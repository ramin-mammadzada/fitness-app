"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Settings, LogOut, User } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      router.push("/login");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <div className="bg-gradient-to-r from-indigo-50 via-white to-purple-50 py-12 shadow-xl border-b border-indigo-100 h-16 flex items-center px-6 justify-between">
      {/* Left Section - Brand */}
      <div className="flex items-center gap-4">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-xl shadow-lg">
          <div className="text-white text-xl">🏋️</div>
        </div>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Gym Dashboard
          </h1>
          <p className="text-xs text-gray-500 -mt-1">İdarəçilik Paneli</p>
        </div>
      </div>

      {/* Right Section - User Menu */}
      {user && (
        <div className="flex items-center gap-4">
          {/* Notifications */}
          {/* <button className="relative p-2 text-gray-600 hover:text-indigo-600 hover:bg-white rounded-xl transition-all duration-200 hover:shadow-md">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
              3
            </span>
          </button> */}

          {/* Settings */}
          {/* <button className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-white rounded-xl transition-all duration-200 hover:shadow-md">
            <Settings size={20} />
          </button> */}

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 bg-white rounded-xl px-4 py-2 shadow-lg border border-indigo-100 hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {user.username?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-gray-900">
                  {user.username}
                </div>
                {/* <div className="text-xs text-gray-500">Admin</div> */}
              </div>
              <div
                className={`transform transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              >
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-indigo-100 py-2 z-50 animate-in slide-in-from-top-2">
                <div className="py-2">
                  {/* <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200">
                    <User size={16} />
                    Profil
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200">
                    <Settings size={16} />
                    Ayarlar
                  </button> */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                  >
                    <LogOut size={16} />
                    Çıxış
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backdrop for dropdown */}
      {dropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setDropdownOpen(false)}
        ></div>
      )}
    </div>
  );
}
