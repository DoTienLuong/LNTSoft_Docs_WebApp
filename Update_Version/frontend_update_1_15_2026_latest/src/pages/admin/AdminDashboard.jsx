import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Header from '../../components/Header';
import AppFooter from '../../components/footer/AppFooter';

export default function AdminDashboard({ children, user, onLogout }) {
  const [open, setOpen] = useState(false); // mobile drawer
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('admin.sidebar.collapsed') === '1';
    } catch {
      return false;
    }
  }); // desktop collapse (persisted)

  useEffect(() => {
    try {
      localStorage.setItem('admin.sidebar.collapsed', collapsed ? '1' : '0');
    } catch {}
  }, [collapsed]);
  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50">
      <Header
        user={user}
        onLogout={onLogout}
        onToggleSidebar={() => setCollapsed((v) => !v)}
        onOpenMobileSidebar={() => setOpen(true)}
        sidebarCollapsed={collapsed}
      />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar desktop */}
        <div className="hidden md:block"><AdminSidebar collapsed={collapsed} /></div>
        {/* Sidebar mobile overlay */}
        {open && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            <div className="absolute inset-0 bg-slate-900/40" onClick={() => setOpen(false)} />
            <div className="relative z-50 w-72 h-full bg-white shadow-xl">
              <AdminSidebar />
              <button
                className="absolute top-3 right-3 rounded bg-slate-100 px-2 py-1"
                onClick={() => setOpen(false)}
              >Đóng</button>
            </div>
          </div>
        )}
        <main className="flex-1 p-6 overflow-auto">
          {children || (
            <div className="space-y-4">
              <h1 className="text-xl font-semibold">Admin Dashboard</h1>
              <p className="text-slate-600">Chọn mục trong thanh điều hướng để quản lý.</p>
            </div>
          )}
        </main>
      </div>
      <AppFooter />
    </div>
  );
}
