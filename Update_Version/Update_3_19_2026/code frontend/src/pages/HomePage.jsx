import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import CategoryContainer from "../components/category/CategoryContainer";
import ContentContainer from "../components/content/ContentContainer";
import AppFooter from "../components/footer/AppFooter";
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
  const BASE = (import.meta.env.BASE_URL || "/").replace(/\/$/, "") + "/";
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
        onOpenMobileSidebar={() => setSidebarCollapsed((s) => !s)}
        sidebarCollapsed={sidebarCollapsed}
      />
      <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
        {activeModule ? (
          <>
            <CategoryContainer
              moduleId={activeModule?.id}
              onSelectCategory={(id) => {
                setActiveCategory(id);
                if (activeModule?.id) navigateToSelection(activeModule.id, id);
                // Auto-hide sidebar on mobile after selecting a category
                if (window.innerWidth < 768) {
                  setSidebarCollapsed(true);
                }
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
          <div className="relative flex-1 overflow-hidden">
            <img
              src={`${BASE}lnt-background.jpg`}
              alt="LNT background"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-[#0f2645]/42" />
            <div className="absolute inset-0 bg-[radial-gradient(120%_95%_at_82%_8%,rgba(95,167,255,0.32)_0%,rgba(17,42,77,0)_56%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,27,50,0.16)_0%,rgba(8,24,44,0.48)_100%)]" />

            <div className="relative z-10 flex h-full items-center justify-center p-8">
              {/** use theme-driven welcome card styles */}
              <WelcomeCard />
            </div>
          </div>
        )}
      </div>
      <AppFooter />
    </div>
  );
}

function WelcomeCard() {
  const { effective } = useTheme();
  const BASE = (import.meta.env.BASE_URL || "/").replace(/\/$/, "") + "/";
  const isDark = effective === "dark";
  return (
    <div className={`relative w-full max-w-5xl rounded-lg border ${isDark ? "border-[#4f87d0]/70 bg-[#0f2036]/68" : "border-[#3f79c8]/65 bg-white/72"} backdrop-blur-md shadow-[0_18px_40px_rgba(10,30,60,0.25)] p-4 md:p-5`}>
      <div className="flex flex-col gap-3 md:pr-52">
        <div className="flex items-start gap-3 md:gap-4">
          <img src={`${BASE}lntlogo.png`} alt="LNT" className="w-12 h-12 md:w-14 md:h-14 object-contain shrink-0 mt-0.5" />
          <div className="min-w-0">
            <h2 className="leading-none font-extrabold tracking-tight !text-[40px] md:text-[90px] whitespace-nowrap">
              <span className={isDark ? "text-[#d6d7d9]" : "text-[#8e8e91]"}>LNTBOOST </span>
              <span className="text-[#1570c6]">BUSINESS</span>
              <span className="text-[#1570c6]"> SUITE</span>
            </h2>
            <p className={`mt-0.5 text-[13px] md:text-[18px] font-semibold ${isDark ? "text-[#d7e6fb]" : "text-[#1e3f73]"}`}>
              Intelligent Cloud Applications &amp; Platform Services
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 md:gap-4">
          <p className={`text-[15px] md:text-[18px] ${isDark ? "text-[#e6eef8]" : "text-[#1a1a1a]"}`}>
            <span className="mr-1">📚</span>
            <span className="font-semibold">Select a module</span> to view guides or
            <span className="mx-1">🔍</span>
            <span className="font-semibold">Search</span> to find what you need instantly
          </p>

          <button
            onClick={() => window.dispatchEvent(new CustomEvent('openModulesModal'))}
            className="inline-flex self-start md:self-auto items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-4 py-2 rounded-md shadow-sm whitespace-nowrap md:absolute md:right-5 md:top-1/2 md:-translate-y-1/2"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="8" height="8" rx="1" fill="currentColor"/><rect x="13" y="3" width="8" height="8" rx="1" fill="currentColor" opacity="0.85"/><rect x="3" y="13" width="8" height="8" rx="1" fill="currentColor" opacity="0.7"/><rect x="13" y="13" width="8" height="8" rx="1" fill="currentColor" opacity="0.55"/></svg>
            Open modules
          </button>
        </div>
      </div>
    </div>
  );
}
