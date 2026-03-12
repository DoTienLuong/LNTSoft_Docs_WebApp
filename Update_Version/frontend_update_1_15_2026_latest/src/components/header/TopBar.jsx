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
      {/* Subheader with compact contact links */}
      <div className={`${theme.headerSubBgClass} w-full`}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between ${theme.headerSubTextClass} py-1`}>
            <div className="flex items-center gap-4">
              <a href="tel:+84979470224" className={theme.headerSubLinkClass} title="Call us">
                <svg xmlns="http://www.w3.org/2000/svg" className={`w-3 h-3 ${theme.headerSubIconClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h2.2a1 1 0 01.95.684l.6 1.8a1 1 0 01-.217.98L7.7 8.7a11 11 0 005.6 5.6l1.23-.83a1 1 0 01.98-.217l1.8.6A1 1 0 0121 16.8V19a2 2 0 01-2 2H7a4 4 0 01-4-4V5z" />
                </svg>
                (+84) 97 947 0224
              </a>
              <a href="mailto:info@lnt-soft.com" className={theme.headerSubLinkClass} title="Email">
                <svg xmlns="http://www.w3.org/2000/svg" className={`w-3 h-3 ${theme.headerSubIconClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m0 8V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2z" />
                </svg>
                info@lnt-soft.com
              </a>
            </div>
            <div className="hidden sm:flex items-center">
              <a href="https://www.google.com/maps/search/?api=1&query=SCS+Building" target="_blank" rel="noreferrer" className={theme.headerSubLinkClass} title="Address">
                <svg xmlns="http://www.w3.org/2000/svg" className={`w-3 h-3 ${theme.headerSubIconClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21s8-4.5 8-11a8 8 0 10-16 0c0 6.5 8 11 8 11z" />
                </svg>
                SCS Buliding
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className={`${mainHeaderClass} px-0`}>
        {/* Header main row split into brand rail (aligns with sidebar) and action area */}
        <div className="w-full flex items-stretch">
          {/* Brand rail - width follows sidebar; clicking goes to Home */}
          <div className={`${sidebarCollapsed ? 'w-20' : 'w-64'} flex items-center gap-3 px-4`}>
            <Link to="/" className="flex items-center gap-3">
              <img src={`${BASE}lntlogo.png`} alt="Logo" className="w-8 h-8 flex-shrink-0" />
              {!sidebarCollapsed && (
                <div className="hidden lg:block">
                  <div className="text-sm font-semibold">Documentation</div>
                  <div className={`text-xs ${theme.subtitleClass}`}>By LNTSOFT</div>
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
