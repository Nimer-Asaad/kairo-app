import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = ({ links }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Add admin-specific menu items when role is admin
  const enhancedLinks = [...links];
  if (user?.role === "admin") {
    const hasCreateTask = links.some(l => l.path === "/admin/create-task");
    const hasTeamMembers = links.some(l => l.path === "/admin/users");
    
    if (!hasCreateTask) {
      enhancedLinks.push({
        path: "/admin/create-task",
        label: "Create Task",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        ),
      });
    }
    
    if (!hasTeamMembers) {
      enhancedLinks.push({
        path: "/admin/users",
        label: "Team Members",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ),
      });
    }
  }

  return (
    <div className="w-64 bg-gradient-to-b from-gray-800 to-gray-900 min-h-screen text-white flex flex-col shadow-xl">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
          Kira
        </h1>
        <p className="text-sm text-gray-400 mt-1">Task Manager</p>
      </div>

      {/* Profile Block */}
      <div className="px-4 py-4 mx-2 border-b border-gray-700 cursor-pointer bg-blue-600/10 hover:bg-blue-600/20 rounded-lg transition-all" onClick={() => navigate("/profile")} title="View profile">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-semibold text-lg shadow-lg">
            {user?.profileImage || user?.avatar ? (
              <img 
                src={user.profileImage || user.avatar} 
                alt={user.name || user.fullName} 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              (user?.name || user?.fullName || "U").charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {user?.name || user?.fullName || "User"}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {user?.email || user?.username || "user@example.com"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {enhancedLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`group flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white hover:translate-x-1"
              }`}
            >
              <span className={`mr-3 transition-transform duration-200 ${!isActive && "group-hover:scale-110"}`}>
                {link.icon}
              </span>
              <span className="font-medium">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-3 text-gray-300 hover:bg-red-600 hover:text-white rounded-lg transition-all duration-200 group"
        >
          <svg
            className="w-5 h-5 mr-3 transition-transform duration-200 group-hover:scale-110"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
