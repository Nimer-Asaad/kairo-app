// src/personPage.js
import React, { useState, useEffect } from "react";
import "./personPage.css";
import { useNavigate } from "react-router-dom";

function PersonPage() {
  const navigate = useNavigate();

  // 🔐 حماية الصفحة: بس اللي role = "person" يدخل
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      navigate("/login");
      return;
    }

    try {
      const user = JSON.parse(stored);
      if (user.role !== "person") {
        navigate("/login");
      }
    } catch (e) {
      navigate("/login");
    }
  }, [navigate]);

  const [activeTab, setActiveTab] = useState("tasks");

  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState("");
  const [taskTime, setTaskTime] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTaskInput, setEditTaskInput] = useState("");
  const [editTaskTime, setEditTaskTime] = useState("");

  const [dailyTasks, setDailyTasks] = useState([]);
  const [dailyTaskInput, setDailyTaskInput] = useState("");
  const [editingDailyTaskId, setEditingDailyTaskId] = useState(null);
  const [editDailyTaskInput, setEditDailyTaskInput] = useState("");

  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: "Support",
      text: "Hello! How can I help you today?",
      type: "support",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editMessageInput, setEditMessageInput] = useState("");

  const [workNotes, setWorkNotes] = useState("");

  // ===== Tasks with Time =====
  const addTask = () => {
    if (taskInput.trim() && taskTime) {
      setTasks((prev) => [
        ...prev,
        { id: Date.now(), task: taskInput, time: taskTime },
      ]);
      setTaskInput("");
      setTaskTime("");
    }
  };

  const startEditTask = (task) => {
    setEditingTaskId(task.id);
    setEditTaskInput(task.task);
    setEditTaskTime(task.time);
  };

  const saveEditTask = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, task: editTaskInput, time: editTaskTime }
          : task
      )
    );
    setEditingTaskId(null);
    setEditTaskInput("");
    setEditTaskTime("");
  };

  const cancelEditTask = () => {
    setEditingTaskId(null);
    setEditTaskInput("");
    setEditTaskTime("");
  };

  const deleteTask = (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      setTasks((prev) => prev.filter((task) => task.id !== id));
    }
  };

  const deleteAllTasks = () => {
    if (window.confirm("Are you sure you want to delete ALL tasks?")) {
      setTasks([]);
    }
  };

  // ===== Daily Tasks =====
  const addDailyTask = () => {
    if (dailyTaskInput.trim()) {
      setDailyTasks((prev) => [
        ...prev,
        { id: Date.now(), task: dailyTaskInput },
      ]);
      setDailyTaskInput("");
    }
  };

  const startEditDailyTask = (task) => {
    setEditingDailyTaskId(task.id);
    setEditDailyTaskInput(task.task);
  };

  const saveEditDailyTask = (id) => {
    setDailyTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, task: editDailyTaskInput } : task
      )
    );
    setEditingDailyTaskId(null);
    setEditDailyTaskInput("");
  };

  const cancelEditDailyTask = () => {
    setEditingDailyTaskId(null);
    setEditDailyTaskInput("");
  };

  const deleteDailyTask = (id) => {
    if (window.confirm("Are you sure you want to delete this daily task?")) {
      setDailyTasks((prev) => prev.filter((task) => task.id !== id));
    }
  };

  const deleteAllDailyTasks = () => {
    if (window.confirm("Are you sure you want to delete ALL daily tasks?")) {
      setDailyTasks([]);
    }
  };

  // ===== Chat =====
  const sendMessage = () => {
    if (chatInput.trim()) {
      const now = Date.now();
      const newMessages = [
        ...chatMessages,
        { id: now, sender: "You", text: chatInput, type: "user" },
        {
          id: now + 1,
          sender: "Support",
          text: "Thank you for your message. Our team will respond shortly.",
          type: "support",
        },
      ];
      setChatMessages(newMessages);
      setChatInput("");
    }
  };

  const startEditMessage = (msg) => {
    if (msg.type === "user") {
      setEditingMessageId(msg.id);
      setEditMessageInput(msg.text);
    }
  };

  const saveEditMessage = (id) => {
    setChatMessages((prev) =>
      prev.map((msg) =>
        msg.id === id ? { ...msg, text: editMessageInput } : msg
      )
    );
    setEditingMessageId(null);
    setEditMessageInput("");
  };

  const cancelEditMessage = () => {
    setEditingMessageId(null);
    setEditMessageInput("");
  };

  const deleteMessage = (id) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      setChatMessages((prev) => prev.filter((msg) => msg.id !== id));
    }
  };

  const clearAllChat = () => {
    if (window.confirm("Are you sure you want to clear ALL chat messages?")) {
      setChatMessages([
        {
          id: Date.now(),
          sender: "Support",
          text: "Hello! How can I help you today?",
          type: "support",
        },
      ]);
    }
  };

  // ===== Tabs Content =====
  const renderTabContent = () => {
    switch (activeTab) {
      case "tasks":
        return (
          <div>
            <h2 className="tabHeader" style={{ color: "#1e40af", marginTop: 0 }}>
              Assign Task with Time
            </h2>
            <input
              type="text"
              placeholder="Enter task description..."
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              className="input"
            />
            <input
              type="datetime-local"
              value={taskTime}
              onChange={(e) => setTaskTime(e.target.value)}
              className="input"
            />
            <div className="buttonGroup">
              <button onClick={addTask} className="button">
                Add Task
              </button>
              {tasks.length > 0 && (
                <button onClick={deleteAllTasks} className="deleteButton">
                  Delete All
                </button>
              )}
            </div>

            <div style={{ marginTop: "30px" }}>
              {tasks.length === 0 ? (
                <div className="emptyState">
                  No tasks assigned yet. Add your first task above!
                </div>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} className="taskItem">
                    {editingTaskId === task.id ? (
                      <div>
                        <input
                          type="text"
                          value={editTaskInput}
                          onChange={(e) => setEditTaskInput(e.target.value)}
                          className="editInputSmall"
                        />
                        <input
                          type="datetime-local"
                          value={editTaskTime}
                          onChange={(e) => setEditTaskTime(e.target.value)}
                          className="editInputSmall"
                        />
                        <div className="buttonGroup">
                          <button
                            onClick={() => saveEditTask(task.id)}
                            className="saveButton"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEditTask}
                            className="cancelButton"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="taskInfo">
                          <p className="taskText">{task.task}</p>
                          <p className="taskTime">
                            Due: {new Date(task.time).toLocaleString()}
                          </p>
                        </div>
                        <div className="buttonGroup">
                          <button
                            onClick={() => startEditTask(task)}
                            className="editButton"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="deleteButton"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case "daily":
        return (
          <div>
            <h2 style={{ color: "#1e40af", marginTop: 0 }}>
              Register Daily Tasks
            </h2>
            <div className="inputGroup">
              <input
                type="text"
                placeholder="Enter daily task..."
                value={dailyTaskInput}
                onChange={(e) => setDailyTaskInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addDailyTask()}
                className="input flexInput"
              />
              <button onClick={addDailyTask} className="button">
                Add Task
              </button>
              {dailyTasks.length > 0 && (
                <button
                  onClick={deleteAllDailyTasks}
                  className="deleteButton"
                >
                  Delete All
                </button>
              )}
            </div>

            <div style={{ marginTop: "30px" }}>
              {dailyTasks.length === 0 ? (
                <div className="emptyState">
                  No daily tasks yet. Start planning your day!
                </div>
              ) : (
                dailyTasks.map((task) => (
                  <div key={task.id} className="taskItem">
                    {editingDailyTaskId === task.id ? (
                      <div>
                        <input
                          type="text"
                          value={editDailyTaskInput}
                          onChange={(e) =>
                            setEditDailyTaskInput(e.target.value)
                          }
                          className="editInputSmall"
                        />
                        <div className="buttonGroup">
                          <button
                            onClick={() => saveEditDailyTask(task.id)}
                            className="saveButton"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEditDailyTask}
                            className="cancelButton"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="taskInfo">
                          <p className="taskText">{task.task}</p>
                        </div>
                        <div className="buttonGroup">
                          <button
                            onClick={() => startEditDailyTask(task)}
                            className="editButton"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteDailyTask(task.id)}
                            className="deleteButton"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case "chat":
        return (
          <div>
            <div className="tabHeader">
              <h2 style={{ color: "#1e40af", margin: 0 }}>
                Technical Support Chat
              </h2>
              {chatMessages.length > 1 && (
                <button onClick={clearAllChat} className="deleteButton">
                  Clear All
                </button>
              )}
            </div>
            <div className="chatMessages">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message ${
                    msg.type === "user" ? "userMessage" : "supportMessage"
                  }`}
                >
                  {editingMessageId === msg.id ? (
                    <div>
                      <input
                        type="text"
                        value={editMessageInput}
                        onChange={(e) =>
                          setEditMessageInput(e.target.value)
                        }
                        className="editInputSmall"
                        style={{ backgroundColor: "rgba(255,255,255,0.9)" }}
                      />
                      <div className="buttonGroup">
                        <button
                          onClick={() => saveEditMessage(msg.id)}
                          className="saveButton"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEditMessage}
                          className="cancelButton"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="messageSender">{msg.sender}</div>
                      <p className="messageText">{msg.text}</p>
                      {msg.type === "user" && (
                        <div
                          className="buttonGroup"
                          style={{ marginTop: "8px" }}
                        >
                          <button
                            onClick={() => startEditMessage(msg)}
                            className="messageButton"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteMessage(msg.id)}
                            className="messageDeleteButton"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="inputGroup">
              <input
                type="text"
                placeholder="Type your message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="input flexInput"
                style={{ marginBottom: 0 }}
              />
              <button onClick={sendMessage} className="button">
                Send
              </button>
            </div>
          </div>
        );

      case "work":
        return (
          <div>
            <h2 style={{ color: "#1e40af", marginTop: 0 }}>Manage Daily Work</h2>
            <textarea
              placeholder="Write your daily work notes, plans, schedules, or updates here..."
              value={workNotes}
              onChange={(e) => setWorkNotes(e.target.value)}
              className="textarea"
            />
            <div className="buttonGroup">
              <button
                onClick={() => {
                  if (workNotes.trim()) {
                    alert("Work notes saved successfully!");
                  } else {
                    alert("Please write some notes before saving!");
                  }
                }}
                className="button"
              >
                Save Notes
              </button>
              {workNotes.trim() && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (
                      window.confirm(
                        "Are you sure you want to clear all work notes?"
                      )
                    ) {
                      setWorkNotes("");
                    }
                  }}
                  className="deleteButton"
                >
                  Clear Notes
                </button>
              )}
            </div>

            {workNotes && (
              <div className="currentNotes">
                <h3 style={{ color: "#1e40af", marginTop: 0 }}>
                  Current Notes:
                </h3>
                <p style={{ color: "#333", whiteSpace: "pre-wrap" }}>
                  {workNotes}
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1 className="title">Person Page</h1>
      </header>

      <div className="mainContent">
        <div className="tabsContainer">
          <div className="tabButtons">
            <button
              className={`tabButton ${
                activeTab === "tasks" ? "activeTab" : ""
              }`}
              onClick={() => setActiveTab("tasks")}
            >
              Assign Tasks
            </button>
            <button
              className={`tabButton ${
                activeTab === "daily" ? "activeTab" : ""
              }`}
              onClick={() => setActiveTab("daily")}
            >
              Daily Tasks
            </button>
            <button
              className={`tabButton ${
                activeTab === "chat" ? "activeTab" : ""
              }`}
              onClick={() => setActiveTab("chat")}
            >
              Support Chat
            </button>
            <button
              className={`tabButton ${
                activeTab === "work" ? "activeTab" : ""
              }`}
              onClick={() => setActiveTab("work")}
            >
              Manage Work
            </button>
          </div>

          <div className="tabContent">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
}

export default PersonPage;
