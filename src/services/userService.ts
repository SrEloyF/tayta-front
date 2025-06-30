import { authFetch } from '@/utils/authFetch';

type User = {
  id_usuario: number;
  nombres: string;
  apellidos: string;
  email: string;
  dni: string;
  telefono: string;
  estado: 'A' | 'I';
  url_img?: string;
};

type UserFilters = {
  search?: string;
  estado?: 'A' | 'I';
  page?: number;
  limit?: number;
};

export const userService = {
  async getUsers(filters: UserFilters = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.estado) params.append('estado', filters.estado);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/usuarios?${params.toString()}`);
    if (!response.ok) throw new Error('Error al obtener los usuarios');
    return response.json();
  },

  async getUserById(id: number) {
    try {
      const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/${id}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`No se pudo obtener el usuario ${id}: ${errorText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      throw error;
    }
  },

  async createUser(userData: Omit<User, 'id_usuario'>) {
    const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/usuarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al crear el usuario');
    }
    return response.json();
  },

  async updateUser(id: number, userData: Partial<User>) {
    const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al actualizar el usuario');
    }
    return response.json();
  },

  async toggleUserStatus(id: number, currentStatus: 'A' | 'I') {
    return this.updateUser(id, { estado: currentStatus === 'A' ? 'I' : 'A' });
  },
};
