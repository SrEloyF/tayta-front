'use client';

import { useEffect, useState } from 'react';
import { CartItem } from '@/components/client/cart/CartItem';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '@/providers/AuthProvider';
import PaymentModal from '@/components/client/cart/PaymentModal';
import { Toaster } from 'react-hot-toast';

export interface CartProduct {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
  url_img?: string;
  es_servicio: boolean;
  id_carrito_producto: number;
}

export default function CartPage() {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://taytaback.onrender.com';

  useEffect(() => {
    const fetchCart = async () => {
      if (!user?.id) return;

      try {
        const token = localStorage.getItem('auth-token');
        // 1. Buscar carrito abierto del usuario
        const carritoRes = await fetch(`${API_BASE_URL}/api/carritos/buscar`, {
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
        const carritos = await carritoRes.json();
        const carrito = Array.isArray(carritos)
          ? carritos.find((c: any) => c.estado === 'E')
          : null;

        if (!carrito) {
          setCartItems([]);
          setLoading(false);
          return;
        }

        // 2. Buscar productos del carrito
        const productosRes = await fetch(`${API_BASE_URL}/api/carritos-productos/buscar`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            campo: 'id_carrito',
            valor: carrito.id_carrito.toString()
          })
        });
        const productos = await productosRes.json();

        // 3. Obtener detalles de cada producto (item)
        const items: CartProduct[] = await Promise.all(
          productos.map(async (prod: any) => {
            // Obtener detalles del item
            const itemRes = await fetch(`${API_BASE_URL}/api/items/buscar`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                campo: 'id_item',
                valor: prod.id_item.toString()
              })
            });
            const [item] = await itemRes.json();

            let stock = 99;
            let id_producto = item.id_item ?? null;

            if (!item.es_servicio && id_producto) {
              const prodStockRes = await fetch(`${API_BASE_URL}/api/productos/buscar`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  campo: 'id_producto',
                  valor: id_producto
                })
              });
              const prodStockArr = await prodStockRes.json();
              if (Array.isArray(prodStockArr) && prodStockArr.length > 0) {
                stock = prodStockArr[0].stock;
              }
            } else if (item.stock) {
              stock = item.stock;
            }

            return {
              id: prod.id_item,
              id_carrito_producto: prod.id_carrito_producto,
              name: item.nombre,
              price: item.precio,
              quantity: prod.cantidad,
              stock,
              url_img: item.url_img ?? '',
              es_servicio: item.es_servicio
            };
          })
        );

        setCartItems(items);
      } catch (error) {
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [user?.id]);

  const updateQuantity = async (id: string, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        String(item.id) === id ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  const removeItem = async (id_carrito_producto: string) => {
    try {
      const token = localStorage.getItem('auth-token');
      const carritoRes = await fetch(`${API_BASE_URL}/api/carritos/buscar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          campo: 'id_usuario',
          valor: user?.id.toString()
        })
      });
      const carritos = await carritoRes.json();
      const carrito = Array.isArray(carritos)
        ? carritos.find((c: any) => c.estado === 'E')
        : null;

      if (!carrito) return;

      // 2. Eliminar el producto del carrito
      await fetch(`${API_BASE_URL}/api/carritos-productos/${id_carrito_producto}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });


      // 3. Verificar si quedan productos en el carrito
      const productosRes = await fetch(`${API_BASE_URL}/api/carritos-productos/buscar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          campo: 'id_carrito',
          valor: carrito.id_carrito.toString()
        })
      });
      const productos = await productosRes.json();

      // 4. Si no quedan productos, eliminar el carrito
      if (!productos || productos.length === 0) {
        await fetch(`${API_BASE_URL}/api/carritos/${carrito.id_carrito}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

      }

      // 5. Actualiza el estado local
      setCartItems((prev) => prev.filter((item) => String(item.id_carrito_producto) !== id_carrito_producto));
    } catch (error) {
      // Manejo de error
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 0;
  const total = subtotal + shipping;

  if (loading) {
    return <div className="text-center py-12">Cargando carrito...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Toaster />
      <div className="flex items-center mb-6">
        <Link href="/client" className="flex items-center text-blue-600 hover:text-blue-800">
          <FiArrowLeft className="mr-1" />
          Continuar comprando
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">Tu Carrito de Compras</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {cartItems.length > 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <ul className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <CartItem
                    key={item.id_carrito_producto}
                    item={{
                      ...item,
                      id: String(item.id),
                      id_carrito_producto: item.id_carrito_producto
                    }}
                    onQuantityChange={updateQuantity}
                    onRemove={(id) => removeItem(String(item.id_carrito_producto))}
                  />
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">Tu carrito está vacío</h3>
              <p className="mt-2 text-gray-500">Agrega productos o servicios para comenzar</p>
              <Link
                href="/client/products"
                className="mt-6 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Explorar productos
              </Link>
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Resumen del Pedido</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Envío</span>
                  <span className="font-medium">Gratis</span>
                </div>
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-medium">Total</span>
                    <span className="text-lg font-bold">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <PaymentModal isOpen={showModal} onClose={() => setShowModal(false)} total={total} />
            </div>

            <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">¿Tienes un código de descuento?</h3>
              <div className="flex">
                <input
                  type="text"
                  placeholder="Ingresa código"
                  className="flex-1 border-gray-300 rounded-l-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <button className="bg-gray-200 px-4 py-2 rounded-r-md hover:bg-gray-300">Aplicar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}