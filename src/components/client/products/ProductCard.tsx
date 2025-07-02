// components/client/ProductCard.tsx
'use client';
import Link from 'next/link';
import { useState } from 'react';

// Interfaces de tipos
interface Vendedor {
  id_usuario?: number;
  nombres?: string;
  apellidos?: string;
  url_img?: string | null;
}

interface Categoria {
  id_categoria?: number;
  nombre?: string;
}

interface Producto {
  id_item?: number;
  nombre?: string;
  descripcion?: string;
  precio?: number;
  categoria?: Categoria | null;
  vendedor?: Vendedor | null;
  estado?: 'A' | 'I'; // A: Activo, I: Inactivo
  fecha_y_hora?: string;
  stock?: number;
  es_servicio?: boolean;
  imagen?: string | null;
}

interface ProductCardProps {
  product: Producto;
}

// Componente de placeholder para cuando faltan datos
const PlaceholderVendedor = () => (
  <div className="flex items-center gap-3 mb-2">
    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
      <span className="text-gray-400 text-xs">SV</span>
    </div>
    <span className="text-gray-500 text-sm">Vendedor no disponible</span>
  </div>
);

// Card de producto con manejo de errores
export function ProductCard({ product }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const [vendedorImgError, setVendedorImgError] = useState(false);

  if (!product) {
    return (
      <div className="bg-white rounded-xl shadow p-4">
        <p>Producto no disponible</p>
      </div>
    );
  }

  // Valores por defecto
  const {
    id_item = 0,
    nombre = 'Producto sin nombre',
    descripcion = 'Sin descripción disponible',
    precio = 0,
    categoria = { nombre: 'Sin categoría' },
    vendedor = null,
    estado = 'I',
    fecha_y_hora = new Date().toISOString(),
    stock = 0,
    imagen = null
  } = product;

  const renderVendedor = () => {
    if (!vendedor) {
      return <PlaceholderVendedor />;
    }

    return (
      <div className="flex items-center gap-3 mb-2">
        <div className="relative">
          <img
            src={!vendedorImgError && vendedor.url_img ? vendedor.url_img : '/avatar.png'}
            alt={vendedor.nombres || 'Vendedor'}
            onError={() => setVendedorImgError(true)}
            className="w-9 h-9 rounded-full object-cover border border-blue-200"
          />
        </div>
        <span className="font-semibold text-gray-700">
          {vendedor.nombres || 'Vendedor'} {vendedor.apellidos || ''}
        </span>
        <span className={`ml-auto px-2 py-0.5 rounded text-xs font-semibold ${
          estado === 'A' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {estado === 'A' ? 'Disponible' : 'No disponible'}
        </span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-4 flex flex-col gap-2 h-full">
      {renderVendedor()}
      
      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-2 flex items-center justify-center">
        {imagen && !imgError ? (
          <img 
            src={`${process.env.NEXT_PUBLIC_API_URL}/api/uploads/item_imgs/${imagen}`} 
            alt={nombre} 
            onError={() => setImgError(true)}
            className="object-cover w-full h-full"
          />
        ) : (
          <span className="text-gray-400">Sin imagen</span>
        )}
      </div>
      
      <div className="flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{nombre}</h3>
        
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          {categoria?.nombre && (
            <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
              {categoria.nombre}
            </span>
          )}
          <span>• Publicado: {new Date(fecha_y_hora).toLocaleDateString()}</span>
        </div>
        
        <p className="text-gray-700 text-sm line-clamp-2 mb-2">{descripcion}</p>
        
        <div className="flex items-center justify-between mt-auto">
          <span className="text-xl font-bold text-blue-700">
            ${typeof precio === 'number' ? precio.toFixed(2) : '0.00'}
          </span>
          <span className="text-xs text-gray-600">
            Stock: <b>{typeof stock === 'number' ? stock : 0}</b>
          </span>
        </div>
      </div>
    </div>
  );
}