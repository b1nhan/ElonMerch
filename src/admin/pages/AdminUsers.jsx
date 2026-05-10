import React, { useState, useEffect } from 'react';
import { Trash2, Shield, User as UserIcon } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import Notification from '../components/Notification';
import { apiGet, apiDelete } from '../../utils/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiGet('/users', { per_page: 100 });
      setUsers(response.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (user) => {
    setDeleteConfirm(user);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm?.id) return;

    try {
      setModalLoading(true);
      await apiDelete(`/users/${deleteConfirm.id}`);
      setNotification({ type: 'success', message: 'User banned successfully!' });
      setDeleteConfirm(null);
      await fetchUsers();
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Failed to ban user' });
    } finally {
      setModalLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const getRoleBadge = (role) => {
    if (role === 'admin') {
      return {
        bg: 'bg-purple-100',
        text: 'text-purple-700',
        label: 'Admin',
        icon: Shield,
      };
    }
    return {
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      label: 'Customer',
      icon: UserIcon,
    };
  };

  const getAvatarColor = (name) => {
    const colors = [
      'bg-blue-500',
      'bg-red-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-yellow-500',
      'bg-indigo-500',
      'bg-cyan-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
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
        <h1 className="text-3xl font-bold text-slate-900">Users Management</h1>
        <p className="text-slate-500 mt-2">Manage customer and admin accounts</p>
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
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-slate-200 h-16 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 shadow-sm border border-slate-100 text-center">
          <p className="text-slate-500">No users found.</p>
        </div>
      ) : (
        /* Users Table */
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8FAFF] border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Phone</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Joined</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const roleBadge = getRoleBadge(user.role);
                  const RoleIcon = roleBadge.icon;
                  const initials = user.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase();

                  return (
                    <tr
                      key={user.id}
                      className="border-b border-slate-100 hover:bg-[#F8FAFF] transition"
                    >
                      {/* Avatar & Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 ${getAvatarColor(user.name)} rounded-full flex items-center justify-center text-white font-bold text-sm`}
                          >
                            {initials}
                          </div>
                          <div className="font-medium text-slate-900">{user.name}</div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 text-slate-700">{user.email}</td>

                      {/* Phone */}
                      <td className="px-6 py-4 text-slate-700">{user.phone || 'N/A'}</td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${roleBadge.bg} ${roleBadge.text}`}
                          >
                            <RoleIcon size={16} />
                            {roleBadge.label}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            user.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : user.status === 'inactive'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'N/A'}
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="px-6 py-4 text-slate-700">
                        {formatDate(user.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        {user.role !== 'admin' ? (
                          <button
                            onClick={() => handleDeleteClick(user)}
                            className="p-2 hover:bg-red-50 rounded-lg transition text-slate-600 hover:text-red-600"
                            title="Ban User"
                          >
                            <Trash2 size={18} />
                          </button>
                        ) : (
                          <span className="text-slate-400 text-sm">N/A</span>
                        )}
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
              Showing <span className="font-semibold">{users.length}</span> users
            </p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deleteConfirm}
        title="Ban User"
        message={`Are you sure you want to ban ${deleteConfirm?.name}? This user will no longer be able to access their account.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm(null)}
        isLoading={modalLoading}
      />
    </AdminLayout>
  );
};

export default AdminUsers;
