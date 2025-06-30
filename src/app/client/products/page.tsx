'use client';
import { useEffect, useState } from 'react';
import { ProductoService } from '@/features/productos/services/ProductoService';
import ProductoCard from '@/components/client/products/ProductoCard';
import api from '@/features/auth/api';
import { BasicUser } from '@/types';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Plus } from 'lucide-react';
import { ProductFilter } from '@/components/client/products/ProductFilter';

export default function ProductsPage() {
  const [productos, setProductos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<BasicUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortOption, setSortOption] = useState('featured');

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [productosData, categoriasDataRaw, usuariosData] = await Promise.all([
          ProductoService.getProductosCompletos(),
          ProductoService.getCategorias(),
          api.get<BasicUser[]>('/usuarios').then(res => res.data),
        ]);
        const categoriasData = categoriasDataRaw as any[];

        // Filtrar solo productos (es_servicio = false) y luego formatear
        const productosFormateados = productosData
          .filter((producto: any) => !producto.es_servicio)
          .map((producto: any) => ({
            ...producto,
            categoria: categoriasData.find((cat: any) => cat.id_categoria === producto.id_categoria)?.nombre || 'Sin categoría',
            stock: producto.stock ?? 0,
            vendedor: usuariosData.find((u: BasicUser) => u.id_usuario === producto.id_vendedor) || null,
          }));

        setProductos(productosFormateados);
        setCategorias(categoriasData);
        setUsuarios(usuariosData);
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  const filteredProducts = productos.filter(producto => {
    const matchesSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || producto.id_categoria.toString() === selectedCategory;
    const matchesPrice = producto.precio >= priceRange[0] && producto.precio <= priceRange[1];
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOption === 'price-low') return a.precio - b.precio;
    if (sortOption === 'price-high') return b.precio - a.precio;
    if (sortOption === 'rating') return b.rating - a.rating;
    return 0;
  });

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await ProductoService.deleteProducto(id);
        setProductos(productos.filter(p => p.id_producto !== id));
      } catch (error) {
        console.error('Error eliminando producto:', error);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nuestros Productos</h1>
          <p className="text-gray-600 mt-2">
            Mostrando {sortedProducts.length} de {productos.length} productos
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar productos..."
              className="pl-10 pr-4 py-2 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="featured">Destacados</option>
            <option value="price-low">Precio: menor a mayor</option>
            <option value="price-high">Precio: mayor a menor</option>
            <option value="rating">Mejor valorados</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <ProductFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            priceRange={priceRange}
            onPriceChange={setPriceRange}
            categories={categorias.map(cat => cat.nombre)}
          />
        </div>
        
        <div className="lg:col-span-3">
          {sortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProducts.map(producto => (
                <ProductoCard 
                  key={producto.id_producto}
                  producto={producto}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
              <div className="text-center max-w-md">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No se encontraron resultados' : 'No hay productos disponibles'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm 
                    ? 'Intenta con otro término de búsqueda' 
                    : 'Prueba ajustando los filtros'}
                </p>
                <Link href="/client/VenderProductos/AgregarProducto">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Producto
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}