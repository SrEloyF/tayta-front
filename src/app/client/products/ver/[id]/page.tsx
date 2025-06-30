'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProductoService } from '@/features/productos/services/ProductoService';
import { ImageWithAuth } from '@/components/ui/ImageWithAuth';
import { Button } from '@/components/ui/Button';
import { ShoppingBag, MessageCircle, Star, Package, Loader2 } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { useAuth } from '@/providers/AuthProvider';
import Link from 'next/link';

interface DetalleProducto {
  id_item: number;
  nombre: string;
  descripcion: string;
  precio: number;
  estado: string;
  stock?: number;
  url_img?: string;
  es_servicio: boolean;
  id_categoria: number;
  id_vendedor: number;
  fecha_y_hora: string;
  vendedor?: {
    id_usuario: number;
    nombres: string;
    apellidos: string;
    url_img?: string;
  };
  categoria?: {
    id_categoria: number;
    nombre: string;
  };
}

export default function DetalleProductoPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [producto, setProducto] = useState<DetalleProducto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [vendedores, setVendedores] = useState<any[]>([]);

  // Estados para el efecto de lupa
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Estados para la cantidad seleccionada
  const [cantidad, setCantidad] = useState(1);

  const [adding, setAdding] = useState(false);

  const handleIncrement = () => {
    const stock = producto?.stock ?? 0;
    if (cantidad < stock) {
      setCantidad(cantidad + 1);
    }
  };

  const handleDecrement = () => {
    if (cantidad > 1) {
      setCantidad(cantidad - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!user?.id) {
      toast.error('Debes iniciar sesión para añadir al carrito');
      return;
    }
    if (!producto) return;
    setAdding(true);

    try {
      const token = localStorage.getItem('auth-token');
      if (!token) throw new Error('No autenticado');

      // 1. Buscar carrito abierto (estado "E") del usuario
      let carritoRes = await fetch(`/api/carritos/buscar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          campo: 'id_usuario',
          valor: user.id.toString()
        })
      });

      let carritoData = await carritoRes.json();
      let carrito = Array.isArray(carritoData)
        ? carritoData.find((c: any) => c.estado === 'E')
        : null;

      // 2. Si no existe, crear uno
      if (!carrito) {
        const crearRes = await fetch(`/api/carritos`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id_usuario: user.id,
            estado: 'E'
          })
        });
        if (!crearRes.ok) throw new Error('No se pudo crear el carrito');
        carrito = await crearRes.json();
      }

      // 3. Añadir producto al carrito
      const addRes = await fetch(`/api/carritos-productos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id_carrito: carrito.id_carrito,
          id_item: producto.id_item,
          cantidad: cantidad
        })
      });

      if (!addRes.ok) throw new Error('No se pudo añadir el producto al carrito');

      toast.success('Producto añadido al carrito');
      router.push('/client/cart');
    } catch (error: any) {
      toast.error(error.message || 'Error al añadir al carrito');
    } finally {
      setAdding(false);
    }
  };


  const handleChangeCantidad = (e: { target: { value: any; }; }) => {
    const value = e.target.value;
    const parsedValue = parseInt(value, 10);

    const stock = producto?.stock ?? 0;

    if (!isNaN(parsedValue) && parsedValue >= 1 && parsedValue <= stock) {
      setCantidad(parsedValue);
    } else if (value === '') {
      setCantidad(1);
    }
  };


  // Manejadores para el efecto de lupa
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;

    const container = imageContainerRef.current;
    const rect = container.getBoundingClientRect();

    // Calcular posición relativa del cursor (0 a 1)
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // Mantener dentro de los límites
    const boundedX = Math.min(Math.max(x, 0), 1);
    const boundedY = Math.min(Math.max(y, 0), 1);

    setZoomPosition({ x: boundedX, y: boundedY });
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseEnter = () => {
    setShowZoom(true);
  };

  const handleMouseLeave = () => {
    setShowZoom(false);
  };

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        const token = localStorage.getItem('auth-token');
        if (!token) {
          throw new Error('No se encontró token de autenticación');
        }

        const data = await ProductoService.getProductoCompleto(Number(id));
        setProducto(data);

        if (data.id_categoria) {
          const categoriaRes = await fetch('/api/categorias/buscar', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              campo: "id_categoria",
              valor: data.id_categoria.toString()
            })
          });

          if (!categoriaRes.ok) throw new Error('Error al obtener categoría');
          const categoriaData = await categoriaRes.json();
          setCategorias(categoriaData);
        }

        if (data.id_vendedor) {
          const vendedorRes = await fetch('/api/usuarios/buscar', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              campo: "id_usuario",
              valor: data.id_vendedor.toString()
            })
          });

          if (!vendedorRes.ok) throw new Error('Error al obtener vendedor');
          const vendedorData = await vendedorRes.json();
          setVendedores(vendedorData);
        }

      } catch (error) {
        console.error('Error al cargar los datos:', error);
        setError(error instanceof Error ? error.message : 'Error al cargar los datos');
        toast.error('Error al cargar la información');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProducto();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          {error || 'Producto no encontrado'}
        </h2>
        <Button onClick={() => router.push('/client/products')}>
          Volver a Productos
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Toaster />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Contenedor de imagen con efecto de lupa */}
        <div className="relative">
          <div
            ref={imageContainerRef}
            className="relative h-96 md:h-[500px] rounded-xl overflow-hidden cursor-zoom-in bg-white border border-gray-200"
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <ImageWithAuth
              imagePath={`item_imgs/${producto.url_img}`}
              alt={producto.nombre}
              className="w-full h-full object-contain"
            />

            {/* Indicador de lupa (recuadro de selección) */}
            {showZoom && (
              <div
                className="absolute w-32 h-32 border-2 border-blue-500 bg-blue-500/10 pointer-events-none rounded-lg shadow-lg backdrop-blur-sm"
                style={{
                  left: `${zoomPosition.x * 100}%`,
                  top: `${zoomPosition.y * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 10
                }}
              />
            )}
          </div>
        </div>

        {/* Información del producto */}
        <div className="flex flex-col">
          {/* Encabezado */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
                  {producto.nombre}
                </h1>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex text-amber-400">
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                  <span className="text-gray-500 text-sm">(12 reseñas)</span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold 
                ${producto.estado === 'A'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'}`}>
                {producto.estado === 'A' ? 'Disponible' : 'Agotado'}
              </span>
            </div>

            <p className="text-3xl font-bold text-blue-600 mt-2">
              ${isNaN(Number(producto.precio)) ? 'Precio no disponible' : Number(producto.precio).toFixed(2)}
            </p>

            {!producto.es_servicio && (
              <div className="mt-4 flex items-center gap-2 text-gray-600">
                <Package className="w-5 h-5 text-gray-500" />
                <span className="font-medium">{producto.stock || 0} unidades disponibles</span>
              </div>
            )}
          </div>

          {/* Descripción */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3 text-gray-900">Descripción</h2>
            <p className="text-gray-600 leading-relaxed">
              {producto.descripcion || 'Este producto no tiene descripción disponible.'}
            </p>
          </div>

          {/* Categoría */}
          {categorias.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2 text-gray-900">Categoría</h2>
              <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                {categorias[0].nombre}
              </span>
            </div>
          )}

          {/* Vendedor */}
          {vendedores.length > 0 && (
            <div className="mb-8 p-5 border rounded-xl bg-gray-50 shadow-sm">
              <h2 className="text-lg font-semibold mb-3 text-gray-900">Vendedor</h2>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <ImageWithAuth
                    imagePath={`user_imgs/${vendedores[0].url_img}`}
                    alt={`${vendedores[0].nombres} ${vendedores[0].apellidos}`}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow"
                  />
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {`${vendedores[0].nombres} ${vendedores[0].apellidos}`}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-500">
                      98% de calificaciones positivas
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sección de compra/servicio */}
          <div className="border-t pt-6">
            {producto.es_servicio ? (
              <div className="mb-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  Servicio
                </span>
              </div>
            ) : (
              <div className="mb-6 space-y-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  Producto
                </span>

                {/* Control de cantidad */}
                <div className="flex items-center space-x-3">
                  <label htmlFor="cantidad" className="text-sm font-medium text-gray-700">
                    Cantidad:
                  </label>
                  <div className="flex items-center">
                    <button
                      onClick={handleDecrement}
                      className="px-2 py-1 border border-gray-300 rounded-l-md hover:bg-gray-100"
                      disabled={cantidad <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      id="cantidad"
                      value={cantidad}
                      onChange={handleChangeCantidad}
                      min="1"
                      max={producto.stock}
                      className="w-16 text-center border-y border-gray-300 py-1"
                    />
                    <button
                      onClick={handleIncrement}
                      className="px-2 py-1 border border-gray-300 rounded-r-md hover:bg-gray-100"
                      disabled={cantidad >= (producto.stock || 0)}
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">
                    Disponibles: {producto.stock}
                  </span>
                </div>
              </div>
            )}

            {/* Botones de acción (comunes para productos y servicios) */}
            <div className="space-y-3">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleAddToCart}
                disabled={adding || (producto.es_servicio ? false : !producto.stock || producto.stock === 0)}
              >
                {adding ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <ShoppingBag className="w-5 h-5 mr-2" />
                )}
                {producto.es_servicio ? 'Solicitar Servicio' : 'Añadir al Carrito'}
              </Button>

              <Link href={`/client/chats/${producto.id_vendedor}`} passHref>
                <Button variant="outline" className="w-full">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Contactar al vendedor
                </Button>
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* Modal de zoom (aparece al hacer hover) */}
      {showZoom && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: mousePosition.x + 20,
            top: mousePosition.y + 20,
          }}
        >
          <div className="w-80 h-80 rounded-xl overflow-hidden border-2 border-gray-300 shadow-2xl bg-white">
            <div className="relative w-full h-full overflow-hidden">
              <ImageWithAuth
                imagePath={`item_imgs/${producto.url_img}`}
                alt={`Zoom - ${producto.nombre}`}
                className="absolute object-contain"
                style={{
                  width: '200%',
                  height: '200%',
                  left: `-${zoomPosition.x * 100}%`,
                  top: `-${zoomPosition.y * 100}%`,
                  transform: 'scale(1)',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}