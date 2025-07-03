"use client";
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
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
import { authFetch } from '@/utils/authFetch';

export interface Producto {
  id_item: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  estado: 'A' | 'I';
  fecha_y_hora: string;
  id_categoria: number;
  id_vendedor: number;
  imagen?: string;
  categoria_nombre?: string;
  vendedor_nombre?: string;
}

type ProductsTableProps = {
  onEdit: (producto: Producto) => void;
};

export function ProductsTable({ onEdit }: ProductsTableProps) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'A' | 'I' | 'ALL'>('ALL');

  const fetchProductos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      // Parámetros de búsqueda y filtrado
      params.append('es_servicio', 'false'); // Asegurar solo productos
      if (searchTerm) params.append('search', searchTerm);
      if (filterStatus !== 'ALL') params.append('estado', filterStatus);
      
      // Parámetros de paginación
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());

      const url = `https://taytaback.onrender.com/api/items?${params.toString()}`;
      console.log('[ProductsTable] Fetching products URL:', url);

      const response = await authFetch(url);
      
      console.log('[ProductsTable] Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[ProductsTable] Error response:', errorText);
        throw new Error('No se pudieron cargar los productos');
      }
      
      const data = await response.json();
      console.log('[ProductsTable] Received data:', data);
      
      // Filtrar explícitamente productos
      const productosData = (data.items || data.data || [])
        .filter((item: any) => 
          item.es_servicio === false || 
          item.es_servicio === 'false' || 
          item.es_servicio === 0
        )
        .map((producto: any) => ({
          ...producto,
          imagen: producto.imagen || producto.url_img || producto.image
        }));
      
      // Actualizar productos y paginación
      setProductos(productosData);
      setPagination(prev => ({
        ...prev,
        total: data.pagination?.total || data.total || 0,
        totalPages: data.pagination?.totalPages || data.totalPages || 1,
      }));
    } catch (error) {
      console.error('Error al cargar productos:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los productos',
        variant: 'destructive'
      });
      setProductos([]); // Asegurar que productos sea un array vacío
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, [pagination.page, pagination.limit, searchTerm, filterStatus]);

  const handleDelete = async (id: number) => {
    try {
      const confirmDelete = window.confirm('¿Está seguro de desactivar este producto?');
      
      if (!confirmDelete) return;

      const response = await authFetch(`https://taytaback.onrender.com/api/items/${id}`, { method: 'DELETE' });
      
      if (!response.ok) {
        throw new Error('No se pudo desactivar el producto');
      }
      
      fetchProductos();
      toast({
        title: 'Producto desactivado',
        description: 'El producto ha sido desactivado correctamente',
      });
    } catch (error) {
      console.error('Error al desactivar producto:', error);
      toast({
        title: 'Error',
        description: 'No se pudo desactivar el producto',
        variant: 'destructive'
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl shadow-lg border border-yellow-700/10">
      <div className="p-4 flex justify-between items-center border-b border-gray-800">
        <div className="flex space-x-2">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Buscar productos..." 
              className="pl-10 pr-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              className={`${filterStatus === 'ALL' ? 'bg-yellow-600 text-white' : 'text-gray-400'}`}
              onClick={() => setFilterStatus('ALL')}
            >
              <Filter className="h-5 w-5" />
            </Button>
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
              <th className="px-4 py-3 text-center">Stock</th>
              <th className="px-4 py-3 text-center">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-400">
                  Cargando productos...
                </td>
              </tr>
            ) : productos.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-400">
                  No se encontraron productos
                </td>
              </tr>
            ) : (
              productos.map((producto) => (
                <tr key={producto.id_item} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-700 flex items-center justify-center">
                      {producto.imagen ? (
                        <AuthImage
                          src={`${process.env.NEXT_PUBLIC_API_URL || 'https://taytaback.onrender.com'}/api/uploads/item_imgs/${producto.imagen}`}
                          alt={producto.nombre}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('Error cargando imagen:', producto.imagen);
                            e.currentTarget.src = '/default-product.jpg'; // Imagen de respaldo
                          }}
                        />
                      ) : (
                        <ImageOff className="h-5 w-5 text-gray-300" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-white">{producto.nombre}</div>
                    <div className="text-xs text-gray-400 line-clamp-1">{producto.descripcion}</div>
                  </td>
                  <td className="px-4 py-3 text-yellow-400">S/ {producto.precio.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">
                    <span 
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        producto.stock > 10 
                          ? 'bg-green-600/20 text-green-400' 
                          : producto.stock > 0 
                            ? 'bg-yellow-600/20 text-yellow-400' 
                            : 'bg-red-600/20 text-red-400'
                      }`}
                    >
                      {producto.stock} en stock
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span 
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        producto.estado === 'A' 
                          ? 'bg-green-600/20 text-green-400' 
                          : 'bg-red-600/20 text-red-400'
                      }`}
                    >
                      {producto.estado === 'A' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="text-yellow-500 hover:bg-yellow-500/10"
                        onClick={() => onEdit(producto)}
                      >
                        <Edit2 className="h-5 w-5" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="text-red-500 hover:bg-red-500/10"
                        onClick={() => handleDelete(producto.id_item)}
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

      <div className="flex justify-between items-center p-4 border-t border-gray-800">
        <div className="text-sm text-gray-400">
          Mostrando {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, productos.length)} de {pagination.total} productos
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            disabled={pagination.page === 1}
            onClick={() => handlePageChange(pagination.page - 1)}
            className="text-gray-300 hover:text-white disabled:opacity-50"
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            disabled={pagination.page === pagination.totalPages}
            onClick={() => handlePageChange(pagination.page + 1)}
            className="text-gray-300 hover:text-white disabled:opacity-50"
          >
            Siguiente <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
