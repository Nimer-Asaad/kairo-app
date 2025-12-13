import express from "express";
import auth from "../middleware/auth.js";
import { dbManager } from "../db/dbManager.js";
import { openai, CHAT_MODEL, ensureOpenAI } from "../services/openaiClient.js";
import { embedText } from "../services/embeddings.js";
import { cosineSim } from "../utils/vector.js";

const router = express.Router();

/**
 * 1) Search emails by simple filters (fast)
 */
router.post("/search", auth, async (req, res) => {
  const { from, keyword, hasAttachments, tag, limit = 20 } = req.body;

  const q = { userId: req.user.id };
  if (from) q.fromEmail = new RegExp(from, "i");
  if (keyword) {
    q.$or = [
      { subject: new RegExp(keyword, "i") },
      { bodyText: new RegExp(keyword, "i") },
      { snippet: new RegExp(keyword, "i") },
    ];
  }
  if (hasAttachments === true) q.hasAttachments = true;
  if (tag) q.tags = tag;

  const emails = await dbManager.findEmails(q);
  
  // Sort using Gmail's priority system
  const sorted = emails
    .sort((a, b) => {
      // Gmail priority first
      const priorityDiff = (b.gmailPriority || 0) - (a.gmailPriority || 0);
      if (priorityDiff !== 0) return priorityDiff;
      // Then by date
      return new Date(b.date) - new Date(a.date);
    })
    .slice(0, Math.min(limit, 50));
  res.json({ emails: sorted });
});

/**
 * 2) Semantic search (meaning-based) using embeddings with hybrid ranking
 */
router.post("/semantic-search", auth, async (req, res) => {
  const { query, limit = 10 } = req.body;
  const qEmb = await embedText(query);
  if (!qEmb) return res.status(400).json({ error: "Empty query" });

  // Pull more candidates for better results
  const candidates = await dbManager.findEmails({ userId: req.user.id, embedding: { $exists: true } });

  // Hybrid ranking: semantic similarity + Gmail priority + recency
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  
  const scored = candidates
    .map((e) => {
      const semanticScore = cosineSim(qEmb, e.embedding);
      const emailDate = new Date(e.date).getTime();
      
      // Gmail priority bonus (normalized 0-0.3)
      const priorityBonus = (e.gmailPriority || 0) / 1000;
      
      // Recency bonus: newer emails get higher score (0 to 0.2 boost)
      const recencyBonus = emailDate > thirtyDaysAgo ? 0.2 * ((emailDate - thirtyDaysAgo) / (now - thirtyDaysAgo)) : 0;
      
      // Importance bonus
      const importanceBonus = e.gmailImportance === 'high' ? 0.15 : (e.gmailImportance === 'low' ? -0.1 : 0);
      
      const finalScore = semanticScore + priorityBonus + recencyBonus + importanceBonus;
      return { e, semanticScore, recencyBonus, priorityBonus, finalScore };
    })
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, Math.min(limit, 20))
    .map(({ e, finalScore }) => ({
      id: e._id,
      gmailId: e.gmailId,
      fromEmail: e.fromEmail,
      fromName: e.fromName,
      subject: e.subject,
      date: e.date,
      snippet: e.snippet,
      bodyText: e.bodyText?.substring(0, 500) || e.snippet,
      hasAttachments: e.hasAttachments,
      score: Math.round(finalScore * 100),
    }));

  res.json({ results: scored });
});

/**
 * 3) Chat endpoint: AI-powered email search with CV intelligence
 *    Works ONLY on local MongoDB emails, never exposes raw emails to AI
 *    Falls back to basic search if OpenAI is not configured
 */
router.post("/chat", auth, async (req, res) => {
  try {
    const { message, jobRequirements, labelIds } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    // Step A: Try to use OpenAI for intent parsing; fallback to basic search if unavailable
    let plan = null;
    const useOpenAI = !!openai;

    if (useOpenAI) {
      const systemPrompt = `You are an intelligent email search assistant. Analyze the user's query and extract search intent.
Return ONLY valid JSON with this structure:
{
  "intent": "list_emails" | "find_cvs" | "rank_cvs" | "semantic_search",
  "filters": {
    "from": "optional sender email pattern",
    "keyword": "optional keyword to search",
    "tag": "optional tag like CV, Invoice",
    "hasAttachments": true/false,
    "startDate": "optional ISO date",
    "endDate": "optional ISO date"
  },
  "queryText": "natural language query for semantic search",
  "limit": 10
}

Examples:
- "show me CVs" → {"intent":"find_cvs","filters":{"tag":"CV"},"limit":20}
- "emails from john@example.com" → {"intent":"list_emails","filters":{"from":"john@example.com"},"limit":10}
- "rank candidates for software engineer" → {"intent":"rank_cvs","filters":{"tag":"CV"},"queryText":"software engineer","limit":20}`;

      try {
        const plannerResponse = await openai.chat.completions.create({
          model: CHAT_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
          temperature: 0.1,
        });

        try {
          const responseText = plannerResponse.choices[0].message.content.trim();
          // Extract JSON from markdown code blocks if present
          const jsonMatch = responseText.match(/```json\n(.*?)\n```/s) || responseText.match(/```\n(.*?)\n```/s);
          const jsonText = jsonMatch ? jsonMatch[1] : responseText;
          plan = JSON.parse(jsonText);
        } catch (parseError) {
          console.error("Failed to parse planner response:", parseError);
          plan = { intent: "semantic_search", queryText: message, filters: {}, limit: 10 };
        }
      } catch (aiError) {
        console.warn("OpenAI planner failed; using fallback basic search:", aiError.message);
        plan = null;
      }
    }

    // Fallback: if OpenAI failed or not available, use basic heuristic search
    if (!plan) {
      const msg = message.toLowerCase();
      let intent = "list_emails";
      let keyword = message;
      let tag = null;

      if (msg.includes("cv") || msg.includes("resume") || msg.includes("سيرة") || msg.includes("تقديم")) {
        intent = "find_cvs";
        tag = "CV";
      }
      if (msg.includes("rank") || msg.includes("ترتيب") || msg.includes("مرشح")) {
        intent = "rank_cvs";
        tag = "CV";
      }

      plan = {
        intent,
        filters: { tag, keyword },
        queryText: message,
        limit: 10,
      };
    }

    // Step B: Execute search based on intent
    let retrieved = [];
    const query = { userId: req.user.id };

    // Optional scope filter by Gmail label IDs (e.g., IMPORTANT, CATEGORY_SOCIAL)
    if (Array.isArray(labelIds) && labelIds.length) {
      query.labels = { $in: labelIds };
    }

    // Apply filters from the plan
    if (plan.filters?.from) query.fromEmail = new RegExp(plan.filters.from, "i");
    if (plan.filters?.tag) query.tags = plan.filters.tag;
    if (plan.filters?.hasAttachments === true) query.hasAttachments = true;
    if (plan.filters?.startDate || plan.filters?.endDate) {
      query.date = {};
      if (plan.filters.startDate) query.date.$gte = new Date(plan.filters.startDate);
      if (plan.filters.endDate) query.date.$lte = new Date(plan.filters.endDate);
    }

    // Keyword search
    if (plan.filters?.keyword) {
      query.$or = [
        { subject: new RegExp(plan.filters.keyword, "i") },
        { bodyText: new RegExp(plan.filters.keyword, "i") },
        { snippet: new RegExp(plan.filters.keyword, "i") },
      ];
    }

    if (plan.intent === "find_cvs" || plan.intent === "rank_cvs") {
      // Find CV emails
      query.isCV = true;
      const cvEmails = await dbManager.findEmails(query);
      const filtered = cvEmails
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 50);

      if (plan.intent === "rank_cvs" && (jobRequirements || plan.queryText) && useOpenAI) {
        // Step C: Intelligent CV ranking with OpenAI (only if available)
        const requirements = jobRequirements || plan.queryText || "";
        
        for (const email of filtered) {
          // Extract CV content
          const cvContent = `Subject: ${email.subject}\nFrom: ${email.fromEmail}\nSnippet: ${email.snippet}\nBody: ${email.bodyText?.substring(0, 2000) || ""}`;

          // Use OpenAI to analyze CV and extract structured data
          const analysisPrompt = `Analyze this CV/Resume email and extract candidate information:

${cvContent}

Extract and return ONLY valid JSON with:
{
  "candidateName": "full name if found",
  "skills": ["skill1", "skill2"],
  "experience": "years of experience description",
  "role": "job role/position",
  "score": 0-100 based on match with requirements: ${requirements},
  "reasoning": "brief explanation of score in Arabic"
}`;

          try {
            const analysisResponse = await openai.chat.completions.create({
              model: CHAT_MODEL,
              messages: [{ role: "user", content: analysisPrompt }],
              temperature: 0.2,
            });

            const analysisText = analysisResponse.choices[0].message.content.trim();
            const jsonMatch = analysisText.match(/```json\n(.*?)\n```/s) || analysisText.match(/```\n(.*?)\n```/s);
            const jsonText = jsonMatch ? jsonMatch[1] : analysisText;
            const cvData = JSON.parse(jsonText);

            // Update email with CV data
            const emailCopy = { ...email, cvData };
            await dbManager.createEmail(emailCopy); // or update if exists

            retrieved.push({
              ...email,
              score: cvData.score || 0,
            });
          } catch (aiError) {
            console.error("CV analysis error:", aiError);
            retrieved.push({
              ...email.toObject(),
              score: 0,
              cvData: { reasoning: "فشل تحليل السيرة الذاتية" },
            });
          }
        }

        // Sort by score
        retrieved.sort((a, b) => (b.score || 0) - (a.score || 0));
        retrieved = retrieved.slice(0, Math.min(plan.limit || 10, 20));
      } else {
        retrieved = filtered;
      }
    } else if (plan.intent === "semantic_search") {
      // Semantic search using embeddings with intelligent ranking
      const qEmb = await embedText(plan.queryText || message);
      if (qEmb) {
        const candidates = await dbManager.findEmails(query);
        
        // Hybrid ranking: combine semantic similarity with recency and relevance
        const now = Date.now();
        const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
        
        retrieved = candidates
          .map((e) => {
            const embedding = e.embedding || [];
            if (embedding.length === 0) return null;
            
            const semanticScore = cosineSim(qEmb, embedding);
            const emailDate = new Date(e.date).getTime();
            
            // Recency bonus: emails from last 30 days get up to 0.15 boost
            const recencyBonus = emailDate > thirtyDaysAgo 
              ? 0.15 * ((emailDate - thirtyDaysAgo) / (now - thirtyDaysAgo)) 
              : 0;
            
            // Content length bonus: longer emails with more content get slight boost
            const contentLength = (e.bodyText || e.snippet || '').length;
            const contentBonus = Math.min(0.05, contentLength / 10000);
            
            const finalScore = semanticScore + recencyBonus + contentBonus;
            return { e, semanticScore, finalScore };
          })
          .filter(Boolean)
          .sort((a, b) => b.finalScore - a.finalScore)
          .slice(0, Math.min(plan.limit || 10, 15))
          .map(({ e, finalScore }) => ({ ...e, score: Math.round(finalScore * 100) }));
      } else {
        // Fallback to simple search with keyword matching
        const all = await dbManager.findEmails(query);
        retrieved = all
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, plan.limit || 10);
      }
    } else {
      // Simple list of emails
      const all = await dbManager.findEmails(query);
      retrieved = all
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, Math.min(plan.limit || 10, 20));
    }

    // Step D: Generate user-friendly response in Arabic
    const context = retrieved.map((e, i) => ({
      index: i + 1,
      id: e._id,
      gmailId: e.gmailId,
      from: e.fromEmail,
      fromName: e.fromName,
      subject: e.subject,
      date: e.date,
      snippet: e.snippet,
      bodyPreview: e.bodyText?.substring(0, 800) || e.snippet,
      hasAttachments: e.hasAttachments,
      tags: e.tags,
      score: e.score,
      cvData: e.cvData,
    }));

    let answer = "";

    // If OpenAI is available, generate AI summary
    if (useOpenAI) {
      const summaryPrompt = `أنت مساعد بريد إلكتروني ذكي ومتقدم. قدم إجابة تفصيلية باللغة العربية (احتفظ بالمصطلحات التقنية بالإنجليزية).

طلب المستخدم: ${message}
${jobRequirements ? `متطلبات الوظيفة: ${jobRequirements}` : ""}

النتائج المسترجعة (مرتبة حسب الأهمية والتاريخ):
${JSON.stringify(context, null, 2)}

ملاحظة: تم تحليل المحتوى الكامل للإيميلات (bodyPreview) وليس فقط العنوان.

قدم إجابة ذكية تتضمن:
1. ملخص دقيق للنتائج مع ذكر أهم النقاط من محتوى الإيميلات
2. قائمة مرقمة بالإيميلات الأكثر صلة مع:
   - سبب المطابقة بناءً على المحتوى الكامل
   - أهم المعلومات من body الإيميل
   - مدى الصلة بالبحث (score)
3. ${plan.intent === "rank_cvs" ? "ترتيب ذكي للمرشحين حسب المهارات والخبرة مع شرح تفصيلي" : "تحليل زمني وموضوعي للنتائج"}
4. اقتراحات لأسئلة المتابعة أو فلاتر إضافية

لا تخترع معلومات. استخدم فقط البيانات المتاحة في bodyPreview والحقول الأخرى.`;

      try {
        const summaryResponse = await openai.chat.completions.create({
          model: CHAT_MODEL,
          messages: [{ role: "user", content: summaryPrompt }],
          temperature: 0.3,
        });
        answer = summaryResponse.choices[0].message.content;
      } catch (summaryError) {
        console.warn("AI summary failed; using basic summary:", summaryError.message);
        answer = generateBasicSummary(context, plan.intent, message);
      }
    } else {
      // Generate basic summary without AI
      answer = generateBasicSummary(context, plan.intent, message);
    }

    res.json({
      intent: plan.intent,
      filters: plan.filters,
      results: context,
      answer,
      count: retrieved.length,
    });
  } catch (err) {
    console.error("AI chat error:", err);
    res.status(500).json({ message: "Failed to process chat request: " + err.message });
  }
});

// Helper: Generate basic summary without OpenAI
function generateBasicSummary(context, intent, userQuery) {
  if (!context || context.length === 0) {
    return `لم أجد إيميلات تطابق البحث "${userQuery}". جرب كلمات مفتاحية أخرى أو غيّر التصنيف المختار.`;
  }

  const lines = [];
  lines.push(`تم العثور على ${context.length} إيميل(ات) مطابقة لبحثك: "${userQuery}"`);
  lines.push("");
  lines.push("قائمة الإيميلات:");
  context.forEach((e, i) => {
    lines.push(`${i + 1}. من: ${e.fromName || e.from}`);
    lines.push(`   الموضوع: ${e.subject}`);
    lines.push(`   التاريخ: ${new Date(e.date).toLocaleDateString("ar-EG")}`);
    if (e.hasAttachments) lines.push(`   📎 يحتوي على مرفقات`);
    if (e.score) lines.push(`   الدرجة: ${Math.round(e.score)}%`);
    lines.push("");
  });

  if (intent === "rank_cvs") {
    lines.push("ملاحظة: يمكنك تفعيل مفتاح OpenAI API للحصول على تحليل ذكي وترتيب دقيق للمرشحين.");
  }

  return lines.join("\n");
}

export default router;
