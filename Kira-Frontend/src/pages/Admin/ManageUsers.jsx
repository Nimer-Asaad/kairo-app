import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { downloadCSV } from "../../utils/helper";

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

const ManageUsers = () => {
  const [teamStats, setTeamStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamStats();
  }, []);

  const fetchTeamStats = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.TEAM_STATS);
      const normalized = (response.data || []).map((member) => {
        const user = member.user || member;
        const stats = member.stats || {};
        return {
          id: user?._id || member._id,
          fullName: user?.fullName || user?.name || "User",
          email: user?.email || "",
          role: user?.role || "user",
          avatar: user?.avatar || "",
          stats: {
            pending: stats.pending || 0,
            inProgress: stats.inProgress || 0,
            completed: stats.completed || 0,
          },
        };
      });

      setTeamStats(normalized);
    } catch (error) {
      console.error("Error fetching team stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.TEAM_REPORT, {
        params: { format: "csv" },
        responseType: "blob",
      });

      const contentType = response.headers["content-type"] || "";

      if (contentType.includes("application/json")) {
        const text = await response.data.text();
        const json = JSON.parse(text);
        downloadCSV(json, "team-report");
        return;
      }

      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "team-report.csv";
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading report:", error);
    }
  };

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
      <div className="flex-1 p-8 bg-gray-50">
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-sm text-gray-500">Team overview</p>
            <h1 className="text-3xl font-bold text-gray-900">Team Members</h1>
          </div>
          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3 3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Report
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {teamStats.map((member) => (
            <div key={member.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-6">
              <div className="flex flex-col items-center mb-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center text-2xl font-bold mb-3 shadow-lg">
                  {member.fullName ? member.fullName.charAt(0).toUpperCase() : "U"}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 text-center">{member.fullName}</h3>
                <p className="text-sm text-gray-500 text-center truncate w-full px-2">{member.email}</p>
                <span className="mt-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-100">
                  {member.role.toUpperCase()}
                </span>
              </div>

              <div className="space-y-3 mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-sm" />
                    <span className="text-sm text-gray-600 font-medium">Pending</span>
                  </div>
                  <span className="font-bold text-gray-900 text-lg">{member.stats.pending}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm" />
                    <span className="text-sm text-gray-600 font-medium">In Progress</span>
                  </div>
                  <span className="font-bold text-gray-900 text-lg">{member.stats.inProgress}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm" />
                    <span className="text-sm text-gray-600 font-medium">Completed</span>
                  </div>
                  <span className="font-bold text-gray-900 text-lg">{member.stats.completed}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Total Tasks</span>
                  <span className="text-xl font-bold text-blue-600">
                    {member.stats.pending + member.stats.inProgress + member.stats.completed}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {teamStats.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No team members found</h3>
            <p className="mt-1 text-sm text-gray-500">Team members will appear here once they join.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;
