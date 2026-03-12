import React, { useEffect, useMemo, useState } from 'react';
import AdminDashboard from './AdminDashboard';
import Table from '../../components/admin/Table';
import Select from '../../components/admin/Select';
import Modal from '../../components/admin/Modal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import Switch from '../../components/admin/Switch';
import CategoryForm from '../../components/admin/forms/CategoryForm';
import {moduleService} from '../../services/moduleService';
import {categoryService} from '../../services/categoryService';
import { FiPlus } from 'react-icons/fi';

export default function AdminCategories({ user, onLogout }) {
  const [modules, setModules] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(() => new Set());

  // Modal states
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  // Confirm delete
  const [openConfirm, setOpenConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toDelete, setToDelete] = useState(null);

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

  const fetchCategories = async () => {
    if (!selectedModuleId) {
      setCategories([]);
      return;
    }
    setLoading(true);
    try {
      const res = await categoryService.list(selectedModuleId, true); // include inactive
      setCategories(res || []);
    } catch (e) {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [selectedModuleId]);

  const moduleOptions = useMemo(
    () => modules.map((m) => ({ value: String(m.id), label: m.title || m.name })),
    [modules]
  );

  // Tạo map để tra parent nhanh
  const catMap = useMemo(() => {
    const map = new Map();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  const getDepth = (cat) => {
    let d = 0; let curr = cat; const seen = new Set();
    while (curr && curr.parent_id && !seen.has(curr.parent_id) && d < 6) {
      seen.add(curr.parent_id);
      curr = catMap.get(curr.parent_id);
      d++;
    }
    return d;
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => (c.title || c.name || '').toLowerCase().includes(q));
  }, [categories, query]);

  useEffect(() => { setPage(1); }, [query, categories]);
  useEffect(() => { setExpanded(new Set()); }, [selectedModuleId, categories]);

  // Build children map for tree rendering when not searching
  const childrenMap = useMemo(() => {
    const ROOT = '__root__';
    const m = new Map();
    m.set(ROOT, []);
    for (const c of categories) {
      const p = c.parent_id ? String(c.parent_id) : ROOT;
      if (!m.has(p)) m.set(p, []);
      m.get(p).push(c);
    }
    // sort each group by order_index then title
    for (const [k, arr] of m.entries()) {
      m.set(
        k,
        (arr || []).slice().sort((a, b) => {
          const ao = a.order_index ?? a.order ?? a.sort_index ?? 0;
          const bo = b.order_index ?? b.order ?? b.sort_index ?? 0;
          if (ao !== bo) return ao - bo;
          const at = (a.title || a.name || '').localeCompare(b.title || b.name || '');
          return at;
        })
      );
    }
    return m;
  }, [categories]);

  const treeRows = useMemo(() => {
    const ROOT = '__root__';
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
    ...(!isSearching
      ? [{
            key: '_exp',
            label: '',
            width: 24,
            render: (_, row) => {
              const has = row.__hasChildren;
              const open = row.__isOpen;
              if (!has) return <span className="inline-block w-3" />;
              return (
                <button
                  type="button"
                  onClick={() => toggleExpand(row.id)}
                  className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-100"
                  aria-label={open ? 'Collapse' : 'Expand'}
                >
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
        const title = row.title;
        return (
          <div className="flex items-center">
            <span style={{ paddingLeft: `${d * 14}px` }} className="inline-block" />
            <span className="truncate" title={title}>{title}</span>
          </div>
        );
      }
    },
    { key: 'order_index', label: 'Order', align: 'right', width: 80, render: (v) => v ?? '—' },
    {
      key: 'is_active',
      label: 'Status',
      width: 110,
      render: (_, row) => (
        <div className="flex items-center">
          <Switch checked={!!(row.is_active)} onChange={(val) => handleToggleActive(row.id, val)} aria-label={`Toggle ${row.title || 'category'}`} />
        </div>
      )
    },
    {
      key: 'updated_at',
      label: 'Last Modify',
      width: 120,
      render: (v) => {
        try {
          const date = v ? new Date(v) : null;
          return date ? date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '—';
        } catch { return v || '—'; }
      }
    },
  ];

  const handleAdd = () => {
    if (!selectedModuleId) {
      window.alert('Vui lòng chọn module trước');
      return;
    }
    setModalMode('create');
    setEditing(null);
    setOpenModal(true);
  };

  const handleSubmit = async (payload) => {
    setSaving(true);
    try {
      if (modalMode === 'create') {
        await categoryService.create(payload);
      } else if (editing?.id) {
        await categoryService.update(editing.id, payload);
      }
      await fetchCategories();
      setOpenModal(false);
    } catch (e) {
      console.error('Save category error:', e?.response || e);
      const apiMessage = e?.response?.data?.message || e?.message;
      window.alert(apiMessage ? `Không thể lưu category: ${apiMessage}` : 'Không thể lưu category.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id, nextVal) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, is_active: nextVal } : c)));
    try {
      await categoryService.update(id, { is_active: nextVal });
    } catch (e) {
      // rollback
      setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, is_active: !nextVal } : c)));
      window.alert('Cập nhật trạng thái thất bại');
    }
  };

  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await categoryService.remove(toDelete.id);
      setCategories((prev) => prev.filter((c) => c.id !== toDelete.id));
    } catch (e) {
      window.alert('Xoá thất bại');
    } finally {
      setDeleting(false);
      setOpenConfirm(false);
      setToDelete(null);
    }
  };

  const actions = {
    edit: (row) => {
      const cat = categories.find((c) => c.id === row.id);
      setModalMode('edit');
      setEditing(cat);
      setOpenModal(true);
    },
    delete: (row) => {
      const cat = categories.find((c) => c.id === row.id);
      setToDelete(cat);
      setOpenConfirm(true);
    },
  };

  return (
    <AdminDashboard user={user} onLogout={onLogout}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Function Manage</h2>
        <button className="px-3.5 py-2.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-2" onClick={handleAdd}>
          <FiPlus />
          <span>Add Function</span>
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
      </div>
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <div className="relative max-w-md w-full">
          <input value={query} onChange={(e)=>setQuery(e.target.value)} className="w-full border border-gray-300 shadow-sm rounded-lg pl-9 pr-3 py-2" placeholder="Search function..." />
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
              Please choose module to show function list.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table
                selectable={false}
                columns={columns}
                page={page}
                pageSize={pageSize}
                onPageChange={setPage}
                data={
                  isSearching
                    ? filtered.map((c) => ({
                        id: c.id,
                        title: c.title || c.name,
                        order_index: c.order_index ?? c.order ?? c.sort_index,
                        is_active: c.is_active ?? c.active ?? false,
                        updated_at: c.updated_at ?? c.update_at ?? c.updatedAt ?? c.create_update_at,
                        __raw: c,
                        __depth: getDepth(c),
                      }))
                    : treeRows.map(({ node, depth, hasChildren, isOpen }) => ({
                        id: node.id,
                        title: node.title || node.name,
                        order_index: node.order_index ?? node.order ?? node.sort_index,
                        is_active: node.is_active ?? node.active ?? false,
                        updated_at: node.updated_at ?? node.update_at ?? node.updatedAt ?? node.create_update_at,
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

      {/* Create/Edit Modal */}
      <Modal open={openModal} title={modalMode === 'create' ? 'Thêm Category' : 'Sửa Category'} onClose={() => !saving && setOpenModal(false)}>
        <CategoryForm
          initial={editing}
          modules={modules}
          categories={categories}
          defaultModuleId={selectedModuleId}
          loading={saving}
          existingNames={categories.filter((c) => c.id !== editing?.id).map((c) => c.title || c.name)}
          onCancel={() => setOpenModal(false)}
          onSubmit={handleSubmit}
        />
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={openConfirm}
        title="Xoá Category"
        message={`Bạn có chắc muốn xoá category "${toDelete?.title || toDelete?.name || ''}"? Các category con cũng có thể bị ảnh hưởng.`}
        onCancel={() => !deleting && setOpenConfirm(false)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        confirmText="Xoá"
      />
    </AdminDashboard>
  );
}
