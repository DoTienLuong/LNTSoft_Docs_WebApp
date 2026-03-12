import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import CategoryContainer from "../components/category/CategoryContainer";
import ContentContainer from "../components/content/ContentContainer";
import { useTheme } from "../contexts/ThemeContext";
import { getThemeStyles } from "../config/themeStyles";
import { moduleService } from "../services/moduleService";

export default function HomePage({ user, onLogout }) {
  const [activeModule, setActiveModule] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [titleCategory, setTitleCategory] = useState("");
  const [scrollToContentId, setScrollToContentId] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { effective } = useTheme();
  const theme = getThemeStyles(effective);
  const userRole = user?.role || 'customer';
  const params = useParams();
  const navigate = useNavigate();

  // Sync state from URL params for deep linking
  useEffect(() => {
    const mid = params.moduleId ? String(params.moduleId) : null;
    const cid = params.categoryId ? Number(params.categoryId) : null;
    const contentId = params.contentId ? Number(params.contentId) : null;

    async function ensureModule() {
      if (!mid) { setActiveModule(null); return; }
      try {
        const res = await moduleService.detail(mid); // { success, data }
        const m = res && res.data ? res.data : null;
        setActiveModule(m || { id: mid });
      } catch {
        setActiveModule({ id: mid });
      }
    }

    ensureModule();
    if (cid) setActiveCategory(cid);
    if (contentId) setScrollToContentId(contentId);
  }, [params.moduleId, params.categoryId, params.contentId]);

  const navigateToSelection = (modId, catId, contentId) => {
    if (!modId || !catId) return;
    const base = `/m/${String(modId)}/c/${Number(catId)}`;
    navigate(contentId ? `${base}/i/${Number(contentId)}` : base, { replace: false });
  };

  const handleHeaderSelectCategory = (catOrId, mod, contentId) => {
    if (mod) setActiveModule(mod);
    const id = typeof catOrId === "object" ? Number(catOrId.id) : Number(catOrId);
    setActiveCategory(id);
    if (typeof catOrId === "object") {
      setTitleCategory(catOrId.title || catOrId.name || "");
    }
    if (contentId) {
      console.log('[HomePage] header select contentId', contentId, 'categoryId', id, 'module', mod?.id);
      setScrollToContentId(Number(contentId));
    }
    const modId = (mod?.id) || (activeModule?.id);
    if (modId && id) navigateToSelection(modId, id, contentId);
  };

  const handleHeaderSelectModule = (m) => setActiveModule(m);
  const handleToggleSidebar = () => setSidebarCollapsed((s) => !s);

  // NOTE: `handleOpenContent` removed — use `handleHeaderSelectCategory` which
  // sets `scrollToContentId` so ContentContainer can open and scroll.

  return (
    <div className={`h-screen flex flex-col ${theme.pageBgClass}`}>
      <Header
        user={user}
        onLogout={onLogout}
        onSelectModule={handleHeaderSelectModule}
        onSelectCategory={handleHeaderSelectCategory}
        onToggleSidebar={handleToggleSidebar}
        sidebarCollapsed={sidebarCollapsed}
      />
      <div className="flex flex-1 overflow-hidden">
        {activeModule ? (
          <>
            <CategoryContainer
              moduleId={activeModule?.id}
              onSelectCategory={(id) => {
                setActiveCategory(id);
                if (activeModule?.id) navigateToSelection(activeModule.id, id);
              }}
              selectedCategoryId={activeCategory}
              nameModuleSelected={activeModule?.name}
              iconModuleSelected={activeModule?.icon}
              userRole={userRole}
              titleCategorySelected={setTitleCategory}
              collapsed={sidebarCollapsed}
            />

            <ContentContainer
              categoryId={activeCategory}
              moduleId={activeModule?.id}
              titleCategory={titleCategory}
              userRole={userRole}
              scrollToContentId={scrollToContentId}
              onScrolledToContent={() => setScrollToContentId(null)}
            />
          </>
        ) : (


          <div className="flex-1 flex items-center justify-center p-8">
            {/** use theme-driven welcome card styles */}
            <WelcomeCard />
          </div>
        )}
      </div>
    </div>
  );
}

function WelcomeCard() {
  const { effective } = useTheme();
  const theme = getThemeStyles(effective);
  const BASE = (import.meta.env.BASE_URL || "/").replace(/\/$/, "") + "/";
  return (
    <div className={theme.welcomeCardClass}>
      <div className={theme.welcomeAccentClass} style={{ width: 56, height: 56 }}>
         <img src={`${BASE}lntlogo.png`} alt="LNT" className="w-10 h-10 object-contain" />
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-[360px] w-full">
            <img src={`${BASE}LNTlogo_horizontal_color.png`} alt="LNT logo" className="w-full h-auto object-contain" />
            <p className={`${theme.welcomeTextClass} mt-2`}>A quick reference for company guides and modules</p>
          </div>
        </div>

        <div className="flex-1">
          <h2 className={`${theme.welcomeTitleClass} mb-2`}>Welcome to LNT Documentation</h2>
          <p className={`${theme.welcomeTextClass} mb-4`}>Select a module to view categories and guides. Use search for quick access to contents.</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('openModulesModal'))}
              className={theme.welcomeBtnClass}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="8" height="8" rx="1" fill="currentColor"/><rect x="13" y="3" width="8" height="8" rx="1" fill="currentColor" opacity="0.85"/><rect x="3" y="13" width="8" height="8" rx="1" fill="currentColor" opacity="0.7"/><rect x="13" y="13" width="8" height="8" rx="1" fill="currentColor" opacity="0.55"/></svg>
              Open modules
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
