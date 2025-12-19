const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const API_PATHS = {
  // Auth
  SIGNUP: `${API_BASE_URL}/auth/signup`,
  LOGIN: `${API_BASE_URL}/auth/login`,
  ME: `${API_BASE_URL}/auth/me`,

  // Tasks
  CREATE_TASK: `${API_BASE_URL}/tasks`,
  ADMIN_TASKS: `${API_BASE_URL}/tasks/admin`,
  MY_TASKS: `${API_BASE_URL}/tasks/my`,
  TASK_BY_ID: (id) => `${API_BASE_URL}/tasks/${id}`,
  TASK_STATS: `${API_BASE_URL}/tasks/stats`,
  TASK_STATUS: (id) => `${API_BASE_URL}/tasks/${id}/status`,
  TASK_CHECKLIST: (id) => `${API_BASE_URL}/tasks/${id}/checklist`,

  // Users
  USERS: `${API_BASE_URL}/users`,
  USER_ME: `${API_BASE_URL}/users/me`,
  USER_AVATAR: `${API_BASE_URL}/users/me/avatar`,
  USER_BY_ID: (id) => `${API_BASE_URL}/users/${id}`,
  USER_STATS: (id) => `${API_BASE_URL}/users/${id}/stats`,
  TEAM_STATS: `${API_BASE_URL}/users/team/stats`,

  // Reports
  TASK_REPORT: `${API_BASE_URL}/reports/tasks`,
  TEAM_REPORT: `${API_BASE_URL}/reports/team`,
};

export default API_PATHS;
