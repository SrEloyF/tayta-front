// app/client/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { ProductoService } from '@/features/productos/services/ProductoService';
import { ProductGrid } from '@/components/client/products/ProductGrid';
import { ServiceCarousel } from '@/components/client/service/ServiceCarousel';
import { PromoBanner } from '@/components/client/products/PromoBanner';
import axios from 'axios';
import { BasicUser } from '@/types';
import ProductoCard from '@/components/client/products/ProductoCard';
import { 
  FaShoppingCart, 
  FaServicestack, 
  FaFireAlt,
  FaBoxOpen,
  FaGift,
  FaHeart,
  FaStar,
  FaRocket
} from 'react-icons/fa';
import Link from 'next/link';

const getToken = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth-token') || '';
  }
  return '';
};

const headers = () => ({
  headers: { Authorization: `Bearer ${getToken()}` }
});

export default function ClientHomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [featuredServices, setFeaturedServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categorias, setCategorias] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [items, categoriasData] = await Promise.all([
          ProductoService.getProductosCompletos(),
          ProductoService.getCategorias()
        ]);

        setCategorias(categoriasData as any[]);

        // Obtener información de vendedores
        const vendedoresIds = [...new Set(items.map(item => item.id_vendedor))];
        const vendedoresPromises = vendedoresIds.map(id => 
          axios.get<BasicUser>(`/api/usuarios/${id}`, headers()).then(res => res.data)
        );
        const vendedores = await Promise.all(vendedoresPromises);

        // Función para obtener información del vendedor
        const getVendedorInfo = (idVendedor: number) => {
          const vendedor = vendedores.find(v => v.id_usuario === idVendedor);
          return vendedor ? {
            id_usuario: vendedor.id_usuario,
            nombres: vendedor.nombres,
            apellidos: vendedor.apellidos,
            url_img: vendedor.url_img
          } : null;
        };

        // Separar y formatear productos
        const productos = items
          .filter(item => !item.es_servicio)
          .slice(0, 6)
          .map(producto => ({
            id: producto.id_item,
            name: producto.nombre,
            price: producto.precio,
            imagen: producto.url_img || producto.imagen,
            rating: producto.rating || 4,
            stock: producto.stock || 0,
            estado: producto.estado || 'A',
            categoria: (categoriasData as { id_categoria: number; nombre: string }[])
              .find(cat => cat.id_categoria === producto.id_categoria)?.nombre || 'Sin categoría',
            vendedor: getVendedorInfo(producto.id_vendedor),
            fecha: new Date(producto.fecha_y_hora).toLocaleDateString()
          }));

        // Separar y formatear servicios
        const servicios = items
          .filter(item => item.es_servicio)
          .slice(0, 4)
          .map(servicio => ({
            id: servicio.id_item,
            name: servicio.nombre,
            price: servicio.precio,
            image: servicio.url_img || servicio.image || '/images/default-service.jpg',
            rating: servicio.rating || 5,
            description: servicio.descripcion || 'Servicio profesional',
            estado: servicio.estado || 'A',
            categoria: (categoriasData as { id_categoria: number; nombre: string }[])
              .find(cat => cat.id_categoria === servicio.id_categoria)?.nombre || 'Sin categoría',
            vendedor: getVendedorInfo(servicio.id_vendedor),
            fecha: new Date(servicio.fecha_y_hora).toLocaleDateString()
          }));

        setFeaturedProducts(productos);
        setFeaturedServices(servicios);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-white"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* Hero Section */}
        <section className="grid md:grid-cols-2 gap-12 items-center bg-white rounded-3xl shadow-2xl p-12">
          <div className="space-y-6">
            <div className="inline-flex items-center bg-blue-50 text-blue-600 px-4 py-2 rounded-full">
              <FaRocket className="mr-2" />
              <span className="font-medium">Marketplace Local</span>
            </div>
            <h1 className="text-5xl font-extrabold text-gray-900 leading-tight">
              Descubre Trujillo
              <br />
              <span className="text-blue-600">Un Mundo de Posibilidades</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Conectamos emprendedores locales con clientes apasionados. Cada compra cuenta una historia única de Trujillo.
            </p>
            <div className="flex space-x-4">
              <Link 
                href="/client/products" 
                className="bg-blue-600 text-white px-8 py-4 rounded-full hover:bg-blue-700 transition transform hover:scale-105 flex items-center"
              >
                <FaShoppingCart className="mr-2" /> Explorar Productos
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="relative">
              <div className="absolute -inset-4 bg-blue-400/10 rounded-3xl transform -rotate-6"></div>
              <img 
                src="/logo.png" 
                alt="Tayta Service" 
                className="relative z-10 rounded-3xl shadow-2xl transform hover:scale-105 transition"
              />
            </div>
          </div>
        </section>

        {/* Características */}
        <section className="grid md:grid-cols-3 gap-8">
          {[
            { 
              icon: FaBoxOpen, 
              title: "Productos Locales", 
              description: "Descubre productos únicos creados con pasión en Trujillo." 
            },
            { 
              icon: FaServicestack, 
              title: "Servicios Profesionales", 
              description: "Encuentra los mejores servicios de profesionales locales." 
            },
            { 
              icon: FaHeart, 
              title: "Apoyo Comunitario", 
              description: "Cada compra impulsa la economía local de Trujillo." 
            }
          ].map((feature, index) => (
            <div 
              key={index} 
              className="bg-white p-8 rounded-3xl shadow-lg transform transition hover:-translate-y-4 hover:shadow-2xl"
            >
              <feature.icon className="text-5xl text-blue-600 mb-6" />
              <h3 className="text-2xl font-bold mb-4 text-gray-800">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </section>

        {/* Productos Destacados */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <FaGift className="text-3xl text-blue-600" />
              <h2 className="text-3xl font-bold text-gray-800">Productos Destacados</h2>
            </div>
            <Link 
              href="/client/products" 
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              Ver más
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 ml-2" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" 
                  clipRule="evenodd" 
                />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {featuredProducts.map((producto) => (
              <ProductoCard 
                key={producto.id}
                producto={{
                  id_item: producto.id,
                  nombre: producto.name,
                  precio: producto.price,
                  url_img: producto.imagen,
                  estado: producto.estado === 'A' ? 'A' : 'I',
                  stock: producto.stock,
                  categoria: producto.categoria,
                  vendedor: producto.vendedor,
                  es_servicio: false,
                  rating: producto.rating
                }}
              />
            ))}
          </div>
        </section>

        {/* Servicios Destacados */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <FaStar className="text-3xl text-yellow-500" />
              <h2 className="text-3xl font-bold text-gray-800">Servicios Destacados</h2>
            </div>
          </div>
          
          {featuredServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredServices.map((service) => (
                <ProductoCard
                  key={service.id}
                  producto={{
                    id_item: service.id,
                    nombre: service.name || 'Servicio sin nombre',
                    descripcion: service.description || 'Sin descripción',
                    precio: service.price || 0,
                    estado: service.estado || 'A',
                    categoria: service.categoria || 'Sin categoría',
                    vendedor: service.vendedor || null,
                    url_img: service.image || service.url_img || '',
                    es_servicio: true,
                    rating: service.rating || 4.5
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No hay servicios destacados disponibles</p>
            </div>
          )}
        </section>

        {/* Testimonios */}
        <section className="bg-white rounded-3xl shadow-2xl p-12">
          <div className="text-center mb-12">
            <FaFireAlt className="mx-auto text-5xl text-red-500 mb-4" />
            <h2 className="text-4xl font-bold text-gray-800">Historias de Éxito</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mt-4">
              Descubre cómo Tayta Service está transformando vidas y negocios en Trujillo.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "María Rodríguez",
                role: "Emprendedora",
                quote: "Tayta Service me ayudó a expandir mi negocio local más allá de mis expectativas.",
                rating: 5
              },
              {
                name: "Carlos Mendoza",
                role: "Cliente",
                quote: "Encontré servicios increíbles de profesionales locales. ¡La plataforma es fácil de usar!",
                rating: 5
              },
              {
                name: "Ana Sánchez",
                role: "Comerciante",
                quote: "Gracias a Tayta Service, mi negocio ha crecido exponencialmente.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div 
                key={index} 
                className="bg-gray-50 p-8 rounded-3xl shadow-md transform transition hover:-translate-y-4"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg 
                      key={i} 
                      className="w-6 h-6 text-yellow-400" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic text-xl">{testimonial.quote}</p>
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-blue-100 mr-4 flex items-center justify-center text-blue-600 font-bold text-xl">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-lg">{testimonial.name}</p>
                    <p className="text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}