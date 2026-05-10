import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, MapPin, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuthModal = ({ type = 'login', onClose, switchType }) => {
  const { login, register, loading, error, setError } = useAuth();
  const [formType, setFormType] = useState(type);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
  });
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setFormError(null);
    setError(null);
  };

  const validateForm = () => {
    if (formType === 'login') {
      if (!formData.email.trim()) {
        setFormError('Email is required');
        return false;
      }
      if (!formData.password.trim()) {
        setFormError('Password is required');
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setFormError('Invalid email format');
        return false;
      }
    } else {
      if (!formData.name.trim()) {
        setFormError('Name is required');
        return false;
      }
      if (!formData.email.trim()) {
        setFormError('Email is required');
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setFormError('Invalid email format');
        return false;
      }
      if (!formData.password.trim()) {
        setFormError('Password is required');
        return false;
      }
      if (formData.password.length < 6) {
        setFormError('Password must be at least 6 characters');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setFormError('Passwords do not match');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!validateForm()) {
      return;
    }

    try {
      let result;

      if (formType === 'login') {
        result = await login(formData.email, formData.password);
      } else {
        result = await register(
          formData.name,
          formData.email,
          formData.password,
          formData.phone,
          formData.address
        );
      }

      if (result.success) {
        setFormSuccess(result.message);
        // Reset form
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          phone: '',
          address: '',
        });
        // Close modal after 1 second
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        setFormError(result.message);
      }
    } catch (err) {
      setFormError(err.message || 'An error occurred');
    }
  };

  const handleSwitchType = (newType) => {
    setFormType(newType);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      address: '',
    });
    setFormError(null);
    setFormSuccess(null);
    setError(null);
    if (switchType) {
      switchType(newType);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">
            {formType === 'login' ? 'Login' : 'Sign Up'}
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 hover:bg-slate-100 rounded-lg transition disabled:opacity-50"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Message */}
          {(formError || error) && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
              {formError || error}
            </div>
          )}

          {/* Success Message */}
          {formSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-green-700 text-sm">
              {formSuccess}
            </div>
          )}

          {/* Name Field (Register Only) */}
          {formType === 'register' && (
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Name
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Full name"
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-[#4054B2] focus:bg-white transition disabled:opacity-50"
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-3.5 text-slate-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-[#4054B2] focus:bg-white transition disabled:opacity-50"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-3.5 text-slate-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-[#4054B2] focus:bg-white transition disabled:opacity-50"
              />
            </div>
          </div>

          {/* Confirm Password (Register Only) */}
          {formType === 'register' && (
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-[#4054B2] focus:bg-white transition disabled:opacity-50"
                />
              </div>
            </div>
          )}

          {/* Phone Field (Register Only) */}
          {formType === 'register' && (
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Phone (Optional)
              </label>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="0912345678"
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-[#4054B2] focus:bg-white transition disabled:opacity-50"
                />
              </div>
            </div>
          )}

          {/* Address Field (Register Only) */}
          {formType === 'register' && (
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Address (Optional)
              </label>
              <div className="relative">
                <MapPin size={18} className="absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Your address"
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-[#4054B2] focus:bg-white transition disabled:opacity-50"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#4054B2] text-white rounded-xl hover:bg-[#3548a1] transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader size={18} className="animate-spin" />
                {formType === 'login' ? 'Logging in...' : 'Signing up...'}
              </>
            ) : (
              formType === 'login' ? 'Login' : 'Sign Up'
            )}
          </button>

          {/* Toggle Form Type */}
          <div className="text-center text-sm text-slate-600">
            {formType === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleSwitchType('register')}
                  className="text-[#4054B2] font-medium hover:underline"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleSwitchType('login')}
                  className="text-[#4054B2] font-medium hover:underline"
                >
                  Login
                </button>
              </>
            )}
          </div>

          {/* Test Credentials (Development Only) */}
          {formType === 'login' && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700">
              <p className="font-medium mb-1">Test Admin Account:</p>
              <p>Email: admin@elonmerch.com</p>
              <p>Password: password123</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
