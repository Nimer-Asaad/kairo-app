import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import AvatarCropper from "../components/AvatarCropper";
import ImageLightbox from "../components/ImageLightbox";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user, login } = useAuth();
  const [form, setForm] = useState({ fullName: "", email: "", avatar: "" });
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cropSrc, setCropSrc] = useState("");
  const [lightboxSrc, setLightboxSrc] = useState("");

  const navLinks = useMemo(() => {
    const baseLinks = user?.role === "admin"
      ? [
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
        ]
      : [
          {
            path: "/user/dashboard",
            label: "Dashboard",
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            ),
          },
          {
            path: "/user/my-tasks",
            label: "My Tasks",
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            ),
          },
        ];

    return [
      ...baseLinks,
      {
        path: "/profile",
        label: "Profile",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9 9 0 1118 8.999M15 19l2 2 4-4" />
          </svg>
        ),
      },
    ];
  }, [user?.role]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axiosInstance.get(API_PATHS.USER_ME);
        setForm({
          fullName: data.fullName || "",
          email: data.email || "",
          avatar: data.avatar || "",
        });
        setPreview(data.avatar || "");
      } catch (error) {
        console.error("Error loading profile", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result);
    reader.readAsDataURL(file);
  };

  const handleCropConfirm = async ({ file, url }) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("avatar", file);
      const { data } = await axiosInstance.post(API_PATHS.USER_AVATAR, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((prev) => ({ ...prev, avatar: data.url }));
      setPreview(data.url || url);
      if (user) {
        login({ token: user.token, user: { ...user, avatar: data.url } });
      }
    } catch (error) {
      console.error("Error uploading avatar", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
      setCropSrc("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const { data } = await axiosInstance.put(API_PATHS.USER_ME, form);
      if (user) {
        login({ token: user.token, user: { ...user, ...data } });
      }
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile", error);
      const message = error?.response?.data?.message || "Failed to update profile";
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar links={navLinks} />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar links={navLinks} />
      <div className="flex-1 p-6 lg:p-10">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="text-sm text-gray-500">Update your personal information and avatar</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
            <div className="flex flex-col md:flex-row gap-6 md:gap-10">
              <div className="flex flex-col items-center gap-4">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center text-3xl font-bold overflow-hidden shadow-lg cursor-pointer hover:opacity-90 transition-opacity" onClick={() => preview && setLightboxSrc(preview)}>
                  {preview ? (
                    <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    (form.fullName || user?.fullName || "U").charAt(0).toUpperCase()
                  )}
                </div>
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold">
                  {uploading ? "Uploading..." : "Choose Image"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {cropSrc && (
        <AvatarCropper
          imageSrc={cropSrc}
          onCancel={() => setCropSrc("")}
          onConfirm={handleCropConfirm}
        />
      )}
      {lightboxSrc && (
        <ImageLightbox
          imageSrc={lightboxSrc}
          onClose={() => setLightboxSrc("")}
        />
      )}
    </div>
  );
};

export default Profile;
