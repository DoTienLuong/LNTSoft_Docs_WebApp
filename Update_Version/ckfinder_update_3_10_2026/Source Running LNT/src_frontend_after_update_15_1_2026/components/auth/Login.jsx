import React, { useState } from "react";
import { authService } from "../../services/authService";
import { useTheme } from "../../contexts/ThemeContext";
import { getThemeStyles } from "../../config/themeStyles";
import TopBar from "../header/TopBar";

export default function Login({ onLogin }) {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await authService.login(usernameOrEmail, password);
      onLogin(user);
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };
  const { effective } = useTheme();
  const theme = getThemeStyles(effective);

  return (
    <div className="min-h-screen relative">
      <TopBar mutedHeader={true} />

    <div className={`min-h-screen flex items-center justify-center py-12 ${theme.loginBgClass}`}>
      <div className="max-w-4xl w-full mx-auto px-4">
        <div className={theme.loginCardClass}>
          <div className={theme.loginLeftClass}>
            <img src="/LNTlogo_horizontal_color.png" alt="LNT logo" className="w-44 mb-4" />
            <h1 className="text-3xl font-bold text-white">Welcome back</h1>
            <p className="mt-3 text-white/90 max-w-sm">Access your guides and modules — fast, searchable, and organized. Sign in to continue to the App Guide.</p>
          </div>

          <div className={theme.loginRightClass}>
            <form onSubmit={handleSubmit} className="w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Sign in to your account</h2>

              <label className="block text-sm mb-1">Username or Email</label>
              <div className="relative mb-3">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14c-4.418 0-8 1.79-8 4v2h16v-2c0-2.21-3.582-4-8-4z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Username or Email"
                  className={`${theme.loginInputClass} pl-12`}
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                />
              </div>

              <label className="block text-sm mb-1">Password</label>
              <div className="relative mb-3">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <input
                  type="password"
                  placeholder="Password"
                  className={`${theme.loginInputClass} pl-12`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between mb-4">
                <label className="inline-flex items-center text-sm">
                  <input type="checkbox" className="mr-2" /> Remember me
                </label>
                <a href="#" className="text-sm text-blue-600 hover:underline">Forgot?</a>
              </div>

              {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className={`${theme.loginBtnClass} disabled:opacity-60`}
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
