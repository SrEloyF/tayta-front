'use client';
import { useEffect, useState } from 'react';
import { OrderCard } from '@/components/client/orders/OrderCard';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://taytaback.onrender.com';

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const token = localStorage.getItem('auth-token');
        
        const res = await fetch(`${API_BASE_URL}/api/carritos/buscar`, {
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
        const carritos = await res.json();
        let ordenes = Array.isArray(carritos)
          ? carritos.filter((c: any) => c.estado === 'V')
          : [];
        
        ordenes.sort((a, b) => {
          const fechaA = a.fecha_compra ? new Date(a.fecha_compra) : new Date(0);
          const fechaB = b.fecha_compra ? new Date(b.fecha_compra) : new Date(0);
          return fechaB.getTime() - fechaA.getTime();
        });

        const ordersData = await Promise.all(
          ordenes.map(async (carrito: any) => {
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
            const items = await Promise.all(
              productos.map(async (prod: any) => {
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
                return {
                  name: item.nombre,
                  quantity: prod.cantidad,
                  price: item.precio
                };
              })
            );

            const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

            return {
              id: `ORD-${carrito.id_carrito}`,
              date: carrito.fecha_compra
                ? new Date(carrito.fecha_compra).toLocaleDateString()
                : '',
              originalDate: carrito.fecha_compra,
              status: 'Completado',
              items,
              total,
              trackingNumber: carrito.id_carrito
            };
          })
        );

        setOrders(ordersData);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user?.id]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mis Pedidos</h1>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-12">Cargando pedidos...</div>
        ) : orders.length > 0 ? (
          orders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">No tienes pedidos recientes</h3>
            <p className="mt-2 text-gray-500">Cuando hagas un pedido, aparecerá aquí</p>
            <Link
              href="/client/products"
              className="mt-6 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Comenzar a comprar
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}