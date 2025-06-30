import { useState } from 'react';

export function ModalNroCuenta({ open, onClose, onSave, isSubmitting }: {
  open: boolean;
  onClose: () => void;
  onSave: (nroCuenta: string) => void;
  isSubmitting: boolean;
}) {
  const [nroCuenta, setNroCuenta] = useState('');

  if (!open) return null;

  return (
  <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/10 z-50">
    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md transition-all duration-300 ease-in-out transform scale-95 hover:scale-100">
      <h2 className="text-xl font-semibold mb-6 text-center text-gray-800">Registrar número de cuenta</h2>
      <p className="text-md font-medium mb-6 text-center text-gray-600">Usted actualmente no tiene registrado un número de cuenta</p>
      <input
        type="text"
        className="border border-gray-300 p-3 w-full rounded-md mb-6 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        placeholder="Número de cuenta"
        value={nroCuenta}
        onChange={e => setNroCuenta(e.target.value)}
        disabled={isSubmitting}
      />
      <div className="flex justify-between gap-4">
        <button
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-all duration-300 ease-in-out"
          onClick={onClose}
          disabled={isSubmitting}
        >Cancelar</button>
        <button
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-300 ease-in-out"
          onClick={() => onSave(nroCuenta)}
          disabled={isSubmitting || !nroCuenta}
        >Guardar</button>
      </div>
    </div>
  </div>
);
}