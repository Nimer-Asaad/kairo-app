import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import UserSelectModal from "../../components/UserSelectModal";

const adminLinks = [
  {
    path: "/admin/dashboard",
    label: "Dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    path: "/admin/tasks",
    label: "Manage Tasks",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
    ),
  },
  {
    path: "/admin/create-task",
    label: "Create Task",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v16m8-8H4"
        />
      </svg>
    ),
  },
  {
    path: "/admin/users",
    label: "Team Members",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
  },
];

const CreateTask = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
    assignedTo: [],
  });
  const [checklist, setChecklist] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [users, setUsers] = useState([]);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [newAttachment, setNewAttachment] = useState({ name: "", url: "" });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.USERS);
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddChecklist = () => {
    if (newChecklistItem.trim()) {
      setChecklist((prev) => [...prev, { text: newChecklistItem, done: false }]);
      setNewChecklistItem("");
    }
  };

  const handleRemoveChecklist = (index) => {
    setChecklist((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddAttachment = () => {
    if (newAttachment.name.trim() && newAttachment.url.trim()) {
      setAttachments((prev) => [...prev, { ...newAttachment }]);
      setNewAttachment({ name: "", url: "" });
    }
  };

  const handleRemoveAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleToggleMember = (userId) => {
    setFormData((prev) => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(userId)
        ? prev.assignedTo.filter((id) => id !== userId)
        : [...prev.assignedTo, userId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const taskData = {
        ...formData,
        checklist,
        attachments,
      };
      await axiosInstance.post(API_PATHS.CREATE_TASK, taskData);
      
      // Show success message
      alert("✅ Task created successfully!");
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        dueDate: "",
        assignedTo: [],
      });
      setChecklist([]);
      setAttachments([]);
      
      // Navigate to manage tasks page
      navigate("/admin/tasks");
    } catch (error) {
      console.error("Error creating task:", error);
      alert("❌ Failed to create task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar links={adminLinks} />
      <div className="flex-1 px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Card Container */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h1 className="text-2xl font-bold text-gray-900">Create Task</h1>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Task Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="Enter task title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="Enter task description"
                />
              </div>

              {/* Row: Priority | Due Date | Assign */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block text-xs font-medium text-gray-600 mb-2">Assign To</label>
                  <button
                    type="button"
                    onClick={() => setShowMemberModal(true)}
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Select Members
                  </button>
                </div>
              </div>

              {/* Selected Members pills */}
              {formData.assignedTo.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.assignedTo.map((userId) => {
                    const user = users.find((u) => u._id === userId);
                    return user ? (
                      <span
                        key={userId}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100 flex items-center gap-2"
                      >
                        {user.fullName || user.name}
                        <button
                          type="button"
                          onClick={() => handleToggleMember(userId)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              )}

              {/* Checklist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-900">TODO Checklist</h2>
                </div>
                <div className="flex gap-2 justify-end">
                  <input
                    type="text"
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    placeholder="Add a subtask"
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddChecklist())}
                  />
                  <button
                    type="button"
                    onClick={handleAddChecklist}
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <ul className="space-y-2">
                  {checklist.map((item, index) => (
                    <li key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 text-sm">{item.text}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveChecklist(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Attachments */}
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-gray-900">Add Attachments</h2>
                <div className="flex gap-2 justify-end">
                  <input
                    type="text"
                    value={newAttachment.name}
                    onChange={(e) => setNewAttachment((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Attachment name"
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                  <input
                    type="url"
                    value={newAttachment.url}
                    onChange={(e) => setNewAttachment((prev) => ({ ...prev, url: e.target.value }))}
                    placeholder="Attachment URL"
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={handleAddAttachment}
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <ul className="space-y-2">
                  {attachments.map((attachment, index) => (
                    <li key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-gray-900 font-medium text-sm">{attachment.name}</p>
                        <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs hover:underline">
                          {attachment.url}
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                >
                  {loading ? "Creating..." : "CREATE TASK"}
                </button>
              </div>
            </form>
          </div>

          {/* Member Selection Modal using component */}
          <UserSelectModal
            isOpen={showMemberModal}
            users={users}
            selectedIds={formData.assignedTo}
            onToggle={handleToggleMember}
            onClose={() => setShowMemberModal(false)}
            onConfirm={() => setShowMemberModal(false)}
            title="Select Team Members"
          />
        </div>
      </div>
    </div>
  );
};

export default CreateTask;
