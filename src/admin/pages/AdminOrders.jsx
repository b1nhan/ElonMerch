import React, { useState, useEffect } from 'react';
import { Edit2, Eye } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import StatusUpdateModal from '../components/StatusUpdateModal';
import Notification from '../components/Notification';
import { apiGet, apiPut } from '../../utils/api';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await apiGet('/orders', { per_page: 100 });
      setOrders(response.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdateClick = (order) => {
    setSelectedOrder(order);
    setShowStatusModal(true);
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!selectedOrder?.id) return;

    try {
      setModalLoading(true);
      await apiPut(`/orders/${selectedOrder.id}`, { status: newStatus });
      setNotification({ type: 'success', message: 'Order status updated successfully!' });
      setShowStatusModal(false);
      setSelectedOrder(null);
      await fetchOrders();
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Failed to update status' });
    } finally {
      setModalLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Confirmed' },
      shipped: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Shipped' },
      delivered: { bg: 'bg-green-100', text: 'text-green-700', label: 'Delivered' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
    };
    return statusMap[status] || statusMap.pending;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <AdminLayout>
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Orders Management</h1>
        <p className="text-slate-500 mt-2">Track and manage all customer orders</p>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 text-red-800">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="bg-slate-200 h-16 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 shadow-sm border border-slate-100 text-center">
          <p className="text-slate-500">No orders found.</p>
        </div>
      ) : (
        /* Orders Table */
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8FAFF] border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Order ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Customer</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Items</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Total</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const statusInfo = getStatusBadge(order.status);
                  return (
                    <tr
                      key={order.id}
                      className="border-b border-slate-100 hover:bg-[#F8FAFF] transition"
                    >
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900">{order.order_number}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{order.shipping_name}</div>
                        <div className="text-sm text-slate-500">{order.user_id}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        Multiple items
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {formatPrice(order.total_price)}
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bg} ${statusInfo.text}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStatusUpdateClick(order)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-600 hover:text-[#4054B2]"
                            title="Update Status"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-600 hover:text-[#4054B2]"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                        </div>
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
              Showing <span className="font-semibold">{orders.length}</span> orders
            </p>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      <StatusUpdateModal
        isOpen={showStatusModal}
        order={selectedOrder}
        onClose={() => {
          setShowStatusModal(false);
          setSelectedOrder(null);
        }}
        onConfirm={handleStatusUpdate}
        isLoading={modalLoading}
      />
    </AdminLayout>
  );
};

export default AdminOrders;
