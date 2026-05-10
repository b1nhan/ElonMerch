import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

const Notification = ({ type, message, onClose, duration = 4000 }) => {
  useEffect(() => {
    if (!message) return;
    
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const isSuccess = type === 'success';
  const bgColor = isSuccess ? 'bg-green-50' : 'bg-red-50';
  const borderColor = isSuccess ? 'border-green-200' : 'border-red-200';
  const textColor = isSuccess ? 'text-green-800' : 'text-red-800';
  const Icon = isSuccess ? CheckCircle : AlertCircle;

  return (
    <div className={`fixed top-4 right-4 max-w-sm w-full ${bgColor} border ${borderColor} rounded-2xl p-4 shadow-lg z-50 flex items-start gap-3`}>
      <Icon size={20} className={isSuccess ? 'text-green-600 flex-shrink-0' : 'text-red-600 flex-shrink-0'} />
      <div className="flex-1">
        <p className={`font-medium ${textColor}`}>{message}</p>
      </div>
      <button
        onClick={onClose}
        className={`p-1 hover:bg-opacity-20 rounded-lg transition flex-shrink-0 ${
          isSuccess ? 'hover:bg-green-600' : 'hover:bg-red-600'
        }`}
      >
        <X size={16} className={isSuccess ? 'text-green-600' : 'text-red-600'} />
      </button>
    </div>
  );
};

export default Notification;
