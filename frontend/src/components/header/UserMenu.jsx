import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";

export default function UserMenu({ user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { effective } = useTheme();
  const isDark = effective === "dark";
  const ref = useRef(null);
  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const displayName = user?.username || user?.name || 'Guest';
  const initial = displayName?.charAt(0)?.toUpperCase() || 'G';

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setMenuOpen((s) => !s)} className={`flex items-center gap-2 px-2 py-1 rounded`}>
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium bg-blue-600 text-white`}>
          {initial}
        </div>
        <span className="hidden sm:inline text-sm">{displayName}</span>
      </button>

      {menuOpen && (
        <div className={`absolute right-0 mt-2 w-44 rounded shadow-lg z-50 bg-white dark:bg-slate-800`}> 
          <div className="px-3 py-2 text-sm border-b border-gray-100 dark:border-slate-700">
            {displayName}
          </div>
          {user ? (
            <button
              onClick={async () => { setMenuOpen(false); if (onLogout) await onLogout(); }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
