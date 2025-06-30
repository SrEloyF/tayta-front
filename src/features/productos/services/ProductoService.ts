import { Producto } from '@/features/types';
import { authFetch } from '@/utils/authFetch';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

const getToken = (): string => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth-token');

    if (!token) throw new Error('No se encontró token de autenticación');
    return token;
  }
  throw new Error('localStorage no disponible en servidor');
};

const headers = () => ({
  headers: { 
    Authorization: `Bearer ${getToken()}`,
    'Content-Type': 'application/json'
  }
});

export const ProductoService = {
  async getProductoCompleto(id: number): Promise<any> {
    try {
      // Obtener el ítem primero
      const itemResponse = await authFetch(`/api/items/${id}`);
      const item = await itemResponse.json() as {
        id_categoria: number | string;
        precio: number | string;
        es_servicio: boolean;
        [key: string]: any;
      };
      
      // Intentar obtener el producto solo si no es servicio
      let productoData: { stock: number; [key: string]: any } = { stock: 0 };
      if (!item.es_servicio) {
        const productoResponse = await authFetch(`/api/productos/${id}`);
        productoData = await productoResponse.json() as { stock: number; [key: string]: any };
      }

      return {
        ...item,
        ...productoData,
        id_producto: id,
        id_categoria: item.id_categoria.toString(),
        precio: item.precio.toString()
      };
    } catch (error) {
      console.error('Error obteniendo producto completo:', error);
      throw error;
    }
  },

  async getProductosCompletos() {
    try {
      const [itemsResponse, productosResponse, usuariosResponse] = await Promise.all([
        authFetch('/api/items').then(res => res.json()),
        authFetch('/api/productos').then(res => res.json()),
        authFetch('/api/usuarios').then(res => res.json())
      ]);

      console.log('Respuestas recibidas:', {
        items: itemsResponse.length,
        productos: productosResponse.length,
        usuarios: usuariosResponse.length
      });

      return itemsResponse.map((item: any) => {
        const producto = productosResponse.find((p: any) => p.id_producto === item.id_item) || {};
        const vendedor = usuariosResponse.find((u: any) => u.id_usuario === item.id_vendedor);
        
        return {
          ...item,
          ...producto,
          id_producto: item.id_item,
          vendedor: vendedor || null
        };
      });
    } catch (error) {
      console.error('Error al obtener productos completos:', error);
      throw error;
    }
  },

  async createProducto(data: Omit<Producto, 'id_producto'>) {
    try {
      const itemResponse = await authFetch('/api/items', {
        method: 'POST',
        body: JSON.stringify({
          id_categoria: data.id_categoria,
          id_vendedor: data.id_vendedor,
          nombre: data.nombre,
          precio: data.precio,
          es_servicio: data.es_servicio,
          estado: data.estado
        })
      });

      const itemData = await itemResponse.json();

      if (!data.es_servicio) {
        await authFetch('/api/productos', {
          method: 'POST',
          body: JSON.stringify({
            id_producto: itemData.id_item,
            stock: data.stock
          })
        });
      }

      return {
        ...itemData,
        stock: data.stock,
        id_producto: itemData.id_item
      };
    } catch (error) {
      console.error('Error creando producto:', error);
      throw error;
    }
  },

  async deleteProducto(id: number) {
    try {
      await authFetch(`/api/productos/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });
      await authFetch(`/api/items/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });
      return true;
    } catch (error) {
      console.error('Error eliminando producto:', error);
      throw error;
    }
  },

  async updateItem(id: number, data: any) {
    try {
      const response = await authFetch(`/api/items/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error actualizando ítem:', error);
      throw error;
    }
  },

  async updateProducto(id: number, data: any) {
    try {
      const response = await authFetch(`/api/productos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error actualizando producto:', error);
      throw error;
    }
  },

  async getCategorias() {
    try {
      console.log('Intentando obtener categorías desde:', `${API_BASE_URL}/api/categorias`);
      const response = await authFetch('/api/categorias');
      const data = await response.json();
      
      console.log('Respuesta de categorías:', data);
      return data;
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      throw error;
    }
  }
};