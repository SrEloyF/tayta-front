import React from "react";

export function StatCard({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) {
  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-yellow-900 shadow-xl rounded-xl p-6 flex flex-col justify-between border border-yellow-700/30">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm font-medium text-gray-400 uppercase tracking-widest">{label}</span>
      </div>
      <span className="text-3xl font-bold text-yellow-400">{value}</span>
    </div>
  );
}
