"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { 
  Edit2, 
  Trash2, 
  Filter, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  ImageOff
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { AuthImage } from '@/components/ui/AuthImage';
import { authFetch } from "@/utils/authFetch";

export interface Servicio {
  id_item: number;
  nombre: string;
  descripcion: string;
  precio: number;
  estado: 'A' | 'I';
  fecha_y_hora: string;
  id_categoria: number;
  id_vendedor: number;
  imagen?: string;
  categoria_nombre?: string;
  vendedor_nombre?: string;
}

type ServicesTableProps = {
  onEdit: (servicio: Servicio) => void;
  onDelete: (id: number) => void;
  searchTerm?: string;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onTotalPagesChange?: (pages: number) => void;
};

export function ServicesTable({ 
  onEdit, 
  onDelete, 
  searchTerm = '', 
  currentPage = 1,
  onPageChange,
  onTotalPagesChange 
}: ServicesTableProps) {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [localPage, setLocalPage] = useState(currentPage);
  const [totalPages, setTotalPages] = useState(1);

  const fetchServicios = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        es_servicio: 'true',
        page: localPage.toString(),
        search: localSearchTerm
      });
      const res = await authFetch(`/api/items?${params.toString()}`);
      
      if (!res.ok) {
        throw new Error(`Error ${res.status}: No se pudieron cargar los servicios`);
      }
      
      const data = await res.json();
      
      // Filtrar explícitamente servicios
      const serviciosConImagen = (data.items || data.data || [])
        .filter((item: any) => 
          item.es_servicio === true || 
          item.es_servicio === 'true' || 
          item.es_servicio === 1
        )
        .map((servicio: any) => ({
          ...servicio,
          imagen: servicio.imagen || servicio.url_img || servicio.image
        }));
      
      setServicios(serviciosConImagen);
      
      // Actualizar total de páginas
      const totalPagesFromResponse = data.pagination?.totalPages || data.totalPages || 1;
      setTotalPages(totalPagesFromResponse);
      
      // Llamar al callback de cambio de páginas si está definido
      if (onTotalPagesChange) {
        onTotalPagesChange(totalPagesFromResponse);
      }
    } catch (err) {
      console.error("Error al cargar servicios:", err);
      setError("No se pudieron cargar los servicios. Intenta recargar la página.");
      setServicios([]);
      
      // Establecer 1 página por defecto si hay un error
      setTotalPages(1);
      if (onTotalPagesChange) {
        onTotalPagesChange(1);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicios();
  }, [localSearchTerm, localPage]);

  // Manejar cambios en la búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setLocalSearchTerm(newSearchTerm);
    setLocalPage(1); // Reiniciar a la primera página
    
    // Llamar al callback de cambio de página si está definido
    if (onPageChange) {
      onPageChange(1);
    }
  };

  // Manejar cambios de página
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setLocalPage(newPage);
      if (onPageChange) {
        onPageChange(newPage);
      }
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl shadow-lg border border-yellow-700/10">
      <div className="p-4 flex justify-between items-center border-b border-gray-800">
        <div className="flex space-x-2 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar servicios..." 
              className="pl-10 pr-4 py-2 bg-gray-800 text-white rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-yellow-600"
              value={localSearchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th className="px-4 py-3 text-left">Imagen</th>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">Precio</th>
              <th className="px-4 py-3 text-center">Categoría</th>
              <th className="px-4 py-3 text-center">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-400">
                  Cargando servicios...
                </td>
              </tr>
            ) : servicios.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-400">
                  No se encontraron servicios
                </td>
              </tr>
            ) : (
              servicios.map((servicio) => (
                <tr key={servicio.id_item} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-700 flex items-center justify-center">
                      {servicio.imagen ? (
                        <AuthImage
                          src={`${process.env.NEXT_PUBLIC_API_URL || 'https://taytaback.onrender.com'}/api/uploads/item_imgs/${servicio.imagen}`}
                          alt={servicio.nombre}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('Error cargando imagen:', servicio.imagen);
                            e.currentTarget.src = '/default-product.jpg'; // Imagen de respaldo
                          }}
                        />
                      ) : (
                        <ImageOff className="h-5 w-5 text-gray-300" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-white">{servicio.nombre}</div>
                    <div className="text-xs text-gray-400 line-clamp-1">{servicio.descripcion}</div>
                  </td>
                  <td className="px-4 py-3 text-yellow-400">S/ {servicio.precio.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-600/20 text-blue-400">
                      {servicio.categoria_nombre || 'Sin categoría'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span 
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        servicio.estado === 'A' 
                          ? 'bg-green-600/20 text-green-400' 
                          : 'bg-red-600/20 text-red-400'
                      }`}
                    >
                      {servicio.estado === 'A' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="text-yellow-500 hover:bg-yellow-500/10"
                        onClick={() => onEdit(servicio)}
                      >
                        <Edit2 className="h-5 w-5" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="text-red-500 hover:bg-red-500/10"
                        onClick={() => onDelete(servicio.id_item)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center p-4 border-t border-gray-800">
          <div className="text-sm text-gray-400">
            Mostrando {(localPage - 1) * 10 + 1} - {Math.min(localPage * 10, servicios.length)} de {servicios.length} servicios
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              disabled={localPage === 1}
              onClick={() => handlePageChange(localPage - 1)}
              className="text-gray-300 hover:text-white disabled:opacity-50"
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              disabled={localPage === totalPages}
              onClick={() => handlePageChange(localPage + 1)}
              className="text-gray-300 hover:text-white disabled:opacity-50"
            >
              Siguiente <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
