"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      router.push("/"); // Artıq login olubsa, dashboard-a yönləndir
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    const { username, password } = form;

    // Sadə yoxlama (realda serverdən yoxlanılır)
    if (username === "admin" && password === "1234") {
      localStorage.setItem("user", JSON.stringify({ username }));
      router.push("/gym-users");
    } else {
      setError("İstifadəçi adı və ya şifrə yanlışdır.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl border border-indigo-100 p-8 max-w-sm w-full">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg mb-4">
            <div className="text-2xl text-white">🏋️</div>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Login
          </h2>
        </div>

        {error && (
          <div className="p-4 rounded-xl border-l-4 bg-red-50 border-red-500 text-red-700 shadow-md animate-pulse mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <input
              type="text"
              placeholder="İstifadəçi adı"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Şifrə"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium"
          >
            Daxil ol
          </button>
        </form>
      </div>
    </div>
  );
}
