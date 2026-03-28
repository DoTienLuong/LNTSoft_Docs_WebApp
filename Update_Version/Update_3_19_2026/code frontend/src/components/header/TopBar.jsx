import React from "react";
import { Link } from "react-router-dom";
import { FiMenu, FiSidebar } from "react-icons/fi";
import CategorySearchHeader from "../category/categoryConfig/CategorySearchHeader";
import { useTheme } from "../../contexts/ThemeContext";
import { getThemeStyles } from "../../config/themeStyles";
import UserMenu from "./UserMenu";

export default function TopBar({ user, onLogout, openModulesModal, modulesList, ensureModulesLoaded, onSelectModule, onSelectCategory, onSelectContent, onQueryChange, onToggleSidebar, onOpenMobileSidebar, sidebarCollapsed = false, mutedHeader = false }) {
  const { mode, setMode, effective } = useTheme();
  const isDark = effective === "dark";
  const theme = getThemeStyles(effective);
  const mainHeaderClass = mutedHeader ? "opacity-70 blur-sm pointer-events-none select-none" : "";
  const rootClass = mutedHeader ? "fixed top-0 left-0 right-0 z-50 w-full" : "w-full";

  const BASE = (import.meta.env.BASE_URL || "/").replace(/\/$/, "") + "/";
  return (
    <div className={rootClass}>
      <div className={`${mainHeaderClass} px-0`}>
        {/* Header main row split into brand rail (aligns with sidebar) and action area */}
        <div className="w-full flex items-stretch">
          {/* Brand rail - width follows sidebar; clicking goes to Home */}
          <div className={`${sidebarCollapsed ? 'w-20' : 'w-64'} flex items-center gap-3 px-4`}>
            <Link to="/" className="flex items-center gap-3">
              <img src={`${BASE}lntlogo.png`} alt="Logo" className="w-8 h-8 flex-shrink-0" />
              {!sidebarCollapsed && (
                <div className="hidden lg:block">
                  <div className="text-xl font-extrabold tracking-tight text-[#0a4f9e]">LNTBOOST ERP</div>
                </div>
              )}
            </Link>
          </div>

          {/* Action area */}
          <div className="flex-1 flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center gap-3 min-w-0">
              {/* Sidebar toggles: mobile and desktop on the action side */}
              <button
                className={`md:hidden inline-flex items-center justify-center w-9 h-9 rounded-md ${theme.topBtnBg}`}
                onClick={() => onOpenMobileSidebar && onOpenMobileSidebar()}
                title="Mở menu"
              >
                <FiMenu />
              </button>
              <button
                className={`hidden md:inline-flex items-center justify-center w-9 h-9 rounded-md ${theme.topBtnBg}`}
                onClick={() => onToggleSidebar && onToggleSidebar()}
                title="Thu gọn/Mở rộng sidebar"
              >
                <FiSidebar />
              </button>

              <button
                onClick={openModulesModal}
                title="Open modules"
                className={`inline-flex items-center justify-center rounded px-3 py-1 text-sm font-medium ${theme.topBtnBg}`}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <rect x="3" y="3" width="8" height="8" rx="1" fill="currentColor" />
                  <rect x="13" y="3" width="8" height="8" rx="1" fill="currentColor" opacity="0.85" />
                  <rect x="3" y="13" width="8" height="8" rx="1" fill="currentColor" opacity="0.7" />
                  <rect x="13" y="13" width="8" height="8" rx="1" fill="currentColor" opacity="0.55" />
                </svg>
                Modules
              </button>
            </div>

            <div className="flex-1 max-w-xl px-2 hidden sm:flex">
              <div className={`flex items-center w-full ${theme.headerSearchContainerClass}`}>
                <CategorySearchHeader
                  placeholder="Search guides, modules..."
                  modulesList={modulesList}
                  ensureModulesLoaded={ensureModulesLoaded}
                  onSelectCategory={(cat, mod, contentId) => {
                    console.log('[TopBar] onSelectCategory', { cat, mod, contentId });
                    if (onSelectModule && mod) onSelectModule(mod);
                    if (onSelectCategory && cat) onSelectCategory(cat, mod, contentId);
                  }}
                  onSelectContent={(cat, mod, contentId) => {
                    if (onSelectModule && mod) onSelectModule(mod);
                    if (onSelectContent) onSelectContent(cat, mod, contentId);
                    if (onSelectCategory && cat) onSelectCategory(cat, mod, contentId);
                  }}
                  onQueryChange={(q) => { if (onQueryChange) onQueryChange(q); }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                aria-label="theme-select"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className={`hidden sm:inline-flex text-sm px-2 py-1 rounded ${theme.selectClass} `}
                title="Theme: Auto / Dark / Light"
              >
                <option value="auto">Auto</option>
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>

              {user?.role === 'admin' && (
                <Link to="/admin" className={`hidden sm:inline-flex text-sm px-3 py-1 rounded ${theme.topBtnBg}`} title="Dashboard Admin">
                  Dashboard Admin
                </Link>
              )}

              <UserMenu user={user} onLogout={onLogout} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
