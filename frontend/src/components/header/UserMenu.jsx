import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { authService } from "../../services/authService";

export default function UserMenu({ user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [resolvedEmail, setResolvedEmail] = useState(user?.email || user?.mail || "");
  const { effective } = useTheme();
  const isDark = effective === "dark";
  const ref = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false);
    };
    const onEsc = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  useEffect(() => {
    setResolvedEmail(user?.email || user?.mail || "");
  }, [user?.email, user?.mail, user?.id, user?.username]);

  useEffect(() => {
    let cancelled = false;
    if (!user) return;
    if (resolvedEmail) return;

    (async () => {
      try {
        const profile = await authService.me();
        const email = profile?.email || profile?.mail || "";
        if (!cancelled && email) setResolvedEmail(email);
      } catch {
        // Keep fallback text when profile endpoint does not provide email.
      }
    })();

    return () => { cancelled = true; };
  }, [user, resolvedEmail]);

  const displayName = user?.username || user?.name || 'Guest';
  const userEmail = resolvedEmail || (user ? "No email" : "Not signed in");
  const initial = displayName?.charAt(0)?.toUpperCase() || 'G';
  const BASE = (import.meta.env.BASE_URL || "/").replace(/\/$/, "") + "/";
  const triggerClass = isDark
    ? "group inline-flex items-center gap-2 rounded-full px-2.5 py-1.5 bg-[#07203a] text-[#e6eef8] hover:bg-[#083047]"
    : "group inline-flex items-center gap-2 rounded-full px-2.5 py-1.5 bg-white text-slate-800 hover:bg-slate-50 border border-slate-200";
  const mainTextClass = isDark ? "text-[#e6eef8]" : "text-slate-900";
  const panelClass = isDark
    ? "absolute right-0 mt-2 w-[300px] max-w-[92vw] rounded-sm border border-[#1f3f56] bg-[#f3f6f9] shadow-xl z-50 overflow-hidden"
    : "absolute right-0 mt-2 w-[300px] max-w-[92vw] rounded-sm border border-slate-300 bg-[#f3f4f6] shadow-xl z-50 overflow-hidden";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((s) => !s)}
        className={triggerClass}
      >
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold bg-blue-600 text-white shadow-sm">
          {initial}
        </div>
        <span className={`hidden sm:inline text-sm font-medium ${mainTextClass}`}>{displayName}</span>
        <svg
          className={`hidden sm:block w-3 h-3 transition-transform ${menuOpen ? "rotate-180" : "rotate-0"}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.167l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {menuOpen && (
        <div className={panelClass} role="menu">
          <div className={`px-3 py-2.5 flex items-start justify-between border-b ${isDark ? "border-[#d8dee6]" : "border-slate-300"}`}>
            <div className="text-[12px] text-slate-700 font-medium truncate pr-2">LNTSOFT BUSINESS SOLUTION</div>
            {user ? (
              <button
                onClick={async () => { setMenuOpen(false); if (onLogout) await onLogout(); }}
                className="px-2.5 py-1 text-xs font-semibold bg-blue-300 text-slate-900 hover:bg-yellow-200 rounded-sm"
              >
                Sign out
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="px-2.5 py-1 text-xs font-semibold bg-blue-300 text-slate-900 hover:bg-yellow-200 rounded-sm"
              >
                Sign in
              </Link>
            )}
          </div>

          <div className="px-3 py-3 bg-[#f3f4f6]">
            <div className="flex gap-3">
              <div className="w-14 h-14 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0">
                <img src={`${BASE}lntlogo.png`} alt="LNT" className="w-10 h-10 object-contain" />
              </div>
              <div className="min-w-0">
                <div className="text-[20px] leading-tight font-bold tracking-tight text-slate-800 truncate">{displayName}</div>
                <div className="mt-0.5 text-[13px] text-slate-700 truncate">{userEmail}</div>
                <a href="#" className="block mt-1 text-[13px] text-blue-700 underline">View account</a>
                <a href="#" className="block mt-0.5 text-[13px] text-blue-700 underline">My Microsoft 365 profile</a>
                <a href="#" className="block mt-0.5 text-[13px] text-blue-700 underline">Third party notice</a>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-300 bg-[#ececec]">
            {user ? (
              <button
                onClick={async () => {
                  setMenuOpen(false);
                  if (onLogout) await onLogout();
                  window.location.href = "/login";
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-200"
              >
                <span className="w-9 h-9 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-500">
                  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="10" cy="8" r="3.6" />
                    <path d="M4 19c0-3.2 2.6-5.2 6-5.2s6 2 6 5.2" />
                    <path d="M18.5 10.5v5" />
                    <path d="M16 13h5" />
                  </svg>
                </span>
                <span className="text-[14px] text-slate-800">Sign in with a different account</span>
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-200"
              >
                <span className="w-9 h-9 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-500">
                  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="10" cy="8" r="3.6" />
                    <path d="M4 19c0-3.2 2.6-5.2 6-5.2s6 2 6 5.2" />
                    <path d="M18.5 10.5v5" />
                    <path d="M16 13h5" />
                  </svg>
                </span>
                <span className="text-[14px] text-slate-800">Login</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
