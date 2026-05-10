import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Ticket,
  ShoppingBag,
  Package,
  Users,
  ArrowLeft,
  LogOut
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/events', label: 'Events', icon: Ticket },
    { path: '/admin/merchandise', label: 'Merchandise', icon: ShoppingBag },
    { path: '/admin/orders', label: 'Orders', icon: Package },
    { path: '/admin/users', label: 'Users', icon: Users },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-72 bg-white shadow-xl transition-transform duration-300 z-50 lg:z-auto lg:relative lg:translate-x-0 pt-8 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>

        {/* Logo/Brand */}
        <div className="px-8 pb-8 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900">
            ELon <span className="text-[#4054B2]">Admin</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Management Panel</p>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => onClose && onClose()}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
                  active
                    ? 'bg-[#4054B2] text-white shadow-md'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="border-t border-slate-200 p-4 space-y-2">
          {/* Back to Store */}
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-700 hover:bg-slate-50 transition-all duration-200"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Store</span>
          </Link>

          {/* Logout */}
          <button
            onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/';
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-600 hover:bg-red-50 transition-all duration-200"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
