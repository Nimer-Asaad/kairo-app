import { formatDate, getStatusColor, getPriorityColor, calculateProgress } from "../utils/helper";

const formatStatus = (status) => {
  const map = {
    pending: "Pending",
    "in-progress": "In Progress",
    completed: "Completed",
  };
  return map[(status || "").toLowerCase()] || status || "Unknown";
};

const TaskCard = ({ task, onClick }) => {
  const progress = calculateProgress(task?.checklist || []);
  const statusClass = getStatusColor((task?.status || "").toLowerCase());
  const priorityClass = getPriorityColor((task?.priority || "").toLowerCase());

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
    >
      {/* Header with Title and Priority */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-lg font-semibold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
          {task?.title}
        </h3>
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${priorityClass} whitespace-nowrap`}>
          {(task?.priority || "").toUpperCase()}
        </span>
      </div>

      {/* Description */}
      {task?.description ? (
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">{task.description}</p>
      ) : null}

      {/* Status and Due Date */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClass}`}>
          {formatStatus(task?.status)}
        </span>
        {task?.dueDate ? (
          <div className="flex items-center text-xs text-gray-500">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(task.dueDate)}
          </div>
        ) : null}
      </div>

      {/* Progress Bar */}
      {task?.checklist && task.checklist.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
            <span className="font-medium">Progress</span>
            <span className="font-semibold">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {task.checklist.filter(i => i.done).length} of {task.checklist.length} tasks completed
          </p>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
