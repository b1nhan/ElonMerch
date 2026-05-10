/**
 * AdminEvents.jsx - OPTION 1: RE-FETCHING
 * 
 * This approach re-fetches all events after every CRUD operation.
 * Pros: Guaranteed accurate data, server is source of truth
 * Cons: Extra network request, slight delay in UI update, more bandwidth
 * 
 * Best for: When you need to ensure data accuracy or when server applies
 * complex transformations to the data
 */

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import AddEventModal from '../components/AddEventModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import Notification from '../components/Notification';
import { apiGet, apiPost, apiPut, apiDelete } from '../../utils/api';

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  /**
   * Fetch all events from API
   * This is called on mount and after every CRUD operation
   */
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await apiGet('/events', { per_page: 100 });
      
      // Validate response structure
      if (!response || !response.data) {
        throw new Error('Invalid API response structure');
      }
      
      setEvents(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.message || 'Failed to fetch events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingEvent(null);
    setShowAddModal(true);
  };

  const handleEditClick = (event) => {
    setEditingEvent(event);
    setShowAddModal(true);
  };

  /**
   * OPTION 1: HANDLE CREATE/UPDATE WITH RE-FETCHING
   * 
   * Flow:
   * 1. Send API request (POST or PUT)
   * 2. Wait for response
   * 3. If successful, immediately re-fetch all events
   * 4. Close modal and show success notification
   */
  const handleSaveEvent = async (formData) => {
    try {
      setModalLoading(true);
      let response;

      if (editingEvent?.id) {
        // UPDATE event
        response = await apiPut(`/events/${editingEvent.id}`, formData);
        
        // Verify the backend actually updated the event
        if (!response.data || response.data.id !== editingEvent.id) {
          throw new Error('Backend did not return updated event data');
        }
        
        // Show success message
        setNotification({ 
          type: 'success', 
          message: 'Event updated successfully!' 
        });
      } else {
        // CREATE new event
        response = await apiPost('/events', formData);
        
        // Verify the backend returned the created event
        if (!response.data || !response.data.id) {
          throw new Error('Backend did not return created event data');
        }
        
        setNotification({ 
          type: 'success', 
          message: 'Event created successfully!' 
        });
      }

      // CRITICAL: Re-fetch all events to ensure UI is in sync
      await fetchEvents();
      
      // Close modal after successful fetch
      setShowAddModal(false);
      setEditingEvent(null);

    } catch (err) {
      console.error('Error saving event:', err);
      setNotification({ 
        type: 'error', 
        message: err.message || 'Failed to save event' 
      });
    } finally {
      setModalLoading(false);
    }
  };

  /**
   * OPTION 1: HANDLE DELETE WITH RE-FETCHING
   * 
   * Flow:
   * 1. Send DELETE request
   * 2. Wait for response
   * 3. If successful, immediately re-fetch all events
   * 4. Close confirmation modal
   */
  const handleConfirmDelete = async () => {
    if (!deleteConfirm?.id) return;

    try {
      setModalLoading(true);
      
      // Send DELETE request
      await apiDelete(`/events/${deleteConfirm.id}`);
      
      // Show success message
      setNotification({ 
        type: 'success', 
        message: 'Event deleted successfully!' 
      });
      
      // CRITICAL: Re-fetch all events
      await fetchEvents();
      
      // Close confirmation modal
      setDeleteConfirm(null);

    } catch (err) {
      console.error('Error deleting event:', err);
      setNotification({ 
        type: 'error', 
        message: err.message || 'Failed to delete event' 
      });
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteClick = (event) => {
    setDeleteConfirm(event);
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

  const getStatusBadge = (status) => {
    const statusMap = {
      upcoming: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Upcoming' },
      ongoing: { bg: 'bg-green-100', text: 'text-green-700', label: 'Ongoing' },
      completed: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Completed' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
    };
    return statusMap[status] || statusMap.upcoming;
  };

  return (
    <AdminLayout>
      {/* Notification */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Events Management</h1>
          <p className="text-slate-500 mt-2">Create and manage concert and event tickets</p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 px-6 py-3 bg-[#4054B2] text-white rounded-2xl hover:bg-[#3548a1] transition font-medium"
        >
          <Plus size={20} />
          Add Event
        </button>
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
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-slate-200 h-16 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 shadow-sm border border-slate-100 text-center">
          <p className="text-slate-500 mb-4">No events found. Create your first event!</p>
          <button
            onClick={handleAddClick}
            className="px-6 py-3 bg-[#4054B2] text-white rounded-2xl hover:bg-[#3548a1] transition font-medium"
          >
            Add Event
          </button>
        </div>
      ) : (
        /* Events Table */
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8FAFF] border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Event Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Location</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Regular Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">VIP Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => {
                  const statusInfo = getStatusBadge(event.status);
                  return (
                    <tr
                      key={event.id}
                      className="border-b border-slate-100 hover:bg-[#F8FAFF] transition"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{event.title}</div>
                        <div className="text-sm text-slate-500">{event.cast}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {formatDate(event.date)}
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {event.location}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {formatPrice(event.reg_price)}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {formatPrice(event.vip_price)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bg} ${statusInfo.text}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditClick(event)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-600 hover:text-[#4054B2]"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(event)}
                            className="p-2 hover:bg-red-50 rounded-lg transition text-slate-600 hover:text-red-600"
                          >
                            <Trash2 size={18} />
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
              Showing <span className="font-semibold">{events.length}</span> events
            </p>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddEventModal
        isOpen={showAddModal}
        event={editingEvent}
        onClose={() => {
          setShowAddModal(false);
          setEditingEvent(null);
        }}
        onSave={handleSaveEvent}
        isLoading={modalLoading}
      />

      <DeleteConfirmationModal
        isOpen={!!deleteConfirm}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm(null)}
        isLoading={modalLoading}
      />
    </AdminLayout>
  );
};

export default AdminEvents;
