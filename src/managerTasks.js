import { useState, useEffect } from "react";
import "./managerTasks.css";

// Mock Data
const mockUsers = [
  {
    id: 1,
    name: "John Doe",
    role: "Developer",
    dept: "Development",
    status: "Active",
  },
  {
    id: 2,
    name: "Sarah Smith",
    role: "Designer",
    dept: "Design",
    status: "Active",
  },
  {
    id: 3,
    name: "Mike Johnson",
    role: "HR Manager",
    dept: "Human Resources",
    status: "Active",
  },
  {
    id: 4,
    name: "Emma Wilson",
    role: "Developer",
    dept: "Development",
    status: "Away",
  },
];

const mockTasks = [
  {
    id: 1,
    name: "Update Dashboard UI",
    employee: "John Doe",
    status: "In Progress",
  },
  {
    id: 2,
    name: "Database Migration",
    employee: "Sarah Smith",
    status: "Completed",
  },
  {
    id: 3,
    name: "Client Meeting Prep",
    employee: "Mike Johnson",
    status: "Pending",
  },
];

const mockProjects = [
  { id: 1, title: "Website Redesign", progress: 75, tasks: 12, completed: 9 },
  {
    id: 2,
    title: "Mobile App Development",
    progress: 45,
    tasks: 20,
    completed: 9,
  },
  { id: 3, title: "Marketing Campaign", progress: 90, tasks: 8, completed: 7 },
  {
    id: 4,
    title: "Database Optimization",
    progress: 30,
    tasks: 15,
    completed: 5,
  },
];

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "addUser", label: "Add User/HR", icon: "➕" },
  { id: "manageUsers", label: "Manage Users", icon: "👥" },
  { id: "assignTask", label: "Assign Tasks", icon: "📋" },
  { id: "projectStatus", label: "Project Status", icon: "📁" },
  { id: "teamChat", label: "Team Chat", icon: "💬" },
  { id: "adminChat", label: "Admin Support", icon: "🛡️" },
];

const stats = [
  { title: "Total Employees", value: "24", icon: "👥" },
  { title: "Active Tasks", value: "38", icon: "📋" },
  { title: "Projects", value: "12", icon: "📁" },
  { title: "Completed", value: "156", icon: "📊" },
];

const teams = [
  { name: "Development Team", progress: 85 },
  { name: "Design Team", progress: 72 },
  { name: "Marketing Team", progress: 90 },
];

function DashboardContent() {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <h2 className="page-title">Dashboard Overview</h2>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-content">
              <div>
                <p className="stat-label">{stat.title}</p>
                <p className="stat-value">{stat.value}</p>
              </div>
              <div className="stat-icon">
                <span className="icon-emoji">{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="content-grid" style={{ flex: 1, minHeight: 0 }}>
        <div className="card">
          <h3 className="card-title">Recent Tasks</h3>
          <div className="task-list">
            {mockTasks.map((task) => (
              <div key={task.id} className="task-item">
                <div>
                  <p className="task-name">{task.name}</p>
                  <p className="task-employee">{task.employee}</p>
                </div>
                <span
                  className={`status-badge status-${task.status
                    .toLowerCase()
                    .replace(" ", "-")}`}
                >
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Team Performance</h3>
          <div className="performance-list">
            {teams.map((team, index) => (
              <div key={index} className="performance-item">
                <div className="performance-header">
                  <span className="performance-name">{team.name}</span>
                  <span className="performance-value">{team.progress}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${team.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AddUserContent() {
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "",
    department: "",
  });

  function handleAddUser(event) {
    event.preventDefault();
    console.log("New User:", newUser);
    alert("User added successfully!");
    setNewUser({ name: "", email: "", role: "", department: "" });
  }

  return (
    <div className="form-container">
      <h2 className="page-title">Add New User or HR</h2>
      <div className="card form-card">
        <form onSubmit={handleAddUser}>
          <div className="form-group">
            <label className="form-label">
              <b>Full Name</b>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter full name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <b>Email</b>
            </label>
            <input
              type="email"
              className="form-input"
              placeholder="email@company.com"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <b>Role</b>
            </label>
            <select
              className="form-input"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              required
            >
              <option value="">Select Role</option>
              <option value="Employee">Employee</option>
              <option value="HR Manager">HR Manager</option>
              <option value="Team Lead">Team Lead</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              <b>Department</b>
            </label>
            <select
              className="form-input"
              value={newUser.department}
              onChange={(e) =>
                setNewUser({ ...newUser, department: e.target.value })
              }
              required
            >
              <option value="">Select Department</option>
              <option value="Development">Development</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
              <option value="Human Resources">Human Resources</option>
            </select>
          </div>

          <button type="submit" className="btn-primary">
            Add User
          </button>
        </form>
      </div>
    </div>
  );
}

function ManageUsersContent() {
  function handleEdit(name) {
    console.log("Edit user:", name);
    alert(`Editing ${name}`);
  }

  function handleRemove(name) {
    console.log("Remove user:", name);
    if (window.confirm(`Are you sure you want to remove ${name}?`)) {
      alert(`${name} has been removed`);
    }
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <h2 className="page-title">Manage Users & HR</h2>
      <div className="card table-card" style={{ flex: 1 }}>
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Department</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockUsers.map((user) => (
              <tr key={user.id} className="user-row">
                <td>{user.name}</td>
                <td>{user.role}</td>
                <td>{user.dept}</td>
                <td>
                  <span
                    className={`status-badge status-${user.status.toLowerCase()}`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="actions-cell">
                  <button
                    onClick={() => handleEdit(user.name)}
                    className="action-btn edit-btn"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleRemove(user.name)}
                    className="action-btn delete-btn"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AssignTaskContent() {
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignTo: "",
    priority: "",
    dueDate: "",
  });

  function handleAssignTask(event) {
    event.preventDefault();
    console.log("New Task:", newTask);
    alert("Task assigned successfully!");
    setNewTask({
      title: "",
      description: "",
      assignTo: "",
      priority: "",
      dueDate: "",
    });
  }

  return (
    <div className="form-container">
      <h2 className="page-title">Assign New Task</h2>
      <div className="card form-card">
        <form onSubmit={handleAssignTask}>
          <div className="form-group">
            <label className="form-label">
              <b>Task Title</b>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter task title"
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <b>Description</b>
            </label>
            <textarea
              className="form-textarea"
              placeholder="Task description..."
              value={newTask.description}
              onChange={(e) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">
              <b>Assign To</b>
            </label>
            <select
              className="form-input"
              value={newTask.assignTo}
              onChange={(e) =>
                setNewTask({ ...newTask, assignTo: e.target.value })
              }
              required
            >
              <option value="">Select Employee</option>
              {mockUsers.map((user) => (
                <option key={user.id} value={user.name}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                <b>Priority</b>
              </label>
              <select
                className="form-input"
                value={newTask.priority}
                onChange={(e) =>
                  setNewTask({ ...newTask, priority: e.target.value })
                }
                required
              >
                <option value="">Select Priority</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                <b>Due Date</b>
              </label>
              <input
                type="date"
                className="form-input"
                value={newTask.dueDate}
                onChange={(e) =>
                  setNewTask({ ...newTask, dueDate: e.target.value })
                }
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary">
            Assign Task
          </button>
        </form>
      </div>
    </div>
  );
}

function ProjectStatusContent() {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <h2 className="page-title">Project & Task Status</h2>
      <div className="content-grid" style={{ flex: 1 }}>
        {mockProjects.map((project) => (
          <div key={project.id} className="project-card">
            <h3 className="project-title">{project.title}</h3>
            <div className="project-progress">
              <div className="performance-header">
                <span className="performance-name">Progress</span>
                <span className="performance-value">{project.progress}%</span>
              </div>
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>
            <div className="project-stats">
              <span>Tasks: {project.tasks}</span>
              <span>Completed: {project.completed}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamChatContent() {
  const [chatMessage, setChatMessage] = useState("");

  const messages = [
    {
      name: "John Doe",
      message: "The dashboard update is complete!",
      time: "10:30 AM",
      isOwn: false,
    },
    {
      name: "You",
      message: "Great work! Can you show it in the next meeting?",
      time: "10:32 AM",
      isOwn: true,
    },
    {
      name: "Sarah Smith",
      message: "I've uploaded the new design mockups",
      time: "10:45 AM",
      isOwn: false,
    },
  ];

  function handleSendMessage(event) {
    event.preventDefault();
    console.log("Message sent:", chatMessage);
    setChatMessage("");
  }

  return (
    <div className="chat-container">
      <h2 className="page-title">Team Chat</h2>
      <div className="card chat-card">
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-message ${
                msg.isOwn ? "own-message" : "other-message"
              }`}
            >
              <div
                className={`message-bubble ${
                  msg.isOwn ? "own-bubble" : "other-bubble"
                }`}
              >
                <p className="message-sender">{msg.name}</p>
                <p className="message-text">{msg.message}</p>
                <p className="message-time">{msg.time}</p>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSendMessage} className="chat-input-container">
          <input
            type="text"
            placeholder="Type a message..."
            className="chat-input"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            required
          />
          <button type="submit" className="btn-send">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

function AdminChatContent() {
  const [chatMessage, setChatMessage] = useState("");

  const messages = [
    {
      name: "System Admin",
      message: "Hello! How can I help you today?",
      time: "9:00 AM",
      isOwn: false,
    },
    {
      name: "You",
      message: "I need help with user permissions",
      time: "9:05 AM",
      isOwn: true,
    },
    {
      name: "System Admin",
      message: "I'll guide you through the process",
      time: "9:06 AM",
      isOwn: false,
    },
  ];

  function handleSendMessage(event) {
    event.preventDefault();
    console.log("Message sent:", chatMessage);
    setChatMessage("");
  }

  return (
    <div className="chat-container">
      <h2 className="page-title">Admin Support</h2>
      <div className="card chat-card">
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-message ${
                msg.isOwn ? "own-message" : "other-message"
              }`}
            >
              <div
                className={`message-bubble ${
                  msg.isOwn ? "own-bubble" : "other-bubble"
                }`}
              >
                <p className="message-sender">{msg.name}</p>
                <p className="message-text">{msg.message}</p>
                <p className="message-time">{msg.time}</p>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSendMessage} className="chat-input-container">
          <input
            type="text"
            placeholder="Message admin..."
            className="chat-input"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            required
          />
          <button type="submit" className="btn-send">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

// Sidebar Component
function Sidebar({ sidebarOpen, menuItems, activeTab, setActiveTab }) {
  return (
    <div className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
      <div className="sidebar-header">
        <h1 className="logo">TaskManager</h1>
        <p className="subtitle">Manager Portal</p>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`nav-item ${activeTab === item.id ? "active" : ""}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

// Header Component
function Header({ sidebarOpen, setSidebarOpen }) {
  return (
    <header className="header">
      <div className="header-left">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="toggle-btn"
        >
          {sidebarOpen ? "✕" : "☰"}
        </button>
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Search..." className="search-input" />
        </div>
      </div>

      <div className="header-right">
        <button className="notification-btn">
          <span>🔔</span>
          <span className="notification-badge"></span>
        </button>
        <div className="user-profile">
          <div className="avatar">MG</div>
          <div className="user-info">
            <p className="user-name">Manager</p>
            <p className="user-role">Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function TaskManagementSystem() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Prevent body scrolling
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  function renderContent() {
    switch (activeTab) {
      case "dashboard":
        return <DashboardContent />;
      case "addUser":
        return <AddUserContent />;
      case "manageUsers":
        return <ManageUsersContent />;
      case "assignTask":
        return <AssignTaskContent />;
      case "projectStatus":
        return <ProjectStatusContent />;
      case "teamChat":
        return <TeamChatContent />;
      case "adminChat":
        return <AdminChatContent />;
      default:
        return <DashboardContent />;
    }
  }

  return (
    <div className="app-container">
      <Sidebar
        sidebarOpen={sidebarOpen}
        menuItems={menuItems}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="main-container">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="content">{renderContent()}</main>
      </div>
    </div>
  );
}
