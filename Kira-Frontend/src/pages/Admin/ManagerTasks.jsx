import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import TaskCard from "../../components/TaskCard";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { formatDate, getPriorityColor, getStatusColor, downloadCSV, calculateProgress } from "../../utils/helper";

const adminLinks = [
	{
		path: "/admin/dashboard",
		label: "Dashboard",
		icon: (
			<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
			</svg>
		),
	},
	{
		path: "/admin/tasks",
		label: "Manage Tasks",
		icon: (
			<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
			</svg>
		),
	},
	{
		path: "/admin/create-task",
		label: "Create Task",
		icon: (
			<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
			</svg>
		),
	},
	{
		path: "/admin/users",
		label: "Team Members",
		icon: (
			<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
			</svg>
		),
	},
];

const ManagerTasks = () => {
	const [tasks, setTasks] = useState([]);
	const [filtered, setFiltered] = useState([]);
	const [active, setActive] = useState("all");
	const [loading, setLoading] = useState(true);
	const [selectedTask, setSelectedTask] = useState(null);
	const [showModal, setShowModal] = useState(false);
	const [updatingTask, setUpdatingTask] = useState(false);

	useEffect(() => {
		loadTasks();
	}, []);

	useEffect(() => {
		if (active === "all") setFiltered(tasks);
		else setFiltered(tasks.filter((t) => t.status === active));
	}, [active, tasks]);

	const loadTasks = async () => {
		try {
			const res = await axiosInstance.get(API_PATHS.ADMIN_TASKS);
			setTasks(res.data || []);
		} catch (error) {
			console.error("Failed to load tasks", error);
		} finally {
			setLoading(false);
		}
	};

	const handleDownload = async () => {
		try {
			const res = await axiosInstance.get(API_PATHS.TASK_REPORT);
			downloadCSV(res.data, "task-report");
		} catch (error) {
			console.error("Failed to download report", error);
		}
	};

	const handleViewTask = (task) => {
		setSelectedTask({
			...task,
			checklist: (task.checklist || []).map((i) => ({ text: i.text, done: !!i.done })),
		});
		setShowModal(true);
	};

	const handleCloseModal = () => {
		setShowModal(false);
		setSelectedTask(null);
	};

	const handleStatusChange = (e) => {
		setSelectedTask({ ...selectedTask, status: e.target.value });
	};

	const handleChecklistToggle = (index) => {
		const updatedChecklist = [...selectedTask.checklist];
		updatedChecklist[index] = {
			...updatedChecklist[index],
			done: !updatedChecklist[index].done,
		};
		setSelectedTask({ ...selectedTask, checklist: updatedChecklist });
	};

	const handleUpdateTask = async () => {
		try {
			setUpdatingTask(true);
			await Promise.all([
				axiosInstance.patch(API_PATHS.TASK_STATUS(selectedTask._id), {
					status: selectedTask.status,
				}),
				axiosInstance.patch(API_PATHS.TASK_CHECKLIST(selectedTask._id), {
					checklist: selectedTask.checklist,
				}),
			]);

			setTasks(tasks.map((task) =>
				task._id === selectedTask._id
					? { ...task, status: selectedTask.status, checklist: selectedTask.checklist }
					: task
			));

			alert("✅ Task updated successfully!");
			handleCloseModal();
		} catch (error) {
			console.error("Error updating task:", error);
			alert("❌ Failed to update task.");
		} finally {
			setUpdatingTask(false);
		}
	};

	const handleMarkCompleted = async () => {
		try {
			setUpdatingTask(true);
			await axiosInstance.patch(API_PATHS.TASK_STATUS(selectedTask._id), {
				status: "completed",
			});

			setTasks(tasks.map((task) =>
				task._id === selectedTask._id ? { ...task, status: "completed" } : task
			));

			alert("✅ Task marked as completed!");
			handleCloseModal();
		} catch (error) {
			console.error("Error marking task as completed:", error);
			alert("❌ Failed to mark task as completed.");
		} finally {
			setUpdatingTask(false);
		}
	};

	const handleDeleteTask = async () => {
		if (!confirm("Are you sure you want to delete this task?")) return;

		try {
			setUpdatingTask(true);
			await axiosInstance.delete(API_PATHS.DELETE_TASK(selectedTask._id));

			setTasks(tasks.filter((task) => task._id !== selectedTask._id));

			alert("✅ Task deleted successfully!");
			handleCloseModal();
		} catch (error) {
			console.error("Error deleting task:", error);
			alert("❌ Failed to delete task.");
		} finally {
			setUpdatingTask(false);
		}
	};

	const formatStatus = (status) => {
		const map = {
			pending: "Pending",
			"in-progress": "In Progress",
			completed: "Completed",
		};
		return map[(status || "").toLowerCase()] || status || "Unknown";
	};

	const tabs = [
		{ id: "all", label: "All" },
		{ id: "pending", label: "Pending" },
		{ id: "in-progress", label: "In Progress" },
		{ id: "completed", label: "Completed" },
	];

	if (loading) {
		return (
			<div className="flex min-h-screen bg-gray-50">
				<Sidebar links={adminLinks} />
				<div className="flex-1 flex items-center justify-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen bg-gray-50">
			<Sidebar links={adminLinks} />
			<div className="flex-1 p-8">
				<div className="flex items-center justify-between mb-8">
					<h1 className="text-3xl font-bold text-gray-900">Manage Tasks</h1>
					<button
						onClick={handleDownload}
						className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
					>
						Download Report
					</button>
				</div>

				<div className="mb-6 border-b border-gray-200">
					<div className="flex space-x-6">
						{tabs.map((tab) => (
							<button
								key={tab.id}
								onClick={() => setActive(tab.id)}
								className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
									active === tab.id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500"
								}`}
							>
								{tab.label}
							</button>
						))}
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{filtered.map((task) => (
						<TaskCard key={task._id} task={task} onClick={() => handleViewTask(task)} />
					))}
				</div>

				{!filtered.length && (
					<div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-xl shadow-sm">
						<div className="bg-gray-100 p-6 rounded-full mb-4">
							<svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
							</svg>
						</div>
						<p className="text-gray-500 font-medium mb-1">No tasks found</p>
						<p className="text-gray-400 text-sm">Tasks for this filter will appear here</p>
					</div>
				)}
			</div>

			{/* Task Details Modal */}
			{showModal && selectedTask && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
					<div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fadeIn">
						<div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-xl">
							<h2 className="text-2xl font-bold text-gray-800">Task Details</h2>
							<button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full">
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>

						<div className="p-6 space-y-6">
							<div>
								<h3 className="text-xl font-semibold text-gray-800 mb-3">{selectedTask.title}</h3>
								<div className="flex items-center gap-3 flex-wrap">
									<span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${getPriorityColor((selectedTask.priority || "").toLowerCase())}`}>
										{(selectedTask.priority || "").toUpperCase()} PRIORITY
									</span>
									<div className="flex items-center text-sm text-gray-600">
										<svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
										</svg>
										Due: {formatDate(selectedTask.dueDate)}
									</div>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
								<p className="text-gray-600 bg-gray-50 p-4 rounded-lg">{selectedTask.description}</p>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
								<select value={selectedTask.status} onChange={handleStatusChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent">
									<option value="pending">Pending</option>
									<option value="in-progress">In Progress</option>
									<option value="completed">Completed</option>
								</select>
							</div>

							{selectedTask.checklist && selectedTask.checklist.length > 0 && (
								<div>
									<div className="flex items-center justify-between mb-3">
										<label className="block text-sm font-medium text-gray-700">Checklist</label>
										<span className="text-sm text-gray-500">
											{selectedTask.checklist.filter((i) => i.done).length} of {selectedTask.checklist.length} completed
										</span>
									</div>
									<div className="mb-3">
										<div className="w-full bg-gray-200 rounded-full h-2.5">
											<div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${calculateProgress(selectedTask.checklist)}%` }}></div>
										</div>
									</div>
									<div className="space-y-2 bg-gray-50 p-4 rounded-lg">
										{selectedTask.checklist.map((item, index) => (
											<label key={index} className="flex items-center space-x-3 cursor-pointer hover:bg-white p-3 rounded-lg transition-all duration-150 group">
												<input type="checkbox" checked={item.done} onChange={() => handleChecklistToggle(index)} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer" />
												<span className={`flex-1 transition-all duration-150 ${item.done ? "line-through text-gray-400" : "text-gray-700 group-hover:text-gray-900"}`}>
													{item.text}
												</span>
											</label>
										))}
									</div>
								</div>
							)}

							{selectedTask.assignedTo && selectedTask.assignedTo.length > 0 && (
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
									<div className="flex items-center gap-2">
										{selectedTask.assignedTo.map((member) => (
											<div key={member._id} className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
												<div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
													{(member.fullName || member.name || "U").charAt(0).toUpperCase()}
												</div>
												<span className="text-sm text-gray-700">{member.fullName || member.name}</span>
											</div>
										))}
									</div>
								</div>
							)}

							<div className="flex gap-3 pt-4 border-t border-gray-200">
								<button onClick={handleUpdateTask} disabled={updatingTask} className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-all duration-150 font-medium disabled:bg-blue-400 disabled:cursor-not-allowed shadow-sm hover:shadow-md">
									{updatingTask ? "Updating..." : "Update Task"}
								</button>
								<button onClick={handleMarkCompleted} disabled={updatingTask || selectedTask.status === "completed"} className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-150 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed">
									Mark Complete
								</button>
								<button onClick={handleDeleteTask} disabled={updatingTask} className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-150 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed">
									Delete
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ManagerTasks;
