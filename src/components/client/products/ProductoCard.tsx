'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Package, Tag, Star, Eye, ShoppingBag, Sparkles } from 'lucide-react';
import { ImageWithAuth } from '@/components/ui/ImageWithAuth';
import { useRouter } from 'next/navigation';

import { BasicUser } from '@/types';

interface Vendedor {
  id_usuario?: number;
  nombres?: string;
  apellidos?: string;
  email?: string;
  telefono?: string;
  url_img?: string;
  rating?: number;
}

interface Categoria {
  id_categoria?: number;
  nombre?: string;
  descripcion?: string;
}

interface ProductoCardProps {
  producto: {
    id_item?: number;
    id_producto?: number;
    nombre?: string;
    descripcion?: string;
    precio?: number;
    estado?: 'A' | 'I' | string;
    stock?: number;
    image?: string;
    url_img?: string;
    categoria?: Categoria | string | null;
    rating?: number;
    id_vendedor?: number;
    vendedor?: Vendedor | string | null;
    fecha_creacion?: string;
    fecha_actualizacion?: string;
    es_servicio?: boolean;
  };
  onDelete?: (id: number) => void;
}

const ProductoCard: React.FC<ProductoCardProps> = ({ producto, onDelete }) => {
  const router = useRouter();

  // Manejar caso cuando producto es undefined o tiene datos incompletos
  if (!producto) {
    return (
      <div className="border rounded-xl p-4 shadow-md bg-gray-100 animate-pulse h-72" />
    );
  }

  // Valores por defecto
  const {
    id_item = 0,
    id_producto = 0,
    nombre = 'Producto sin nombre',
    descripcion = 'Sin descripción disponible',
    precio = 0,
    categoria = { nombre: 'Sin categoría' },
    vendedor = null,
    estado = 'I',
    stock = 0,
    rating = 4.5,
    es_servicio = false
  } = producto;

  // Obtener nombre de categoría
  const getCategoriaNombre = () => {
    if (!categoria) return 'Sin categoría';
    if (typeof categoria === 'string') return categoria;
    return categoria.nombre || 'Sin categoría';
  };

  // Obtener nombre del vendedor
  const getVendedorNombre = () => {
    if (!vendedor) return 'Vendedor no disponible';
    if (typeof vendedor === 'string') return vendedor;
    return `${vendedor.nombres || ''} ${vendedor.apellidos || ''}`.trim() || 
           `Vendedor #${vendedor.id_usuario || 'N/A'}`;
  };

  // Obtener imagen del vendedor
  const getVendedorImagen = () => {
    if (!vendedor) return '/avatar.png';
    if (typeof vendedor === 'string') return '/avatar.png';
    return vendedor.url_img ? `user_imgs/${vendedor.url_img}` : '/avatar.png';
  };

  const estadoTexto = estado === 'A' ? 
    (es_servicio ? 'Servicio disponible' : 'Disponible') : 
    (es_servicio ? 'Servicio no disponible' : 'Agotado');
  
  const stockStatus = stock !== undefined && stock >= 0 
    ? `${stock} ${stock === 1 ? 'unidad' : 'unidades'} disponible${stock !== 1 ? 's' : ''}` 
    : 'Stock no disponible';

  // Paleta de colores dorados y elegantes
  const goldGradients = {
    service: 'bg-gradient-to-br from-[#FFF7E0] via-[#FFF3CC] to-[#FFEB99] dark:from-[#4A3F35] dark:via-[#5C4B3D] dark:to-[#6E5C47]',
    product: 'bg-gradient-to-br from-[#F5F5F5] via-[#FAFAFA] to-[#FFFFFF] dark:from-[#1E1E1E] dark:via-[#2A2A2A] dark:to-[#333333]'
  };

  const goldAccentColors = {
    service: 'border-amber-300 shadow-amber-300/30',
    product: 'border-gray-200 shadow-gray-300/30'
  };

  // Función para manejar la contratación/chat
  const handleContratarOrChat = () => {
    // Si es un servicio, redirigir al chat del vendedor
    if (es_servicio && producto.vendedor && typeof producto.vendedor !== 'string') {
      // Construir la ruta al chat del vendedor
      router.push(`/client/chats?vendedorId=${producto.vendedor.id_usuario}`);
    } else if (onDelete) {
      // Si no es un servicio, usar la función onDelete existente
      onDelete(producto.id_item || producto.id_producto || 0);
    }
  };

  return (
    <div className={`
      group relative rounded-3xl overflow-hidden transition-all duration-500 
      transform hover:-translate-y-2 hover:scale-[1.02] 
      ${es_servicio ? goldGradients.service : goldGradients.product}
      border-2 ${es_servicio ? 'border-amber-200 dark:border-amber-800' : 'border-gray-200 dark:border-gray-700'}
      shadow-xl hover:shadow-2xl
    `}>
      {/* Decoración dorada */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-200 opacity-80"></div>
      
      {/* Etiquetas de estado y oferta */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 items-end">
        <span className={`
          px-3 py-1 rounded-full text-xs font-semibold tracking-wide 
          ${estado === 'A' 
            ? (es_servicio 
              ? 'bg-amber-200 text-amber-900 shadow-md' 
              : 'bg-green-100 text-green-800 shadow-md') 
            : (es_servicio 
              ? 'bg-red-200 text-red-900 shadow-md' 
              : 'bg-red-100 text-red-800 shadow-md')}
        `}>
          {estadoTexto}
        </span>
        {precio > 100 && !es_servicio && (
          <span className="
            px-3 py-1 bg-amber-100 text-amber-800 
            rounded-full text-xs font-semibold 
            shadow-md backdrop-blur-sm flex items-center gap-1
          ">
            <Sparkles className="w-3 h-3 text-amber-600" />
            ¡Oferta Especial!
          </span>
        )}
      </div>

      {/* Imagen del producto/servicio */}
      <div className={`
        relative h-48 md:h-56 overflow-hidden flex items-center justify-center 
        bg-gradient-to-t from-gray-100 to-white 
        dark:from-gray-800 dark:to-gray-900
        transition-all duration-500 group-hover:brightness-110
      `}>
        <ImageWithAuth
          imagePath={`item_imgs/${producto.url_img || producto.image}`}
          alt={producto.nombre || 'Producto'}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 rounded-t-3xl"
        />
        {/* Efecto de brillo dorado sutil */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-100/10 to-transparent opacity-30 pointer-events-none"></div>
      </div>

      {/* Contenido */}
      <div className="p-5 flex flex-col flex-grow relative">
        {/* Decoración de fondo sutil */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-amber-50/20 to-transparent opacity-50 dark:opacity-10 pointer-events-none"></div>
        
        <div className="relative z-10">
          <h3 className="
            text-xl font-bold text-gray-900 dark:text-white mb-1 truncate 
            group-hover:text-amber-800 dark:group-hover:text-amber-300 
            transition-colors duration-300
          " title={producto.nombre || 'Producto'}>
            {producto.nombre || 'Producto'}
          </h3>
          
          <div className="flex items-center justify-between mb-3">
            <span className="
              text-2xl font-extrabold 
              text-amber-700 dark:text-amber-500
              group-hover:text-amber-900 dark:group-hover:text-amber-400
              transition-colors duration-300
            ">
              ${typeof precio === 'number' ? precio.toFixed(2) : '0.00'}
            </span>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-300">
              <Star className="w-5 h-5 text-amber-400 mr-1" />
              {typeof rating === 'number' ? rating : 4.5}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm mb-4">
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
              <Tag className="w-5 h-5 text-amber-500 mr-1" />
              <span className="truncate" title={getCategoriaNombre()}>
                {getCategoriaNombre()}
              </span>
            </div>
            {!es_servicio && (
              <div className="flex items-center gap-1" title={`${stock || 0} unidades en stock`}>
                <Package className="w-5 h-5 text-amber-500 mr-1 flex-shrink-0" />
                <span className={`text-sm ${stock && stock > 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                  {stockStatus}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1 col-span-2">
              <div className="flex items-center gap-2">
                <ImageWithAuth
                  imagePath={getVendedorImagen()}
                  alt={producto.nombre || 'Producto'}
                  className="w-6 h-6 rounded-full object-cover border-2 border-amber-200 shadow-md"
                />
                <span className="truncate text-gray-700 dark:text-gray-200" title={getVendedorNombre()}>
                  {getVendedorNombre()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-auto flex gap-2">
            <Link href={`/client/products/ver/${producto.id_item || producto.id_producto}`} passHref>
              <Button
                variant="outline"
                className="
                  flex-1 flex items-center gap-2 
                  border-amber-300 text-amber-700 
                  hover:bg-amber-50 hover:border-amber-400
                  dark:border-amber-700 dark:text-amber-300
                  dark:hover:bg-amber-900/30
                "
              >
                <Eye className="w-4 h-4" />
                Ver
              </Button>
            </Link>
            <Button
              variant="outline"
              className="
                flex items-center gap-2 px-3 py-2 text-sm
                border-green-300 text-green-700 
                hover:bg-green-50 hover:border-green-400
                dark:border-green-700 dark:text-green-300
                dark:hover:bg-green-900/30
              "
              onClick={handleContratarOrChat}
            >
              <ShoppingBag className="w-5 h-5 min-w-[20px]" />
              <span>{es_servicio ? 'Contratar' : 'Añadir al carrito'}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductoCard;