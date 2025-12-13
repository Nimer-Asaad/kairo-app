import { useState, useEffect } from "react";
import "./emailsForm.css";
import { apiGet } from "./api";

const DEFAULT_AVATAR =
  "https://ssl.gstatic.com/ui/v1/icons/mail/profile_mask2.png";
const GmailModalDemo = () => {
  const [isModalOpen, setIsModalOpen] = useState(true);

  const [userInfo, setUserInfo] = useState({
    name: "Connected Gmail",
    email: "",
    picture: DEFAULT_AVATAR,
  });

const [emails, setEmails] = useState([]);
const [nextPageToken, setNextPageToken] = useState(null);

const PAGE_SIZE = 20;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showEmailContent, setShowEmailContent] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [currentSummary, setCurrentSummary] = useState("");

  // 🔹 تحميل بروفايل Gmail من الباك إند
  const loadProfile = async () => {
    try {
      const data = await apiGet("/gmail/profile");
      if (data) {
        setUserInfo({
          name: data.name || "Gmail User",
          email: data.email || "",
          picture: data.picture || DEFAULT_AVATAR,
        });
      }
    } catch (err) {
      console.error(err);
      // لو فشل البروفايل مش مشكلة، نترك الديفولت
    }
  };

  // 🔹 تحميل الإيميلات من الباك إند
  // تحميل الإيميلات (أول مرة أو صفحة إضافية)
const loadEmails = async (pageToken = null, append = false) => {
  try {
    setLoading(true);
    setError("");

    const tokenParam = pageToken ? `&pageToken=${pageToken}` : "";
    const data = await apiGet(
      `/gmail/messages?limit=${PAGE_SIZE}${tokenParam}`
    );

    const newEmails = data.emails || [];

    if (append) {
      // نضيف على الموجودين
      setEmails((prev) => [...prev, ...newEmails]);
    } else {
      // أول مرة
      setEmails(newEmails);
    }

    setNextPageToken(data.nextPageToken || null);
  } catch (err) {
    console.error(err);
    setError(err.message || "Failed to load Gmail messages");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    loadProfile();
  }, []);

useEffect(() => {
  loadProfile();   // لو حاب تخليها هنا
  loadEmails();    // أول صفحة بدون pageToken
}, []);            // مرة واحدة بس

  // إعادة ربط / تغيير حساب Gmail
  const handleReconnectGmail = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Session expired, please log in again.");
      window.location.href = "/login";
      return;
    }

    // نفس رابط الـ Connect اللي في صفحة الأدمن
    window.location.href = `http://localhost:5000/gmail/auth?token=${token}`;
  };

  const handleDisconnect = () => {
    alert("Gmail account disconnected! (واجهة فقط حالياً)");
    // هنا لاحقاً ممكن تمسح التوكنات من الباك إند + تفضي الواجهة
  };

  // 🔹 عرض محتوى الإيميل الحقيقي
  const handleShowEmail = async (email) => {
    try {
      setShowSummary(false);
      setShowEmailContent(false);

      const data = await apiGet(`/gmail/messages/${email.id}/summary`);

      setSelectedEmail({
        id: email.id,
        subject: data.subject || email.subject,
        from: data.from || email.from,
        date: data.date || email.date,
        body: data.body || "",
      });

      setShowEmailContent(true);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to load email content");
    }
  };

  // 🔹 تلخيص الإيميل
  const handleSummarize = async (email) => {
    try {
      setShowEmailContent(false);
      setShowSummary(false);

      const data = await apiGet(`/gmail/messages/${email.id}/summary`);

      setSelectedEmail({
        id: email.id,
        subject: data.subject || email.subject,
        from: data.from || email.from,
        date: data.date || email.date,
        body: data.body || "",
      });

      setCurrentSummary(data.summary || "No summary returned");
      setShowSummary(true);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to summarize email");
    }
  };

  // 🔹 زر Load More → نزود limit
  const handleLoadMore = () => {
  if (!nextPageToken) {
    alert("No more emails to load from inbox.");
    return;
  }

  // نجيب الصفحة اللي بعدها ونضيفها
  loadEmails(nextPageToken, true);
};


  if (!isModalOpen) return null;

  return (
    <div className="gmail-modal-overlay">
      <div className="gmail-modal">
        <button
          className="close-button"
          onClick={() => setIsModalOpen(false)}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)")
          }
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="modal-header">
          <div className="header-content">
            <div className="header-icon">📧</div>
            <div>
              <h2>معلومات Gmail</h2>
              <p className="header-subtitle">إدارة البريد الإلكتروني والذكاء الاصطناعي</p>
            </div>
          </div>
        </div>

        <div className="user-section">
          <div className="user-profile-card">
            <div className="profile-pic-wrapper">
              <img src={userInfo.picture} alt="Profile" className="profile-pic" />
              <div className="profile-status"></div>
            </div>
            <div className="user-details">
              <p className="user-name">👤 {userInfo.name}</p>
              <p className="user-email">✉️ {userInfo.email}</p>
            </div>
          </div>

          <div className="account-actions">
            <button className="action-btn reconnect-btn" onClick={handleReconnectGmail}>
              <span className="btn-icon">🔄</span>
              <span>تغيير الحساب</span>
            </button>

            <button className="action-btn disconnect-btn" onClick={handleDisconnect}>
              <span className="btn-icon">⛔</span>
              <span>قطع الاتصال</span>
            </button>
          </div>
        </div>

        <div className="modal-content">
          <div className="inbox-section">
            <div className="inbox-header">
              <div className="inbox-title">
                <span className="inbox-icon">📬</span>
                <h3>صندوق الوارد</h3>
              </div>
              <span className="email-count">
                {loading ? "⏳ جاري التحميل..." : (
                  <>
                    <span className="count-number">{emails.length}</span>
                    <span className="count-label">رسالة</span>
                  </>
                )}
              </span>
            </div>

            {error && (
              <p style={{ color: "red", padding: "0 16px 8px" }}>{error}</p>
            )}

            <div className="emails-list">
              {loading ? <div>loading...</div> :(
                <>
                 {emails.map((email) => (
                <div key={email.id} className="email-item">
                  <div className="email-header">
                    <span className="email-subject">{email.subject}</span>
                    <span className="email-date">{email.date}</span>
                  </div>
                  <span className="email-from">{email.from}</span>
                  <p className="email-snippet">{email.snippet}</p>
                  <div className="email-actions">
                    <button
                      className="action-button show-button"
                      onClick={() => handleShowEmail(email)}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      Show
                    </button>
                    <button
                      className="action-button summarize-button"
                      onClick={() => handleSummarize(email)}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="8" y1="6" x2="21" y2="6"></line>
                        <line x1="8" y1="12" x2="21" y2="12"></line>
                        <line x1="8" y1="18" x2="21" y2="18"></line>
                      </svg>
                      Summarize
                    </button>
                  </div>
                </div>
              ))}
                </>
              ) 

              }
              {/* {emails.map((email) => (
                <div key={email.id} className="email-item">
                  <div className="email-header">
                    <span className="email-subject">{email.subject}</span>
                    <span className="email-date">{email.date}</span>
                  </div>
                  <span className="email-from">{email.from}</span>
                  <p className="email-snippet">{email.snippet}</p>
                  <div className="email-actions">
                    <button
                      className="action-button show-button"
                      onClick={() => handleShowEmail(email)}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      Show
                    </button>
                    <button
                      className="action-button summarize-button"
                      onClick={() => handleSummarize(email)}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="8" y1="6" x2="21" y2="6"></line>
                        <line x1="8" y1="12" x2="21" y2="12"></line>
                        <line x1="8" y1="18" x2="21" y2="18"></line>
                      </svg>
                      Summarize
                    </button>
                  </div>
                </div>
              ))} */}
            </div>

            <button className="load-more-button" onClick={handleLoadMore}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
              Load More Emails
            </button>
          </div>

          {showEmailContent || showSummary ? (
            <div className="email-content-section">
              {showEmailContent && selectedEmail && (
                <>
                  <div className="email-content-header">
                    <h3>Email Content</h3>
                    <button
                      className="close-content-button"
                      onClick={() => setShowEmailContent(false)}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                  <div className="email-content-body">
                    <div className="email-metadata">
                      <div className="metadata-item">
                        <div className="metadata-label">Subject</div>
                        <div className="metadata-value">
                          {selectedEmail.subject}
                        </div>
                      </div>
                      <div className="metadata-item">
                        <div className="metadata-label">From</div>
                        <div className="metadata-value">
                          {selectedEmail.from}
                        </div>
                      </div>
                      <div className="metadata-item">
                        <div className="metadata-label">Date</div>
                        <div className="metadata-value">
                          {selectedEmail.date}
                        </div>
                      </div>
                    </div>
                        <div 
                          className="email-html-viewer" 
                          dangerouslySetInnerHTML={{ __html: selectedEmail.body }} 
                        />

                  </div>
                </>
              )}

              {showSummary && (
                <>
                  <div className="summary-header">
                    <h3>AI Summary</h3>
                    <button
                      className="close-content-button"
                      onClick={() => setShowSummary(false)}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                  <div className="summary-content">{currentSummary}</div>
                </>
              )}
            </div>
          ) : (
            <div className="email-content-section">
              <div className="no-content">
                <h3>Select an email to view content</h3>
                <p>
                  Click "Show" to view full email content or "Summarize" to get
                  an AI summary
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GmailModalDemo;
