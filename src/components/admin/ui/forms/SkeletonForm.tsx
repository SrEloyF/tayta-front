import React from "react";

export function SkeletonForm({ fields }: { fields: string[] }) {
  return (
    <form className="bg-gray-900 rounded-xl p-6 shadow-lg border border-yellow-700/10 grid grid-cols-1 gap-4 animate-pulse">
      {fields.map((field, i) => (
        <div key={i} className="h-8 bg-gray-800 rounded w-full" />
      ))}
      <div className="h-10 bg-yellow-900 rounded w-32 mt-2 mx-auto" />
    </form>
  );
}
