import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/providers/AuthProvider';
import { useState } from 'react';

export function useAddToCart() {
  const { user } = useAuth();
  const router = useRouter();
  const [adding, setAdding] = useState(false);

  const addToCart = async (producto: { id_item: number }, cantidad = 1) => {
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
      let carritoRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/carritos/buscar`, {
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
        const crearRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/carritos`, {
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
      const addRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/carritos-productos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id_carrito: carrito.id_carrito,
          id_item: producto.id_item,
          cantidad
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

  return { addToCart, adding };
}