import React, { useState, useEffect } from 'react';
import { Menu, Bell, User, Settings, ChevronDown } from 'lucide-react';

const AdminHeader = ({ onMenuToggle }) => {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Get user info from localStorage or API
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-72 h-20 bg-white border-b border-slate-200 shadow-sm z-40">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left: Menu Toggle */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition"
        >
          <Menu size={24} className="text-slate-600" />
        </button>

        {/* Center: Breadcrumb/Title (optional) */}
        <div className="hidden lg:block flex-1">
          <h2 className="text-lg font-semibold text-slate-900">
            Welcome back, {user?.name || 'Admin'}! 👋
          </h2>
        </div>

        {/* Right: Icons and User Menu */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 hover:bg-slate-100 rounded-lg transition">
            <Bell size={20} className="text-slate-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Settings */}
          <button className="p-2 hover:bg-slate-100 rounded-lg transition">
            <Settings size={20} className="text-slate-600" />
          </button>

          {/* User Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 p-2 hover:bg-slate-100 rounded-lg transition"
            >
              <div className="w-8 h-8 bg-[#4054B2] rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <span className="text-sm font-medium text-slate-900 hidden sm:block">
                {user?.name || 'Admin'}
              </span>
              <ChevronDown size={16} className="text-slate-600" />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-slate-200">
                  <p className="text-sm font-semibold text-slate-900">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
                <div className="py-2">
                  <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition">
                    Profile Settings
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition">
                    Preferences
                  </button>
                </div>
                <div className="border-t border-slate-200 p-2">
                  <button
                    onClick={() => {
                      localStorage.removeItem('token');
                      localStorage.removeItem('user');
                      window.location.href = '/';
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition font-medium"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
