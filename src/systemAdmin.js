// src/systemAdmin.js
import React, { useState, useEffect } from "react";
import "./systemAdmin.css";
import { apiGet, apiPost } from "./api";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [persons, setPersons] = useState([]);
  const [hrs, setHrs] = useState([]);
  const [employees, setEmployees] = useState([]);

  // فورم إنشاء HR / Employee - PASSWORD FIELD REMOVED ✅
  const [staffForm, setStaffForm] = useState({
    role: "hr",
    full_name: "",
    email: "",
    phone: "",
    address: "",
    status: "active",
  });

  const [activeChatId, setActiveChatId] = useState(null);
  const [activeChatType, setActiveChatType] = useState(null);
  const [messages, setMessages] = useState({});
  const [currentMessage, setCurrentMessage] = useState("");
  const [emailFilter, setEmailFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ===== Gmail + AI CV Tools State =====
  const [gmailEmails, setGmailEmails] = useState([]);
  const [selectedEmailId, setSelectedEmailId] = useState("");
  const [emailSummary, setEmailSummary] = useState("");

  const [cvRequirements, setCvRequirements] = useState("");
  const [cvKeywords, setCvKeywords] = useState("");
  const [cvResults, setCvResults] = useState([]);
  const [cvLoading, setCvLoading] = useState(false);

  // 🔐 حماية صفحة الأدمن + تحميل المستخدمين من Mongo
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      navigate("/login");
      return;
    }

    let currentUser;
    try {
      currentUser = JSON.parse(storedUser);
    } catch {
      navigate("/login");
      return;
    }

    // بس ال company مسموح يدخل صفحة الأدمن
    if (currentUser.role !== "company") {
      navigate("/login");
      return;
    }

    async function loadUsers() {
      try {
        setLoading(true);
        setError("");

        const data = await apiGet("/auth/users");
        const all = data.users || [];

        setCompanies(
          all
            .filter((u) => u.role === "company")
            .map((u) => ({
              id: u._id,
              name: u.full_name,
              email: u.email,
              phone: u.phone || "",
              address: u.address || "",
              status: u.is_active ? "active" : "inactive",
              type: "company",
            }))
        );

        setPersons(
          all
            .filter((u) => u.role === "person")
            .map((u) => ({
              id: u._id,
              name: u.full_name,
              email: u.email,
              phone: u.phone || "",
              address: u.address || "",
              status: u.is_active ? "active" : "inactive",
              type: "person",
              subscription: "Basic",
            }))
        );

        setHrs(
          all
            .filter((u) => u.role === "hr")
            .map((u) => ({
              id: u._id,
              name: u.full_name,
              email: u.email,
              phone: u.phone || "",
              address: u.address || "",
              status: u.is_active ? "active" : "inactive",
              type: "hr",
            }))
        );

        setEmployees(
          all
            .filter((u) => u.role === "employee")
            .map((u) => ({
              id: u._id,
              name: u.full_name,
              email: u.email,
              phone: u.phone || "",
              address: u.address || "",
              status: u.is_active ? "active" : "inactive",
              type: "employee",
            }))
        );
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // 🎯 إنشاء HR / Employee في الداتابيس - PASSWORD REMOVED ✅
  const handleCreateStaff = async () => {
    if (!staffForm.full_name || !staffForm.email) {
      alert("Please fill name and email");
      return;
    }

    try {
      const body = {
        full_name: staffForm.full_name,
        email: staffForm.email,
        role: staffForm.role, // hr أو employee
      };

      if (staffForm.phone.trim()) {
        body.phone = staffForm.phone;
      }

      if (staffForm.address.trim()) {
        body.address = staffForm.address;
      }

      if (staffForm.status) {
        body.is_active = staffForm.status === "active";
      }

      const data = await apiPost("/auth/create-user", body);

      const newUser = {
        id: data.user._id, // مهم توحيد الاسم مع Mongo
        name: data.user.full_name,
        email: data.user.email,
        phone: staffForm.phone || "",
        address: staffForm.address || "",
        status: staffForm.status,
        type: staffForm.role,
      };

      if (staffForm.role === "hr") {
        setHrs((prev) => [...prev, newUser]);
      } else if (staffForm.role === "employee") {
        setEmployees((prev) => [...prev, newUser]);
      }

      alert(
        `User created successfully!\nEmail: ${
          data.user.email
        }\nTemporary Password: ${data.temp_password || "123456"}`
      );

      setStaffForm({
        role: "hr",
        full_name: "",
        email: "",
        phone: "",
        address: "",
        status: "active",
      });
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to create user");
    }
  };

  // حذف من الواجهة فقط (مش داتابيس)
  const handleDelete = (id, type) => {
    if (!window.confirm("Delete this item from UI? (not DB)")) return;

    if (type === "company") {
      setCompanies((prev) => prev.filter((c) => c.id !== id));
    } else if (type === "person") {
      setPersons((prev) => prev.filter((p) => p.id !== id));
    } else if (type === "hr") {
      setHrs((prev) => prev.filter((h) => h.id !== id));
    } else if (type === "employee") {
      setEmployees((prev) => prev.filter((e) => e.id !== id));
    }
  };

  // الشات
  const handleSendMessage = () => {
    if (!currentMessage.trim() || !activeChatId) return;

    const chatKey = `${activeChatType}-${activeChatId}`;
    const newMsg = {
      id: Date.now(),
      sender: "admin",
      text: currentMessage,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => ({
      ...prev,
      [chatKey]: [...(prev[chatKey] || []), newMsg],
    }));

    setCurrentMessage("");
  };

  // فلترة الإيميلات (Users)
  const getFilteredData = () => {
    const allData = [...companies, ...persons, ...hrs, ...employees];

    switch (emailFilter) {
      case "companies":
        return companies;
      case "persons":
        return persons;
      case "hrs":
        return hrs;
      case "employees":
        return employees;
      case "active":
        return allData.filter((i) => i.status === "active");
      case "inactive":
        return allData.filter((i) => i.status === "inactive");
      default:
        return allData;
    }
  };

  // ===== Gmail + AI CV Tools Handlers =====

  // ربط حساب Gmail بالسيستم (OAuth)
  const handleConnectGmail = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Session expired, please log in again.");
      navigate("/login");
      return;
    }

    // نبعت التوكن كـ query param
    window.location.href = `http://localhost:5000/gmail/auth?token=${token}`;
  };

  // تحميل آخر إيميلات من Gmail (من الباك إند)
  const handleLoadGmailEmails = async () => {
    try {
      setEmailSummary("");
      setSelectedEmailId("");
      const data = await apiGet("/gmail/messages?limit=20");
      setGmailEmails(data || []);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to load Gmail messages");
    }
  };

  // تلخيص إيميل معيّن باستخدام AI
  const handleSummarizeEmail = async () => {
    if (!selectedEmailId) {
      alert("اختر إيميل أولاً");
      return;
    }
    try {
      const data = await apiGet(`/gmail/messages/${selectedEmailId}/summary`);
      setEmailSummary(data.summary || "No summary returned");
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to summarize email");
    }
  };

  // فلترة إيميلات الـ CV حسب المتطلبات والكلمات
  const handleFilterCvEmails = async () => {
    if (!cvRequirements.trim()) {
      alert("اكتب متطلبات الوظيفة أولاً");
      return;
    }

    try {
      setCvLoading(true);
      setCvResults([]);

      const body = {
        requirements: cvRequirements,
        keywords: cvKeywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
      };

      const data = await apiPost("/gmail/filter-cvs", body);
      setCvResults(data || []);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to filter CV emails");
    } finally {
      setCvLoading(false);
    }
  };

  // === TABS RENDER ===

  const renderDashboard = () => (
    <div>
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-icon">🏢</div>
          <div className="stat-number">{companies.length}</div>
          <div className="stat-label">Total Companies</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div className="stat-number">{persons.length}</div>
          <div className="stat-label">Total Persons</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🧑‍💼</div>
          <div className="stat-number">{hrs.length}</div>
          <div className="stat-label">Total HR</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👨‍🔧</div>
          <div className="stat-number">{employees.length}</div>
          <div className="stat-label">Total Employees</div>
        </div>
      </div>

      {/* Companies */}
      <div className="card">
        <h3 className="card-title">Companies Overview</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.phone}</td>
                <td>
                  <span className={`badge badge-${c.status}`}>
                    {c.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Persons */}
      <div className="card">
        <h3 className="card-title">Persons & Subscriptions</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Subscription</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {persons.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.email}</td>
                <td>{p.subscription}</td>
                <td>
                  <span className={`badge badge-${p.status}`}>
                    {p.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* HR & Employees */}
      <div className="card">
        <h3 className="card-title">HR Accounts</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {hrs.map((h) => (
              <tr key={h.id}>
                <td>{h.name}</td>
                <td>{h.email}</td>
                <td>
                  <span className={`badge badge-${h.status}`}>
                    {h.status.toUpperCase()}
                  </span>
                </td>
                <td>
                  <button
                    className="btn-danger"
                    onClick={() => handleDelete(h.id, "hr")}
                  >
                    Remove (UI)
                  </button>
                </td>
              </tr>
            ))}
            {hrs.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", color: "#999" }}>
                  No HR accounts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3 className="card-title">Employee Accounts</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((e) => (
              <tr key={e.id}>
                <td>{e.name}</td>
                <td>{e.email}</td>
                <td>
                  <span className={`badge badge-${e.status}`}>
                    {e.status.toUpperCase()}
                  </span>
                </td>
                <td>
                  <button
                    className="btn-danger"
                    onClick={() => handleDelete(e.id, "employee")}
                  >
                    Remove (UI)
                  </button>
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", color: "#999" }}>
                  No employee accounts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAddStaff = () => (
    <div>
      <div className="card">
        <h2 className="card-title">Create HR / Employee Account</h2>
        <div className="form-grid">
          <div className="input-group">
            <label>Role *</label>
            <select
              value={staffForm.role}
              onChange={(e) =>
                setStaffForm((prev) => ({ ...prev, role: e.target.value }))
              }
            >
              <option value="hr">HR</option>
              <option value="employee">Employee</option>
            </select>
          </div>

          <div className="input-group">
            <label>Full Name *</label>
            <input
              type="text"
              placeholder="Full name"
              value={staffForm.full_name}
              onChange={(e) =>
                setStaffForm((prev) => ({ ...prev, full_name: e.target.value }))
              }
            />
          </div>

          <div className="input-group">
            <label>Email *</label>
            <input
              type="email"
              placeholder="Email"
              value={staffForm.email}
              onChange={(e) =>
                setStaffForm((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </div>

          <div className="input-group">
            <label>Phone</label>
            <input
              type="tel"
              placeholder="Phone"
              value={staffForm.phone}
              onChange={(e) =>
                setStaffForm((prev) => ({ ...prev, phone: e.target.value }))
              }
            />
          </div>

          <div className="input-group">
            <label>Address</label>
            <input
              type="text"
              placeholder="Address"
              value={staffForm.address}
              onChange={(e) =>
                setStaffForm((prev) => ({ ...prev, address: e.target.value }))
              }
            />
          </div>

          <div className="input-group">
            <label>Status</label>
            <select
              value={staffForm.status}
              onChange={(e) =>
                setStaffForm((prev) => ({ ...prev, status: e.target.value }))
              }
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <button className="btn-primary" onClick={handleCreateStaff}>
          Create User
        </button>
      </div>

      <div className="card">
        <h3 className="card-title">All HR & Employees</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {[...hrs, ...employees].map((u) => (
              <tr key={`${u.type}-${u.id}`}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.phone || "N/A"}</td>
                <td>{u.type === "hr" ? "HR" : "Employee"}</td>
                <td>
                  <span className={`badge badge-${u.status}`}>
                    {u.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
            {hrs.length + employees.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", color: "#999" }}>
                  No staff accounts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderChat = () => {
    const allContacts = [
      ...companies.map((c) => ({ ...c, displayType: "Company" })),
      ...persons.map((p) => ({ ...p, displayType: "Person" })),
      ...hrs.map((h) => ({ ...h, displayType: "HR" })),
      ...employees.map((e) => ({ ...e, displayType: "Employee" })),
    ];

    const activeContact = allContacts.find(
      (c) => c.id === activeChatId && c.type === activeChatType
    );

    const chatKey =
      activeChatId && activeChatType
        ? `${activeChatType}-${activeChatId}`
        : null;

    return (
      <div className="chat-layout">
        <div className="chat-sidebar">
          <div className="chat-sidebar-header">Contacts</div>
          {allContacts.map((contact) => (
            <div
              key={`${contact.type}-${contact.id}`}
              className={
                activeChatId === contact.id && activeChatType === contact.type
                  ? "contact-item active"
                  : "contact-item"
              }
              onClick={() => {
                setActiveChatId(contact.id);
                setActiveChatType(contact.type);
              }}
            >
              <div className="contact-name">{contact.name}</div>
              <div className="contact-email">{contact.email}</div>
              <div className="contact-type">{contact.displayType}</div>
            </div>
          ))}
        </div>

        <div className="chat-window">
          {activeContact ? (
            <div className="chat-content">
              <h3 className="chat-header">
                Chat with {activeContact.name} ({activeContact.displayType})
              </h3>
              <div className="messages-area">
                {(messages[chatKey] || []).map((msg) => (
                  <div key={msg.id} className={`message message-${msg.sender}`}>
                    <div>{msg.text}</div>
                    <div className="message-time">{msg.timestamp}</div>
                  </div>
                ))}
              </div>
              <div className="chat-input-container">
                <input
                  type="text"
                  className="chat-input"
                  placeholder="Type message..."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <button className="btn-primary" onClick={handleSendMessage}>
                  Send
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              Select a contact to start chatting
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderEmailFilter = () => {
    const filtered = getFilteredData();

    const getTypeLabel = (t) => {
      if (t === "company") return "Company";
      if (t === "person") return "Person";
      if (t === "hr") return "HR";
      if (t === "employee") return "Employee";
      return t;
    };

    return (
      <div className="card">
        <h2 className="card-title">Email Filter</h2>
        <div className="filter-section">
          <select
            value={emailFilter}
            onChange={(e) => setEmailFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="companies">Companies</option>
            <option value="persons">Persons</option>
            <option value="hrs">HR</option>
            <option value="employees">Employees</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button
            className="btn-primary"
            onClick={() =>
              alert("Emails: " + filtered.map((u) => u.email).join(", "))
            }
          >
            Copy Emails
          </button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={`${u.type}-${u.id}`}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{getTypeLabel(u.type)}</td>
                <td>
                  <span className={`badge badge-${u.status}`}>
                    {u.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", color: "#999" }}>
                  No users match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <p className="filter-total">Total: {filtered.length}</p>
      </div>
    );
  };

  const renderGmailAiTools = () => (
    <div>
      {/* Card 0: Connect Gmail */}
      <div className="card">
        <h2 className="card-title">Connect Gmail</h2>
        <p style={{ marginBottom: "10px" }}>
          اربط حساب Gmail الخاص بالـ Company حتى يقدر Kairo يقرأ الإيميلات
          المتعلقة بالوظائف ويعمل تلخيص وفلترة CVs تلقائياً.
        </p>
        <button className="btn-primary" onClick={handleConnectGmail}>
          Connect Gmail Account
        </button>
      </div>

      {/* Card 1: Email Summarizer */}
      <div className="card">
        <h2 className="card-title">Email Summarizer (AI)</h2>

        <div className="filter-section" style={{ gap: "10px" }}>
          <button className="btn-primary" onClick={handleLoadGmailEmails}>
            Load Recent Gmail Messages
          </button>

          <select
            value={selectedEmailId}
            onChange={(e) => setSelectedEmailId(e.target.value)}
          >
            <option value="">Select an email...</option>
            {gmailEmails.map((m) => (
              <option key={m.id} value={m.id}>
                {m.subject} — {m.from}
              </option>
            ))}
          </select>

          <button className="btn-secondary" onClick={handleSummarizeEmail}>
            Summarize Selected Email
          </button>
        </div>

        <table className="data-table" style={{ marginTop: "15px" }}>
          <thead>
            <tr>
              <th>Subject</th>
              <th>From</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {gmailEmails.map((m) => (
              <tr key={m.id}>
                <td>{m.subject}</td>
                <td>{m.from}</td>
                <td>{m.date}</td>
              </tr>
            ))}
            {gmailEmails.length === 0 && (
              <tr>
                <td colSpan="3" style={{ textAlign: "center", color: "#999" }}>
                  No emails loaded yet. Click "Load Recent Gmail Messages".
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {emailSummary && (
          <div className="card" style={{ marginTop: "15px" }}>
            <h3 className="card-title">AI Summary</h3>
            <p>{emailSummary}</p>
          </div>
        )}
      </div>

      {/* Card 2: Smart CV Filter */}
      <div className="card">
        <h2 className="card-title">Smart CV Filter (AI)</h2>

        <div className="form-grid">
          <div className="input-group" style={{ gridColumn: "1 / -1" }}>
            <label>Job Requirements *</label>
            <textarea
              placeholder="اكتب هنا متطلبات الوظيفة (خبرة، Skills، لغة، ...)"
              value={cvRequirements}
              onChange={(e) => setCvRequirements(e.target.value)}
              rows={4}
            />
          </div>

          <div className="input-group">
            <label>Keywords (optional)</label>
            <input
              type="text"
              placeholder="مثال: cv,resume,job application"
              value={cvKeywords}
              onChange={(e) => setCvKeywords(e.target.value)}
            />
          </div>
        </div>

        <button className="btn-primary" onClick={handleFilterCvEmails}>
          {cvLoading ? "Analyzing..." : "Analyze Inbox for CVs"}
        </button>

        <table className="data-table" style={{ marginTop: "15px" }}>
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Email</th>
              <th>Position</th>
              <th>Score</th>
              <th>Decision</th>
              <th>Open in Gmail</th>
            </tr>
          </thead>
          <tbody>
            {cvResults.map((app) => (
              <tr key={app.id}>
                <td>{app.candidateName || "-"}</td>
                <td>{app.from || "-"}</td>
                <td>{app.position || "-"}</td>
                <td>{app.score ?? "-"}</td>
                <td>{app.decision || "-"}</td>
                <td>
                  {app.gmailLink ? (
                    <a href={app.gmailLink} target="_blank" rel="noreferrer">
                      View
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
            {cvResults.length === 0 && !cvLoading && (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", color: "#999" }}>
                  No CV results yet. Fill the requirements then click
                  &quot;Analyze Inbox for CVs&quot;.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="admin-container">
      <div className="header">
        <h1 className="header-title">System Admin Dashboard</h1>
        <button
          className="btn-secondary"
          onClick={handleLogout}
          style={{ marginLeft: "auto" }}
        >
          Logout
        </button>
      </div>

      {loading && <p style={{ marginTop: "10px" }}>Loading users...</p>}
      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

      <div className="navigation">
        <button
          className={
            activeTab === "dashboard" ? "nav-button active" : "nav-button"
          }
          onClick={() => setActiveTab("dashboard")}
        >
          Dashboard
        </button>
        <button
          className={activeTab === "add" ? "nav-button active" : "nav-button"}
          onClick={() => setActiveTab("add")}
        >
          Add HR/Employee
        </button>
        <button
          className={activeTab === "chat" ? "nav-button active" : "nav-button"}
          onClick={() => setActiveTab("chat")}
        >
          Chat
        </button>
        <button
          className={
            activeTab === "filter" ? "nav-button active" : "nav-button"
          }
          onClick={() => setActiveTab("filter")}
        >
          Email Filter
        </button>
        <button
          className={
            activeTab === "gmail_ai" ? "nav-button active" : "nav-button"
          }
          onClick={() => setActiveTab("gmail_ai")}
        >
          Gmail AI (CV)
        </button>
      </div>

      {activeTab === "dashboard" && renderDashboard()}
      {activeTab === "add" && renderAddStaff()}
      {activeTab === "chat" && renderChat()}
      {activeTab === "filter" && renderEmailFilter()}
      {activeTab === "gmail_ai" && renderGmailAiTools()}
    </div>
  );
};

export default AdminDashboard;
