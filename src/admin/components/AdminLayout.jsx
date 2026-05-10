import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import AdminHeader from './AdminHeader';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAuthenticated, isAdmin } = useAuth();

  // Show loading state while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFF]">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Checking authentication...</p>
          <div className="w-8 h-8 border-4 border-[#4054B2] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  // Check if user is admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFF]">
        <div className="text-center bg-white rounded-3xl p-8 shadow-sm border border-slate-100 max-w-md">
          <p className="text-lg font-bold text-slate-900 mb-2">Access Denied</p>
          <p className="text-slate-600 mb-6">You don't have permission to access the admin panel.</p>
          <p className="text-sm text-slate-500">Current user role: <span className="font-medium">{user?.role || 'unknown'}</span></p>
          <a
            href="/"
            className="inline-block mt-4 px-6 py-3 bg-[#4054B2] text-white rounded-2xl hover:bg-[#3548a1] transition font-medium"
          >
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  // User is authenticated and is admin - render admin layout
  return (
    <div className="flex h-screen bg-[#F8FAFF]">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <AdminHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        {/* Content Area */}
        <main className="flex-1 overflow-auto pt-20 lg:pt-20 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
