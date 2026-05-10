import React, { useState, useEffect } from 'react';
import { TrendingUp, Package, ShoppingCart, Users, Eye } from 'lucide-react';
import StatCard from '../components/StatCard';
import AdminLayout from '../components/AdminLayout';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 45250000,
    ticketsSold: 1250,
    totalOrders: 324,
    activeUsers: 156,
  });

  const [recentOrders, setRecentOrders] = useState([
    {
      id: 'ORD-2024-00001',
      customer: 'Nguyễn Văn A',
      amount: 288000,
      status: 'completed',
      date: '2024-05-10',
    },
    {
      id: 'ORD-2024-00002',
      customer: 'Trần Thị B',
      amount: 649000,
      status: 'pending',
      date: '2024-05-09',
    },
    {
      id: 'ORD-2024-00003',
      customer: 'Lê Minh C',
      amount: 178000,
      status: 'shipped',
      date: '2024-05-08',
    },
    {
      id: 'ORD-2024-00004',
      customer: 'Phạm Thị D',
      amount: 228000,
      status: 'completed',
      date: '2024-05-07',
    },
  ]);

  const getStatusBadge = (status) => {
    const statusMap = {
      completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
      shipped: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Shipped' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
    };
    const s = statusMap[status] || statusMap.pending;
    return s;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-2">Welcome to ELon Merch Admin Panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={TrendingUp}
          label="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          trend="+12.5%"
          trendUp={true}
        />
        <StatCard
          icon={Package}
          label="Tickets Sold"
          value={stats.ticketsSold.toLocaleString()}
          trend="+8.2%"
          trendUp={true}
        />
        <StatCard
          icon={ShoppingCart}
          label="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          trend="+5.1%"
          trendUp={true}
        />
        <StatCard
          icon={Users}
          label="Active Users"
          value={stats.activeUsers.toLocaleString()}
          trend="+3.7%"
          trendUp={true}
        />
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Recent Orders</h2>
              <p className="text-slate-500 text-sm mt-1">Latest transactions from your store</p>
            </div>
            <button className="px-4 py-2 rounded-xl text-[#4054B2] hover:bg-[#F8FAFF] transition font-medium">
              View All →
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8FAFF] border-b border-slate-200">
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Order ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => {
                const statusInfo = getStatusBadge(order.status);
                return (
                  <tr
                    key={order.id}
                    className="border-b border-slate-100 hover:bg-[#F8FAFF] transition"
                  >
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900">{order.id}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{order.customer}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {formatCurrency(order.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          statusInfo.bg
                        } ${statusInfo.text}`}
                      >
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{order.date}</td>
                    <td className="px-6 py-4">
                      <button className="p-2 hover:bg-slate-100 rounded-lg transition">
                        <Eye size={18} className="text-slate-600" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#F8FAFF] border-t border-slate-200">
          <p className="text-sm text-slate-600">
            Showing <span className="font-semibold">4</span> of{' '}
            <span className="font-semibold">324</span> total orders
          </p>
        </div>
      </div>

      {/* Placeholder Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Chart Placeholder */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-80">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Revenue Trend</h3>
          <div className="h-full flex items-center justify-center bg-gradient-to-br from-[#F8FAFF] to-[#F0F5FF] rounded-2xl">
            <div className="text-center">
              <p className="text-slate-500">Chart visualization</p>
              <p className="text-slate-400 text-sm mt-2">Coming in Phase 6</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full px-4 py-3 bg-[#4054B2] text-white rounded-2xl hover:bg-[#3548a1] transition font-medium">
              + Add New Event
            </button>
            <button className="w-full px-4 py-3 bg-slate-100 text-slate-900 rounded-2xl hover:bg-slate-200 transition font-medium">
              + Add New Product
            </button>
            <button className="w-full px-4 py-3 bg-slate-100 text-slate-900 rounded-2xl hover:bg-slate-200 transition font-medium">
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
