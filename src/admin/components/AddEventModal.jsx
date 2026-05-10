import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const AddEventModal = ({ isOpen, event, onClose, onSave, isLoading }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    cast: '',
    image: '',
    reg_price: '',
    vip_price: '',
    total_tickets: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (event) {
      setFormData(event);
    } else {
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        cast: '',
        image: '',
        reg_price: '',
        vip_price: '',
        total_tickets: '',
      });
    }
    setErrors({});
  }, [event, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.time) newErrors.time = 'Time is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.reg_price) newErrors.reg_price = 'Regular price is required';
    if (!formData.vip_price) newErrors.vip_price = 'VIP price is required';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">
            {event?.id ? 'Edit Event' : 'Add New Event'}
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1 hover:bg-slate-100 rounded-lg transition disabled:opacity-50"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Event Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Soobin Live Concert 2024"
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.title ? 'border-red-500' : 'border-slate-200'
              } bg-[#F8FAFF] focus:outline-none focus:border-[#4054B2] transition`}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Event description..."
              rows="3"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-[#F8FAFF] focus:outline-none focus:border-[#4054B2] transition resize-none"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.date ? 'border-red-500' : 'border-slate-200'
                } bg-[#F8FAFF] focus:outline-none focus:border-[#4054B2] transition`}
              />
              {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Time *
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.time ? 'border-red-500' : 'border-slate-200'
                } bg-[#F8FAFF] focus:outline-none focus:border-[#4054B2] transition`}
              />
              {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Location *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., National Convention Center, TP.HCM"
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.location ? 'border-red-500' : 'border-slate-200'
              } bg-[#F8FAFF] focus:outline-none focus:border-[#4054B2] transition`}
            />
            {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
          </div>

          {/* Cast */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Cast/Artists
            </label>
            <input
              type="text"
              name="cast"
              value={formData.cast}
              onChange={handleChange}
              placeholder="e.g., Soobin Hoàng Sơn, Tòng Tài"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-[#F8FAFF] focus:outline-none focus:border-[#4054B2] transition"
            />
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Regular Price *
              </label>
              <input
                type="number"
                name="reg_price"
                value={formData.reg_price}
                onChange={handleChange}
                placeholder="0"
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.reg_price ? 'border-red-500' : 'border-slate-200'
                } bg-[#F8FAFF] focus:outline-none focus:border-[#4054B2] transition`}
              />
              {errors.reg_price && <p className="text-red-500 text-sm mt-1">{errors.reg_price}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                VIP Price *
              </label>
              <input
                type="number"
                name="vip_price"
                value={formData.vip_price}
                onChange={handleChange}
                placeholder="0"
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.vip_price ? 'border-red-500' : 'border-slate-200'
                } bg-[#F8FAFF] focus:outline-none focus:border-[#4054B2] transition`}
              />
              {errors.vip_price && <p className="text-red-500 text-sm mt-1">{errors.vip_price}</p>}
            </div>
          </div>

          {/* Total Tickets */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Total Tickets
            </label>
            <input
              type="number"
              name="total_tickets"
              value={formData.total_tickets}
              onChange={handleChange}
              placeholder="1000"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-[#F8FAFF] focus:outline-none focus:border-[#4054B2] transition"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Image URL
            </label>
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="/events/image.jpg"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-[#F8FAFF] focus:outline-none focus:border-[#4054B2] transition"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-slate-100 text-slate-900 rounded-2xl hover:bg-slate-200 transition font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-[#4054B2] text-white rounded-2xl hover:bg-[#3548a1] transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                event?.id ? 'Update Event' : 'Add Event'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEventModal;
