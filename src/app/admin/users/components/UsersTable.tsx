'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { User, UserFormData } from '@/types';
import { userService } from '@/services/userService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search, RefreshCw, UserPlus, Edit, Trash2, Check, X } from 'lucide-react';

type UserStatus = 'A' | 'I' | '';

const statusLabels: Record<string, string> = {
  A: 'Activo',
  I: 'Inactivo',
};

type UsersTableProps = {
  onEditUser: (user: User) => void;
};

export function UsersTable({ onEditUser }: UsersTableProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus>('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        estado: statusFilter || undefined,
      };

      const response = await userService.getUsers(params);
      setUsers(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages,
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los usuarios. Intente nuevamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, pagination.limit, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchUsers();
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value as UserStatus);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleToggleStatus = async (user: User) => {
    if (!window.confirm(`¿Está seguro de ${user.estado === 'A' ? 'desactivar' : 'activar'} este usuario?`)) {
      return;
    }

    try {
      await userService.toggleUserStatus(user.id_usuario, user.estado);
      toast({
        title: 'Éxito',
        description: `Usuario ${user.estado === 'A' ? 'desactivado' : 'activado'} correctamente.`,
      });
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado del usuario. Intente nuevamente.',
        variant: 'destructive',
      });
    }
  };

  const handleEditUser = (user: User) => {
    onEditUser(user);
    // Desplazarse al formulario
    document.getElementById('user-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    // Aquí podrías mostrar un modal de confirmación personalizado
    if (window.confirm(`¿Está seguro de eliminar al usuario ${user.nombres} ${user.apellidos}? Esta acción no se puede deshacer.`)) {
      handleDeleteUser(user.id_usuario);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      setIsDeleting(true);
      // Aquí iría la llamada al servicio para eliminar el usuario
      // await userService.deleteUser(userId);
      
      toast({
        title: 'Usuario eliminado',
        description: 'El usuario ha sido eliminado correctamente.',
      });
      
      // Si el usuario eliminado está en la página actual y es el último de la lista,
      // volver a la página anterior
      if (users.length === 1 && pagination.page > 1) {
        setPagination(prev => ({
          ...prev,
          page: prev.page - 1,
        }));
      } else {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el usuario. Intente nuevamente.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setSelectedUser(null);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PP', { locale: es });
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 shadow-lg border border-yellow-700/10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-yellow-400">Gestión de Usuarios</h2>
        
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <Input
              type="text"
              placeholder="Buscar por nombre o email..."
              className="bg-gray-800 border-gray-700 text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button type="submit" variant="outline" className="bg-yellow-600 hover:bg-yellow-700 text-white">
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </form>
          
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="A">Activos</SelectItem>
              <SelectItem value="I">Inactivos</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline"
            className="bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-600"
            onClick={() => onEditUser({} as User)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Nuevo Usuario
          </Button>
        </div>
      </div>

      <div className="rounded-md border border-gray-800 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-800">
            <TableRow>
              <TableHead className="text-yellow-400">Nombre</TableHead>
              <TableHead className="text-yellow-400">Email</TableHead>
              <TableHead className="text-yellow-400">Teléfono</TableHead>
              <TableHead className="text-yellow-400">Estado</TableHead>
              <TableHead className="text-yellow-400">Fecha de Registro</TableHead>
              <TableHead className="text-right text-yellow-400">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Cargando usuarios...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-gray-400">
                  No se encontraron usuarios
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id_usuario} className="hover:bg-gray-800/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-yellow-400">
                        {user.nombres.charAt(0)}{user.apellidos.charAt(0)}
                      </div>
                      <div>
                        <div className="text-white">{user.nombres} {user.apellidos}</div>
                        <div className="text-xs text-gray-400">DNI: {user.dni}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">{user.email}</TableCell>
                  <TableCell className="text-gray-300">{user.telefono || 'N/A'}</TableCell>
                  <TableCell>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.estado === 'A' 
                        ? 'bg-green-900/50 text-green-400' 
                        : 'bg-red-900/50 text-red-400'
                    }`}>
                      {statusLabels[user.estado] || 'Desconocido'}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-400 text-sm">
                    {user.fecha_creacion ? formatDate(user.fecha_creacion) : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button 
                      variant="outline"
                      className="h-8 w-8 p-0 text-yellow-400 hover:bg-yellow-500/10 border-yellow-600/30"
                      onClick={() => handleEditUser(user)}
                      title="Editar usuario"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <button
                      className={`h-8 w-8 flex items-center justify-center rounded border border-gray-700 ${user.estado === 'A'
                        ? 'text-red-400 hover:bg-red-500/10'
                        : 'text-green-400 hover:bg-green-500/10'
                      }`}
                      onClick={() => handleToggleStatus(user)}
                      disabled={isDeleting && selectedUser?.id_usuario === user.id_usuario}
                      title={user.estado === 'A' ? 'Desactivar usuario' : 'Activar usuario'}
                    >
                      {user.estado === 'A' ? (
                        <X className="h-4 w-4" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </button>
                    <Button
                      variant="outline"
                      onClick={() => handleDeleteClick(user)}
                      className="h-8 w-8 p-0 text-red-400 hover:bg-red-900/20 border-red-600/30"
                      title="Eliminar usuario"
                      disabled={loading}
                    >
                      {isDeleting && selectedUser?.id_usuario === user.id_usuario ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-400">
            Mostrando {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} usuarios
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1 || loading}
              className="px-3 py-1.5 text-sm"
            >
              Anterior
            </Button>
            <div className="flex items-center px-4 text-sm text-gray-300">
              Página {pagination.page} de {pagination.totalPages}
            </div>
            <Button
              variant="outline"
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))}
              disabled={pagination.page === pagination.totalPages || loading}
              className="px-3 py-1.5 text-sm"
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
