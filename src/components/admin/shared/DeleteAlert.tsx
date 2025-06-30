import React from "react";

export function DeleteAlert({ onDelete }: { onDelete: () => void }) {
  // Placeholder: solo muestra un mensaje visual
  return (
    <div className="bg-red-900/90 border border-red-700 rounded-xl p-4 flex flex-col items-center text-red-200">
      <span className="font-bold mb-2">¿Estás seguro de eliminar?</span>
      <div className="flex gap-2">
        <button className="bg-red-700 px-4 py-2 rounded text-white font-bold hover:bg-red-800 transition-colors" onClick={onDelete}>Eliminar</button>
        <button className="bg-gray-800 px-4 py-2 rounded text-gray-200 font-bold hover:bg-gray-700 transition-colors">Cancelar</button>
      </div>
    </div>
  );
}
