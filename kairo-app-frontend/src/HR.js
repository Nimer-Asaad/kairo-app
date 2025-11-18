import React, { useState } from "react";
import "./HR.css";

// Main HR Dashboard Component
function HRDashboard() {
  const [activeTab, setActiveTab] = useState("emails");
  const [emails, setEmails] = useState([
    {
      id: 1,
      from: "john.doe@company.com",
      subject: "Leave Request - Annual Leave",
      preview: "Hi, I would like to request annual leave from...",
      date: "2025-11-06",
      read: false,
      category: "leave",
    },
    {
      id: 2,
      from: "sarah.smith@company.com",
      subject: "Salary Inquiry",
      preview: "Could you please clarify the bonus structure...",
      date: "2025-11-05",
      read: false,
      category: "salary",
    },
    {
      id: 3,
      from: "mike.jones@company.com",
      subject: "Training Request",
      preview: "I am interested in attending the leadership training...",
      date: "2025-11-04",
      read: true,
      category: "training",
    },
  ]);

  const [filterCategory, setFilterCategory] = useState("all");
  const [filterRead, setFilterRead] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    position: "",
    department: "",
    notes: "",
  });

  const [selectedContact, setSelectedContact] = useState(null);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState({});

  const contacts = [
    { id: 1, name: "John Doe", role: "Software Engineer" },
    { id: 2, name: "Sarah Smith", role: "Marketing Manager" },
    { id: 3, name: "Mike Jones", role: "Sales Director" },
    { id: 4, name: "Admin Team", role: "Administration" },
  ];

  // Email Management Functions
  const markAsRead = (emailId) => {
    setEmails(
      emails.map((email) =>
        email.id === emailId ? { ...email, read: true } : email
      )
    );
  };

  const deleteEmail = (emailId) => {
    setEmails(emails.filter((email) => email.id !== emailId));
  };

  const getFilteredEmails = () => {
    return emails.filter((email) => {
      const matchesCategory =
        filterCategory === "all" || email.category === filterCategory;
      const matchesRead =
        filterRead === "all" ||
        (filterRead === "unread" && !email.read) ||
        (filterRead === "read" && email.read);
      const matchesSearch =
        email.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.subject.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesCategory && matchesRead && matchesSearch;
    });
  };

  // Employee Management Functions
  const handleEmployeeInputChange = (field, value) => {
    setNewEmployee({ ...newEmployee, [field]: value });
  };

  const submitNewEmployee = () => {
    if (newEmployee.name && newEmployee.email && newEmployee.position) {
      alert(
        `Employee report submitted to admin:\n\nName: ${newEmployee.name}\nEmail: ${newEmployee.email}\nPosition: ${newEmployee.position}\nDepartment: ${newEmployee.department}\n\nThe admin team will review this request.`
      );
      setNewEmployee({
        name: "",
        email: "",
        position: "",
        department: "",
        notes: "",
      });
    } else {
      alert("Please fill in all required fields (Name, Email, Position)");
    }
  };

  // Chat Functions
  const handleContactSelect = (contact) => {
    setSelectedContact(contact);
    if (!chatMessages[contact.id]) {
      setChatMessages({
        ...chatMessages,
        [contact.id]: [],
      });
    }
  };

  const sendMessage = () => {
    if (chatMessage.trim() && selectedContact) {
      const newMessage = {
        id: Date.now(),
        text: chatMessage,
        sender: "me",
        timestamp: new Date().toLocaleTimeString(),
      };

      setChatMessages({
        ...chatMessages,
        [selectedContact.id]: [
          ...(chatMessages[selectedContact.id] || []),
          newMessage,
        ],
      });

      setChatMessage("");

      setTimeout(() => {
        const autoReply = {
          id: Date.now() + 1,
          text: "Thank you for your message. I will get back to you shortly.",
          sender: "them",
          timestamp: new Date().toLocaleTimeString(),
        };
        setChatMessages((prev) => ({
          ...prev,
          [selectedContact.id]: [
            ...(prev[selectedContact.id] || []),
            autoReply,
          ],
        }));
      }, 1000);
    }
  };

  // Render Email Management Tab
  const renderEmailManagement = () => {
    return (
      <div className="content-card">
        <h2 className="section-title">📧 Email Management</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{emails.length}</div>
            <div className="stat-label">Total Emails</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {emails.filter((e) => !e.read).length}
            </div>
            <div className="stat-label">Unread Emails</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {emails.filter((e) => e.read).length}
            </div>
            <div className="stat-label">Read Emails</div>
          </div>
        </div>
        <div className="filter-controls">
          <input
            type="text"
            className="filter-input"
            placeholder="Search emails..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="filter-input"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="leave">Leave Requests</option>
            <option value="salary">Salary Inquiries</option>
            <option value="training">Training Requests</option>
          </select>
          <select
            className="filter-input"
            value={filterRead}
            onChange={(e) => setFilterRead(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="unread">Unread Only</option>
            <option value="read">Read Only</option>
          </select>
        </div>
        <div className="email-list">
          {getFilteredEmails().length === 0 ? (
            <div className="empty-state">📭 No emails match your filters</div>
          ) : (
            getFilteredEmails().map((email) => (
              <div
                key={email.id}
                className={`email-item ${!email.read ? "unread" : ""}`}
              >
                <div className="email-header">
                  <span className="email-from">
                    {email.from}
                    <span
                      className={`badge ${
                        email.read ? "badge-read" : "badge-new"
                      }`}
                    >
                      {email.read ? "Read" : "New"}
                    </span>
                  </span>
                  <span className="email-date">{email.date}</span>
                </div>
                <div className="email-subject">{email.subject}</div>
                <div className="email-preview">{email.preview}</div>
                <div className="email-actions">
                  {!email.read && (
                    <button
                      className="action-button btn-primary"
                      onClick={() => markAsRead(email.id)}
                    >
                      Mark as Read
                    </button>
                  )}
                  <button
                    className="action-button btn-danger"
                    onClick={() => deleteEmail(email.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // Render Add Employee Tab
  const renderAddEmployee = () => {
    return (
      <div className="content-card">
        <h2 className="section-title">👤 Add New Employee (Report to Admin)</h2>
        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input
            type="text"
            className="form-input"
            value={newEmployee.name}
            onChange={(e) => handleEmployeeInputChange("name", e.target.value)}
            placeholder="Enter employee full name"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Email Address *</label>
          <input
            type="email"
            className="form-input"
            value={newEmployee.email}
            onChange={(e) => handleEmployeeInputChange("email", e.target.value)}
            placeholder="employee@company.com"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Position *</label>
          <input
            type="text"
            className="form-input"
            value={newEmployee.position}
            onChange={(e) =>
              handleEmployeeInputChange("position", e.target.value)
            }
            placeholder="e.g., Software Engineer"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Department</label>
          <select
            className="form-select"
            value={newEmployee.department}
            onChange={(e) =>
              handleEmployeeInputChange("department", e.target.value)
            }
          >
            <option value="">Select Department</option>
            <option value="IT">IT</option>
            <option value="HR">HR</option>
            <option value="Marketing">Marketing</option>
            <option value="Sales">Sales</option>
            <option value="Finance">Finance</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Additional Notes</label>
          <textarea
            className="form-textarea"
            value={newEmployee.notes}
            onChange={(e) => handleEmployeeInputChange("notes", e.target.value)}
            placeholder="Any additional information for the admin..."
          />
        </div>
        <button
          className="action-button btn-success"
          onClick={submitNewEmployee}
          style={{ width: "100%", padding: "12px" }}
        >
          Submit to Admin for Approval
        </button>
      </div>
    );
  };

  // Render Chat Tab
  const renderChat = () => {
    return (
      <div className="content-card">
        <h2 className="section-title">💬 Chat with Employees & Managers</h2>
        <div className="chat-container">
          <div className="contacts-list">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className={`contact-item ${
                  selectedContact?.id === contact.id ? "active" : ""
                }`}
                onClick={() => handleContactSelect(contact)}
              >
                <div className="contact-name">{contact.name}</div>
                <div className="contact-role">{contact.role}</div>
              </div>
            ))}
          </div>
          <div className="chat-window">
            {selectedContact ? (
              <>
                <div className="chat-header">
                  <h3>{selectedContact.name}</h3>
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      fontSize: "14px",
                      opacity: 0.9,
                    }}
                  >
                    {selectedContact.role}
                  </p>
                </div>
                <div className="chat-messages">
                  {(chatMessages[selectedContact.id] || []).length === 0 ? (
                    <div className="empty-state">💭 Start a conversation</div>
                  ) : (
                    (chatMessages[selectedContact.id] || []).map((msg) => (
                      <div
                        key={msg.id}
                        className={`message ${
                          msg.sender === "me" ? "sent" : "received"
                        }`}
                      >
                        <div>{msg.text}</div>
                        <div className="message-time">{msg.timestamp}</div>
                      </div>
                    ))
                  )}
                </div>
                <div className="chat-input-container">
                  <input
                    type="text"
                    className="chat-input"
                    placeholder="Type your message..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  />
                  <button
                    className="action-button btn-primary"
                    onClick={sendMessage}
                  >
                    Send
                  </button>
                </div>
              </>
            ) : (
              <div
                className="empty-state"
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                👈 Select a contact to start chatting
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Main Render
  return (
    <div className="hr-dashboard">
      <div className="dashboard-header">
        <h1>👔 HR Dashboard</h1>
        <p>Manage emails, employees, and communications</p>
      </div>
      <div className="nav-tabs">
        <button
          className={`tab-button ${activeTab === "emails" ? "active" : ""}`}
          onClick={() => setActiveTab("emails")}
        >
          📧 Manage Emails
        </button>
        <button
          className={`tab-button ${
            activeTab === "add-employee" ? "active" : ""
          }`}
          onClick={() => setActiveTab("add-employee")}
        >
          👤 Add Employee
        </button>
        <button
          className={`tab-button ${activeTab === "chat" ? "active" : ""}`}
          onClick={() => setActiveTab("chat")}
        >
          💬 Chat
        </button>
      </div>
      {activeTab === "emails" && renderEmailManagement()}
      {activeTab === "add-employee" && renderAddEmployee()}
      {activeTab === "chat" && renderChat()}
    </div>
  );
}

export default HRDashboard;
