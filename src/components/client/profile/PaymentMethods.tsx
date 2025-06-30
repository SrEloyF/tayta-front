// components/client/PaymentMethods.tsx
'use client';

import { useState } from 'react';
import { FiCreditCard, FiPlus, FiTrash2 } from 'react-icons/fi';

interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  exp: string;
  isDefault: boolean;
}

export function PaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'Visa',
      last4: '4242',
      exp: '12/25',
      isDefault: true,
    },
    {
      id: '2',
      type: 'Mastercard',
      last4: '5555',
      exp: '05/24',
      isDefault: false,
    },
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSetDefault = (id: string) => {
    setPaymentMethods(pm => 
      pm.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
  };

  const handleDelete = (id: string) => {
    setPaymentMethods(pm => pm.filter(method => method.id !== id));
  };

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simular llamada a API
    setTimeout(() => {
      setPaymentMethods(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          type: 'Visa',
          last4: '1111',
          exp: '10/26',
          isDefault: false,
        },
      ]);
      setShowAddForm(false);
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mt-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Métodos de Pago</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FiPlus className="mr-1" /> Agregar
        </button>
      </div>

      {showAddForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-3">Agregar nueva tarjeta</h4>
          <form onSubmit={handleAddNew}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de tarjeta
                </label>
                <input
                  type="text"
                  placeholder="4242 4242 4242 4242"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre en la tarjeta
                </label>
                <input
                  type="text"
                  placeholder="Juan Pérez"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de expiración
                </label>
                <input
                  type="text"
                  placeholder="MM/AA"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVV
                </label>
                <input
                  type="text"
                  placeholder="123"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isProcessing ? 'Guardando...' : 'Guardar tarjeta'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {paymentMethods.length === 0 ? (
          <p className="text-gray-500">No tienes métodos de pago guardados</p>
        ) : (
          paymentMethods.map((method) => (
            <div
              key={method.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center">
                <div className="p-2 bg-blue-50 rounded-full mr-4">
                  <FiCreditCard className="text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">
                    {method.type} •••• {method.last4}
                  </p>
                  <p className="text-sm text-gray-500">
                    Expira {method.exp} {method.isDefault && '(Predeterminada)'}
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                {!method.isDefault && (
                  <>
                    <button
                      onClick={() => handleSetDefault(method.id)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Hacer predeterminada
                    </button>
                    <button
                      onClick={() => handleDelete(method.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FiTrash2 />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}