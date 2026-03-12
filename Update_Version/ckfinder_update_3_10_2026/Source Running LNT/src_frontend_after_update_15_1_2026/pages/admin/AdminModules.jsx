import React, { useEffect, useMemo, useState } from 'react';
import AdminDashboard from './AdminDashboard';
import Table from '../../components/admin/Table';
import Modal from '../../components/admin/Modal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import Switch from '../../components/admin/Switch';
import ModuleForm from '../../components/admin/forms/ModuleForm';
import {moduleService} from '../../services/moduleService';
import { FiPlus } from 'react-icons/fi';

export default function AdminModules({ user, onLogout }) {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [query, setQuery] = useState('');

  // Modal states
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  // Confirm delete
  const [openConfirm, setOpenConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const fetchModules = async () => {
    setLoading(true);
    try {
      const res = await moduleService.list();
      setModules(res || []);
    } catch (e) {
      setModules([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchModules(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return modules;
    return modules.filter((m) => (m.title || m.name || '').toLowerCase().includes(q));
  }, [modules, query]);

  // Reset về trang 1 khi filter thay đổi
  useEffect(() => { setPage(1); }, [query, modules]);

  const columns = [
    {
      key: 'icon',
      label: 'Icon',
      width: 64,
      render: (val) => {
        if (!val) return <span className="inline-flex w-6 h-6 items-center justify-center rounded bg-gray-100 text-gray-500">—</span>;
        const s = String(val).trim();
        const isImg = s.startsWith('http') || s.includes('/') || s.endsWith('.svg') || s.endsWith('.png') || s.endsWith('.jpg');
        if (isImg) return <img src={s} alt="icon" className="w-6 h-6 rounded" />;
        // Detect FontAwesome class names (fa, fa-solid, fa-regular, fa-brands, etc.)
        const isFA = /\bfa(-solid|-regular|-brands)?\b/.test(s) || s.includes('fa-');
        if (isFA) {
          const cls = s.replace('fas', 'fa-solid').replace('far', 'fa-regular').replace('fab', 'fa-brands');
          return <i className={`${cls} text-lg`}></i>;
        }
        return <span className="inline-flex w-6 h-6 items-center justify-center rounded bg-gray-100 text-gray-700 text-xs">{s.slice(0,2)}</span>;
      }
    },
    { key: 'name', label: 'Title', width: 320, render: (v, row) => {
      const text = v || row.title || '—';
      return <span className="truncate inline-block max-w-full" title={text}>{text}</span>;
    } },
    { key: 'order_index', label: 'Order', align: 'right', width: 80, render: (v) => v ?? '—' },
    {
      key: 'is_active',
      label: 'Status',
      width: 110,
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Switch checked={!!(row.is_active)} onChange={(val) => handleToggleActive(row.id, val)} aria-label={`Toggle ${row.name || row.title || 'module'}`} />
        </div>
      )
    },
    {
      key: 'updated_at',
      label: 'Last Modify',
      width: 120,
      render: (v, row) => {
        const d = v || row.create_update_at;
        try {
          const date = d ? new Date(d) : null;
          return date ? date.toLocaleDateString() : '—';
        } catch {
          return d || '—';
        }
      }
    },
  ];

  const actions = {
    edit: (row) => { setModalMode('edit'); setEditing(row); setOpenModal(true); },
    delete: (row) => { setToDelete(row); setOpenConfirm(true); },
  };

  const handleAdd = () => { setModalMode('create'); setEditing(null); setOpenModal(true); };

  const handleSubmit = async (payload) => {
    setSaving(true);
    try {
      if (modalMode === 'create') {
        await moduleService.create(payload);
      } else if (editing?.id) {
        await moduleService.update(editing.id, payload);
      }
      await fetchModules();
      setOpenModal(false);
    } catch (e) {
      // fallback alert for now
      console.error(e);
      window.alert('Không thể lưu module.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id, nextVal) => {
    setModules((prev) => prev.map((m) => (m.id === id ? { ...m, is_active: nextVal } : m)));
    try {
      await moduleService.update(id, { is_active: nextVal });
    } catch (e) {
      // rollback
      setModules((prev) => prev.map((m) => (m.id === id ? { ...m, is_active: !nextVal } : m)));
      window.alert('Cập nhật trạng thái thất bại');
    }
  };

  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await moduleService.remove(toDelete.id);
      // Adjust page if needed after deletion
      setModules((prev) => prev.filter((m) => m.id !== toDelete.id));
    } catch (e) {
      window.alert('Xoá thất bại');
    } finally {
      setDeleting(false);
      setOpenConfirm(false);
      setToDelete(null);
    }
  };

  return (
    <AdminDashboard user={user} onLogout={onLogout}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Module Manage</h2>
        <button className="px-3.5 py-2.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-2" onClick={handleAdd}>
          <FiPlus />
          <span>Add Module</span>
        </button>
      </div>
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <div className="relative max-w-md w-full">
          <input value={query} onChange={(e)=>setQuery(e.target.value)} className="w-full border border-gray-300 shadow-sm rounded-lg pl-9 pr-3 py-2" placeholder="Search modules..." />
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
          {filtered.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-lg p-6 text-center text-slate-600">
              Chưa có module nào. Hãy bấm “Add Module” để tạo mới.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table
                selectable={false}
                columns={columns}
                data={filtered.map((m) => ({
                  id: m.id,
                  icon: m.icon,
                  name: m.name || m.title,
                  order_index: m.order_index ?? m.order ?? m.sort_index,
                  is_active: m.is_active ?? m.active ?? false,
                  updated_at: m.updated_at ?? m.update_at ?? m.updatedAt ?? m.create_update_at,
                }))}
                actions={actions}
                page={page}
                pageSize={pageSize}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      <Modal open={openModal} title={modalMode === 'create' ? 'Thêm Module' : 'Sửa Module'} onClose={() => !saving && setOpenModal(false)}>
        <ModuleForm
          initial={editing}
          loading={saving}
          existingNames={modules.map((m)=>m.name || m.title)}
          onCancel={() => setOpenModal(false)}
          onSubmit={handleSubmit}
        />
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={openConfirm}
        title="Xoá Module"
        message={`Bạn có chắc muốn xoá module "${toDelete?.name || toDelete?.title || ''}"?`}
        onCancel={() => !deleting && setOpenConfirm(false)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        confirmText="Xoá"
      />
    </AdminDashboard>
  );
}
