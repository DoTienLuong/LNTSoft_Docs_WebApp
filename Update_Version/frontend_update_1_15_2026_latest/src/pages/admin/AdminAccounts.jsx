import React, { useEffect, useMemo, useState } from 'react';
import AdminDashboard from './AdminDashboard';
import Table from '../../components/admin/Table';
import Modal from '../../components/admin/Modal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import Switch from '../../components/admin/Switch';
import { authService } from '../../services/authService';
import { FiPlus } from 'react-icons/fi';

export default function AdminAccounts({ user, onLogout }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [query, setQuery] = useState('');

  // Create/Edit modal
  const [openModal, setOpenModal] = useState(false);
  const [mode, setMode] = useState('create'); // 'create' | 'edit'
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Reset password modal
  const [openReset, setOpenReset] = useState(false);
  const [resetFor, setResetFor] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const list = await authService.adminListUsers();
      setUsers(list);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return (users || []).filter((u) =>
      (u.username || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q)
    );
  }, [users, query]);

  const handleAdd = () => { setMode('create'); setEditing(null); setOpenModal(true); };
  const handleEdit = (row) => { setMode('edit'); setEditing(row); setOpenModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormErrors({});
    try {
      if (mode === 'create') {
        const form = e.target;
        const payload = {
          username: form.username.value.trim(),
          email: form.email.value.trim(),
          password: form.password.value,
          role: form.role.value,
        };
        await authService.register(payload); // dùng API register có sẵn
      } else if (editing?.id) {
        const form = e.target;
        const payload = {
          username: form.username.value.trim(),
          email: form.email.value.trim(),
          role: form.role.value,
          is_active: form.is_active.checked,
        };
        await authService.adminUpdateUser(editing.id, payload);
      }
      await fetchUsers();
      setOpenModal(false);
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || 'Lưu tài khoản thất bại';
      const fields = err?.response?.data?.fields || {};
      setFormErrors(fields);
      window.alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id, nextVal) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, is_active: nextVal } : u)));
    try {
      await authService.adminUpdateUser(id, { is_active: nextVal });
    } catch (e) {
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, is_active: !nextVal } : u)));
      window.alert('Cập nhật trạng thái thất bại');
    }
  };

  const openResetModal = (row) => { setResetFor(row); setNewPassword(''); setOpenReset(true); };
  const submitReset = async () => {
    if (!resetFor?.id || !newPassword) { window.alert('Nhập mật khẩu mới'); return; }
    setResetting(true);
    try {
      await authService.adminResetPassword(resetFor.id, newPassword);
      setOpenReset(false);
    } catch (e) {
      window.alert('Reset mật khẩu thất bại');
    } finally {
      setResetting(false);
    }
  };

  const columns = [
    { key: 'username', label: 'Username', width: 220, render: (v) => <span className="truncate" title={v}>{v}</span> },
    { key: 'email', label: 'Email', width: 260, render: (v) => <span className="truncate" title={v}>{v}</span> },
    { key: 'role', label: 'Role', width: 110 },
    {
      key: 'is_active',
      label: 'Status',
      width: 110,
      render: (_, row) => (
        <div className="flex items-center">
          <Switch checked={!!row.is_active} onChange={(val) => handleToggleActive(row.id, val)} aria-label={`Toggle ${row.username}`} />
        </div>
      )
    },
    {
      key: 'last_login_at',
      label: 'Last Login',
      width: 140,
      render: (v) => {
        try { const d = v ? new Date(v) : null; return d ? d.toLocaleDateString() : '—'; } catch { return v || '—'; }
      }
    },
  ];

  const actions = {
    edit: (row) => handleEdit(row),
    view: (row) => openResetModal(row), // dùng nút "Xem" cho Reset Pass (đổi label trong UI Table nếu cần)
  };

  return (
    <AdminDashboard user={user} onLogout={onLogout}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Account Manage</h2>
        <button className="px-3.5 py-2.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-2" onClick={handleAdd}>
          <FiPlus />
          <span>Add User</span>
        </button>
      </div>
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <div className="relative max-w-md w-full">
          <input value={query} onChange={(e)=>setQuery(e.target.value)} className="w-full border border-gray-300 shadow-sm rounded-lg pl-9 pr-3 py-2" placeholder="Search users..." />
          <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none pl-3">
            <span className="text-gray-400">🔍</span>
          </div>
        </div>
        <div className="flex-1" />
      </div>

      {loading ? (
        <div className="text-slate-600">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <Table
            selectable={false}
            columns={columns}
            data={filtered}
            actions={actions}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal open={openModal} title={mode === 'create' ? 'Thêm User' : 'Sửa User'} onClose={() => !saving && setOpenModal(false)}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input name="username" defaultValue={editing?.username || ''} className={`w-full border rounded px-3 py-2 ${formErrors.username ? 'border-red-500' : 'border-gray-300'}`} required />
            {formErrors.username && <p className="text-xs text-red-600 mt-1">Username đã tồn tại</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" name="email" defaultValue={editing?.email || ''} className={`w-full border rounded px-3 py-2 ${formErrors.email ? 'border-red-500' : 'border-gray-300'}`} required />
            {formErrors.email && <p className="text-xs text-red-600 mt-1">Email đã tồn tại</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select name="role" defaultValue={editing?.role || 'customer'} className="w-full border rounded px-3 py-2 border-gray-300">
              <option value="admin">admin</option>
              <option value="manager">manager</option>
              <option value="customer">customer</option>
            </select>
          </div>
          {mode === 'edit' && (
            <div className="flex items-center gap-2">
              <input id="is_active" type="checkbox" name="is_active" defaultChecked={!!editing?.is_active} className="border-gray-300" />
              <label htmlFor="is_active" className="text-sm">Active</label>
            </div>
          )}
          {mode === 'create' && (
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input type="password" name="password" className="w-full border rounded px-3 py-2 border-gray-300" required />
            </div>
          )}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button type="button" className="px-3 py-2 rounded border border-gray-300 bg-white hover:bg-gray-50" onClick={() => setOpenModal(false)} disabled={saving}>Huỷ</button>
            <button type="submit" className="px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-50" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal open={openReset} title={`Reset mật khẩu: ${resetFor?.username || ''}`} onClose={() => !resetting && setOpenReset(false)}>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Mật khẩu mới</label>
            <input type="password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} className="w-full border rounded px-3 py-2 border-gray-300" />
          </div>
          <div className="pt-2 flex items-center justify-end gap-2">
            <button className="px-3 py-2 rounded border border-gray-300 bg-white hover:bg-gray-50" onClick={()=>setOpenReset(false)} disabled={resetting}>Huỷ</button>
            <button className="px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-50" onClick={submitReset} disabled={resetting || !newPassword}>{resetting ? 'Đang đặt...' : 'Đặt lại'}</button>
          </div>
        </div>
      </Modal>
    </AdminDashboard>
  );
}
