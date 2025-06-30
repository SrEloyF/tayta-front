'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '../../ui/Button';
import { Edit, Trash2, User, Calendar, Tag as TagIcon } from 'lucide-react';

// Tipos de datos
interface Vendedor {
  id_usuario?: number;
  nombres?: string;
  apellidos?: string;
  email?: string;
  telefono?: string;
  url_img?: string;
}

interface Categoria {
  id_categoria?: number;
  nombre?: string;
  descripcion?: string;
}

interface ServiceCardProps {
  service: {
    id_item: number;
    id_producto?: number;
    nombre: string;
    descripcion: string;
    precio: number;
    categoria: Categoria | string | null;
    vendedor: Vendedor | string | null;
    estado: 'A' | 'I' | string;
    fecha_y_hora: string;
    es_servicio: boolean;
    imagen?: string;
    imagen_url?: string;
  };
  onDelete?: (id: number) => void;
}

export const ServiceCard = ({ service, onDelete }: ServiceCardProps) => {
  const [imageError, setImageError] = useState(false);

  // Obtener nombre de categoría
  const getCategoriaNombre = () => {
    if (!service.categoria) return 'Sin categoría';
    if (typeof service.categoria === 'string') return service.categoria;
    return service.categoria.nombre || 'Sin categoría';
  };

  // Obtener nombre del vendedor
  const getVendedorNombre = () => {
    if (!service.vendedor) return 'Vendedor no disponible';
    if (typeof service.vendedor === 'string') return service.vendedor;
    return `${service.vendedor.nombres || ''} ${service.vendedor.apellidos || ''}`.trim() || 
           `Vendedor #${service.vendedor.id_usuario || 'N/A'}`;
  };

  // Obtener imagen del vendedor
  const getVendedorImagen = () => {
    if (!service.vendedor || typeof service.vendedor === 'string') return '/avatar.png';
    return service.vendedor.url_img || '/avatar.png';
  };

  const estadoTexto = service.estado === 'A' ? 'Disponible' : 'No disponible';
  const fechaPublicacion = new Date(service.fecha_y_hora).toLocaleDateString();

  return (
    <div className="group relative bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
      {/* Etiqueta de estado */}
      <div className="absolute top-4 right-4 z-10">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide shadow-md backdrop-blur-sm
          ${service.estado === 'A' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}
        >
          {estadoTexto}
        </span>
      </div>

      {/* Imagen del servicio */}
      <div className="relative h-48 md:h-56 overflow-hidden flex items-center justify-center bg-gradient-to-t from-gray-200 to-white dark:from-gray-800 dark:to-gray-900">
        {service.imagen_url || service.imagen ? (
          <img
            src={`/api/uploads/item_imgs/${service.imagen_url || service.imagen}`}
            alt={service.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-t-2xl"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="text-gray-400 flex flex-col items-center">
            <span className="text-4xl mb-2">📷</span>
            <span className="text-sm">Sin imagen</span>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 truncate" title={service.nombre}>
          {service.nombre}
        </h3>
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-extrabold text-blue-700 dark:text-blue-400">
            ${service.precio.toFixed(2)}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-300 font-semibold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
            Servicio
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
            <TagIcon className="w-4 h-4 text-gray-400" />
            <span className="truncate" title={getCategoriaNombre()}>
              {getCategoriaNombre()}
            </span>
          </div>
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="truncate" title={fechaPublicacion}>
              {fechaPublicacion}
            </span>
          </div>
          <div className="flex items-center gap-1 col-span-2">
            <div className="flex items-center gap-2">
              <img 
                src={getVendedorImagen()} 
                alt={getVendedorNombre()}
                className="w-5 h-5 rounded-full object-cover border border-gray-200"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/avatar.png';
                }}
              />
              <span className="truncate text-gray-600 dark:text-gray-300 text-sm" title={getVendedorNombre()}>
                {getVendedorNombre()}
              </span>
            </div>
          </div>
        </div>
        
        <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2 mb-4" title={service.descripcion}>
          {service.descripcion}
        </p>

        <div className="mt-auto flex gap-2">
          <Link
            href={`/client/VenderProductos/EditarServicio/${service.id_item || service.id_producto}`}
            className="flex-1"
          >
            <Button variant="outline" className="w-full flex items-center justify-center gap-2 border-blue-500 text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20">
              <Edit className="w-4 h-4" />
              Editar
            </Button>
          </Link>
          <Button
            variant="destructive"
            className="flex-1 flex items-center justify-center gap-2"
            onClick={() => onDelete && onDelete(service.id_item || service.id_producto || 0)}
          >
            <Trash2 className="w-4 h-4" />
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  );
};