// src/AIAssistant.js
import React, { useState, useEffect } from "react";
import "./AIAssistant.css";
import { apiGet, apiPost } from "./api";

const AIAssistant = () => {
  const [message, setMessage] = useState("");
  const [jobRequirements, setJobRequirements] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [fullSyncLoading, setFullSyncLoading] = useState(false);
  const [fullSyncStats, setFullSyncStats] = useState({ synced: 0, skipped: 0, pages: 0 });
  const NEXT_TOKEN_KEY = "kairo_fullsync_nextPageToken";
  const FULL_SYNC_PAGE_CAP = 50; // approximate cap (50 pages ≈ 5000 emails)
  const [emailCount, setEmailCount] = useState(0);
  const [searchMode, setSearchMode] = useState("chat"); // 'chat' or 'cv'
  const chatHistoryRef = React.useRef(null);
  const [messagesTotal, setMessagesTotal] = useState(null);
  const [serverSyncState, setServerSyncState] = useState(null);
  const [scope, setScope] = useState("inbox");

  const SCOPES = [
    { key: "inbox", label: "📥 الوارد", labelIds: ["INBOX"] },
    { key: "important", label: "⭐ مهم", labelIds: ["IMPORTANT"] },
    { key: "starred", label: "🌟 مميزة بنجمة", labelIds: ["STARRED"] },
    { key: "social", label: "👥 سوشيال", labelIds: ["CATEGORY_SOCIAL"] },
    { key: "promotions", label: "🏷️ ترويجات", labelIds: ["CATEGORY_PROMOTIONS"] },
    { key: "updates", label: "🛠️ تحديثات", labelIds: ["CATEGORY_UPDATES"] },
    { key: "forums", label: "💬 منتديات", labelIds: ["CATEGORY_FORUMS"] },
    { key: "sent", label: "📤 المُرسَل", labelIds: ["SENT"] },
    { key: "draft", label: "📝 المسودات", labelIds: ["DRAFT"] },
  ];

  const activeScope = SCOPES.find((s) => s.key === scope) || SCOPES[0];
  const activeLabelIds = activeScope.labelIds;
  const tokenKey = `${NEXT_TOKEN_KEY}:${scope}`;

  // Load email count on mount + profile totals
  useEffect(() => {
    loadEmailCount();
    apiGet("/gmail/profile")
      .then((p) => {
        if (p && typeof p.messagesTotal === "number") {
          setMessagesTotal(p.messagesTotal);
        }
      })
      .catch(() => {});
  }, []);

  // Load server-side sync state for current scope and refresh scoped count
  useEffect(() => {
    loadEmailCount();
    apiGet(`/gmail/sync/state?scope=${encodeURIComponent(scope)}`)
      .then((state) => {
        if (state && (state.lastPageToken || state.totalSynced || state.totalSkipped || state.pagesProcessed)) {
          setServerSyncState(state);
        } else {
          setServerSyncState(null);
        }
      })
      .catch(() => setServerSyncState(null));
  }, [scope]);

  // Auto-scroll to bottom when new messages arrive (smooth)
  useEffect(() => {
    if (chatHistoryRef.current) {
      // Use smooth scroll for better UX
      chatHistoryRef.current.scrollTo({
        top: chatHistoryRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [chatHistory, loading, syncLoading, fullSyncLoading]);

  const loadEmailCount = async () => {
    try {
      const labelsCsv = (activeLabelIds || []).join(",");
      const data = await apiGet(`/gmail/local/search?limit=0&labelIds=${encodeURIComponent(labelsCsv)}`);
      // Get the count field from backend
      const count = data.count || 0;
      setEmailCount(count);
    } catch (err) {
      console.error("Failed to load email count:", err);
      setEmailCount(0);
    }
  };

  const handleSyncEmails = async () => {
    try {
      setSyncLoading(true);
      
      // Add loading message with progress
      setChatHistory((prev) => ([
        ...prev,
        { type: "system", message: `⏳ جاري المزامنة السريعة... (${activeScope.label})\n📥 يتم تحميل عدة صفحات من الإيميلات...`, timestamp: new Date() }
      ]));
      
      // Sync multiple pages (up to 5 pages = ~500 emails for quick sync)
      let totalSynced = 0;
      let totalSkipped = 0;
      let totalProcessed = 0;
      let nextPageToken = undefined;
      const maxPages = 5;
      
      for (let page = 1; page <= maxPages; page++) {
        const data = await apiPost("/gmail/sync-page", { 
          limit: 100, 
          pageToken: nextPageToken,
          labelIds: activeLabelIds, 
          q: undefined,
          scope 
        });
        
        totalSynced += data.synced || 0;
        totalSkipped += data.skipped || 0;
        totalProcessed += data.total || 0;
        nextPageToken = data.nextPageToken;
        
        // Show progress per page
        setChatHistory((prev) => ([
          ...prev,
          { type: "system", message: `📄 صفحة ${page}/${maxPages}: حفظ ${data.synced}, تخطي ${data.skipped}`, timestamp: new Date() }
        ]));
        
        // Stop if no more pages
        if (!nextPageToken) break;
      }
      
      setChatHistory((prev) => ([
        ...prev,
        {
          type: "system",
          message: `✅ تم المزامنة السريعة بنجاح! (${activeScope.label})\n- تم حفظ: ${totalSynced} إيميل جديد\n- تم تخطي: ${totalSkipped} إيميل (موجود مسبقاً)\n- المجموع: ${totalSynced + totalSkipped} إيميل\n${nextPageToken ? '💡 يوجد المزيد - استخدم "مزامنة كاملة" لجلب كل الإيميلات' : '✨ تم المزامنة الكاملة!'}`,
          timestamp: new Date(),
        },
      ]));

      await loadEmailCount();
    } catch (err) {
      setChatHistory((prev) => ([
        ...prev,
        {
          type: "error",
          message: `❌ فشلت المزامنة: ${err.message}`,
          timestamp: new Date(),
        },
      ]));
    } finally {
      setSyncLoading(false);
    }
  };

  const handleFullSync = async () => {
    try {
      setFullSyncLoading(true);
      setFullSyncStats({ synced: 0, skipped: 0, pages: 0 });
      // Try resume from localStorage
      // Prefer server-side state token if available, fallback to localStorage
      let nextPageToken = (serverSyncState && serverSyncState.lastPageToken) || localStorage.getItem(tokenKey) || undefined;
      let totalSynced = 0;
      let totalSkipped = 0;
      let pages = 0;

      // Add initial sync message
      setChatHistory((prev) => ([
        ...prev,
        { type: "system", message: `🚀 بدء المزامنة الكاملة (${activeScope.label})...\n⏱️ قد يستغرق هذا عدة دقائق حسب عدد الإيميلات`, timestamp: new Date() }
      ]));

      const startTime = Date.now();
      
      // Loop pages up to a safe cap (e.g., 50 pages ≈ 5,000 emails)
      for (let i = 0; i < 50; i++) {
        const resp = await apiPost("/gmail/sync-page", { limit: 100, pageToken: nextPageToken, labelIds: activeLabelIds, q: undefined, scope });
        totalSynced += resp.synced || 0;
        totalSkipped += resp.skipped || 0;
        pages += 1;
        const totalProcessed = totalSynced + totalSkipped;
        nextPageToken = resp.nextPageToken || null;
        
        // Calculate elapsed time and speed
        const elapsedMs = Date.now() - startTime;
        const elapsedMin = Math.floor(elapsedMs / 60000);
        const elapsedSec = Math.floor((elapsedMs % 60000) / 1000);
        const emailsPerSec = totalProcessed / (elapsedMs / 1000);
        
        // Persist token to allow resume if user leaves
        if (nextPageToken) localStorage.setItem(tokenKey, nextPageToken);

        // Refresh server state snapshot (for badge/progress)
        apiGet(`/gmail/sync/state?scope=${encodeURIComponent(scope)}`).then((s) => setServerSyncState(s)).catch(() => {});

        setFullSyncStats({ synced: totalSynced, skipped: totalSkipped, pages });

        // Show progress every page with stats
        const progressMsg = `🔄 صفحة ${pages} - ${activeScope.label}\n` +
          `✅ حفظ: ${resp.synced} | ⏭️ تخطي: ${resp.skipped}\n` +
          `📊 الإجمالي: ${totalProcessed} إيميل\n` +
          `⏱️ الوقت: ${elapsedMin}د ${elapsedSec}ث | ⚡ ${Math.round(emailsPerSec)} إيميل/ث`;
        
        setChatHistory((prev) => ([
          ...prev,
          { type: "system", message: progressMsg, timestamp: new Date() }
        ]));

        if (!nextPageToken) break;
      }

      setChatHistory((prev) => ([
        ...prev,
        { type: "system", message: `✅ المزامنة الكاملة انتهت (${activeScope.label}):\n- إجمالي حفظ: ${totalSynced}\n- إجمالي تخطي: ${totalSkipped}\n- عدد الصفحات: ${pages}` , timestamp: new Date() }
      ]));

      // Clear resume token when complete
      localStorage.removeItem(tokenKey);

      await loadEmailCount();
    } catch (err) {
      setChatHistory((prev) => ([
        ...prev,
        { type: "error", message: `❌ فشل المزامنة الكاملة: ${err.message}`, timestamp: new Date() }
      ]));
    } finally {
      setFullSyncLoading(false);
    }
  };

  const handleResetFullSync = () => {
    localStorage.removeItem(tokenKey);
    // Also reset server-side sync state for clean restart
    apiPost(`/gmail/sync/reset?scope=${encodeURIComponent(scope)}`, { scope }).then(() => {
      setServerSyncState(null);
    }).catch(() => {});
    setChatHistory((prev) => ([
      ...prev,
      { type: "system", message: `🔁 تم إعادة تعيين حالة المزامنة (${activeScope.label}). يمكنك البدء من جديد.`, timestamp: new Date() }
    ]));
    setFullSyncStats({ synced: 0, skipped: 0, pages: 0 });
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = {
      type: "user",
      message: message,
      jobRequirements: searchMode === "cv" ? jobRequirements : undefined,
      timestamp: new Date(),
    };

    setChatHistory([...chatHistory, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const data = await apiPost("/ai/chat", {
        message: userMessage.message,
        jobRequirements: userMessage.jobRequirements || undefined,
        labelIds: activeLabelIds,
      });

      const aiResponse = {
        type: "ai",
        intent: data.intent || "unknown",
        answer: data.answer || "تم معالجة الطلب بنجاح",
        results: Array.isArray(data.results) ? data.results : [],
        count: data.count || (Array.isArray(data.results) ? data.results.length : 0),
        timestamp: new Date(),
      };

      setChatHistory((prev) => [...prev, aiResponse]);
    } catch (err) {
      const errorMessage = err.message || "حدث خطأ غير متوقع";
      setChatHistory((prev) => [
        ...prev,
        {
          type: "error",
          message: `❌ ${errorMessage}\n\nتأكد من:\n- اتصال الإنترنت\n- تسجيل الدخول\n- إعدادات OpenAI`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderEmail = (email, index) => {
    return (
      <div key={email.id || index} className={`email-result-card ${email.isUnread ? 'email-unread' : ''} ${email.gmailImportance === 'high' ? 'email-important' : ''}`}>
        <div className="email-header">
          <span className="email-index">#{index + 1}</span>
          {email.isStarred && <span className="email-icon" title="مميزة بنجمة">⭐</span>}
          {email.isImportant && <span className="email-icon" title="مهم">❗</span>}
          {email.gmailCategory && email.gmailCategory !== 'Primary' && (
            <span className="email-category" title={email.gmailCategory}>
              {email.gmailCategory === 'Social' ? '👥' : 
               email.gmailCategory === 'Promotions' ? '🏷️' : 
               email.gmailCategory === 'Updates' ? '🛠️' : 
               email.gmailCategory === 'Forums' ? '💬' : ''}
            </span>
          )}
          <span className="email-from">{email.fromName || email.from}</span>
          {email.score && (
            <span className="email-score">{Math.round(email.score)}%</span>
          )}
          {email.gmailPriority > 0 && (
            <span className="email-priority" title={`أولوية: ${email.gmailPriority}`}>
              🎯 {email.gmailPriority}
            </span>
          )}
        </div>
        <div className="email-subject">{email.subject}</div>
        <div className="email-meta">
          <span className="email-date">
            {new Date(email.date).toLocaleDateString("ar-EG")}
          </span>
          {email.hasAttachments && <span className="email-attachment">📎</span>}
          {email.tags && email.tags.length > 0 && (
            <span className="email-tags">{email.tags.join(", ")}</span>
          )}
        </div>
        <div className="email-snippet">
          {email.bodyPreview || email.bodyText?.substring(0, 400) || email.snippet}
        </div>
        
        {email.cvData && (
          <div className="cv-data">
            <div className="cv-field">
              <strong>المرشح:</strong> {email.cvData.candidateName}
            </div>
            {email.cvData.role && (
              <div className="cv-field">
                <strong>الوظيفة:</strong> {email.cvData.role}
              </div>
            )}
            {email.cvData.skills && email.cvData.skills.length > 0 && (
              <div className="cv-field">
                <strong>المهارات:</strong> {email.cvData.skills.join(", ")}
              </div>
            )}
            {email.cvData.experience && (
              <div className="cv-field">
                <strong>الخبرة:</strong> {email.cvData.experience}
              </div>
            )}
            {email.cvData.reasoning && (
              <div className="cv-reasoning">{email.cvData.reasoning}</div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderChatMessage = (msg, index) => {
    if (msg.type === "user") {
      return (
        <div key={index} className="chat-message user-message">
          <div className="message-content">
            <div className="message-text">{msg.message}</div>
            {msg.jobRequirements && (
              <div className="job-requirements">
                <strong>متطلبات الوظيفة:</strong> {msg.jobRequirements}
              </div>
            )}
          </div>
          <div className="message-time">
            {msg.timestamp.toLocaleTimeString("ar-EG", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      );
    }

    if (msg.type === "ai") {
      return (
        <div key={index} className="chat-message ai-message">
          <div className="message-header">
            <span className="ai-badge">🤖 Kairo AI</span>
            <span className="message-time">
              {msg.timestamp.toLocaleTimeString("ar-EG", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div className="message-content">
            <div className="ai-answer">{msg.answer}</div>
            {msg.results && msg.results.length > 0 && (
              <div className="email-results">
                <div className="results-header">
                  النتائج ({msg.count}):
                </div>
                {msg.results.map((email, idx) => renderEmail(email, idx))}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (msg.type === "system" || msg.type === "error") {
      return (
        <div
          key={index}
          className={`chat-message system-message ${
            msg.type === "error" ? "error-message" : ""
          }`}
        >
          <div className="message-text">{msg.message}</div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="ai-assistant-container">
      <div className="ai-header">
        <h2>🤖 مساعد Kairo الذكي</h2>
        <div className="ai-stats">
          <span className="stat-badge">📧 {emailCount} في {activeScope.label}</span>
          <select
            className="scope-select"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            disabled={syncLoading || fullSyncLoading}
            title="اختر تصنيف الإيميلات"
          >
            {SCOPES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
          {serverSyncState && (
            <span className="stat-badge">
              🧭 تقدم المزامنة: حفظ {serverSyncState.totalSynced || 0}, تخطي {serverSyncState.totalSkipped || 0}
            </span>
          )}
          <button
            className="sync-button sync-button-primary"
            onClick={handleSyncEmails}
            disabled={syncLoading || fullSyncLoading}
            title="جلب ~500 إيميل حديث (5 صفحات سريعة)"
          >
            {syncLoading ? "⏳ جاري المزامنة..." : "⚡ مزامنة سريعة (~500)"}
          </button>
          <button
            className="sync-button sync-button-secondary"
            onClick={handleFullSync}
            disabled={fullSyncLoading || syncLoading}
            title="جلب جميع الإيميلات من Gmail (قد يستغرق وقت طويل)"
          >
            {fullSyncLoading
              ? `⏳ مزامنة كاملة... (${fullSyncStats.pages} صفحة)`
              : ((serverSyncState && serverSyncState.lastPageToken) || localStorage.getItem(tokenKey)
                ? "📥 متابعة المزامنة الكاملة"
                : "📥 مزامنة كاملة (الكل)")}
          </button>
          <button
            className="sync-button"
            onClick={handleResetFullSync}
            disabled={fullSyncLoading}
          >
            🔁 إعادة تعيين المزامنة
          </button>
          {(fullSyncLoading || syncLoading) && (
            <div className="sync-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${(() => {
                    if (syncLoading) {
                      // Show animated progress for simple sync
                      return 50;
                    }
                    // Prefer server counters when available for full sync
                    if (scope === 'inbox' && serverSyncState && typeof serverSyncState.totalSynced === 'number' && typeof serverSyncState.totalSkipped === 'number' && typeof messagesTotal === 'number' && messagesTotal > 0) {
                      const processedMsgs = serverSyncState.totalSynced + serverSyncState.totalSkipped;
                      return Math.min(100, Math.round((processedMsgs / messagesTotal) * 100));
                    }
                    // Fall back to messagesTotal with page estimate
                    if (scope === 'inbox' && messagesTotal && messagesTotal > 0) {
                      const processed = fullSyncStats.pages * 100; // rough estimate per page
                      return Math.min(100, Math.round((processed / messagesTotal) * 100));
                    }
                    return Math.min(100, Math.round((fullSyncStats.pages / FULL_SYNC_PAGE_CAP) * 100));
                  })()}%` }}
                />
              </div>
              <span className="progress-text">
                {syncLoading ? '⏳ جاري التحميل...' : 
                  (scope === 'inbox' && serverSyncState && typeof serverSyncState.totalSynced === 'number' && typeof serverSyncState.totalSkipped === 'number' && typeof messagesTotal === 'number' && messagesTotal > 0
                  ? `📊 ${Math.min(serverSyncState.totalSynced + serverSyncState.totalSkipped, messagesTotal)}/${messagesTotal} (${Math.round((serverSyncState.totalSynced + serverSyncState.totalSkipped) / messagesTotal * 100)}%)`
                    : (scope === 'inbox' && messagesTotal
                      ? `📊 ${Math.min(fullSyncStats.pages * 100, messagesTotal)}/${messagesTotal} (تقريب)`
                      : `📄 ${fullSyncStats.pages} صفحة | 📧 ${fullSyncStats.synced + fullSyncStats.skipped} إيميل`))}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="search-mode-tabs">
        <button
          className={`mode-tab ${searchMode === "chat" ? "active" : ""}`}
          onClick={() => setSearchMode("chat")}
        >
          💬 بحث عام
        </button>
        <button
          className={`mode-tab ${searchMode === "cv" ? "active" : ""}`}
          onClick={() => setSearchMode("cv")}
        >
          📄 بحث في السير الذاتية
        </button>
      </div>

      <div className="chat-history" ref={chatHistoryRef}>
        {chatHistory.length === 0 ? (
          <div className="welcome-message">
            <h3>مرحباً! 👋</h3>
            <p>أنا مساعدك الذكي للبحث في الإيميلات. يمكنني مساعدتك في:</p>
            <ul>
              <li>🔍 البحث عن إيميلات معينة</li>
              <li>📝 تحليل السير الذاتية وترتيب المرشحين</li>
              <li>📊 فلترة الإيميلات حسب المرسل أو التاريخ</li>
              <li>🎯 إيجاد إيميلات مع مرفقات</li>
            </ul>
            <p className="example-queries">
              <strong>أمثلة على الأسئلة:</strong>
              <br />• "أظهر لي السير الذاتية"
              <br />• "أرتب المرشحين لوظيفة مهندس برمجيات"
              <br />• "إيميلات من john@example.com"
              <br />• "إيميلات اليوم مع مرفقات"
              <br />• "ابحث عن رسائل من Alibaba"
              <br />• "أرني جميع الإيميلات من الأسبوع الماضي"
            </p>
            <div className="quick-examples">
              <strong>جرّب الآن:</strong>
              <button
                className="example-btn"
                onClick={() => {
                  setMessage("أظهر لي السير الذاتية");
                  setSearchMode("cv");
                }}
              >
                📄 البحث عن السير الذاتية
              </button>
              <button
                className="example-btn"
                onClick={() => {
                  setMessage("إيميلات من Alibaba");
                  setSearchMode("chat");
                }}
              >
                📧 رسائل من Alibaba
              </button>
              <button
                className="example-btn"
                onClick={() => {
                  setMessage("إيميلات اليوم مع مرفقات");
                  setSearchMode("chat");
                }}
              >
                📎 رسائل مع مرفقات
              </button>
            </div>
          </div>
        ) : (
          chatHistory.map((msg, idx) => renderChatMessage(msg, idx))
        )}
        {loading && (
          <div className="chat-message ai-message loading">
            <div className="loading-dots">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </div>
            جاري التفكير...
          </div>
        )}
      </div>

      <div className="chat-input-section">
        {searchMode === "cv" && (
          <div className="job-requirements-input">
            <input
              type="text"
              placeholder="متطلبات الوظيفة (مثل: Python, 3+ سنوات خبرة, React)"
              value={jobRequirements}
              onChange={(e) => setJobRequirements(e.target.value)}
              className="requirements-input"
            />
          </div>
        )}
        <div className="chat-input-container">
          <textarea
            className="chat-input"
            placeholder={
              searchMode === "cv"
                ? "اسأل عن المرشحين... (مثل: رتب المرشحين حسب الخبرة)"
                : "اسأل عن الإيميلات... (مثل: أظهر إيميلات اليوم)"
            }
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={3}
            disabled={loading}
          />
          <button
            className="send-button"
            onClick={handleSendMessage}
            disabled={loading || !message.trim()}
          >
            {loading ? "⏳" : "➤"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
