// src/routes/gmailRoutes.js
import express from "express";
import { google } from "googleapis";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// ---------- Helpers ----------

// ننشئ OAuth client باستخدام القيم من process.env وقت التنفيذ
function createOAuth2Client() {
  const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI,
  } = process.env;

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

async function getOAuthClientForUser(userId) {
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

  oAuth2Client.on("tokens", async (tokens) => {
    if (tokens.access_token) {
      await saveGmailTokens(userId, {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || user.gmailRefreshToken,
        expiry_date: tokens.expiry_date || user.gmailTokenExpiry,
      });
    }
  });

  return google.gmail({ version: "v1", auth: oAuth2Client });
}

function decodeBase64Url(str) {
  if (!str) return "";
  return Buffer.from(
    str.replace(/-/g, "+").replace(/_/g, "/"),
    "base64"
  ).toString("utf8");
}

function extractPlainTextFromMessage(message) {
  const payload = message.payload;

  function walk(part) {
    if (!part) return "";
    if (part.mimeType === "text/plain" && part.body && part.body.data) {
      return decodeBase64Url(part.body.data);
    }
    if (part.parts && part.parts.length) {
      return part.parts.map(walk).join("\n");
    }
    return "";
  }

  if (payload.mimeType === "text/plain" && payload.body?.data) {
    return decodeBase64Url(payload.body.data);
  }

  if (payload.parts?.length) {
    return walk(payload);
  }

  return "";
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
router.get("/auth", auth, async (req, res) => {
  try {
    const oAuth2Client = createOAuth2Client();

    const url = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: ["https://www.googleapis.com/auth/gmail.readonly"],
      state: String(req.user.id),
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

// 3) جلب آخر الإيميلات
router.get("/messages", auth, async (req, res) => {
  try {
    const gmail = await getOAuthClientForUser(req.user.id);

    const limit = Number(req.query.limit || 20);
    const listRes = await gmail.users.messages.list({
      userId: "me",
      maxResults: limit,
    });

    const messages = listRes.data.messages || [];
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

    res.json(result);
  } catch (err) {
    console.error("Gmail messages error:", err);
    res.status(500).json({ message: "Failed to fetch Gmail messages" });
  }
});

// 4) تلخيص إيميل معيّن
router.get("/messages/:id/summary", auth, async (req, res) => {
  try {
    const gmail = await getOAuthClientForUser(req.user.id);
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
    const body = extractPlainTextFromMessage(full.data);

    const summary = await summarizeEmail({ subject, from, date, body });

    res.json({ id, subject, from, date, summary });
  } catch (err) {
    console.error("Gmail summary error:", err);
    res.status(500).json({ message: "Failed to summarize email" });
  }
});

// 5) فلترة إيميلات الـ CV
router.post("/filter-cvs", auth, async (req, res) => {
  try {
    const { requirements, keywords = [] } = req.body;

    if (!requirements || !requirements.trim()) {
      return res
        .status(400)
        .json({ message: "Job requirements are required" });
    }

    const gmail = await getOAuthClientForUser(req.user.id);

    const listRes = await gmail.users.messages.list({
      userId: "me",
      maxResults: 50,
      q: "has:attachment",
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
      const body = extractPlainTextFromMessage(full.data);

      const combined = `${subject}\n${snippet}\n${body}`.toLowerCase();

      const kw = keywords
        .map((k) => k.toLowerCase().trim())
        .filter(Boolean);

      const passKeywords =
        kw.length === 0 || kw.some((k) => combined.includes(k));

      if (!passKeywords) continue;

      const scoring = await scoreEmail({
        text: combined,
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
