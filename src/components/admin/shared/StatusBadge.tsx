import React from "react";

export function StatusBadge({ status }: { status: string }) {
  const color = status === "Activo" ? "bg-green-900 text-green-400" : status === "Inactivo" ? "bg-red-900 text-red-400" : "bg-yellow-900 text-yellow-400";
  return (
    <span className={`px-2 py-1 rounded text-xs font-bold ${color}`}>{status}</span>
  );
}
