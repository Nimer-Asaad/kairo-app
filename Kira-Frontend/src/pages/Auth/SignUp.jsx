import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { API_PATHS } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";
import AuthLayout from "../../components/AuthLayout";

const SignUp = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    adminInviteToken: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const body = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      };
      
      if (formData.adminInviteToken) {
        body.adminInviteToken = formData.adminInviteToken;
      }

      const response = await axiosInstance.post("/auth/signup", body);

      // Persist normalized user
      login(response.data);

      // Navigate based on role from backend payload
      const role = response.data?.user?.role;
      if (role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/user/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-10">
        <div className="pt-2">
          <h1 className="text-xl font-semibold text-gray-900">Task Manager</h1>
        </div>

        <div className="space-y-3">
          <h2 className="text-[28px] leading-tight font-semibold text-gray-900">Create an Account</h2>
          <p className="text-sm text-gray-600">Join us today by entering your details below.</p>
          <div className="pt-3">
            <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 shadow-lg flex items-center justify-center text-white text-xl font-semibold mx-auto lg:mx-0">
              JD
              <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-white shadow flex items-center justify-center">
                <div className="h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">×</div>
              </div>
            </div>
          </div>
        </div>

        <form className="space-y-8" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="auth-grid grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-800 mb-2">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="w-full h-12 px-4 border border-gray-200 bg-gray-50 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                placeholder="John"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-800 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full h-12 px-4 border border-gray-200 bg-gray-50 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-800 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full h-12 px-4 border border-gray-200 bg-gray-50 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pr-12 shadow-sm"
                  placeholder="Min 8 Characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="adminInviteToken" className="block text-sm font-medium text-gray-800 mb-2">
                Admin Invite Token <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                id="adminInviteToken"
                name="adminInviteToken"
                type="text"
                value={formData.adminInviteToken}
                onChange={handleChange}
                className="w-full h-12 px-4 border border-gray-200 bg-gray-50 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                placeholder="6 Digit Code"
              />
              <p className="mt-1 text-xs text-gray-500">Leave empty to register as a regular user</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 px-4 bg-[#1d7bff] hover:bg-[#1562d6] text-white font-semibold rounded-xl uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow"
          >
            {loading ? "Creating account..." : "SIGN UP"}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-blue-700 hover:text-blue-800">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default SignUp;
