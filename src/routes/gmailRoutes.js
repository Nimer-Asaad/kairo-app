// src/routes/gmailRoutes.js
import express from "express";
import { google } from "googleapis";
import jwt from "jsonwebtoken";
import { dbManager } from "../db/dbManager.js";
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
  await dbManager.updateUser(userId, {
    gmailAccessToken: tokens.access_token,
    gmailRefreshToken: tokens.refresh_token,
    gmailTokenExpiry: tokens.expiry_date,
  });
}

// OAuth2 client للمستخدم (بدون إنشاء Gmail client)
async function getOAuth2ClientForUser(userId) {
  const user = await dbManager.findUserById(userId);
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

    // Also get messagesTotal from Gmail profile
    const gmail = await getGmailClientForUser(req.user.id);
    let messagesTotal = null;
    try {
      const profile = await gmail.users.getProfile({ userId: "me" });
      messagesTotal = profile?.data?.messagesTotal ?? null;
    } catch (e) {
      console.warn("Failed to get Gmail profile messagesTotal:", e.message);
    }

    res.json({
      email: data.email || "",
      name: data.name || data.given_name || "Gmail User",
      picture:
        data.picture ||
        "https://ui-avatars.com/api/?name=GM&background=4285f4&color=fff&size=120",
      messagesTotal,
    });
  } catch (err) {
    console.error("Gmail profile error:", err);
    res.status(500).json({ message: "Failed to fetch Gmail profile" });
  }
});

// Sync state endpoints
router.get("/sync/state", auth, async (req, res) => {
  const scope = (req.query.scope || "inbox").toString();
  const state = await dbManager.getSyncState(req.user.id, scope);
  res.json(state || {});
});

router.post("/sync/reset", auth, async (req, res) => {
  const scope = (req.query.scope || req.body?.scope || "inbox").toString();
  await dbManager.resetSyncState(req.user.id, scope);
  res.json({ message: "Sync state reset" });
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

// 7) Sync Gmail emails to local MongoDB (NEW)
router.post("/sync-local", auth, async (req, res) => {
  try {
    const { maxResults = 50, labelIds, q } = req.body;
    const gmail = await getGmailClientForUser(req.user.id);
    
    const limit = Math.min(Number(maxResults), 100);

    // Fetch Gmail messages
    const listRes = await gmail.users.messages.list({
      userId: "me",
      maxResults: limit,
      labelIds: Array.isArray(labelIds) && labelIds.length ? labelIds : ["INBOX"],
      includeSpamTrash: false,
      q: q || undefined,
    });

    const messages = listRes.data.messages || [];
    let synced = 0;
    let skipped = 0;

    for (const msg of messages) {
      try {
        const full = await gmail.users.messages.get({
          userId: "me",
          id: msg.id,
          format: "full",
        });

        const headers = full.data.payload.headers || [];
        const subject = headers.find((h) => h.name === "Subject")?.value || "(no subject)";
        const fromHeader = headers.find((h) => h.name === "From")?.value || "(unknown)";
        const dateHeader = headers.find((h) => h.name === "Date")?.value || "";
        const toHeader = headers.find((h) => h.name === "To")?.value || "";
        const ccHeader = headers.find((h) => h.name === "Cc")?.value || "";

        // Extract email from "Name <email@domain.com>" format
        const fromEmailMatch = fromHeader.match(/<([^>]+)>/) || [null, fromHeader];
        const fromEmail = fromEmailMatch[1] || fromHeader;
        const fromName = fromHeader.replace(/<[^>]+>/, "").trim();

        const to = toHeader.split(",").map((e) => e.trim()).filter(Boolean);
        const cc = ccHeader.split(",").map((e) => e.trim()).filter(Boolean);

        const { html, text } = extractMessageBody(full.data.payload);
        const snippet = full.data.snippet || "";
        const labels = full.data.labelIds || [];

        // Check for attachments
        let hasAttachments = false;
        const attachments = [];
        
        function findAttachments(part) {
          if (part.filename && part.body?.attachmentId) {
            hasAttachments = true;
            attachments.push({
              filename: part.filename,
              mimeType: part.mimeType,
              size: part.body.size || 0,
              attachmentId: part.body.attachmentId,
            });
          }
          if (part.parts) {
            part.parts.forEach(findAttachments);
          }
        }
        
        if (full.data.payload) {
          findAttachments(full.data.payload);
        }

        // Auto-detect CV emails based on keywords and attachments
        const combinedText = `${subject} ${snippet} ${text}`.toLowerCase();
        const cvKeywords = ["cv", "resume", "curriculum vitae", "سيرة ذاتية", "application", "candidate"];
        const isCV = cvKeywords.some((kw) => combinedText.includes(kw)) && hasAttachments;

        // Check if email already exists (avoid duplicates)
        const existing = await dbManager.findEmailByGmailId(req.user.id, msg.id);

        if (existing) {
          skipped++;
          continue;
        }

        // Save to local or MongoDB store
        await dbManager.createEmail({
          userId: req.user.id,
          gmailId: msg.id,
          gmailMessageId: full.data.id,
          threadId: full.data.threadId,
          fromEmail,
          fromName,
          to,
          cc,
          subject,
          snippet,
          bodyText: text,
          bodyHtml: html,
          date: dateHeader ? new Date(dateHeader) : new Date(),
          internalDate: full.data.internalDate,
          hasAttachments,
          attachments,
          labels,
          tags: isCV ? ["CV"] : [],
          isCV,
        });

        synced++;
      } catch (msgError) {
        console.error(`Failed to sync message ${msg.id}:`, msgError.message);
      }
    }

    res.json({
      message: "Gmail sync completed",
      synced,
      skipped,
      total: messages.length,
    });
  } catch (err) {
    console.error("Gmail sync-local error:", err);
    res.status(500).json({ message: "Failed to sync Gmail to local storage" });
  }
});

// 8) Local search endpoint (NEW)
router.get("/local/search", auth, async (req, res) => {
  try {
    const {
      from,
      keyword,
      hasAttachments,
      startDate,
      endDate,
      tag,
      labelId,
      labelIds,
      limit = 20,
    } = req.query;

    const query = { userId: req.user.id };

    // Filter by sender email
    if (from) {
      query.fromEmail = new RegExp(from, "i");
    }

    // Keyword search in subject, body, snippet
    if (keyword) {
      query.$or = [
        { subject: new RegExp(keyword, "i") },
        { bodyText: new RegExp(keyword, "i") },
        { snippet: new RegExp(keyword, "i") },
      ];
    }

    // Filter by attachments
    if (hasAttachments === "true") {
      query.hasAttachments = true;
    }

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Filter by tag
    if (tag) {
      query.tags = tag;
    }

    // Filter by Gmail label(s)
    const labelsFilter =
      (typeof labelId === "string" && labelId.trim() ? [labelId.trim()] : [])
        .concat(
          typeof labelIds === "string"
            ? labelIds
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : []
        );
    if (labelsFilter.length) {
      query.labels = { $in: labelsFilter };
    }

    const totalCount = await dbManager.countEmails(query);

    const emails = await dbManager.findEmails(query);
    
    // Sort using Gmail's priority system (exactly like Gmail does)
    const filtered = emails
      .sort((a, b) => {
        // 1. Priority score (starred, important, unread, category, recency)
        const priorityDiff = (b.gmailPriority || 0) - (a.gmailPriority || 0);
        if (priorityDiff !== 0) return priorityDiff;
        
        // 2. Importance level
        const importanceOrder = { high: 3, normal: 2, low: 1 };
        const importanceDiff = (importanceOrder[b.gmailImportance] || 2) - (importanceOrder[a.gmailImportance] || 2);
        if (importanceDiff !== 0) return importanceDiff;
        
        // 3. Date (most recent first)
        return new Date(b.date) - new Date(a.date);
      })
      .slice(0, Math.min(Number(limit), 100));

    res.json({
      emails: filtered,
      count: totalCount,
    });
  } catch (err) {
    console.error("Gmail local/search error:", err);
    res.status(500).json({ message: "Failed to search local emails" });
  }
});

// 7b) Paginated sync: fetch a Gmail page, store locally, return nextPageToken
router.post("/sync-page", auth, async (req, res) => {
  try {
    const { limit = 100, pageToken, labelIds, q, scope } = req.body;
    const gmail = await getGmailClientForUser(req.user.id);

    const max = Math.min(Number(limit), 100);

    const listRes = await gmail.users.messages.list({
      userId: "me",
      maxResults: max,
      labelIds: Array.isArray(labelIds) && labelIds.length ? labelIds : ["INBOX"],
      includeSpamTrash: false,
      pageToken: pageToken || undefined,
      q: q || undefined,
    });

    const messages = listRes.data.messages || [];
    const nextPageToken = listRes.data.nextPageToken || null;

    let synced = 0;
    let skipped = 0;

    for (const msg of messages) {
      try {
        const full = await gmail.users.messages.get({ userId: "me", id: msg.id, format: "full" });

        const headers = full.data.payload.headers || [];
        const subject = headers.find((h) => h.name === "Subject")?.value || "(no subject)";
        const fromHeader = headers.find((h) => h.name === "From")?.value || "(unknown)";
        const dateHeader = headers.find((h) => h.name === "Date")?.value || "";
        const toHeader = headers.find((h) => h.name === "To")?.value || "";
        const ccHeader = headers.find((h) => h.name === "Cc")?.value || "";

        const fromEmailMatch = fromHeader.match(/<([^>]+)>/) || [null, fromHeader];
        const fromEmail = fromEmailMatch[1] || fromHeader;
        const fromName = fromHeader.replace(/<[^>]+>/, "").trim();

        const to = toHeader.split(",").map((e) => e.trim()).filter(Boolean);
        const cc = ccHeader.split(",").map((e) => e.trim()).filter(Boolean);

        const { html, text } = extractMessageBody(full.data.payload);
        const snippet = full.data.snippet || "";
        const labels = full.data.labelIds || [];

        let hasAttachments = false;
        const attachments = [];
        function findAttachments(part) {
          if (part.filename && part.body?.attachmentId) {
            hasAttachments = true;
            attachments.push({
              filename: part.filename,
              mimeType: part.mimeType,
              size: part.body.size || 0,
              attachmentId: part.body.attachmentId,
            });
          }
          if (part.parts) part.parts.forEach(findAttachments);
        }
        if (full.data.payload) findAttachments(full.data.payload);

        const combinedText = `${subject} ${snippet} ${text}`.toLowerCase();
        const cvKeywords = ["cv", "resume", "curriculum vitae", "سيرة ذاتية", "application", "candidate"];
        const isCV = cvKeywords.some((kw) => combinedText.includes(kw)) && hasAttachments;

        // Extract Gmail-specific metadata for smart sorting
        const isStarred = labels.includes('STARRED');
        const isImportant = labels.includes('IMPORTANT');
        const isUnread = labels.includes('UNREAD');
        
        // Determine Gmail category
        let gmailCategory = 'Primary';
        if (labels.includes('CATEGORY_SOCIAL')) gmailCategory = 'Social';
        else if (labels.includes('CATEGORY_PROMOTIONS')) gmailCategory = 'Promotions';
        else if (labels.includes('CATEGORY_UPDATES')) gmailCategory = 'Updates';
        else if (labels.includes('CATEGORY_FORUMS')) gmailCategory = 'Forums';
        
        // Calculate Gmail-like priority (higher = more important)
        let gmailPriority = 0;
        if (isStarred) gmailPriority += 100;
        if (isImportant) gmailPriority += 50;
        if (isUnread) gmailPriority += 10;
        if (gmailCategory === 'Primary') gmailPriority += 30;
        if (hasAttachments) gmailPriority += 5;
        // Recent emails get priority boost
        const emailDate = dateHeader ? new Date(dateHeader) : new Date();
        const daysSinceEmail = (Date.now() - emailDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceEmail < 7) gmailPriority += 20;
        else if (daysSinceEmail < 30) gmailPriority += 10;
        
        // Determine importance level
        let gmailImportance = 'normal';
        if (isStarred || isImportant) gmailImportance = 'high';
        else if (gmailCategory !== 'Primary') gmailImportance = 'low';

        const existing = await dbManager.findEmailByGmailId(req.user.id, msg.id);
        if (existing) {
          skipped++;
          continue;
        }

        await dbManager.createEmail({
          userId: req.user.id,
          gmailId: msg.id,
          gmailMessageId: full.data.id,
          threadId: full.data.threadId,
          fromEmail,
          fromName,
          to,
          cc,
          subject,
          snippet,
          bodyText: text,
          bodyHtml: html,
          date: emailDate,
          internalDate: full.data.internalDate,
          hasAttachments,
          attachments,
          labels,
          tags: isCV ? ["CV"] : [],
          isCV,
          // Gmail smart sorting metadata
          gmailImportance,
          gmailCategory,
          gmailPriority,
          isStarred,
          isImportant,
          isUnread,
        });

        synced++;
      } catch (e) {
        console.error("sync-page item error:", e.message);
      }
    }

    // Update persistent sync state
    const stateScope = (scope || "inbox").toString();
    await dbManager.updateSyncState(req.user.id, stateScope, {
      lastPageToken: nextPageToken,
      totalSynced: ((await dbManager.getSyncState(req.user.id, stateScope))?.totalSynced || 0) + synced,
      totalSkipped: ((await dbManager.getSyncState(req.user.id, stateScope))?.totalSkipped || 0) + skipped,
      pagesProcessed: ((await dbManager.getSyncState(req.user.id, stateScope))?.pagesProcessed || 0) + 1,
    });

    res.json({ message: "Page synced", synced, skipped, total: messages.length, nextPageToken });
  } catch (err) {
    // Log full error for debugging and surface a helpful message to the client
    console.error("Gmail sync-page error:", err);
    const authError = err?.code === 401 || err?.response?.status === 401;
    const friendlyMessage = authError
      ? "انتهت صلاحية اتصال Gmail، الرجاء إعادة الربط"
      : err?.errors?.[0]?.message || err?.message || "Failed to sync Gmail page";
    res.status(authError ? 401 : 500).json({ message: friendlyMessage });
  }
});

export default router;
