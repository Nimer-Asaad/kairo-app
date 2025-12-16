// // src/employeeTasks.js
// import { useState, useEffect } from "react";
// import "./employeeTasks.css";
// import { apiGet } from "./api";

// /**
//  * Employee dashboard - displays tasks assigned to the logged-in user.
//  * This version resolves assigned user IDs to full names (using /auth/users)
//  * and shows a readable project name when available on the task object.
//  */

// function getCurrentUser() {
//   try {
//     const raw = localStorage.getItem("user");
//     return raw ? JSON.parse(raw) : null;
//   } catch {
//     return null;
//   }
// }

// export default function EmployeeDashboard() {
//   const [activeTab, setActiveTab] = useState("tasks");
//   const [selectedProject, setSelectedProject] = useState(null);
//   const [chatMessage, setChatMessage] = useState("");
//   const [reportType, setReportType] = useState("completion");
//   const [reportDescription, setReportDescription] = useState("");
//   const [selectedTaskForReport, setSelectedTaskForReport] = useState(null);

//   const [tasks, setTasks] = useState([]);
//   const [projects, setProjects] = useState([]);
//   const [usersMap, setUsersMap] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [loadError, setLoadError] = useState("");

//   const currentUser = getCurrentUser();

//   useEffect(() => {
//     let mounted = true;

//     async function loadUsers() {
//       try {
//         // Fetch users to resolve assigned_to ids -> names
//         const res = await apiGet("/auth/users").catch(() => null);
//         // API may return { users: [...] } or an array
//         const list = res ? (Array.isArray(res) ? res : res.users || []) : [];
//         const map = {};
//         list.forEach((u) => {
//           const id = u._id || u.id;
//           if (id) map[String(id)] = u;
//         });
//         if (mounted) setUsersMap(map);
//         return map;
//       } catch (err) {
//         console.warn("Failed to load users:", err);
//         return {};
//       }
//     }

//     async function loadTasks() {
//       try {
//         setLoading(true);
//         setLoadError("");

//         // try endpoint that returns only logged-in user's tasks (if available)
//         let data;
//         try {
//           data = await apiGet("/api/tasks/my");
//         } catch (err) {
//           // fallback to all tasks and filter client-side
//           data = await apiGet("/api/tasks");
//         }

//         const list = Array.isArray(data) ? data : data.tasks || [];

//         // Build users map (in case not loaded yet)
//         const map = await loadUsers();

//         // Map tasks to UI-friendly shape and resolve assignees to names
//         const mapped = list.map((t) => {
//           // Handle assigned_to being string, object, or array
//           let assigned = [];
//           if (Array.isArray(t.assigned_to)) {
//             assigned = t.assigned_to;
//           } else if (t.assigned_to) {
//             assigned = [t.assigned_to];
//           }

//           const assignedToNames = assigned
//             .map((a) => {
//               // if a is object with full_name
//               if (typeof a === "object" && a !== null) {
//                 return a.full_name || a.fullName || a.email || String(a);
//               }
//               // if a is string id
//               const idStr = String(a);
//               if (map[idStr]) return map[idStr].full_name || map[idStr].email;
//               // try to extract from a if it's a composite string
//               return idStr;
//             })
//             .filter(Boolean);

//           // project name resolution: task may include project info in different shapes
//           const projectName =
//             (t.project && (t.project.name || t.project.title || t.project)) ||
//             t.project_name ||
//             t.project_title ||
//             t.project_id ||
//             "Unspecified Project";

//           return {
//             ...t,
//             assignedToNames,
//             projectName,
//           };
//         });

//         if (mounted) {
//           setTasks(mapped);

//           // Build projects list from tasks (projectName)
//           const projectsMap = new Map();
//           mapped.forEach((t) => {
//             const key = t.projectName || "Unspecified Project";
//             if (!projectsMap.has(key))
//               projectsMap.set(key, { id: key, name: key });
//           });
//           setProjects(Array.from(projectsMap.values()));

//           if (!selectedTaskForReport && mapped.length > 0) {
//             setSelectedTaskForReport(mapped[0]._id || mapped[0].id);
//           }
//         }
//       } catch (err) {
//         console.error("Failed to load tasks:", err);
//         if (mounted) setLoadError(err.message || "Failed to load tasks");
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     }

//     loadTasks();

//     return () => {
//       mounted = false;
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   function handleStatusChange(taskId, newStatus) {
//     setTasks((prev) =>
//       prev.map((task) =>
//         task._id === taskId || task.id === taskId
//           ? { ...task, status: newStatus }
//           : task
//       )
//     );
//   }

//   function handleSendMessage() {
//     if (chatMessage.trim() && selectedProject) {
//       const newMessage = {
//         user: "You",
//         message: chatMessage,
//         time: new Date().toLocaleTimeString([], {
//           hour: "2-digit",
//           minute: "2-digit",
//         }),
//       };
//       setChatMessages((prev) => ({
//         ...prev,
//         [selectedProject]: [...(prev[selectedProject] || []), newMessage],
//       }));
//       setChatMessage("");
//     }
//   }

//   // Keep light-weight chat/messages sample state (unchanged)
//   const [chatMessages, setChatMessages] = useState({
//     "Website Redesign": [
//       {
//         user: "John Doe",
//         message: "Great progress on the homepage!",
//         time: "10:30 AM",
//       },
//     ],
//   });

//   // UI helpers
//   function getStatusColor(status) {
//     switch ((status || "").toLowerCase()) {
//       case "completed":
//         return "#4CAF50";
//       case "in-progress":
//         return "#2196F3";
//       case "pending":
//         return "#FFC107";
//       default:
//         return "#999";
//     }
//   }

//   function getPriorityColor(priority) {
//     switch ((priority || "").toLowerCase()) {
//       case "high":
//         return "#f44336";
//       case "medium":
//         return "#ff9800";
//       case "low":
//         return "#4caf50";
//       default:
//         return "#999";
//     }
//   }

//   return (
//     <div className="dashboard-container">
//       {/* Header */}
//       <header className="dashboard-header">
//         <div className="header-content">
//           <h1>Employee Dashboard</h1>
//           <div className="user-info">
//             <span className="user-name">
//               {currentUser?.full_name || currentUser?.email || "Employee"}
//             </span>
//           </div>
//         </div>
//       </header>

//       {/* Navigation Tabs */}
//       <nav className="nav-tabs">
//         <button
//           className={`nav-tab ${activeTab === "tasks" ? "active" : ""}`}
//           onClick={() => setActiveTab("tasks")}
//         >
//           Tasks & Projects
//         </button>
//         <button
//           className={`nav-tab ${activeTab === "communication" ? "active" : ""}`}
//           onClick={() => setActiveTab("communication")}
//         >
//           Team Communication
//         </button>
//         <button
//           className={`nav-tab ${activeTab === "reports" ? "active" : ""}`}
//           onClick={() => setActiveTab("reports")}
//         >
//           Task Reports
//         </button>
//         <button
//           className={`nav-tab ${activeTab === "emails" ? "active" : ""}`}
//           onClick={() => setActiveTab("emails")}
//         >
//           Email Management
//         </button>
//       </nav>

//       {/* Main Content */}
//       <main className="main-content">
//         {/* Tasks & Projects Tab */}
//         {activeTab === "tasks" && (
//           <div className="content-section">
//             <div className="section-header">
//               <h2>My Tasks & Projects</h2>
//             </div>

//             <div className="projects-grid">
//               <h3>Active Projects</h3>
//               <div className="cards-container">
//                 {projects.length === 0 ? (
//                   <div style={{ padding: 12 }}>No projects yet</div>
//                 ) : (
//                   projects.map((project) => (
//                     <div key={project.id} className="project-card">
//                       <h4>{project.name}</h4>
//                       <div className="project-info">
//                         <span>👥 members</span>
//                       </div>
//                       <div className="progress-bar">
//                         <div
//                           className="progress-fill"
//                           style={{
//                             width:
//                               (tasks.filter(
//                                 (t) =>
//                                   t.projectName === project.id &&
//                                   (t.status === "completed" ||
//                                     t.status === "done")
//                               ).length /
//                                 Math.max(
//                                   1,
//                                   tasks.filter(
//                                     (t) => t.projectName === project.id
//                                   ).length
//                                 )) *
//                                 100 +
//                               "%",
//                           }}
//                         ></div>
//                       </div>
//                       <span className="progress-text">
//                         {Math.round(
//                           (tasks.filter(
//                             (t) =>
//                               t.projectName === project.id &&
//                               (t.status === "completed" || t.status === "done")
//                           ).length /
//                             Math.max(
//                               1,
//                               tasks.filter((t) => t.projectName === project.id)
//                                 .length
//                             )) *
//                             100
//                         )}
//                         % Complete
//                       </span>
//                     </div>
//                   ))
//                 )}
//               </div>
//             </div>

//             <div className="tasks-section">
//               <h3>My Tasks</h3>
//               <div className="tasks-list">
//                 {loading ? (
//                   <div className="empty-state">Loading tasks...</div>
//                 ) : tasks.length === 0 ? (
//                   <div className="empty-state">No tasks assigned to you.</div>
//                 ) : (
//                   tasks.map((task) => (
//                     <div key={task._id || task.id} className="task-card">
//                       <div className="task-header">
//                         <h4>{task.title || task.name || "Untitled Task"}</h4>
//                         <span
//                           className="priority-badge"
//                           style={{
//                             backgroundColor:
//                               task.priority === "high"
//                                 ? "#f44336"
//                                 : task.priority === "low"
//                                 ? "#4caf50"
//                                 : "#ff9800",
//                           }}
//                         >
//                           {task.priority || "Medium"}
//                         </span>
//                       </div>
//                       <div className="task-details">
//                         <span>📁 {task.projectName || "—"}</span>
//                         <span>
//                           📅{" "}
//                           {task.due_date
//                             ? new Date(task.due_date).toLocaleDateString()
//                             : "—"}
//                         </span>
//                       </div>

//                       <div
//                         style={{ marginTop: 8, color: "#6b7280", fontSize: 13 }}
//                       >
//                         <strong>Assigned to:</strong>{" "}
//                         {task.assignedToNames && task.assignedToNames.length > 0
//                           ? task.assignedToNames.join(", ")
//                           : Array.isArray(task.assigned_to)
//                           ? task.assigned_to.join(", ")
//                           : (task.assigned_to &&
//                               (task.assigned_to.full_name ||
//                                 task.assigned_to)) ||
//                             "—"}
//                       </div>

//                       <div className="task-actions" style={{ marginTop: 12 }}>
//                         <label>
//                           <b>Status:</b>
//                         </label>
//                         <select
//                           value={task.status || "in-progress"}
//                           onChange={(e) =>
//                             handleStatusChange(
//                               task._id || task.id,
//                               e.target.value
//                             )
//                           }
//                           className="status-select"
//                           style={{ marginLeft: 12 }}
//                         >
//                           <option value="pending">Pending</option>
//                           <option value="in-progress">In Progress</option>
//                           <option value="completed">Completed</option>
//                         </select>
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Team Communication Tab */}
//         {activeTab === "communication" && (
//           <div className="content-section">
//             <div className="section-header">
//               <h2>Team Communication</h2>
//             </div>
//             <div className="communication-layout">
//               <div className="project-list">
//                 <h3>Select Project</h3>
//                 <div className="project-items">
//                   {projects.map((project) => (
//                     <button
//                       key={project.id}
//                       className={`project-item ${
//                         selectedProject === project.name ? "selected" : ""
//                       }`}
//                       onClick={() => setSelectedProject(project.name)}
//                     >
//                       {project.name}
//                       <span className="member-count">members</span>
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               <div className="chat-area">
//                 {selectedProject ? (
//                   <>
//                     <div className="chat-header">
//                       <h3>{selectedProject} - Team Chat</h3>
//                     </div>
//                     <div className="chat-messages">
//                       {(chatMessages[selectedProject] || []).map((msg, idx) => (
//                         <div
//                           key={idx}
//                           className={`chat-message ${
//                             msg.user === "You" ? "own-message" : ""
//                           }`}
//                         >
//                           <div className="message-header">
//                             <strong>{msg.user}</strong>
//                             <span className="message-time">{msg.time}</span>
//                           </div>
//                           <div>{msg.message}</div>
//                         </div>
//                       ))}
//                     </div>
//                     <div className="chat-input">
//                       <input
//                         type="text"
//                         placeholder="Type your message..."
//                         value={chatMessage}
//                         onChange={(e) => setChatMessage(e.target.value)}
//                         onKeyPress={(e) =>
//                           e.key === "Enter" && handleSendMessage()
//                         }
//                       />
//                       <button onClick={handleSendMessage}>Send</button>
//                     </div>
//                   </>
//                 ) : (
//                   <div className="no-selection">
//                     <p>Select a project to view team chat</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Task Reports Tab */}
//         {activeTab === "reports" && (
//           <div className="content-section">
//             <div className="section-header">
//               <h2>Submit Task Report</h2>
//             </div>
//             <form
//               className="report-form"
//               onSubmit={(e) => {
//                 e.preventDefault();
//                 alert(
//                   `Report submitted for task ${selectedTaskForReport}\nType: ${reportType}\nDescription: ${reportDescription}`
//                 );
//                 setReportDescription("");
//               }}
//             >
//               <h3>Create Report</h3>

//               <div className="form-group">
//                 <label>
//                   <b>Select Task</b>
//                 </label>
//                 <select
//                   className="form-control"
//                   value={selectedTaskForReport || ""}
//                   onChange={(e) => setSelectedTaskForReport(e.target.value)}
//                 >
//                   <option value="">-- select task --</option>
//                   {tasks.map((task) => (
//                     <option
//                       key={task._id || task.id}
//                       value={task._id || task.id}
//                     >
//                       {task.title} - {task.projectName}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="form-group">
//                 <label>
//                   <b>Report Type</b>
//                 </label>
//                 <div className="radio-group">
//                   {["completion", "problem"].map((type) => (
//                     <label key={type} className="radio-label">
//                       <input
//                         type="radio"
//                         value={type}
//                         checked={reportType === type}
//                         onChange={(e) => setReportType(e.target.value)}
//                       />
//                       {type === "completion"
//                         ? "Task Completion"
//                         : "Problem Report"}
//                     </label>
//                   ))}
//                 </div>
//               </div>

//               <div className="form-group">
//                 <label>
//                   <b>Description</b>
//                 </label>
//                 <textarea
//                   className="form-control"
//                   rows="6"
//                   placeholder="Provide details about the task..."
//                   value={reportDescription}
//                   onChange={(e) => setReportDescription(e.target.value)}
//                 ></textarea>
//               </div>

//               <button type="submit" className="submit-btn">
//                 Submit Report
//               </button>
//             </form>
//           </div>
//         )}

//         {/* Email Management Tab */}
//         {activeTab === "emails" && (
//           <div className="content-section">
//             <div className="section-header">
//               <h2>Email Management & Summaries</h2>
//             </div>
//             <div className="emails-list">
//               <div className="email-card">
//                 <div className="email-header">
//                   <div>
//                     <h4>Weekly Team Meeting</h4>
//                     <span className="email-from">
//                       From: manager@company.com
//                     </span>
//                   </div>
//                   <span className="email-date">2025-11-02</span>
//                 </div>
//                 <div className="email-summary">
//                   <strong>Summary:</strong>
//                   <p>
//                     Weekly sync scheduled for Friday at 2 PM to discuss project
//                     milestones.
//                   </p>
//                 </div>
//                 <div className="email-actions">
//                   <button className="btn-secondary">View Full Email</button>
//                   <button className="btn-secondary">Reply</button>
//                   <button className="btn-secondary">Archive</button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }

/**
 * src/employeeTasks.js
 *
 * Employee dashboard — full page with tabs:
 * - Tasks & Projects (loads tasks assigned to current logged-in user from backend)
 * - Team Communication (simple chat per-project, synced locally but supports a backend endpoint if available)
 * - Task Reports (submit report for a task -> POST to backend)
 * - Email Management (loads local synced Gmail emails via backend)
 *
 * Notes about API usage (frontend makes best-effort choices and falls back gracefully):
 * - GET /api/tasks/my            -> preferred: returns tasks assigned to current user
 * - GET /api/tasks               -> fallback: returns all tasks (frontend filters by current user)
 * - POST /api/tasks/:id/status   -> optional: update single-task status (backend must implement)
 * - POST /api/task-reports       -> submit a task report (backend should accept this)
 * - GET  /gmail/local/search?limit=..  -> fetch local stored emails
 * - All requests use Authorization header from localStorage token via ./api helpers
 *
 * If your backend uses different routes adjust the path strings accordingly.
 */

import { useState, useEffect } from "react";
import "./employeeTasks.css";
import { apiGet, apiPost } from "./api";
import { useNavigate } from "react-router-dom";

export default function EmployeeDashboard() {
  const navigate = useNavigate();

  // UI tabs
  const [activeTab, setActiveTab] = useState("tasks");

  // Current user (from localStorage set by login)
  const [currentUser, setCurrentUser] = useState(null);

  // Tasks & Projects
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  // Communication (simple per-project chat)
  const [selectedProject, setSelectedProject] = useState(null);
  const [chatMessages, setChatMessages] = useState({});
  const [chatInput, setChatInput] = useState("");

  // Reports
  const [reportType, setReportType] = useState("completion");
  const [reportDescription, setReportDescription] = useState("");
  const [selectedTaskForReport, setSelectedTaskForReport] = useState("");

  // Emails
  const [emails, setEmails] = useState([]);
  const [loadingEmails, setLoadingEmails] = useState(false);

  // Load current user and protect page for logged-in only
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) {
        // not logged in -> redirect to login
        navigate("/login");
        return;
      }
      const u = JSON.parse(raw);
      setCurrentUser(u);
    } catch (e) {
      console.warn("Failed to parse stored user, redirecting to login.", e);
      navigate("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load tasks assigned to current user
  useEffect(() => {
    if (!currentUser) return;
    let mounted = true;

    async function loadTasks() {
      setLoadingTasks(true);
      try {
        // Try the optimized endpoint first
        let data;
        try {
          data = await apiGet("/api/tasks/my");
        } catch (err) {
          // If my endpoint doesn't exist or fails, fall back to /api/tasks and filter
          console.warn(
            "/api/tasks/my failed, falling back to /api/tasks:",
            err.message
          );
          const all = await apiGet("/api/tasks");
          data = all;
        }

        // Normalize to array
        const list = Array.isArray(data) ? data : data.tasks || [];
        // If endpoint returned all tasks, filter those assigned to current user
        const myId = currentUser.id || currentUser._id || currentUser._id;
        let assigned = list;
        if (
          !Array.isArray(data) ||
          (Array.isArray(data) && data.length && !data[0]._id)
        ) {
          // nothing suspicious — keep list as-is
        }
        // If endpoint was /api/tasks (all tasks) we need to filter
        // We'll check if /api/tasks/my was probably used by the server; nonetheless filter defensively:
        assigned = list.filter((t) => {
          if (!t) return false;
          // assigned_to may be a string id, an object, or array
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

        // Map tasks to UI friendly fields (keep original for any updates)
        const mapped = assigned.map((t) => ({
          id: t._id || t.id,
          title: t.title || t.name || "Untitled task",
          project: t.project_id || t.project || "Unassigned",
          description: t.description || "",
          status: t.status || "in_progress",
          priority: t.priority || "medium",
          due_date: t.due_date || t.dueDate || null,
          raw: t,
        }));

        if (!mounted) return;
        setTasks(mapped);

        // Build projects from tasks
        const projMap = new Map();
        mapped.forEach((m) => {
          const key = m.project || "Unassigned";
          if (!projMap.has(key)) projMap.set(key, { id: key, name: key });
        });
        setProjects(Array.from(projMap.values()));

        // Auto select first project for communication tab if none
        if (!selectedProject && Array.from(projMap.keys()).length > 0) {
          setSelectedProject(Array.from(projMap.keys())[0]);
        }

        // Default selectedTaskForReport
        if (!selectedTaskForReport && mapped.length > 0) {
          setSelectedTaskForReport(mapped[0].id);
        }
      } catch (err) {
        console.error("Failed to load tasks for user:", err);
        setTasks([]);
      } finally {
        if (mounted) setLoadingTasks(false);
      }
    }

    loadTasks();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // Load emails (local storage) for Emails tab
  async function loadEmails() {
    try {
      setLoadingEmails(true);
      const data = await apiGet("/gmail/local/search?limit=20");
      const list = data.emails || [];
      setEmails(list);
    } catch (err) {
      console.error("Failed to load local emails:", err);
      setEmails([]);
    } finally {
      setLoadingEmails(false);
    }
  }

  useEffect(() => {
    // load emails once when emails tab first shown or on mount
    loadEmails();
  }, []);

  // Update task status (optimistic UI + backend POST)
  async function handleStatusChange(taskId, newStatus) {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    // Try a backend call - many servers accept PATCH/PUT; here we try a POST to a dedicated endpoint,
    // fallback to generic /api/tasks/:id update if available on your backend.
    try {
      // Try convenient endpoint first
      await apiPost(`/api/tasks/${taskId}/status`, { status: newStatus });
    } catch (err) {
      // Try alternative generic update
      try {
        await apiPost(`/api/tasks/${taskId}/update`, { status: newStatus });
      } catch (err2) {
        console.warn(
          "Status update endpoints failed, server may not support direct update:",
          err,
          err2
        );
        // We leave optimistic UI as-is; ideally reload tasks to reflect server state
      }
    }
  }

  // Submit a task report to backend
  async function handleSubmitReport(e) {
    e.preventDefault();
    if (!selectedTaskForReport) {
      alert("Please select a task to report on.");
      return;
    }
    if (!reportDescription.trim()) {
      alert("Please provide a description for the report.");
      return;
    }

    const payload = {
      project_id: "", // optional
      task_id: selectedTaskForReport,
      report_type: reportType,
      description: reportDescription,
      created_by: currentUser?.id || currentUser?._id || null,
    };

    try {
      await apiPost("/api/task-reports", payload);
      alert("Report submitted successfully.");
      setReportDescription("");
    } catch (err) {
      console.error("Failed to submit report:", err);
      alert("Failed to submit report: " + (err.message || ""));
    }
  }

  // Chat send (local + optional backend)
  async function handleSendChat() {
    if (!selectedProject || !chatInput.trim()) return;

    const newMsg = {
      id: Date.now(),
      text: chatInput.trim(),
      user: currentUser?.full_name || currentUser?.email || "You",
      time: new Date().toLocaleTimeString(),
    };

    setChatMessages((prev) => {
      const copy = { ...prev };
      if (!copy[selectedProject]) copy[selectedProject] = [];
      copy[selectedProject] = [...copy[selectedProject], newMsg];
      return copy;
    });
    setChatInput("");

    // Optional: persist message to backend if endpoint exists:
    try {
      await apiPost(
        `/api/projects/${encodeURIComponent(selectedProject)}/messages`,
        {
          text: newMsg.text,
          userId: currentUser?.id || currentUser?._id || null,
        }
      );
    } catch (err) {
      // ignore: it's optional
    }
  }

  // Small helpers for rendering
  function getStatusColor(status) {
    switch ((status || "").toLowerCase()) {
      case "completed":
      case "done":
        return "#4CAF50";
      case "in_progress":
      case "in-progress":
        return "#2196F3";
      case "pending":
        return "#FFC107";
      default:
        return "#999";
    }
  }

  // Render UI per tab
  const renderTasksTab = () => {
    return (
      <div className="content-section">
        <div className="section-header">
          <h2>My Tasks & Projects</h2>
        </div>

        <div className="projects-grid">
          <h3>Active Projects</h3>
          <div className="cards-container">
            {projects.length === 0 ? (
              <div style={{ padding: 12 }}>No projects yet</div>
            ) : (
              projects.map((project) => {
                const projectTasks = tasks.filter(
                  (t) => t.project === project.id
                );
                const total = projectTasks.length || 0;
                const completed = projectTasks.filter((t) =>
                  ["completed", "done"].includes((t.status || "").toLowerCase())
                ).length;
                const pct =
                  total === 0 ? 0 : Math.round((completed / total) * 100);
                return (
                  <div key={project.id} className="project-card">
                    <h4>{project.name}</h4>
                    <div className="project-info">
                      <span>👥 members</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="progress-text">{pct}% Complete</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="tasks-section">
          <h3>My Tasks</h3>
          <div className="tasks-list">
            {loadingTasks ? (
              <div>Loading tasks...</div>
            ) : tasks.length === 0 ? (
              <div className="empty-state">No tasks assigned to you.</div>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="task-card">
                  <div className="task-header">
                    <h4>{task.title}</h4>
                    <span
                      className="priority-badge"
                      style={{
                        backgroundColor:
                          task.priority === "high"
                            ? "#f44336"
                            : task.priority === "low"
                            ? "#4caf50"
                            : "#ff9800",
                      }}
                    >
                      {task.priority}
                    </span>
                  </div>
                  <div className="task-details">
                    <span>📁 {task.project}</span>
                    <span>
                      📅{" "}
                      {task.due_date
                        ? new Date(task.due_date).toLocaleDateString()
                        : "—"}
                    </span>
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
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCommunicationTab = () => {
    return (
      <div className="content-section">
        <div className="section-header">
          <h2>Team Communication</h2>
        </div>

        <div className="communication-layout">
          <div className="project-list">
            <h3>Select Project</h3>
            <div className="project-items">
              {projects.map((p) => (
                <button
                  key={p.id}
                  className={`project-item ${
                    selectedProject === p.id ? "selected" : ""
                  }`}
                  onClick={() => setSelectedProject(p.id)}
                >
                  {p.name}
                  <span className="member-count">members</span>
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
                <div className="chat-messages" style={{ padding: 16 }}>
                  {(chatMessages[selectedProject] || []).length === 0 ? (
                    <div className="empty-state">
                      No messages for this project yet.
                    </div>
                  ) : (
                    (chatMessages[selectedProject] || []).map((msg) => (
                      <div
                        key={msg.id}
                        className={`chat-message ${
                          msg.user ===
                          (currentUser?.full_name || currentUser?.email)
                            ? "own-message"
                            : ""
                        }`}
                      >
                        <div className="message-header">
                          <strong>{msg.user}</strong>
                          <span className="message-time">{msg.time}</span>
                        </div>
                        <div>{msg.text}</div>
                      </div>
                    ))
                  )}
                </div>

                <div className="chat-input" style={{ padding: 12 }}>
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                    className="chat-input"
                    style={{ flex: 1 }}
                  />
                  <button
                    onClick={handleSendChat}
                    className="btn-primary"
                    style={{ marginLeft: 8 }}
                  >
                    Send
                  </button>
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
    );
  };

  const renderReportsTab = () => {
    return (
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
              onChange={(e) => setSelectedTaskForReport(e.target.value)}
            >
              <option value="">-- select task --</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} - {t.project}
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
                  {type === "completion" ? "Task Completion" : "Problem Report"}
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
            />
          </div>

          <button type="submit" className="submit-btn">
            Submit Report
          </button>
        </form>
      </div>
    );
  };

  const renderEmailsTab = () => {
    return (
      <div className="content-section">
        <div className="section-header">
          <h2>Email Management & Summaries</h2>
        </div>

        <div style={{ padding: 12 }}>
          <button
            onClick={loadEmails}
            className="btn-primary"
            style={{ marginBottom: 12 }}
          >
            Refresh Emails
          </button>
          {loadingEmails ? (
            <div>Loading emails...</div>
          ) : (
            <div className="emails-list">
              {emails.length === 0 ? (
                <div className="empty-state">No local emails found.</div>
              ) : (
                emails.map((email) => (
                  <div key={email.id} className="email-card">
                    <div className="email-header">
                      <div>
                        <h4>{email.subject}</h4>
                        <span className="email-from">
                          From: {email.fromEmail || email.from}
                        </span>
                      </div>
                      <span className="email-date">
                        {new Date(email.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="email-summary">
                      <strong>Snippet:</strong>
                      <p>
                        {email.snippet ||
                          email.bodyText?.substring(0, 200) ||
                          "—"}
                      </p>
                    </div>
                    <div className="email-actions">
                      <a
                        className="btn-secondary"
                        href={`/gmail/messages/${email.id}/summary`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View
                      </a>
                      <button
                        className="btn-secondary"
                        onClick={() =>
                          navigator.clipboard?.writeText(email.fromEmail || "")
                        }
                      >
                        Copy Sender
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Main render
  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Employee Dashboard</h1>
          <div className="user-info">
            <span className="user-name">
              Welcome,{" "}
              {currentUser?.full_name || currentUser?.email || "Employee"}
            </span>
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
        {activeTab === "tasks" && renderTasksTab()}
        {activeTab === "communication" && renderCommunicationTab()}
        {activeTab === "reports" && renderReportsTab()}
        {activeTab === "emails" && renderEmailsTab()}
      </main>
    </div>
  );
}
