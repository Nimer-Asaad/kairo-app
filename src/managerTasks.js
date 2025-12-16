
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./managerTasks.css";
import { apiGet, apiPost } from "./api";

/* Helper */
function formatDate(d) {
  if (!d) return "";
  try {
    const date = new Date(d);
    return date.toLocaleDateString("en-US");
  } catch {
    return d;
  }
}

const menuItems = [
  { id: "assignTask", label: "Assign Tasks", icon: "📋" },
  { id: "projectStatus", label: "Project Status", icon: "📁" },
];

const stats = [
  { title: "Total Employees", value: "0", icon: "👥" },
  { title: "Active Tasks", value: "0", icon: "📋" },
  { title: "Projects", value: "0", icon: "📁" },
  { title: "Completed", value: "0", icon: "📊" },
];

function BackButton({ onBack }) {
  const navigate = useNavigate();
  const handleBackToSystemAdmin = () => {
    if (onBack && typeof onBack === "function") {
      onBack();
    } else {
      navigate("/admin");
    }
  };

  return (
    <button className="back-to-admin-btn" onClick={handleBackToSystemAdmin}>
      ↩️ Back to System Admin
    </button>
  );
}

function DashboardContent({ stats }) {
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
    </div>
  );
}

/* Project status with safer grouping when project_id may be populated object */
function ProjectStatusContent({ tasks, usersMap }) {
  // Build groups with stable string keys and optional project meta
  const groupsMap = new Map();

  tasks.forEach((t) => {
    // Determine project id string
    let pid = "Unassigned Project";
    let meta = null;

    if (t.project_id) {
      if (typeof t.project_id === "object") {
        pid = t.project_id._id || t.project_id.id || JSON.stringify(t.project_id);
        meta = {
          title: t.project_id.title || t.project_id.name || pid,
          description: t.project_id.description || "",
        };
      } else {
        pid = String(t.project_id);
      }
    } else if (t.project) {
      pid = String(t.project);
    }

    if (!groupsMap.has(pid)) groupsMap.set(pid, { tasks: [], meta });
    groupsMap.get(pid).tasks.push(t);
  });

  const entries = Array.from(groupsMap.entries());

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <h2 className="page-title">Project & Task Status</h2>
      <div className="content-grid" style={{ flex: 1 }}>
        {entries.length === 0 && (
          <div className="card">
            <h3 className="card-title">No projects / tasks found</h3>
            <p>Sync your backend or assign a task to see it listed here.</p>
          </div>
        )}

        {entries.map(([projectId, { tasks: projectTasks, meta }]) => {
          const total = projectTasks.length;
          const completed = projectTasks.filter(
            (p) => (p.status || "").toLowerCase() === "completed" || (p.status || "").toLowerCase() === "done"
          ).length;
          const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

          // project display title: prefer populated meta.title
          const projectTitle = (meta && meta.title) ? meta.title : projectId;

          return (
            <div key={projectId} className="project-card">
              <h3 className="project-title">{projectTitle}</h3>

              {meta && meta.description && (
                <div style={{ marginBottom: 8, color: "#374151" }}>
                  {meta.description}
                </div>
              )}

              <div className="project-progress" style={{ marginBottom: 12 }}>
                <div className="performance-header">
                  <span className="performance-name">Progress</span>
                  <span className="performance-value">{progress}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <strong>Tasks ({total}):</strong>
                <div style={{ marginTop: 8 }}>
                  {projectTasks.map((t) => (
                    <div
                      key={t._id || t.id || `${projectId}-${t.title}`}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 8,
                        background: "#f9fafb",
                        marginBottom: 8,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ maxWidth: "70%" }}>
                        <div style={{ fontWeight: 600 }}>{t.title}</div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>
                          {t.description ? `${t.description.substring(0, 160)} ` : ""}
                          • Due: {formatDate(t.due_date || t.dueDate)}
                        </div>
                        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>
                          Assigned to:&nbsp;
                          {Array.isArray(t.assigned_to)
                            ? t.assigned_to
                                .map((a) => {
                                  // If populated, a is object; otherwise string id
                                  if (typeof a === "object") {
                                    return a.full_name || a.email || (a._id || a.id);
                                  }
                                  // try usersMap
                                  const u = usersMap[String(a)];
                                  return u ? u.full_name || u.email : String(a);
                                })
                                .join(", ")
                            : typeof t.assigned_to === "object" && t.assigned_to
                            ? t.assigned_to.full_name || t.assigned_to.email
                            : (usersMap[String(t.assigned_to)]?.full_name ||
                                usersMap[String(t.assigned_to)]?.email ||
                                (t.assigned_to || "—"))}
                        </div>
                      </div>

                      <div>
                        <span
                          className={`status-badge status-${((t.status || "pending").toLowerCase()).replace(" ", "-")}`}
                        >
                          {t.status || "pending"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* MyTasks view for employees */
function MyTasksView({ myTasks, usersMap }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <h2 className="page-title">My Tasks</h2>
      <div className="content-grid" style={{ flex: 1 }}>
        {myTasks.length === 0 ? (
          <div className="card">
            <h3 className="card-title">No tasks assigned to you</h3>
            <p>When your manager assigns tasks they will appear here.</p>
          </div>
        ) : (
          myTasks.map((t) => (
            <div key={t._id || t.id} className="project-card">
              <h3 className="project-title">{t.title}</h3>
              <div style={{ marginBottom: 8 }}>{t.description}</div>
              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <div>Due: {formatDate(t.due_date || t.dueDate)}</div>
                <div>
                  Status:{" "}
                  <span className={`status-badge status-${((t.status || "pending").toLowerCase()).replace(" ", "-")}`}>
                    {t.status || "pending"}
                  </span>
                </div>
              </div>
              <div style={{ marginTop: 12, fontSize: 13, color: "#6b7280" }}>
                Assigned by:{" "}
                {t.assigned_by?.full_name || usersMap[t.assigned_by]?.full_name || t.assigned_by || "—"}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* Assign Task UI unchanged except it re-uses backend employees endpoint */
function AssignTaskContent({ refreshAfterCreate }) {
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    contributors: [],
    teamLead: "",
    priority: "",
    dueDate: "",
  });

  const [assignees, setAssignees] = useState([]);
  const [loadingAssignees, setLoadingAssignees] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAssignees() {
      try {
        setLoadingAssignees(true);
        const data = await apiGet("/api/tasks/employees/all");
        const list = Array.isArray(data) ? data : data.users || [];
        setAssignees(list);
      } catch (err) {
        console.error("Failed to load assignees:", err);
        setAssignees([]);
      } finally {
        setLoadingAssignees(false);
      }
    }
    loadAssignees();
  }, []);

  function handleContributorsChange(e) {
    const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
    const unique = Array.from(new Set(selected));
    setNewTask((prev) => ({
      ...prev,
      contributors: unique,
      teamLead: unique.includes(prev.teamLead) ? prev.teamLead : "",
    }));
  }

  async function handleAssignTask(event) {
    event.preventDefault();

    if (!newTask.title.trim()) {
      alert("Task title is required");
      return;
    }
    if (!newTask.contributors || newTask.contributors.length === 0) {
      alert("Please select at least one assignee (contributor)");
      return;
    }

    const payload = {
      project_id: "6918554e8be5641507dd881b",
      assigned_to:
        newTask.contributors.length === 1
          ? newTask.contributors[0]
          : newTask.contributors,
      contributors: newTask.contributors,
      team_lead: newTask.teamLead || newTask.contributors[0] || null,
      title: newTask.title,
      description: newTask.description,
      due_date: newTask.dueDate || undefined,
      priority: newTask.priority || undefined,
    };

    try {
      setSubmitting(true);
      setError("");
      const data = await apiPost("/api/tasks", payload);
      alert("Task assigned successfully!");
      setNewTask({
        title: "",
        description: "",
        contributors: [],
        teamLead: "",
        priority: "",
        dueDate: "",
      });
      if (typeof refreshAfterCreate === "function") refreshAfterCreate();
    } catch (err) {
      console.error("Assign task error:", err);
      setError(err.message || "Failed to assign task");
      alert("Error assigning task: " + (err.message || ""));
    } finally {
      setSubmitting(false);
    }
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
            ></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">
              <b>Assign To (hold Ctrl/Cmd to select multiple)</b>
            </label>

            <select
              className="form-input"
              multiple
              value={newTask.contributors}
              onChange={handleContributorsChange}
              required
              size={Math.min(8, Math.max(4, assignees.length))}
            >
              {loadingAssignees ? (
                <option value="">Loading...</option>
              ) : assignees.length === 0 ? (
                <option value="">No assignees available</option>
              ) : (
                assignees.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.full_name} — {user.email}
                  </option>
                ))
              )}
            </select>
            <small style={{ display: "block", marginTop: 8, color: "#6b7280" }}>
              You can select multiple contributors. One of them will be the team
              leader.
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">
              <b>Team Leader (optional)</b>
            </label>
            <select
              className="form-input"
              value={newTask.teamLead}
              onChange={(e) =>
                setNewTask({ ...newTask, teamLead: e.target.value })
              }
            >
              <option value="">
                (use first selected contributor by default)
              </option>
              {newTask.contributors.map((id) => {
                const user = assignees.find((u) => u._id === id);
                if (!user) return null;
                return (
                  <option key={user._id} value={user._id}>
                    {user.full_name} — {user.email}
                  </option>
                );
              })}
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
              />
            </div>
          </div>

          {error && <p style={{ color: "red" }}>{error}</p>}

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Assigning..." : "Assign Task"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* Sidebar / Header components reused from previous layout */
function Sidebar({ sidebarOpen, menuItems, activeTab, setActiveTab, onBack }) {
  return (
    <div className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
      <div className="sidebar-header">
        <h1 className="logo">TaskManager</h1>
        <p className="subtitle">Manager Portal</p>
        <div className="back-button-container">
          <BackButton onBack={onBack} />
        </div>
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

function Header({ sidebarOpen, setSidebarOpen, onBack }) {
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
        <BackButton onBack={onBack} />
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

export default function TaskManagementSystem({ onBack }) {
  const [activeTab, setActiveTab] = useState("assignTask");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  // data
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [usersMap, setUsersMap] = useState({});
  const [statsState, setStatsState] = useState(stats);

  // detect current user
  const storedUser =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;
  let currentUser = null;
  try {
    currentUser = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    currentUser = null;
  }

  async function loadTasks() {
    try {
      setLoadingTasks(true);
      const isEmployee =
        currentUser &&
        currentUser.role &&
        ["employee", "person"].includes(currentUser.role);
      const path = isEmployee ? "/api/tasks/my" : "/api/tasks";
      let data;
      try {
        data = await apiGet(path);
      } catch (err) {
        console.warn("Primary tasks endpoint failed, falling back to /api/tasks:", err.message);
        data = await apiGet("/api/tasks");
      }

      const list = Array.isArray(data) ? data : data.tasks || data || [];
      setTasks(list || []);

      const total = list.length;
      const completed = list.filter(
        (t) => (t.status || "").toLowerCase() === "completed" || (t.status || "").toLowerCase() === "done"
      ).length;
      const projects = Array.from(new Set(list.map((t) => t.project_id && (typeof t.project_id === "object" ? (t.project_id._id || t.project_id.id) : t.project_id) || t.project || "Unassigned"))).length;

      setStatsState([
        {
          title: "Total Employees",
          value: String(
            Array.from(
              new Set(
                list
                  .reduce((acc, t) => {
                    const assigned = Array.isArray(t.assigned_to)
                      ? t.assigned_to
                      : t.assigned_to
                      ? [t.assigned_to]
                      : [];
                    return acc.concat(assigned);
                  }, [])
                  .filter(Boolean)
              )
            ).length
          ),
          icon: "👥",
        },
        {
          title: "Active Tasks",
          value: String(
            list.filter(
              (t) => t.status && t.status.toLowerCase() !== "completed" && t.status.toLowerCase() !== "done"
            ).length
          ),
          icon: "📋",
        },
        { title: "Projects", value: String(projects), icon: "📁" },
        { title: "Completed", value: String(completed), icon: "📊" },
      ]);
    } catch (err) {
      console.error("Failed to load tasks:", err);
      setTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  }

  async function loadUsersMap() {
    try {
      const data = await apiGet("/auth/users");
      const list = data.users || data || [];
      const map = {};
      (Array.isArray(list) ? list : []).forEach((u) => {
        map[u._id || u.id] = u;
      });
      setUsersMap(map);
    } catch (err) {
      console.warn("Failed to load users map:", err.message);
    }
  }

  useEffect(() => {
    loadTasks();
    loadUsersMap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev || "unset";
    };
  }, []);

  function renderContent() {
    const isEmployee =
      currentUser &&
      currentUser.role &&
      ["employee", "person"].includes(currentUser.role);

    if (isEmployee) {
      const myId = currentUser.id || currentUser._id || currentUser.id;
      const myTasks = tasks.filter((t) => {
        if (!t) return false;
        if (Array.isArray(t.assigned_to)) {
          return t.assigned_to.some((a) => {
            const aid = typeof a === "string" ? a : a?._id || a?.id;
            return String(aid) === String(myId);
          });
        }
        if (typeof t.assigned_to === "object" && t.assigned_to) {
          const aid = t.assigned_to._id || t.assigned_to.id;
          return String(aid) === String(myId);
        }
        return String(t.assigned_to) === String(myId);
      });

      return <MyTasksView myTasks={myTasks} usersMap={usersMap} />;
    }

    switch (activeTab) {
      case "assignTask":
        return <AssignTaskContent refreshAfterCreate={loadTasks} />;
      case "projectStatus":
        return <ProjectStatusContent tasks={tasks} usersMap={usersMap} />;
      default:
        return <DashboardContent stats={statsState} />;
    }
  }

  return (
    <div className="app-container">
      <Sidebar
        sidebarOpen={sidebarOpen}
        menuItems={menuItems}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onBack={onBack}
      />

      <div className="main-container">
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onBack={onBack}
        />
        <main className="content">
          <div
            className="content-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <button
              className="back-to-admin-btn content-back-btn"
              onClick={() => (onBack ? onBack() : navigate("/admin"))}
            >
              ↩️ Back to System Admin Dashboard
            </button>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                className={`nav-button ${activeTab === "assignTask" ? "active" : ""}`}
                onClick={() => setActiveTab("assignTask")}
              >
                Assign Tasks
              </button>
              <button
                className={`nav-button ${activeTab === "projectStatus" ? "active" : ""}`}
                onClick={() => setActiveTab("projectStatus")}
              >
                Project Status
              </button>
              <button
                className={`nav-button ${activeTab === "dashboard" ? "active" : ""}`}
                onClick={() => setActiveTab("dashboard")}
              >
                Dashboard
              </button>
            </div>
          </div>

          {loadingTasks ? (
            <div style={{ padding: 24 }}>
              <h3>Loading tasks...</h3>
            </div>
          ) : (
            renderContent()
          )}
        </main>
      </div>
    </div>
  );
}
