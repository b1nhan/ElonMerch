import React, { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';

const StatusUpdateModal = ({ isOpen, order, onClose, onConfirm, isLoading }) => {
  const [newStatus, setNewStatus] = useState(order?.status || 'pending');

  const statuses = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-50', textColor: 'text-yellow-700' },
    { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-50', textColor: 'text-blue-700' },
    { value: 'shipped', label: 'Shipped', color: 'bg-blue-50', textColor: 'text-blue-700' },
    { value: 'delivered', label: 'Delivered', color: 'bg-green-50', textColor: 'text-green-700' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-50', textColor: 'text-red-700' },
  ];

  const handleConfirm = () => {
    onConfirm(newStatus);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full mx-4 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-900">Update Order Status</h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1 hover:bg-slate-100 rounded-lg transition disabled:opacity-50"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        {/* Order Info */}
        <div className="bg-[#F8FAFF] rounded-2xl p-4 mb-6">
          <p className="text-sm text-slate-500">Order</p>
          <p className="font-bold text-slate-900">{order?.order_number}</p>
          <p className="text-sm text-slate-700 mt-2">{order?.shipping_name}</p>
          <p className="text-sm font-semibold text-[#4054B2] mt-1">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(order?.total_price || 0)}
          </p>
        </div>

        {/* Status Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-900 mb-2">
            New Status
          </label>
          <div className="relative">
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-[#F8FAFF] focus:outline-none focus:border-[#4054B2] transition appearance-none cursor-pointer disabled:opacity-50"
            >
              {statuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <ChevronDown size={20} className="absolute right-4 top-3.5 text-slate-600 pointer-events-none" />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-slate-100 text-slate-900 rounded-2xl hover:bg-slate-200 transition font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-[#4054B2] text-white rounded-2xl hover:bg-[#3548a1] transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Updating...
              </>
            ) : (
              'Update Status'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusUpdateModal;
