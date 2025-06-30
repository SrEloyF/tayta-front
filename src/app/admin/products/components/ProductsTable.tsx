"use client";
import { Button } from "@/components/ui/Button";
import { Edit, Trash2, ImageOff } from "lucide-react";
import { authFetch } from "@/utils/authFetch";
import { useEffect, useState } from "react";
import { AuthImage } from "@/components/ui/AuthImage";

export interface Producto {
  id_item: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  estado: string;
  fecha_y_hora: string;
  id_categoria: number;
  id_vendedor: number;
  imagen?: string;
  categoria_nombre?: string;
  vendedor_nombre?: string;
}

interface ProductsTableProps {
  onEdit: (producto: Producto) => void;
  onDelete: (id: number) => void;
}

export const ProductsTable: React.FC<ProductsTableProps> = ({ onEdit, onDelete }) => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductos = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Obteniendo lista de productos...');
      const res = await authFetch("/api/items?es_servicio=false");
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Error al obtener productos:', errorText);
        throw new Error(`Error ${res.status}: No se pudieron cargar los productos`);
      }
      const data = await res.json();
      console.log('Productos recibidos:', data);
      const productosData = Array.isArray(data) ? data : data.data || [];
      // Verificar si los productos tienen el campo imagen
      productosData.forEach((prod: any) => {
        console.log(`Producto ID ${prod.id_item}:`, {
          nombre: prod.nombre,
          tieneImagen: !!prod.imagen,
          tipoImagen: typeof prod.imagen,
          valorImagen: prod.imagen,
          urlCompleta: prod.imagen ? 
            `${process.env.NEXT_PUBLIC_API_URL || 'https://taytaback.onrender.com'}/api/uploads/item_imgs/${prod.imagen}` : 
            null
        });
      });
      
      setProductos(productosData);
    } catch (err) {
      console.error("Error al cargar productos:", err);
      setError("No se pudieron cargar los productos. Intenta recargar la página.");
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
      <span className="ml-3 text-gray-400">Cargando productos...</span>
    </div>
  );
  
  if (error) return (
    <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4 text-center">
      <p className="text-red-400">{error}</p>
      <Button 
        variant="outline" 
        size="sm" 
        className="mt-2"
        onClick={fetchProductos}
      >
        Reintentar
      </Button>
    </div>
  );
  
  if (!productos.length) return (
    <div className="text-center p-8 bg-gray-900/50 rounded-lg border border-dashed border-gray-800">
      <p className="text-gray-400">No hay productos registrados.</p>
      <p className="text-sm text-gray-500 mt-1">Crea tu primer producto para comenzar</p>
    </div>
  );

  return (
    <div className="bg-gray-900/50 rounded-xl overflow-hidden shadow-lg border border-gray-800/50">
      <div className="px-6 py-4 border-b border-gray-800/50">
        <h2 className="text-lg font-semibold text-yellow-400">Productos</h2>
        <p className="text-sm text-gray-400">Gestiona los productos de tu catálogo</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900/30">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Imagen</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Producto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Precio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Categoría</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {productos.map((prod) => (
              <tr 
                key={prod.id_item} 
                className="hover:bg-gray-900/30 transition-colors"
              >
                {/* Columna de Imagen */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex-shrink-0 h-10 w-10 rounded-md overflow-hidden bg-gray-800/50 flex items-center justify-center">
                    {prod.imagen ? (
                      <>
                        {console.log('URL de la imagen:', `${process.env.NEXT_PUBLIC_API_URL}/api/uploads/item_imgs/${prod.imagen}`)}
                        <div className="relative">
                          <div className="absolute -top-6 -left-2 bg-black bg-opacity-75 text-white text-xs p-1 rounded">
                            ID: {prod.id_item}
                          </div>
                          <AuthImage
                            src={`${process.env.NEXT_PUBLIC_API_URL || 'https://taytaback.onrender.com'}/api/uploads/item_imgs/${prod.imagen}`}
                            alt={prod.nombre}
                            width={40}
                            height={40}
                            className="h-10 w-10 object-cover border border-gray-700"
                          />
                        </div>
                      </>
                    ) : (
                      <ImageOff className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </td>
                
                {/* Columna de Nombre y Descripción */}
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-200">{prod.nombre}</div>
                  <div className="text-xs text-gray-400 line-clamp-2">
                    {prod.descripcion}
                  </div>
                </td>
                
                {/* Precio */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-yellow-400 font-medium">
                    S/ {Number(prod.precio).toFixed(2)}
                  </div>
                </td>
                
                {/* Stock */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    prod.stock > 10 ? 'bg-green-900/30 text-green-400' : 
                    prod.stock > 0 ? 'bg-yellow-900/30 text-yellow-400' : 
                    'bg-red-900/30 text-red-400'
                  }`}>
                    {prod.stock} en stock
                  </span>
                </td>
                
                {/* Estado */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    prod.estado === 'A' ? 'bg-green-900/30 text-green-400' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {prod.estado === 'A' ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                
                {/* Categoría */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300">
                    {prod.categoria_nombre || `ID: ${prod.id_categoria}`}
                  </div>
                </td>
                
                {/* Acciones */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onEdit(prod)}
                      className="text-gray-400 hover:text-yellow-400"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onDelete(prod.id_item)}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Eliminar</span>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Paginación (opcional) */}
      <div className="px-6 py-3 flex items-center justify-between border-t border-gray-800/50 bg-gray-900/30">
        <div className="flex-1 flex justify-between items-center">
          <div className="text-sm text-gray-400">
            Mostrando <span className="font-medium">1</span> a <span className="font-medium">{productos.length}</span> de{' '}
            <span className="font-medium">{productos.length}</span> resultados
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" disabled>
              Anterior
            </Button>
            <Button variant="outline" size="sm" disabled>
              Siguiente
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
