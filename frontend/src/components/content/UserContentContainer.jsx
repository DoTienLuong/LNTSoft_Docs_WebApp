// components/content/user/UserContentContainer.jsx

import React, { useEffect, useState, useRef, useCallback } from "react";
import { categoryService } from "../../services/categoryService";
import { IMAGE_BASE_URL } from "../../config/config";
import { contentService } from "../../services/contentService";
import { imageService } from "../../services/imageService";
import ImageLightbox from "./contentConfig/ImageLightbox";
import { useTheme } from "../../contexts/ThemeContext";
import { getContentStyles } from "./contentConfig/contentStyles";

export default function UserContentContainer({ categoryId, moduleId, titleCategory, scrollToContentId, onScrolledToContent }) {
  const [grouped, setGrouped] = useState([]); // [{ category: {id,title}, items: [flat contents...], tree: [nested nodes...] }]
  const [openItems, setOpenItems] = useState({});     // giữ trạng thái mở (luôn mở tất cả)
  const [tocOpen, setTocOpen] = useState({});         // TOC node expanded/collapsed
  const [images, setImages] = useState({});           // map: contentId -> images[]

  const containerRef = useRef(null);
  const tocRef = useRef(null);
  const categoryRefs = useRef({});
  const contentRefs = useRef({});
  const [activeKey, setActiveKey] = useState(null); // e.g. 'cat-12' or 'ct-34'

  const [preview, setPreview] = useState({ open: false, contentId: null, index: 0 });
  const [copiedId, setCopiedId] = useState(null); // track which content was just copied

  // load grouped contents: category + descendants
  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!categoryId) {
        setGrouped([]);
        setOpenItems({});
        setImages({});
        return;
      }

      // If moduleId available, fetch categories for module and compute descendants
      try {
        if (moduleId) {
          const cats = await categoryService.list(moduleId);
          const mapById = {};
          cats.forEach((c) => { mapById[c.id] = c; });

          const childrenMap = {};
          cats.forEach((c) => {
            const pid = c.parent_id ?? c.parentId ?? null;
            if (!childrenMap[pid]) childrenMap[pid] = [];
            childrenMap[pid].push(c.id);
          });

          // collect category ids in DFS pre-order starting from selected category
          const order = [];
          const stack = [Number(categoryId)];
          while (stack.length) {
            const cur = stack.pop();
            if (cur == null) continue;
            order.push(cur);
            const childs = childrenMap[cur] || [];
            // push children in reverse so the original order is preserved during traversal
            for (let i = childs.length - 1; i >= 0; i--) stack.push(childs[i]);
          }

          // fetch tree for each category id and flatten for display while keeping tree for TOC
          const flatten = (nodes) => {
            const out = [];
            const walk = (nList) => {
              if (!nList || !nList.length) return;
              nList.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
              for (const n of nList) {
                const { children, ...rest } = n;
                out.push(rest);
                if (children && children.length) walk(children);
              }
            };
            walk(nodes);
            return out;
          };

          const fetches = order.map((id) => contentService.tree(id, false).then((res) => {
            // contentService.tree returns array of nodes
            const data = Array.isArray(res) ? res : (res || []);
            return { tree: data, items: flatten(data).filter(x => x.is_published !== false) };
          }).catch(() => ({ tree: [], items: [] })));

          const results = await Promise.all(fetches);
          if (ignore) return;
          const groupedRes = order.map((id, idx) => ({ category: mapById[id] || { id, title: 'Category ' + id }, tree: results[idx].tree, items: results[idx].items }));

          setGrouped(groupedRes);
          // mở tất cả nội dung mặc định
          const initialOpen = {};
          groupedRes.forEach((g) => g.items.forEach((it) => { initialOpen[it.id] = true; }));
          setOpenItems(initialOpen);
          setImages({});

          // fetch images for items
          groupedRes.forEach((g) => g.items.forEach((it) => fetchImages(it.id)));
          return;
        }

        // fallback: single category only - use tree endpoint
        const res = await contentService.tree(categoryId, false);
        const tree = Array.isArray(res) ? res : (res || []);
        const flattenSingle = (nodes) => {
          const out = [];
          const walk = (nList) => {
            if (!nList || !nList.length) return;
            nList.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
            for (const n of nList) {
              const { children, ...rest } = n;
              out.push(rest);
              if (children && children.length) walk(children);
            }
          };
          walk(nodes);
          return out;
        };

        const data = flattenSingle(tree).filter(x => x.is_published !== false);
        if (ignore) return;
        setGrouped([{ category: { id: Number(categoryId), title: titleCategory || '' }, tree, items: data }]);
        const initialOpen = {};
        data.forEach((it) => { initialOpen[it.id] = true; });
        setOpenItems(initialOpen);
        setImages({});
        data.forEach((item) => fetchImages(item.id));
      } catch (err) {
        // on error fallback
        setGrouped([]);
        setOpenItems({});
        setImages({});
      }
    }
    load();
    return () => { ignore = true; };
  }, [categoryId, moduleId]);

  async function fetchImages(contentId) {
    const res = await imageService.listByContent(contentId);
    setImages(prev => ({ ...prev, [contentId]: res || [] }));
  }

  // Không cần expand/collapse theo yêu cầu: luôn mở tất cả nội dung

  async function copyLink(contentId) {
    try {
      const basePrefix = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
      const path = `${basePrefix}/m/${String(moduleId)}/c/${Number(categoryId)}/i/${Number(contentId)}`;
      const url = `${window.location.origin}${path}`;
      
      // Try modern clipboard API first (HTTPS/localhost only)
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for HTTP: use legacy execCommand method
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      
      setCopiedId(contentId);
      // revert back after 2 seconds
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  }

  // Scroll handling to update active content/category in TOC
  const updateActive = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const bounds = container.getBoundingClientRect();
    let closest = null;
    let closestDistance = Infinity;

    const check = (key, el) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const distance = Math.abs(r.top - bounds.top - 20);
      if (r.top <= bounds.bottom && r.bottom >= bounds.top) {
        if (distance < closestDistance) {
          closestDistance = distance;
          closest = key;
        }
      }
    };

    // check categories first
    Object.entries(categoryRefs.current).forEach(([id, el]) => check('cat-' + id, el));
    // then contents
    Object.entries(contentRefs.current).forEach(([id, el]) => check('ct-' + id, el));

    if (closest) setActiveKey(closest);
  }, []);

  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    updateActive();
    c.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);
    return () => {
      c.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, [updateActive, grouped]);

  // When activeKey changes, ensure the TOC (right column) scrolls so active item is visible
  useEffect(() => {
    if (!tocRef.current || !activeKey) return;
    try {
      const el = tocRef.current.querySelector(`[data-toc-key="${activeKey}"]`);
      const container = tocRef.current;
      if (!el || !container) return;
      // compute target scrollTop relative to toc container
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const target = container.scrollTop + (elRect.top - containerRect.top);
      smoothScrollTo(container, target - 8, 250);
    } catch (err) {
      // ignore
    }
  }, [activeKey]);

  const scrollToContent = (id) => {
    // Ensure item is open so it has height and position
    setOpenItems((s) => ({ ...s, [id]: true }));
    // small delay to allow DOM/layout update when opening the item
    setTimeout(() => {
      const el = contentRefs.current[id];
      const container = containerRef.current;
      if (!el || !container) return;
      // compute target scrollTop relative to container
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const target = container.scrollTop + (elRect.top - containerRect.top);
      smoothScrollTo(container, target - 8, 350);
    }, 50);
  };

  // Smooth scroll helper for an arbitrary scrollable element
  function smoothScrollTo(container, to, duration = 300) {
    const start = container.scrollTop;
    const change = to - start;
    const startTime = performance.now();

    function easeInOutQuad(t) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    function animate(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      container.scrollTop = start + change * easeInOutQuad(progress);
      if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }

  // If parent requests scrolling to a specific content id, open/scroll to it
  useEffect(() => {
    if (!scrollToContentId) return;
    // wait until grouped data loaded
    const allItems = grouped.flatMap((g) => g.items);
    if (!allItems || allItems.length === 0) return;
    const idNum = Number(scrollToContentId);
    setOpenItems((s) => ({ ...s, [idNum]: true }));

    const maxAttempts = 60;
    const intervalMs = 50;
    let attempts = 0;
    const poll = setInterval(() => {
      attempts += 1;
      const el = contentRefs.current[idNum];
      if (el) {
        try {
          const container = containerRef.current;
          if (container) {
            const containerRect = container.getBoundingClientRect();
            const elRect = el.getBoundingClientRect();
            const target = container.scrollTop + (elRect.top - containerRect.top);
            smoothScrollTo(container, target - 8, 350);
          }
        } catch (err) {}
        if (typeof onScrolledToContent === "function") onScrolledToContent();
        clearInterval(poll);
      } else if (attempts >= maxAttempts) {
        clearInterval(poll);
      }
    }, intervalMs);
    return () => clearInterval(poll);
  }, [scrollToContentId, grouped, onScrolledToContent]);

  // Derive current preview info  
  
  const currentImages = preview.contentId ? (images[preview.contentId] || []) : [];
  const current = currentImages[preview.index];
  const src = current ? `${IMAGE_BASE_URL}${current.image_url}` : "";
  const caption = current?.caption || "";
  const hasMany = currentImages.length > 1;

  const closePreview = () => setPreview({ open: false, contentId: null, index: 0 });
  const onPrev = () =>
    setPreview((p) => ({ ...p, index: Math.max(0, p.index - 1) }));
  const onNext = () =>
    setPreview((p) => ({ ...p, index: Math.min(currentImages.length - 1, p.index + 1) }));

  const { effective } = useTheme();
  const theme = getContentStyles(effective);

  if (!categoryId) {
    return <p className={`p-4 ${theme.mutedText}`}>Please select a category</p>;
  }

  return (
    <div ref={containerRef} className={theme.userContainer} style={{ scrollBehavior: 'smooth' }}>
      <div className="flex gap-8">
        {/* Centered main content */}
        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-4xl bg-transparent p-6">
            {grouped.map((g, gi) => (
              <section key={g.category.id} className={`${gi < grouped.length - 1 ? 'border-b' : ''} pb-6`}>
                <h3 ref={(el) => (categoryRefs.current[g.category.id] = el)} className="text-2xl font-semibold mb-4">{g.category.title}</h3>
                {g.items.map((c, idx) => (
                  <article
                    key={c.id}
                    ref={(el) => (contentRefs.current[c.id] = el)}
                    className={`py-6 ${idx < g.items.length - 1 ? 'border-b' : ''} ${theme.articleBorder}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="flex-1 text-xl font-semibold">{c.title}</h4>
                      <button 
                        onClick={() => copyLink(c.id)} 
                        title={copiedId === c.id ? "Copied!" : "Copy link"}
                        className="text-gray-500 hover:text-blue-600 transition p-1"
                      >
                        {copiedId === c.id ? (
                          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                    </div>

                    <div className={theme.proseText}>
                      <div className="content-body" dangerouslySetInnerHTML={{ __html: c.html_content || "" }} />
                    </div>

                    {(images[c.id] || []).length > 0 && (
                      <div className="mt-4">
                        <div className="space-y-4">
                          {(images[c.id] || []).map((img, i) => (
                            <div key={img.id} className="w-full overflow-hidden rounded-md">
                              <div className={`w-full h-64 md:h-72 lg:h-80 relative ${theme.imageFigureBg} rounded-md overflow-hidden`}>
                                <img
                                  src={`${IMAGE_BASE_URL}${img.image_url}`}
                                  alt={img.caption || ""}
                                  className="absolute inset-0 w-full h-full object-cover cursor-zoom-in"
                                  loading="lazy"
                                  onClick={() => setPreview({ open: true, contentId: c.id, index: i })}
                                />
                                {img.caption && (
                                  <div className="absolute bottom-0 left-0 right-0 bg-black/45 text-white text-[11px] leading-4 px-2 py-1 truncate">
                                    {img.caption}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </article>
                ))}
              </section>
            ))}

            {grouped.length === 0 && (
              <div className={`text-sm ${theme.mutedText}`}>Chưa có nội dung.</div>
            )}
          </div>
        </div>

        {/* Right TOC */}
        <aside className="w-64 shrink-0">
          <div className="sticky top-1 bg-transparent p-3">
                {/* <h4 className="text-sm font-semibold mb-2">{titleCategory}</h4> */}
            <ul ref={tocRef} className="space-y-2 max-h-[70vh] overflow-auto pr-2" style={{ scrollBehavior: 'smooth' }}>
              {grouped.map((g) => (
                <li key={`cat-${g.category.id}`}>
                  <div className="text-sm font-semibold mb-1">{g.category.title}</div>
                  <ul className="space-y-1 mb-2">
                    {/** Render tree nodes recursively with toggles, icons and connectors */}
                    {function renderNodes(nodes, depth = 0) {
                      if (!nodes || !nodes.length) return null;
                      return nodes.map((n) => {
                        const hasChildren = n.children && n.children.length > 0;
                        const isOpen = tocOpen[n.id] ?? true; // default expanded
                        return (
                          <li key={n.id} className={`relative`}>
                            <div className="flex items-center">
                              {/* indent / connector */}
                              <div style={{ width: `${depth * 4}px`, flex: '0 0 auto' }} />

                              {/* toggle icon (chevron) for nodes with children */}
                              {hasChildren ? (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setTocOpen(prev => ({ ...prev, [n.id]: !isOpen })); }}
                                  className={`w-3 h-3 flex items-center justify-center mr-0 text-sm text-gray-500 hover:text-gray-700`}
                                  aria-label={isOpen ? 'Collapse' : 'Expand'}
                                >
                                  <svg className={`w-2 h-2 transform ${isOpen ? 'rotate-90' : 'rotate-0'}`} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M6.293 4.293a1 1 0 011.414 0L13 9.586a1 1 0 010 1.414l-5.293 5.293a1 1 0 11-1.414-1.414L10.586 11 6.293 6.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              ) : (
                                <div style={{ width: 10 }} className="mr-0" />
                              )}

                              {/* folder / leaf icon */}
                              <div className="mr-0 flex items-center" style={{ width: 10 }}>
                              </div>

                              <button
                                data-toc-key={`ct-${n.id}`}
                                onClick={() => scrollToContent(n.id)}
                                className={`flex-1 text-left text-sm px-0 py-1 rounded-md transition ${
                                  activeKey === `ct-${n.id}` ? theme.tocActive : theme.tocInactive
                                }`}
                              >
                                {n.title}
                              </button>
                            </div>

                            {/* child list with connector line */}
                            {hasChildren && isOpen && (
                              <ul className="mt-1" style={{ borderLeft: '1px solid rgba(0,0,0,0.06)', marginLeft: 2, paddingLeft: 2 }}>
                                {renderNodes(n.children, depth + 1)}
                              </ul>
                            )}
                          </li>
                        );
                      });
                    }(g.tree || [], 0)}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
      {preview.open && (
        <ImageLightbox
          src={src}
          caption={caption}
          onClose={closePreview}
          showArrows={hasMany}
          onPrev={onPrev}
          onNext={onNext}
        />
      )}

    </div>
  );
}
