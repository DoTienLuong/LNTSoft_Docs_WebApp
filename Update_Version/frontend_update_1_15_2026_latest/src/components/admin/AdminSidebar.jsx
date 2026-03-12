import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiGrid, FiFolder, FiFileText, FiUser } from 'react-icons/fi';

const NavItem = ({ to, label, icon, collapsed }) => {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-md transition-colors ${
        active ? 'bg-blue-50 text-blue-800 font-semibold' : 'text-slate-700 hover:bg-slate-100'
      }`}
    >
      {icon && (
        <span className={`${active ? 'text-blue-700' : 'text-slate-500'} text-xl`}>{icon}</span>
      )}
      {!collapsed && (
        <span className="text-[15px] md:text-base leading-5 truncate">
          {label}
        </span>
      )}
    </Link>
  );
};

export default function AdminSidebar({ collapsed = false }) {
  return (
    <aside
      className={`${collapsed ? 'w-20' : 'w-72 md:w-64'} border-r border-slate-200 h-full p-3 space-y-2 bg-white transition-all duration-200`}
    >
      <nav className="flex flex-col">
        <NavItem to="/admin/modules" label="Module" icon={<FiGrid />} collapsed={collapsed} />
        <NavItem to="/admin/categories" label="Function" icon={<FiFolder />} collapsed={collapsed} />
        <NavItem to="/admin/contents" label="Content" icon={<FiFileText />} collapsed={collapsed} />
        <NavItem to="/admin/accounts" label="Account" icon={<FiUser />} collapsed={collapsed} />
      </nav>
    </aside>
  );
}
