"use client";
import { useEffect, useState } from 'react';
import { ProductoService } from '@/features/productos/services/ProductoService';
import ProductoCard from '@/components/client/products/ProductoCard';
import api from '@/features/auth/api';
import { BasicUser } from '@/types';
import Link from 'next/link';
import { 
  FaShoppingCart, 
  FaHandshake, 
  FaMapMarkerAlt, 
  FaStore, 
  FaHeart, 
  FaUsers,
  FaRocket,
  FaGlobe,
  FaLightbulb
} from 'react-icons/fa';

const FeatureCard = ({ 
  Icon, 
  title, 
  description 
}: { 
  Icon: React.ElementType, 
  title: string, 
  description: string 
}) => (
  <div className="group bg-white border border-gray-200 rounded-2xl p-6 transform transition hover:-translate-y-2 hover:shadow-2xl hover:border-blue-500">
    <div className="flex items-center mb-4">
      <Icon className="text-4xl text-blue-600 mr-4 group-hover:text-blue-700 transition" />
      <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-800 transition">{title}</h3>
    </div>
    <p className="text-gray-600 group-hover:text-gray-800 transition">{description}</p>
  </div>
);

export default function Home() {
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [productosData, categoriasDataRaw, usuariosData] = await Promise.all([
          ProductoService.getProductosCompletos(),
          ProductoService.getCategorias(),
          api.get<BasicUser[]>('/usuarios').then(res => res.data),
        ]);
        const categoriasData = categoriasDataRaw as any[];

        const productosFormateados = productosData
          .filter((producto: any) => !producto.es_servicio)
          .map((producto: any) => ({
            ...producto,
            categoria: categoriasData.find((cat: any) => cat.id_categoria === producto.id_categoria)?.nombre || 'Sin categoría',
            stock: producto.stock ?? 0,
            vendedor: usuariosData.find((u: BasicUser) => u.id_usuario === producto.id_vendedor) || null,
          }));

        setProductos(productosFormateados);
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-800 via-purple-700 to-pink-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        <div className="container mx-auto px-4 py-24 grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-8">
            <div className="inline-block bg-white/20 px-4 py-2 rounded-full">
              <span className="text-white font-medium tracking-wider uppercase text-sm">Marketplace de Trujillo</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
              Tayta Service
              <br />
              <span className="text-yellow-300">Conecta. Crece. Comparte.</span>
            </h1>
            <p className="text-xl text-white/90 max-w-xl leading-relaxed">
              Transformamos la economía local de Trujillo, conectando emprendedores apasionados con clientes que valoran lo auténtico.
            </p>
            <div className="flex space-x-4">
              <Link 
                href="/client/products" 
                className="bg-white text-blue-800 hover:bg-blue-50 px-8 py-4 rounded-full font-bold shadow-lg transition transform hover:scale-105 flex items-center"
              >
                <FaShoppingCart className="mr-2" /> Explorar Productos
              </Link>
            </div>
          </div>
          <div className="hidden md:flex justify-center">
            <div className="bg-white/10 p-8 rounded-2xl">
              <img 
                src="/logo.png" 
                alt="Tayta Service Logo" 
                className="w-full max-w-md rounded-xl shadow-2xl transform hover:scale-110 transition"
              />
            </div>
          </div>
        </div>
        <svg 
          className="absolute bottom-0 left-0 w-full text-white" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1440 320"
        >
          <path 
            fill="currentColor" 
            fillOpacity="1" 
            d="M0,256L48,250.7C96,245,192,235,288,208C384,181,480,139,576,138.7C672,139,768,181,864,197.3C960,213,1056,203,1152,181.3C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320L192,320L96,320L0,320Z"
          ></path>
        </svg>
      </div>

      {/* Características */}
      <div className="container mx-auto px-4 -mt-16 mb-16 relative z-20">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard 
            Icon={FaRocket}
            title="Impulso Local"
            description="Potenciamos el crecimiento de emprendedores de Trujillo con tecnología innovadora."
          />
          <FeatureCard 
            Icon={FaGlobe}
            title="Conexión Global"
            description="Llevamos los productos y servicios de Trujillo más allá de las fronteras locales."
          />
          <FeatureCard 
            Icon={FaLightbulb}
            title="Innovación Constante"
            description="Creamos soluciones que transforman la forma de hacer negocios en nuestra ciudad."
          />
        </div>
      </div>

      {/* Productos Destacados */}
      <div className="container mx-auto p-4 py-16 bg-white rounded-2xl shadow-lg">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Productos Destacados</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Descubre una selección única de productos locales, cada uno con una historia de emprendimiento.
          </p>
        </div>
        
        {productos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {productos.slice(0, 8).map(producto => (
              <ProductoCard 
                key={producto.id_item} 
                producto={producto} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500">
            No hay productos disponibles
          </div>
        )}

        {productos.length > 8 && (
          <div className="text-center mt-12">
            <Link 
              href="/client/products" 
              className="bg-blue-600 text-white px-10 py-4 rounded-full hover:bg-blue-700 transition transform hover:scale-105 shadow-lg flex items-center justify-center max-w-xs mx-auto"
            >
              <FaShoppingCart className="mr-2" /> Ver Más Productos
            </Link>
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 mt-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Tu Negocio, Nuestra Plataforma</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Transforma tu emprendimiento. Únete a Tayta Service y lleva tu negocio al siguiente nivel.
          </p>
          <div className="flex justify-center space-x-4">
            <Link 
              href="/auth/register" 
              className="bg-white text-blue-700 px-10 py-4 rounded-full font-bold hover:bg-blue-50 transition transform hover:scale-105 flex items-center"
            >
              <FaHandshake className="mr-2" /> Registrarse
            </Link>
          </div>
        </div>
      </div>

      {/* Estilo personalizado */}
      <style jsx global>{`
        .bg-pattern {
          background-image: 
            linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%), 
            linear-gradient(-45deg, rgba(255,255,255,0.1) 25%, transparent 25%);
          background-size: 50px 50px;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
      `}</style>
    </div>
  );
}
