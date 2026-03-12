import React, { useState, useMemo, useRef } from "react";
import Navbar from "./Navbar";
import TopBar from "./header/TopBar";
import ModulesModal from "./header/ModulesModal";
import { getModules } from "../api/modules";
import { getCategoriesByModule } from "../api/categories";

import { useTheme } from "../contexts/ThemeContext";
import { getThemeStyles } from "../config/themeStyles";

const Header = ({ user, onLogout, onSelectModule, onSelectCategory, onOpenContent, onToggleSidebar, onOpenMobileSidebar, sidebarCollapsed = false }) => {
  const [selectedModule, setSelectedModule] = useState(null);
  const [modulesList, setModulesList] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingModules, setLoadingModules] = useState(false);
  const [modulesError, setModulesError] = useState(null);

  const handleSelectModule = (m) => {
    setSelectedModule(m);
    if (onSelectModule) onSelectModule(m);
  };

  // theme
  const { mode, setMode, effective } = useTheme();
  const isDark = effective === "dark";
  const theme = useMemo(() => getThemeStyles(effective), [effective]);

  // load modules + categories (reusable)
  const loadModules = async () => {
    setLoadingModules(true);
    setModulesError(null);
    try {
      const res = await getModules();
      const modules = res && res.data && res.data.data ? res.data.data : [];
      const modulesWithCats = await Promise.all(
        modules.map(async (m) => {
          try {
            const r = await getCategoriesByModule(m.id);
            const cats = r && r.data && r.data.data ? r.data.data : [];
            return { ...m, categories: cats };
          } catch (err) {
            return { ...m, categories: [] };
          }
        })
      );
      setModulesList(modulesWithCats);
    } catch (err) {
      setModulesError("Failed to load modules");
      setModulesList([]);
    } finally {
      setLoadingModules(false);
    }
  };

  const openModulesModal = async () => {
    setModalOpen(true);
    await loadModules();
  };

  const closeModulesModal = () => {
    setModalOpen(false);
  };

  // NOTE: auto-open-on-login removed — modal opens only from header button or welcome card

  // Listen for global event to open modules modal (used by other components)
  React.useEffect(() => {
    const handler = () => {
      setModalOpen(true);
      if (modulesList.length === 0) loadModules();
    };
    window.addEventListener('openModulesModal', handler);
    return () => window.removeEventListener('openModulesModal', handler);
  }, [modulesList]);

  const handleSelectCategory = (category, module, contentId) => {
    // select module first (Header forwards full objects so App can decide)
    console.log('[Header] handleSelectCategory', { category, module, contentId });
    if (onSelectModule && module) onSelectModule(module);
    if (onSelectCategory && category) onSelectCategory(category, module, contentId);
    closeModulesModal();
  };
 

  // search query state to support highlight/clear
  const [searchQuery, setSearchQuery] = useState("");
  const latestQueryRef = useRef("");

  const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");

  const clearHighlights = () => {
    const marks = document.querySelectorAll('mark.search-highlight');
    marks.forEach((m) => {
      m.replaceWith(document.createTextNode(m.textContent));
    });
  };

  const highlightMatches = (el, q) => {
    if (!el || !q) return;
    try {
      // remove existing first
      clearHighlights();
      const regex = new RegExp(escapeRegExp(q), 'gi');
      // naive innerHTML replace (ok for simple highlighting)
      el.innerHTML = el.innerHTML.replace(regex, (match) => `<mark class="search-highlight">${match}</mark>`);
    } catch (err) {
      // fallback: do nothing
      console.error('Highlight error', err);
    }
  };

  const onSearchQueryChange = (q) => {
    setSearchQuery(q);
    latestQueryRef.current = q;
    // When user starts typing a search, auto-close the Modules modal
    if (q && q.trim().length > 0) {
      setModalOpen(false);
    }
    if (!q) {
      // clear highlights when query emptied
      clearHighlights();
    }
  };

  const handleSelectContent = (category, module, contentId) => {
    // forward selection as before
    if (onSelectModule && module) onSelectModule(module);
    if (onSelectCategory && category) onSelectCategory(category, module);
    // scroll to element and highlight
    setTimeout(() => {
      const el = document.getElementById(`content-${contentId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const body = el.querySelector('.content-body') || el;
        if (latestQueryRef.current) highlightMatches(body, latestQueryRef.current);
      }
    }, 200);
    if (onOpenContent) onOpenContent(contentId, category, module);
    closeModulesModal();
  };

  return (
    <header className={`${theme.headerBg} sticky top-0 z-40`}> 
      <TopBar
        user={user}
        onLogout={onLogout}
        openModulesModal={openModulesModal}
        modulesList={modulesList}
        ensureModulesLoaded={async () => { if (modulesList.length === 0) await loadModules(); }}
        onSelectModule={handleSelectModule}
        onSelectCategory={handleSelectCategory}
        onSelectContent={handleSelectContent}
        onQueryChange={onSearchQueryChange}
        onToggleSidebar={onToggleSidebar}
        onOpenMobileSidebar={onOpenMobileSidebar}
        sidebarCollapsed={sidebarCollapsed}
      />

      {/* <div className={`border-t ${isDark ? 'border-[#083047]' : 'border-gray-200'}`}>
        <Navbar onSelectModule={handleSelectModule} compact />
      </div> */}

      <ModulesModal
        open={modalOpen}
        onClose={closeModulesModal}
        modulesList={modulesList}
        loadingModules={loadingModules}
        modulesError={modulesError}
        onSelectCategory={handleSelectCategory}
      />
    </header>
  );
};

export default Header;
