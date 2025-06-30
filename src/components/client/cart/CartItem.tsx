
'use client';

import { FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';
import { useState } from 'react';
import { ImageWithAuth } from '@/components/ui/ImageWithAuth';
import { Toaster, toast } from 'react-hot-toast';

interface CartItemProps {
  item: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    stock: number;
    url_img?: string;
    es_servicio: boolean;
    id_carrito_producto: number;
  };
  onRemove: (id: string) => void;
  onQuantityChange: (id: string, quantity: number) => void;
}



export function CartItem({ item, onRemove, onQuantityChange }: CartItemProps) {
  const [quantity, setQuantity] = useState(item.quantity);

  const handleIncrease = () => {
    const newQuantity = Math.min(quantity + 1, item.stock);
    setQuantity(newQuantity);
    onQuantityChange(item.id, newQuantity);
  };

  const handleDecrease = () => {
    const newQuantity = Math.max(quantity - 1, 1);
    setQuantity(newQuantity);
    onQuantityChange(item.id, newQuantity);
  };

  const handleRemove = () => {
    toast.success('Item eliminado');
    onRemove(String(item.id_carrito_producto));
  };

  

return (
  <li className="flex gap-4 py-6 px-2 border-b border-gray-100 hover:bg-gray-50/50 transition-colors duration-200">
    {/* Contenedor de imagen mejorado */}
    <div className="flex-shrink-0 w-28 h-28 rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-white">
      {item.url_img ? (
        <ImageWithAuth
          imagePath={`item_imgs/${item.url_img}`}
          alt={item.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-1 bg-gray-300 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-xs text-gray-400 font-medium">Sin imagen</span>
          </div>
        </div>
      )}
    </div>

    {/* Contenido principal mejorado */}
    <div className="flex flex-1 flex-col justify-between min-w-0">
      {/* Header con título y precio */}
      <div className="flex justify-between items-start gap-4 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 leading-tight truncate pr-2">
            {item.name}
          </h3>
          <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
            <span className="font-medium">${item.price.toFixed(2)}</span>
            <span className="text-gray-400">por unidad</span>
          </p>
        </div>
        
        <div className="text-right flex-shrink-0">
          <p className="text-xl font-bold text-gray-900">
            ${(item.price * quantity).toFixed(2)}
          </p>
          {quantity > 1 && (
            <p className="text-xs text-gray-500">
              {quantity} × ${item.price.toFixed(2)}
            </p>
          )}
        </div>
      </div>

      {/* Controles inferiores */}
      <div className="flex items-center justify-between gap-4">
        {/* Control de cantidad o indicador de servicio */}
        <div className="flex-1">
          {!item.es_servicio ? (
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-3 font-medium">Cantidad:</span>
              <div className="flex items-center bg-white border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 transition-colors">
                <button
                  onClick={handleDecrease}
                  disabled={quantity <= 1}
                  className={`p-2 rounded-l-lg transition-colors ${
                    quantity <= 1 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                  }`}
                >
                  <FiMinus className="h-4 w-4" />
                </button>
                
                <div className="px-4 py-2 bg-gray-50 border-x border-gray-300 min-w-[3rem] text-center">
                  <span className="font-semibold text-gray-900">{quantity}</span>
                </div>
                
                <button
                  onClick={handleIncrease}
                  disabled={quantity >= item.stock}
                  className={`p-2 rounded-r-lg transition-colors ${
                    quantity >= item.stock 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                  }`}
                >
                  <FiPlus className="h-4 w-4" />
                </button>
              </div>
              
              {item.stock && (
                <span className="ml-3 text-xs text-gray-500">
                  {item.stock - quantity} disponibles
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600 font-medium">
                Servicio - Cantidad única
              </span>
            </div>
          )}
        </div>

        {/* Botón de eliminar mejorado */}
        <button
          type="button"
          onClick={handleRemove}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200 group"
        >
          <FiTrash2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
          <span>Eliminar</span>
        </button>
      </div>
    </div>
  </li>
);
}