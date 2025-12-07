import { useState } from "react";
import "./emailsForm.css";

const GmailModalDemo = () => {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showEmailContent, setShowEmailContent] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [currentSummary, setCurrentSummary] = useState("");

  const userInfo = {
    name: "Sarah Johnson",
    email: "sarah.johnson@gmail.com",
    picture:
      "https://ui-avatars.com/api/?name=Sarah+Johnson&background=4285f4&color=fff&size=120",
  };

  const emails = [
    {
      id: "1",
      subject: "Q4 Strategy Meeting - Action Items",
      from: "team.lead@company.com",
      date: "Dec 7, 2025",
      snippet:
        "Following up on our strategy meeting, here are the key action items we discussed...",
      body: "Hi Team,\n\nThank you all for participating in our Q4 strategy meeting. Here are the key action items and deadlines:\n\n1. Marketing Campaign Launch - Dec 15\n2. Product Roadmap Review - Dec 20\n3. Budget Planning - Dec 28\n\nPlease ensure all tasks are completed on time.\n\nBest regards,\nTeam Lead",
    },
    {
      id: "2",
      subject: "New Project Proposal: Mobile App Redesign",
      from: "product.manager@company.com",
      date: "Dec 6, 2025",
      snippet:
        "Excited to share our new mobile app redesign proposal with improved UX and performance...",
      body: "Hello Everyone,\n\nI am excited to present our mobile app redesign proposal. After analyzing user feedback and market trends, we have identified key areas for improvement.\n\nThe estimated timeline is 3 months with a budget of $150K.\n\nBest,\nProduct Team",
    },
    {
      id: "3",
      subject: "Security Update: New Authentication System",
      from: "security@company.com",
      date: "Dec 5, 2025",
      snippet:
        "Important security update regarding our new two-factor authentication system...",
      body: "Security Notice\n\nWe are implementing a new two-factor authentication system to enhance account security.\n\nAction Required:\n1. Download an authenticator app\n2. Set up 2FA in your account settings\n3. Save your backup codes securely\n\nStay secure!\nSecurity Team",
    },
    {
      id: "4",
      subject: "Training Session: Advanced Analytics Tools",
      from: "training@company.com",
      date: "Dec 4, 2025",
      snippet:
        "Join us for an in-depth training on our new analytics platform...",
      body: "Hi Everyone,\n\nWe are hosting a comprehensive training session on our new analytics platform!\n\nSession Details:\nDate: December 12, 2025\nTime: 2:00 PM - 4:00 PM EST\n\nSee you there!\nTraining Team",
    },
    {
      id: "5",
      subject: "Team Building Event: Holiday Party",
      from: "hr@company.com",
      date: "Dec 3, 2025",
      snippet:
        "You are invited to our annual holiday celebration! Food, games, and prizes...",
      body: "Happy Holidays!\n\nYou are invited to our annual Holiday Party!\n\nEvent Details:\nDate: December 18, 2025\nTime: 6:00 PM - 10:00 PM\n\nLooking forward to seeing everyone!\n\nWarmly,\nHR Team",
    },
    {
      id: "6",
      subject: "Monthly Newsletter: December Edition",
      from: "communications@company.com",
      date: "Dec 2, 2025",
      snippet:
        "Company updates, achievements, and upcoming events for December...",
      body: "December Newsletter\n\nCompany Highlights:\n- Reached 1 million active users\n- 150% revenue growth\n\nThank you for an incredible year!\n\nCheers,\nLeadership Team",
    },
    {
      id: "7",
      subject: "Weekly Report: Sales Performance",
      from: "sales@company.com",
      date: "Dec 1, 2025",
      snippet:
        "Our sales team exceeded targets this week with remarkable performance...",
      body: "Sales Update\n\nThis week we achieved:\n- 125% of weekly target\n- 15 new clients signed\n- $500K in revenue\n\nGreat work team!\n\nSales Manager",
    },
    {
      id: "8",
      subject: "IT Maintenance Notice",
      from: "it@company.com",
      date: "Nov 30, 2025",
      snippet: "Scheduled system maintenance this weekend...",
      body: "IT Notice\n\nScheduled maintenance:\nDate: Dec 7-8\nTime: 11 PM - 6 AM\n\nServices will be temporarily unavailable.\n\nIT Team",
    },
  ];

  const handleDisconnect = () => {
    alert("Gmail account disconnected!");
  };

  const handleShowEmail = (email) => {
    setSelectedEmail(email);
    setShowEmailContent(true);
    setShowSummary(false);
  };

  const handleSummarize = (email) => {
    const summaries = {
      1: "Summary of Q4 strategy meeting action items: Marketing campaign launch on Dec 15, product roadmap review on Dec 20, and budget planning on Dec 28.",
      2: "Proposal for mobile app redesign focusing on UX improvements with expected outcomes. Project timeline: 3 months, budget: $150K.",
      3: "Security update announcing mandatory two-factor authentication. Users must download authenticator app, set up 2FA, and save backup codes.",
      4: "Training session on new analytics platform scheduled for Dec 12, 2-4 PM EST.",
      5: "Annual holiday party invitation for Dec 18, 6-10 PM. Family-friendly event with dinner, entertainment, and prizes.",
      6: "December newsletter highlighting company milestones: 1M users, 150% revenue growth. Thanks to all team members.",
      7: "Weekly sales report showing 125% target achievement, 15 new clients, and $500K revenue.",
      8: "IT maintenance notice for Dec 7-8, 11 PM - 6 AM. Services temporarily unavailable.",
    };

    setCurrentSummary(summaries[email.id] || "Summary not available");
    setShowSummary(true);
    setShowEmailContent(false);
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
          <h2>Gmail Info</h2>
        </div>

        <div className="user-section">
          <div className="user-info">
            <img src={userInfo.picture} alt="Profile" className="profile-pic" />
            <div>
              <p className="user-name">{userInfo.name}</p>
              <p className="user-email">{userInfo.email}</p>
            </div>
          </div>
          <button className="disconnect-button" onClick={handleDisconnect}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Disconnect
          </button>
        </div>

        <div className="modal-content">
          <div className="inbox-section">
            <div className="inbox-header">
              <h3>Inbox</h3>
              <span className="email-count">{emails.length} emails</span>
            </div>
            <div className="emails-list">
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
            </div>
            <button className="load-more-button">
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
                    <textarea
                      className="email-textarea"
                      value={selectedEmail.body}
                      readOnly
                      rows="20"
                    />
                  </div>
                </>
              )}

              {showSummary && (
                <>
                  <div className="summary-header">
                    <h3>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#4285f4"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                      </svg>
                      AI Summary
                    </h3>
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
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
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
