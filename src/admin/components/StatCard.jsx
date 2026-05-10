import React from 'react';

const StatCard = ({ icon: Icon, label, value, trend, trendUp = true }) => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-500 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>

          {trend && (
            <div className={`mt-3 text-sm font-medium flex items-center gap-1 ${
              trendUp ? 'text-green-600' : 'text-red-600'
            }`}>
              <span>{trendUp ? '↑' : '↓'} {trend}</span>
              <span className="text-slate-500 font-normal">vs last month</span>
            </div>
          )}
        </div>

        <div className="w-12 h-12 bg-[#F8FAFF] rounded-2xl flex items-center justify-center">
          <Icon size={24} className="text-[#4054B2]" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
