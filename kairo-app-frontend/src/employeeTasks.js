import { useState } from "react";
import "./employeeTasks.css";

export default function EmployeeDashboard() {
  const [activeTab, setActiveTab] = useState("tasks");
  const [selectedProject, setSelectedProject] = useState(null);
  const [chatMessage, setChatMessage] = useState("");
  const [reportType, setReportType] = useState("completion");
  const [reportDescription, setReportDescription] = useState("");
  const [selectedTaskForReport, setSelectedTaskForReport] = useState(1);

  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Design Homepage",
      project: "Website Redesign",
      status: "in-progress",
      priority: "high",
      deadline: "2025-11-10",
    },
    {
      id: 2,
      title: "API Integration",
      project: "Mobile App",
      status: "pending",
      priority: "medium",
      deadline: "2025-11-15",
    },
    {
      id: 3,
      title: "Database Optimization",
      project: "Backend System",
      status: "in-progress",
      priority: "high",
      deadline: "2025-11-08",
    },
    {
      id: 4,
      title: "User Testing",
      project: "Website Redesign",
      status: "pending",
      priority: "low",
      deadline: "2025-11-20",
    },
  ]);

  const [projects] = useState([
    { id: 1, name: "Website Redesign", members: 5, progress: 60 },
    { id: 2, name: "Mobile App", members: 3, progress: 35 },
    { id: 3, name: "Backend System", members: 4, progress: 80 },
  ]);

  const [chatMessages, setChatMessages] = useState({
    "Website Redesign": [
      {
        user: "John Doe",
        message: "Great progress on the homepage!",
        time: "10:30 AM",
      },
      {
        user: "Sarah Smith",
        message: "Need feedback on color scheme",
        time: "11:15 AM",
      },
    ],
    "Mobile App": [
      {
        user: "Mike Johnson",
        message: "API endpoint is ready for testing",
        time: "09:00 AM",
      },
    ],
    "Backend System": [
      {
        user: "Emma Wilson",
        message: "Database migration completed",
        time: "08:45 AM",
      },
    ],
  });

  const [emails] = useState([
    {
      id: 1,
      from: "manager@company.com",
      subject: "Weekly Team Meeting",
      date: "2025-11-02",
      summary:
        "Weekly sync scheduled for Friday at 2 PM to discuss project milestones.",
    },
    {
      id: 2,
      from: "hr@company.com",
      subject: "Benefits Update",
      date: "2025-11-01",
      summary:
        "New health insurance options available. Review deadline is Nov 15.",
    },
    {
      id: 3,
      from: "client@external.com",
      subject: "Project Feedback",
      date: "2025-10-31",
      summary:
        "Client appreciates the recent updates and requests minor design changes.",
    },
  ]);

  function handleStatusChange(taskId, newStatus) {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  }

  function handleSendMessage() {
    if (chatMessage.trim() && selectedProject) {
      const newMessage = {
        user: "You",
        message: chatMessage,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setChatMessages({
        ...chatMessages,
        [selectedProject]: [
          ...(chatMessages[selectedProject] || []),
          newMessage,
        ],
      });
      setChatMessage("");
    }
  }

  function handleSubmitReport(event) {
    event.preventDefault();
    alert(
      `Report submitted for task ${selectedTaskForReport}\nType: ${reportType}\nDescription: ${reportDescription}`
    );
    setReportDescription("");
  }

  function getStatusColor(status) {
    switch (status) {
      case "completed":
        return "#4CAF50";
      case "in-progress":
        return "#2196F3";
      case "pending":
        return "#FFC107";
      default:
        return "#999";
    }
  }

  function getPriorityColor(priority) {
    switch (priority) {
      case "high":
        return "#f44336";
      case "medium":
        return "#ff9800";
      case "low":
        return "#4caf50";
      default:
        return "#999";
    }
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Employee Dashboard</h1>
          <div className="user-info">
            <span className="user-name">Welcome, Employee</span>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="nav-tabs">
        <button
          className={`nav-tab ${activeTab === "tasks" ? "active" : ""}`}
          onClick={() => setActiveTab("tasks")}
        >
          Tasks & Projects
        </button>
        <button
          className={`nav-tab ${activeTab === "communication" ? "active" : ""}`}
          onClick={() => setActiveTab("communication")}
        >
          Team Communication
        </button>
        <button
          className={`nav-tab ${activeTab === "reports" ? "active" : ""}`}
          onClick={() => setActiveTab("reports")}
        >
          Task Reports
        </button>
        <button
          className={`nav-tab ${activeTab === "emails" ? "active" : ""}`}
          onClick={() => setActiveTab("emails")}
        >
          Email Management
        </button>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {/* Tasks & Projects Tab */}
        {activeTab === "tasks" && (
          <div className="content-section">
            <div className="section-header">
              <h2>My Tasks & Projects</h2>
            </div>

            <div className="projects-grid">
              <h3>Active Projects</h3>
              <div className="cards-container">
                {projects.map((project) => (
                  <div key={project.id} className="project-card">
                    <h4>{project.name}</h4>
                    <div className="project-info">
                      <span>👥 {project.members} members</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">
                      {project.progress}% Complete
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="tasks-section">
              <h3>My Tasks</h3>
              <div className="tasks-list">
                {tasks.map((task) => (
                  <div key={task.id} className="task-card">
                    <div className="task-header">
                      <h4>{task.title}</h4>
                      <span
                        className="priority-badge"
                        style={{
                          backgroundColor: getPriorityColor(task.priority),
                        }}
                      >
                        {task.priority}
                      </span>
                    </div>
                    <div className="task-details">
                      <span>📁 {task.project}</span>
                      <span>📅 {task.deadline}</span>
                    </div>
                    <div className="task-actions">
                      <label>
                        <b>Status:</b>
                      </label>
                      <select
                        value={task.status}
                        onChange={(e) =>
                          handleStatusChange(task.id, e.target.value)
                        }
                        className="status-select"
                        style={{ borderColor: getStatusColor(task.status) }}
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Team Communication Tab */}
        {activeTab === "communication" && (
          <div className="content-section">
            <div className="section-header">
              <h2>Team Communication</h2>
            </div>
            <div className="communication-layout">
              <div className="project-list">
                <h3>Select Project</h3>
                <div className="project-items">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      className={`project-item ${
                        selectedProject === project.name ? "selected" : ""
                      }`}
                      onClick={() => setSelectedProject(project.name)}
                    >
                      {project.name}
                      <span className="member-count">
                        {project.members} members
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="chat-area">
                {selectedProject ? (
                  <>
                    <div className="chat-header">
                      <h3>{selectedProject} - Team Chat</h3>
                    </div>
                    <div className="chat-messages">
                      {(chatMessages[selectedProject] || []).map((msg, idx) => (
                        <div
                          key={idx}
                          className={`chat-message ${
                            msg.user === "You" ? "own-message" : ""
                          }`}
                        >
                          <div className="message-header">
                            <strong>{msg.user}</strong>
                            <span className="message-time">{msg.time}</span>
                          </div>
                          <p>{msg.message}</p>
                        </div>
                      ))}
                    </div>
                    <div className="chat-input">
                      <input
                        type="text"
                        placeholder="Type your message..."
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleSendMessage()
                        }
                      />
                      <button onClick={handleSendMessage}>Send</button>
                    </div>
                  </>
                ) : (
                  <div className="no-selection">
                    <p>Select a project to view team chat</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Task Reports Tab */}
        {activeTab === "reports" && (
          <div className="content-section">
            <div className="section-header">
              <h2>Submit Task Report</h2>
            </div>
            <form className="report-form" onSubmit={handleSubmitReport}>
              <h3>Create Report</h3>

              <div className="form-group">
                <label>
                  <b>Select Task</b>
                </label>
                <select
                  className="form-control"
                  value={selectedTaskForReport}
                  onChange={(e) =>
                    setSelectedTaskForReport(Number(e.target.value))
                  }
                >
                  {tasks.map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.title} - {task.project}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>
                  <b>Report Type</b>
                </label>
                <div className="radio-group">
                  {["completion", "problem"].map((type) => (
                    <label key={type} className="radio-label">
                      <input
                        type="radio"
                        value={type}
                        checked={reportType === type}
                        onChange={(e) => setReportType(e.target.value)}
                      />
                      {type === "completion"
                        ? "Task Completion"
                        : "Problem Report"}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>
                  <b>Description</b>
                </label>
                <textarea
                  className="form-control"
                  rows="6"
                  placeholder="Provide details about the task..."
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                ></textarea>
              </div>

              <button type="submit" className="submit-btn">
                Submit Report
              </button>
            </form>
          </div>
        )}

        {/* Email Management Tab */}
        {activeTab === "emails" && (
          <div className="content-section">
            <div className="section-header">
              <h2>Email Management & Summaries</h2>
            </div>
            <div className="emails-list">
              {emails.map((email) => (
                <div key={email.id} className="email-card">
                  <div className="email-header">
                    <div>
                      <h4>{email.subject}</h4>
                      <span className="email-from">From: {email.from}</span>
                    </div>
                    <span className="email-date">{email.date}</span>
                  </div>
                  <div className="email-summary">
                    <strong>Summary:</strong>
                    <p>{email.summary}</p>
                  </div>
                  <div className="email-actions">
                    <button className="btn-secondary">View Full Email</button>
                    <button className="btn-secondary">Reply</button>
                    <button className="btn-secondary">Archive</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
