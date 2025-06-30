'use client';
import { useEffect, useState } from 'react';
import { ProductoService } from '@/features/productos/services/ProductoService';
import ProductoCard from '@/components/client/products/ProductoCard';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Plus } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

export default function VenderProductos() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all'); // 'all', 'products', 'services'
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortOption, setSortOption] = useState('featured');

  useEffect(() => {
    const cargarDatos = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const [itemsData, categoriasDataRaw] = await Promise.all([
          ProductoService.getProductosCompletos(),
          ProductoService.getCategorias()
        ]);
        const categoriasData = categoriasDataRaw as any[];
        
        const itemsDelUsuario = itemsData.filter((item: any) => item.id_vendedor === Number(user.id));

        const itemsFormateados = itemsDelUsuario.map((item: any) => ({
          ...item,
          categoryName: categoriasData.find((cat: any) => cat.id_categoria === item.id_categoria)?.nombre || 'Sin categoría'
        }));

        setItems(itemsFormateados);
        setCategorias(categoriasData);
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, [user]);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.id_categoria.toString() === selectedCategory;
    const matchesType = selectedType === 'all' || 
      (selectedType === 'products' && !item.es_servicio) || 
      (selectedType === 'services' && item.es_servicio);
    const matchesPrice = item.precio >= priceRange[0] && item.precio <= priceRange[1];
    
    return matchesSearch && matchesCategory && matchesType && matchesPrice;
  }).sort((a, b) => {
    if (sortOption === 'price-low') return a.precio - b.precio;
    if (sortOption === 'price-high') return b.precio - a.precio;
    return 0;
  });

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este item?')) {
      try {
        await ProductoService.deleteProducto(id);
        setItems(items.filter(p => p.id_producto !== id));
      } catch (error) {
        console.error('Error eliminando item:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>Debes iniciar sesión para ver tus productos</p>
        <Link href="/auth/login">
          <Button>Iniciar Sesión</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mis Productos y Servicios</h1>
          <p className="text-gray-600">
            {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} registrados
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar..."
              className="pl-10 pr-4 py-2 w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border rounded-md p-2"
          >
            <option value="all">Todos los tipos</option>
            <option value="products">Solo Productos</option>
            <option value="services">Solo Servicios</option>
          </select>

          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="border rounded-md p-2"
          >
            <option value="featured">Destacados</option>
            <option value="price-low">Precio: Menor a Mayor</option>
            <option value="price-high">Precio: Mayor a Menor</option>
          </select>

          <Link href="/client/VenderProductos/AgregarProducto" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Item
            </Button>
          </Link>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Categorías</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="all">Todas las categorías</option>
            {categorias.map(categoria => (
              <option key={categoria.id_categoria} value={categoria.id_categoria}>
                {categoria.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Rango de precios</label>
          <div className="mt-1 flex gap-2">
            <Input
              type="number"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
              className="w-1/2"
            />
            <Input
              type="number"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
              className="w-1/2"
            />
          </div>
        </div>
      </div>

      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <ProductoCard 
              key={item.id_producto} 
              producto={{
                ...item,
                categoria: item.categoryName
              }} 
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
          <div className="text-center max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No se encontraron resultados' : 'No tienes items registrados'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? 'Intenta con otro término de búsqueda' 
                : 'Comienza agregando tu primer producto o servicio'}
            </p>
            <Link href="/client/VenderProductos/AgregarProducto">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Agregar Item
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}