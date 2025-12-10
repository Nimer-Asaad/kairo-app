// src/routes/gmailRoutes.js
import express from "express";
import { google } from "googleapis";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// ---------- Helpers ----------

// ننشئ OAuth client باستخدام القيم من process.env وقت التنفيذ
function createOAuth2Client() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } =
    process.env;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
    throw new Error("Google OAuth not configured in .env");
  }

  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );
}

async function saveGmailTokens(userId, tokens) {
  await User.findByIdAndUpdate(userId, {
    gmailAccessToken: tokens.access_token,
    gmailRefreshToken: tokens.refresh_token,
    gmailTokenExpiry: tokens.expiry_date,
  });
}

// OAuth2 client للمستخدم (بدون إنشاء Gmail client)
async function getOAuth2ClientForUser(userId) {
  const user = await User.findById(userId);
  if (!user || !user.gmailAccessToken || !user.gmailRefreshToken) {
    throw new Error("No Gmail tokens stored for this user");
  }

  const oAuth2Client = createOAuth2Client();

  oAuth2Client.setCredentials({
    access_token: user.gmailAccessToken,
    refresh_token: user.gmailRefreshToken,
    expiry_date: user.gmailTokenExpiry,
  });

  // تحديث التوكنات تلقائياً إذا رجع من جوجل refresh جديد
  oAuth2Client.on("tokens", async (tokens) => {
    if (tokens.access_token) {
      await saveGmailTokens(userId, {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || user.gmailRefreshToken,
        expiry_date: tokens.expiry_date || user.gmailTokenExpiry,
      });
    }
  });

  return oAuth2Client;
}

// Gmail client للمستخدم
async function getGmailClientForUser(userId) {
  const oAuth2Client = await getOAuth2ClientForUser(userId);
  return google.gmail({ version: "v1", auth: oAuth2Client });
}

function decodeBase64Url(str) {
  if (!str) return "";
  return Buffer.from(
    str.replace(/-/g, "+").replace(/_/g, "/"),
    "base64"
  ).toString("utf8");
}

function extractMessageBody(payload) {
  if (!payload) return { html: "", text: "" };

  let html = "";
  let text = "";

  function walk(part) {
    if (!part) return;

    // HTML أولاً
    if (part.mimeType === "text/html" && part.body?.data) {
      try {
        html = decodeBase64Url(part.body.data);
      } catch (e) {
        console.error("Failed to decode HTML part:", e);
      }
    }

    // TEXT كـ fallback
    if (part.mimeType === "text/plain" && part.body?.data) {
      try {
        text = decodeBase64Url(part.body.data);
      } catch (e) {
        console.error("Failed to decode TEXT part:", e);
      }
    }

    if (part.parts?.length) {
      part.parts.forEach(walk);
    }
  }

  walk(payload);
  return { html, text };
}

// تلخيص بسيط بدون OpenAI (تقدر تطوّره بعدين)
async function summarizeEmail({ subject, from, date, body }) {
  const shortBody = body.slice(0, 400).replace(/\s+/g, " ");
  return `From: ${from}
Subject: ${subject}
Date: ${date}

Summary:
${shortBody}...`;
}

async function scoreEmail({ text, requirements }) {
  const lowerText = text.toLowerCase();
  const words = requirements
    .toLowerCase()
    .split(/[\s,]+/)
    .map((w) => w.trim())
    .filter(Boolean);

  let matches = 0;
  for (const w of words) {
    if (lowerText.includes(w)) matches++;
  }

  const score =
    words.length === 0 ? 0 : Math.round((matches / words.length) * 100);

  let decision = "Reject";
  if (score >= 70) decision = "Shortlist";
  else if (score >= 40) decision = "Maybe";

  const firstLine = text.split("\n")[0] || "";

  return {
    candidateName: firstLine.slice(0, 40) || "Unknown",
    position: "",
    score,
    decision,
  };
}

// ---------- Routes ----------

// 1) بدء عملية ربط Gmail
// ملاحظة: ما في auth middleware هون عشان نقدر نمرر الـ token كـ query
router.get("/auth", async (req, res) => {
  try {
    let userId = null;

    // أولوية: token من الـ query (جاينا من الفرونت)
    if (req.query.token) {
      try {
        const decoded = jwt.verify(
          req.query.token,
          process.env.JWT_SECRET || "super_secret_kairo_key"
        );
        userId =
          decoded.user?.id ||
          decoded.id ||
          decoded._id ||
          decoded.userId ||
          null;
      } catch (err) {
        console.error("Invalid JWT in /gmail/auth:", err);
      }
    }

    // fallback: لو حدا استدعى الراوت مع Authorization header
    if (!userId && req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "super_secret_kairo_key"
        );
        userId =
          decoded.user?.id ||
          decoded.id ||
          decoded._id ||
          decoded.userId ||
          null;
      } catch (err) {
        console.error("Invalid header JWT in /gmail/auth:", err);
      }
    }

    if (!userId) {
      return res.status(401).send("User not authenticated");
    }

    const oAuth2Client = createOAuth2Client();

    const url = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
      ],
      state: String(userId),
    });

    res.redirect(url);
  } catch (err) {
    console.error("Gmail /auth error:", err);
    res.status(500).send(err.message || "Failed to start Google OAuth");
  }
});

// 2) callback من Google
router.get("/oauth2/callback", async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.status(400).send("Missing code or state");
    }

    const userId = state;
    const oAuth2Client = createOAuth2Client();

    const { tokens } = await oAuth2Client.getToken(code);
    await saveGmailTokens(userId, {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date,
    });

    const redirectUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    res.redirect(`${redirectUrl}/admin?gmail=connected`);
  } catch (err) {
    console.error("Gmail callback error:", err);
    res.status(500).send("Failed to complete Google OAuth");
  }
});

// 3) جلب معلومات البروفايل (الصورة + الاسم + الإيميل)
router.get("/profile", auth, async (req, res) => {
  try {
    const oAuth2Client = await getOAuth2ClientForUser(req.user.id);

    const oauth2 = google.oauth2({
      auth: oAuth2Client,
      version: "v2",
    });

    const { data } = await oauth2.userinfo.get();

    res.json({
      email: data.email || "",
      name: data.name || data.given_name || "Gmail User",
      picture:
        data.picture ||
        "https://ui-avatars.com/api/?name=GM&background=4285f4&color=fff&size=120",
    });
  } catch (err) {
    console.error("Gmail profile error:", err);
    res.status(500).json({ message: "Failed to fetch Gmail profile" });
  }
});

// 4) جلب الإيميلات مع دعم "next page"
router.get("/messages", auth, async (req, res) => {
  try {
    const gmail = await getGmailClientForUser(req.user.id);

    const limit = Number(req.query.limit || 20);
    const pageToken = req.query.pageToken || undefined;

    const listRes = await gmail.users.messages.list({
      userId: "me",
      maxResults: limit,
      labelIds: ["INBOX"],
      includeSpamTrash: false,
      pageToken, // صفحة جديدة كل مرة
    });

    const messages = listRes.data.messages || [];
    const nextPageToken = listRes.data.nextPageToken || null;

    const result = [];

    for (const msg of messages) {
      const full = await gmail.users.messages.get({
        userId: "me",
        id: msg.id,
      });

      const headers = full.data.payload.headers || [];
      const subject =
        headers.find((h) => h.name === "Subject")?.value || "(no subject)";
      const from =
        headers.find((h) => h.name === "From")?.value || "(unknown)";
      const date =
        headers.find((h) => h.name === "Date")?.value || "(no date)";
      const snippet = full.data.snippet || "";

      result.push({
        id: full.data.id,
        threadId: full.data.threadId,
        subject,
        from,
        date,
        snippet,
      });
    }

    // رجعنا الإيميلات + التوكن لصفحة أخرى
    res.json({ emails: result, nextPageToken });
  } catch (err) {
    console.error("Gmail messages error:", err);
    res.status(500).json({ message: "Failed to fetch Gmail messages" });
  }
});

// 5) تلخيص إيميل معيّن + إرجاع كامل الـ body
router.get("/messages/:id/summary", auth, async (req, res) => {
  try {
    const gmail = await getGmailClientForUser(req.user.id);
    const { id } = req.params;

    const full = await gmail.users.messages.get({
      userId: "me",
      id,
    });

    const headers = full.data.payload.headers || [];
    const subject =
      headers.find((h) => h.name === "Subject")?.value || "(no subject)";
    const from =
      headers.find((h) => h.name === "From")?.value || "(unknown)";
    const date =
      headers.find((h) => h.name === "Date")?.value || "(no date)";

    const { html, text } = extractMessageBody(full.data.payload);
    const body = html || text || "";

    const plainForSummary = (text || html || "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const summary = await summarizeEmail({
      subject,
      from,
      date,
      body: plainForSummary,
    });

    return res.json({
      id,
      subject,
      from,
      date,
      body, // HTML أو Text
      summary, // التلخيص النصي
    });
  } catch (err) {
    console.error("Gmail summary error:", err?.message || err);
    return res
      .status(500)
      .json({ message: "Failed to summarize email", error: String(err) });
  }
});

// 6) فلترة إيميلات الـ CV
router.post("/filter-cvs", auth, async (req, res) => {
  try {
    const { requirements, keywords = [], limit: limitBody } = req.body;

    if (!requirements || !requirements.trim()) {
      return res
        .status(400)
        .json({ message: "Job requirements are required" });
    }

    const gmail = await getGmailClientForUser(req.user.id);
    const limit = Number(limitBody || 50);

    const listRes = await gmail.users.messages.list({
      userId: "me",
      maxResults: limit,
      labelIds: ["INBOX"],
      includeSpamTrash: false,
      q: "", // ما بنفلتر إيميلات زيادة
    });

    const messages = listRes.data.messages || [];
    const results = [];

    for (const msg of messages) {
      const full = await gmail.users.messages.get({
        userId: "me",
        id: msg.id,
      });

      const headers = full.data.payload.headers || [];
      const subject =
        headers.find((h) => h.name === "Subject")?.value || "(no subject)";
      const from =
        headers.find((h) => h.name === "From")?.value || "(unknown)";
      const date =
        headers.find((h) => h.name === "Date")?.value || "(no date)";
      const snippet = full.data.snippet || "";

      const { html, text } = extractMessageBody(full.data.payload);
      const bodyString = `${subject}\n${snippet}\n${html}\n${text}`.trim();

      const kw = keywords
        .map((k) => k.toLowerCase().trim())
        .filter(Boolean);

      const combinedLower = bodyString.toLowerCase();

      const passKeywords =
        kw.length === 0 || kw.some((k) => combinedLower.includes(k));

      if (!passKeywords) continue;

      const scoring = await scoreEmail({
        text: bodyString,
        requirements,
      });

      results.push({
        id: msg.id,
        from,
        subject,
        date,
        snippet,
        candidateName: scoring.candidateName,
        position: scoring.position,
        score: scoring.score,
        decision: scoring.decision,
        gmailLink: `https://mail.google.com/mail/u/0/#inbox/${msg.id}`,
      });
    }

    results.sort((a, b) => (b.score || 0) - (a.score || 0));

    res.json(results);
  } catch (err) {
    console.error("Gmail filter-cvs error:", err);
    res.status(500).json({ message: "Failed to filter CV emails" });
  }
});

export default router;
