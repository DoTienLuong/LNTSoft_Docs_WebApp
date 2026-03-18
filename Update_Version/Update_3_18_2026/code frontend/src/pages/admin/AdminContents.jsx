import React, { useEffect, useMemo, useRef, useState } from 'react';
import AdminDashboard from './AdminDashboard';
import Table from '../../components/admin/Table';
import Select from '../../components/admin/Select';
import Switch from '../../components/admin/Switch';
import ContentForm from '../../components/admin/forms/ContentForm';
import ImageManager from '../../components/content/ImageManager';
import Modal from '../../components/admin/Modal';
import {moduleService} from '../../services/moduleService';
import {categoryService} from '../../services/categoryService';
import {contentService} from '../../services/contentService';
import { FiPlus } from 'react-icons/fi';

export default function AdminContents({ user, onLogout }) {
  const [modules, setModules] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [selectedCategoryType, setSelectedCategoryType] = useState('Work Area');
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(() => new Set());
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const editorAreaRef = useRef(null);
  const [viewingContent, setViewingContent] = useState(null);
  const [viewingLoading, setViewingLoading] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [showEditImages, setShowEditImages] = useState(false);

  useEffect(() => {
    const loadModules = async () => {
      try {
        const res = await moduleService.list();
        setModules(res || []);
      } catch (e) {
        setModules([]);
      }
    };
    loadModules();
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      if (!selectedModuleId) {
        setCategories([]);
        setSelectedCategoryId('');
        return;
      }
      try {
        const res = await categoryService.list(selectedModuleId);
        setCategories(res || []);
      } catch (e) {
        setCategories([]);
      }
    };
    loadCategories();
  }, [selectedModuleId]);

  useEffect(() => {
    setSelectedCategoryType('Work Area');
    setSelectedCategoryId('');
    setContents([]);
  }, [selectedModuleId]);

  useEffect(() => {
    const loadContents = async () => {
      if (!selectedModuleId || !selectedCategoryId) {
        setContents([]);
        return;
      }
      setLoading(true);
      try {
        const res = await contentService.list(selectedCategoryId, true);
        setContents(res || []);
      } catch (e) {
        setContents([]);
      } finally {
        setLoading(false);
      }
    };
    loadContents();
  }, [selectedModuleId, selectedCategoryId]);

  useEffect(() => { setPage(1); }, [selectedModuleId, selectedCategoryId, query, contents]);
  useEffect(() => { setExpanded(new Set()); }, [selectedCategoryId, contents]);

  const moduleOptions = useMemo(
    () => modules.map((m) => ({ value: String(m.id), label: m.title || m.name })),
    [modules]
  );

  const categoryTypeOptions = useMemo(
    () => [
      { value: 'Work Area', label: 'Work Area' },
      { value: 'Setting', label: 'Setting' },
      { value: 'Report', label: 'Report' },
    ],
    []
  );

  const categoriesByType = useMemo(
    () => (categories || []).filter((c) => String(c.category_type || 'Work Area') === selectedCategoryType),
    [categories, selectedCategoryType]
  );

  const categoryOptions = useMemo(
    () => categoriesByType.map((c) => ({ value: String(c.id), label: c.title || c.name })),
    [categoriesByType]
  );

  useEffect(() => {
    if (!selectedCategoryId) return;
    const exists = categoriesByType.some((c) => String(c.id) === String(selectedCategoryId));
    if (!exists) {
      setSelectedCategoryId('');
      setContents([]);
    }
  }, [categoriesByType, selectedCategoryId]);

  // Map for fast parent lookup
  const contentMap = useMemo(() => {
    const map = new Map();
    (contents || []).forEach((c) => map.set(c.id, c));
    return map;
  }, [contents]);

  const getDepth = (item) => {
    let d = 0; let curr = item; const seen = new Set();
    while (curr && curr.parent_id && !seen.has(curr.parent_id) && d < 6) {
      seen.add(curr.parent_id);
      curr = contentMap.get(curr.parent_id);
      d++;
    }
    return d;
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contents;
    return contents.filter((c) => (c.title || c.name || '').toLowerCase().includes(q));
  }, [contents, query]);

  // children map for tree
  const childrenMap = useMemo(() => {
    const ROOT = '__root__';
    const m = new Map();
    m.set(ROOT, []);
    for (const c of contents) {
      const p = c.parent_id ? String(c.parent_id) : ROOT;
      if (!m.has(p)) m.set(p, []);
      m.get(p).push(c);
    }
    for (const [k, arr] of m.entries()) {
      m.set(
        k,
        (arr || []).slice().sort((a, b) => {
          const ao = a.order_index ?? a.order ?? a.sort_index ?? 0;
          const bo = b.order_index ?? b.order ?? b.sort_index ?? 0;
          if (ao !== bo) return ao - bo;
          return (a.title || a.name || '').localeCompare(b.title || b.name || '');
        })
      );
    }
    return m;
  }, [contents]);

  const treeRows = useMemo(() => {
    const out = [];
    const walk = (nodes, depth) => {
      for (const n of nodes) {
        const kids = childrenMap.get(String(n.id)) || [];
        const isOpen = expanded.has(n.id);
        out.push({ node: n, depth, hasChildren: kids.length > 0, isOpen });
        if (kids.length > 0 && isOpen) walk(kids, depth + 1);
      }
    };
    const roots = childrenMap.get('__root__') || [];
    walk(roots, 0);
    return out;
  }, [childrenMap, expanded]);

  const isSearching = query.trim().length > 0;

  const toggleExpand = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const columns = [
    { key: 'order_index', label: 'Order', align: 'center', width: 80, render: (v) => v ?? '—' },
    ...(!isSearching
      ? [{
            key: '_exp',
            label: '',
            width: 24,
            render: (_, row) => {
              const has = row.__hasChildren;
              const open = row.__isOpen;
              if (!has) return <span className="inline-block w-4" />;
              return (
                <button type="button" onClick={() => toggleExpand(row.id)} className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-100" aria-label={open ? 'Collapse' : 'Expand'}>
                  <span className="text-slate-600 text-sm">{open ? '▾' : '▸'}</span>
                </button>
              );
            }
        }]
      : []),
      
    {
      key: 'title',
      label: 'Title',
      width: 320,
      render: (_, row) => {
        const d = row.__depth ?? getDepth(row.__raw);
        return (
          <div className="flex items-center">
            <span style={{ paddingLeft: `${d * 16}px` }} className="inline-block" />
            <span className="truncate" title={row.title}>{row.title}</span>
          </div>
        );
      }
    },
    {
      key: 'review',
      label: 'Review',
      width: 360,
      render: (v) => (
        <span className="text-slate-600 text-sm block truncate" title={v || ''}>{v || '—'}</span>
      )
    },
    
    {
      key: 'is_published',
      label: 'Status',
      width: 110,
      render: (_, row) => (
        <div className="flex items-center">
          <Switch checked={!!(row.is_published)} onChange={(val) => handleTogglePublished(row.id, val)} aria-label={`Toggle publish ${row.title || 'content'}`} />
        </div>
      )
    },
  ];

  const actions = {
    view: async (row) => {
      setViewingLoading(true);
      try {
        const res = await contentService.detail(row.id);
        const data = res?.data || res?.result || res || {};
        setViewingContent(data);
        setViewerOpen(true);
      } catch (e) {
        window.alert('Không thể tải nội dung để xem');
      } finally {
        setViewingLoading(false);
      }
    },
    edit: (row) => {
      const c = contents.find((x) => x.id === row.id) || row.__raw;
      setEditing(c);
      setTimeout(() => editorAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    },
    delete: async (row) => {
      if (!window.confirm('Xoá content này?')) return;
      try {
        await contentService.remove(row.id);
        setContents((prev) => prev.filter((c) => c.id !== row.id));
      } catch (e) {
        window.alert('Xoá thất bại');
      }
    },
  };

  const handleAdd = () => {
    // Require selecting Module and Category before adding content
    if (!selectedModuleId || !selectedCategoryId) {
      window.alert('Vui lòng chọn Module và Function trước khi thêm content');
      return;
    }
    setEditing({ title: '', is_published: true, parent_id: null, summary: '', body_html: '' });
    setTimeout(() => editorAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const handleSubmit = async (payload) => {
    if (!selectedCategoryId) { window.alert('Vui lòng chọn Function'); return; }
    setSaving(true);
    try {
      if (editing?.id) {
        await contentService.update(editing.id, payload);
      } else {
        await contentService.create(payload);
      }
      const res = await contentService.list(selectedCategoryId, true);
      setContents(res || []);
      setEditing(null);
    } catch (e) {
      console.error(e);
      window.alert('Không thể lưu content');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublished = async (id, nextVal) => {
    setContents((prev) => prev.map((c) => (c.id === id ? { ...c, is_published: nextVal } : c)));
    try {
      await contentService.update(id, { is_published: nextVal });
    } catch (e) {
      setContents((prev) => prev.map((c) => (c.id === id ? { ...c, is_published: !nextVal } : c)));
      window.alert('Cập nhật publish thất bại');
    }
  };

  return (
    <AdminDashboard user={user} onLogout={onLogout}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Content Manage</h2>
        <button className="px-3.5 py-2.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-2" onClick={handleAdd}>
          <FiPlus />
          <span>Add Content</span>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Select
          label="Module"
          value={selectedModuleId}
          onChange={setSelectedModuleId}
          options={moduleOptions}
          placeholder="Select module"
        />
        <Select
          label="Type"
          value={selectedCategoryType}
          onChange={setSelectedCategoryType}
          options={categoryTypeOptions}
          includePlaceholder={false}
        />
        <Select
          label="Function"
          value={selectedCategoryId}
          onChange={setSelectedCategoryId}
          options={categoryOptions}
          placeholder="Select function"
        />
      </div>
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <div className="relative max-w-md w-full">
          <input value={query} onChange={(e)=>setQuery(e.target.value)} className="w-full border border-gray-300 shadow-sm rounded-lg pl-9 pr-3 py-2" placeholder="Search contents..." />
          <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none pl-3">
            <span className="text-gray-400">🔍</span>
          </div>
        </div>
        <div className="flex-1" />
      </div>
      {loading ? (
        <div className="text-slate-600">Đang tải...</div>
      ) : (
        <>
          {(isSearching ? filtered.length === 0 : treeRows.length === 0) ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-lg p-6 text-center text-slate-600">
              Please choose module and function to show contents list.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table
                selectable={false}
                columns={columns}
                page={page}
                pageSize={pageSize}
                onPageChange={setPage}
                actionsWidth={200}
                data={
                  isSearching
                    ? filtered.map((c) => ({
                        id: c.id,
                        title: c.title || c.name,
                        review: (() => { const t = (c.plain_content ?? c.plainContent ?? c.plain_text ?? c.plain ?? '').toString(); const s = t.replace(/\s+/g,' ').trim(); return s.length > 100 ? s.slice(0, 100) + '…' : s; })(),
                        order_index: c.order_index ?? c.order ?? c.sort_index,
                        is_published: c.is_published ?? c.published ?? false,
                        __raw: c,
                        __depth: getDepth(c),
                      }))
                    : treeRows.map(({ node, depth, hasChildren, isOpen }) => ({
                        id: node.id,
                        title: node.title || node.name,
                        review: (() => { const t = (node.plain_content ?? node.plainContent ?? node.plain_text ?? node.plain ?? '').toString(); const s = t.replace(/\s+/g,' ').trim(); return s.length > 100 ? s.slice(0, 100) + '…' : s; })(),
                        order_index: node.order_index ?? node.order ?? node.sort_index,
                        is_published: node.is_published ?? node.published ?? false,
                        __raw: node,
                        __depth: depth,
                        __hasChildren: hasChildren,
                        __isOpen: isOpen,
                      }))
                }
                actions={actions}
              />
            </div>
          )}
        </>
      )}
      <Modal
        open={viewerOpen}
        onClose={() => { setViewerOpen(false); setViewingContent(null); }}
        title={viewingContent?.title || 'Xem nội dung'}
        maxWidth="max-w-5xl"
      >
        {viewingLoading && <div className="text-slate-600">Đang tải nội dung...</div>}
        {viewingContent && (
          <div className="prose max-w-none">
            <div className="pt-1" dangerouslySetInnerHTML={{ __html: viewingContent.html_content || viewingContent.body_html || '' }} />
            <div className="mt-4">
              <ImageManager contentId={viewingContent.id} simple />
            </div>
          </div>
        )}
      </Modal>
      <div ref={editorAreaRef} />
      <div className="mt-2 flex items-center justify-end">
        <button className="px-3.5 py-2.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-2" onClick={handleAdd}>
          <FiPlus />
          <span>Add Content</span>
        </button>
      </div>
      {editing && (
        <>
          <ContentForm
            initial={editing}
            moduleId={selectedModuleId}
            categoryId={selectedCategoryId}
            moduleName={(modules.find((m) => String(m.id) === String(selectedModuleId))?.title) || (modules.find((m) => String(m.id) === String(selectedModuleId))?.name) || ''}
            categoryName={(categories.find((c) => String(c.id) === String(selectedCategoryId))?.title) || (categories.find((c) => String(c.id) === String(selectedCategoryId))?.name) || ''}
            contentsInCategory={contents}
            loading={saving}
            onCancel={() => setEditing(null)}
            onSubmit={handleSubmit}
          />
          {editing?.id && (
            <ImageManager contentId={editing.id} simple />
          )}
        </>
      )}
    </AdminDashboard>
  );
}
