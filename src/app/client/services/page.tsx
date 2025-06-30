// app/client/services/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { ProductoService } from '@/features/productos/services/ProductoService';
import { ServiceCategoryFilter } from '@/components/client/service/ServiceCategoryFilter';
import { Search } from 'lucide-react';
import axios from 'axios';
import { BasicUser } from '@/types';
import ProductoCard from '@/components/client/products/ProductoCard';
import { useAddToCart } from '@/hooks/useAddToCart';

const getToken = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth-token') || '';
  }
  return '';
};

const headers = () => ({
  headers: { Authorization: `Bearer ${getToken()}` }
});

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { addToCart, adding } = useAddToCart();

  useEffect(() => {
    const cargarServicios = async () => {
      try {
        const [serviciosData, categoriasDataRaw] = await Promise.all([
          ProductoService.getProductosCompletos(),
          ProductoService.getCategorias()
        ]);
        const categoriasData = categoriasDataRaw as any[];
        
        // Obtener IDs únicos de vendedores
        const vendedoresIds = [...new Set(serviciosData
          .filter((item: any) => item.es_servicio)
          .map((item: any) => item.id_vendedor))];

        // Obtener información de vendedores
        const vendedoresPromises = vendedoresIds.map(id =>
          axios.get<BasicUser>(`${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/${id}`, headers()).then(res => res.data)
        );
        const vendedores = await Promise.all(vendedoresPromises);
        
        // Filtrar solo servicios y formatear con información completa
        const serviciosFormateados = serviciosData
          .filter((servicio: any) => servicio.es_servicio)
          .map((servicio: any) => {
            const vendedor = vendedores.find((v: BasicUser) => v.id_usuario === servicio.id_vendedor);
            return {
              ...servicio,
              imagen: servicio.url_img || servicio.imagen,
              categoryName: categoriasData.find((cat: any) => cat.id_categoria === servicio.id_categoria)?.nombre || 'Sin categoría',
              vendedor: vendedor ? {
                id_usuario: vendedor.id_usuario,
                nombres: vendedor.nombres,
                apellidos: vendedor.apellidos,
                url_img: vendedor.url_img
              } : null
            };
          });

        setServices(serviciosFormateados);
        setError(null);
      } catch (error) {
        console.error('Error cargando servicios:', error);
        setError('Error al cargar los servicios');
      } finally {
        setLoading(false);
      }
    };
    cargarServicios();
  }, []);

  // Filtrar servicios basado en búsqueda y categoría
  const filteredServices = services.filter(service => {
    const matchesSearch = service.nombre.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.id_categoria.toString() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nuestros Servicios</h1>
          <p className="text-gray-600 mt-2">
            Mostrando {filteredServices.length} de {services.length} servicios
          </p>
        </div>

        <div className="relative w-full md:w-96 mt-4 md:mt-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar servicios..."
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ServiceCategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">
          {error} - Intenta recargar la página
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {filteredServices.map((service) => (
              <ProductoCard
                key={service.id_item}
                producto={{
                  id_item: service.id_item,
                  nombre: service.nombre || 'Servicio sin nombre',
                  descripcion: service.descripcion || 'Sin descripción',
                  precio: service.precio || 0,
                  estado: service.estado || 'A',
                  categoria: service.categoryName || 'Sin categoría',
                  vendedor: service.vendedor || null,
                  url_img: service.imagen || service.url_img || '',
                  es_servicio: true,
                  rating: 4.5
                }}
                onDelete={(id: number) => {
                  setServices((prev) => prev.filter((s) => s.id_item !== id));
                }}
                onAddToCart={() => addToCart(service, 1)}
              />
            ))}
          </div>

          {filteredServices.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900">
                No se encontraron servicios
              </h3>
              <p className="mt-2 text-gray-500">
                Intenta con otra categoría o término de búsqueda
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}