'use client';

import React, { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { User, UserFormData, UserFormData as UserFormValues } from '@/types';
import { userService } from '@/services/userService';
import { Loader2, Save, X } from 'lucide-react';

// Esquema de validación con Zod
const userFormSchema = z.object({
  nombres: z.string().min(2, { message: 'El nombre es obligatorio' }),
  apellidos: z.string().min(2, { message: 'Los apellidos son obligatorios' }),
  email: z.string().email({ message: 'Correo electrónico inválido' }),
  dni: z.string()
    .min(8, { message: 'El DNI debe tener 8 dígitos' })
    .max(8, { message: 'El DNI debe tener 8 dígitos' })
    .regex(/^[0-9]+$/, { message: 'El DNI solo debe contener números' }),
  telefono: z.string().min(9, { message: 'El teléfono debe tener al menos 9 dígitos' }),
  estado: z.enum(['A', 'I']),
  url_img: z.string().min(1, { message: 'La URL de la imagen es obligatoria' }),
  contrasena: z.union([
    z.string().min(8, { message: 'La contraseña debe tener al menos 8 caracteres' }),
    z.literal('')
  ]).optional(),
  confirmarContrasena: z.string().optional(),
}).refine(
  (data) => !data.contrasena || data.contrasena === '' || data.contrasena.length >= 8,
  {
    message: 'La contraseña debe tener al menos 8 caracteres',
    path: ['contrasena'],
  }
).refine(
  (data) => !data.contrasena || data.contrasena === data.confirmarContrasena,
  {
    message: 'Las contraseñas no coinciden',
    path: ['confirmarContrasena'],
  }
);

type UserFormProps = {
  user?: User | null;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const isEditMode = !!user?.id_usuario;
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const defaultValues: UserFormData = {
    nombres: user?.nombres || '',
    apellidos: user?.apellidos || '',
    email: user?.email || '',
    dni: user?.dni || '',
    telefono: user?.telefono || '',
    estado: user?.estado || 'A',
    url_img: user?.url_img || 'https://via.placeholder.com/150',
    contrasena: '',
    confirmarContrasena: '',
  };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues,
  });

  // Observar cambios en el estado para actualizar el valor del formulario
  const currentStatus = watch('estado');

  useEffect(() => {
    if (user) {
      reset({
        nombres: user.nombres,
        apellidos: user.apellidos,
        email: user.email,
        dni: user.dni,
        telefono: user.telefono,
        estado: user.estado,
        contrasena: '',
        confirmarContrasena: '',
      });
    }
  }, [user, reset]);

  const onSubmit: SubmitHandler<UserFormValues> = async (formData) => {
    try {
      setIsLoading(true);
      
      if (isEditMode && user?.id_usuario) {
        // Para actualizar, no requerimos contraseña a menos que se esté cambiando
        const updateData: Partial<UserFormData> = { ...formData };
        
        // Si la contraseña está vacía, no la incluimos en la actualización
        if (!updateData.contrasena) {
          delete updateData.contrasena;
        }
        
        // Eliminar campos que no se deben enviar
        delete updateData.confirmarContrasena;
        
        await userService.updateUser(user.id_usuario, updateData as UserFormData);
        
        toast({
          title: 'Usuario actualizado',
          description: 'Los datos del usuario se han actualizado correctamente.',
        });
        
        if (onSuccess) onSuccess();
      } else {
        // Para crear nuevo usuario, la contraseña es obligatoria
        if (!formData.contrasena) {
          throw new Error('La contraseña es obligatoria para nuevos usuarios');
        }
        
        const createData = { ...formData };
        delete createData.confirmarContrasena;
        
        await userService.createUser(createData as any);
        
        toast({
          title: 'Usuario creado',
          description: 'El usuario se ha creado correctamente.',
        });
        
        if (onSuccess) {
          onSuccess();
        } else {
          reset();
          router.push('/admin/users');
        }
      }

      // Llamar a la función de éxito si se proporciona
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error al guardar el usuario:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el usuario. Por favor, inténtelo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push('/admin/users');
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 shadow-lg border border-yellow-700/10" id="user-form">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-yellow-400">
          {isEditMode ? 'Editar Usuario' : 'Nuevo Usuario'}
        </h2>
        {onCancel && (
          <Button
            variant="outline"
            className="text-gray-400 hover:text-white border-gray-700 h-10 w-10 p-0 flex items-center justify-center"
            onClick={handleCancel}
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <form onSubmit={async (e) => {
        e.preventDefault();
        try {
          const formData = new FormData(e.currentTarget);
          const data = Object.fromEntries(formData.entries());
          await onSubmit(data as unknown as UserFormValues);
        } catch (error) {
          console.error('Error al procesar el formulario:', error);
        }
      }} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombres */}
          <div className="space-y-2">
            <Label htmlFor="nombres" className="text-gray-300">
              Nombres <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nombres"
              placeholder="Ej: Juan Carlos"
              className={`bg-gray-800 border-gray-700 text-white ${errors.nombres ? 'border-red-500' : ''}`}
              {...register('nombres')}
              disabled={isLoading}
            />
            {errors.nombres && (
              <p className="text-red-500 text-sm mt-1">{errors.nombres.message}</p>
            )}
          </div>

          {/* Apellidos */}
          <div className="space-y-2">
            <Label htmlFor="apellidos" className="text-gray-300">
              Apellidos <span className="text-red-500">*</span>
            </Label>
            <Input
              id="apellidos"
              placeholder="Ej: Pérez López"
              className={`bg-gray-800 border-gray-700 text-white ${errors.apellidos ? 'border-red-500' : ''}`}
              {...register('apellidos')}
              disabled={isLoading}
            />
            {errors.apellidos && (
              <p className="text-red-500 text-sm mt-1">{errors.apellidos.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">
              Correo electrónico <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="ejemplo@correo.com"
              className={`bg-gray-800 border-gray-700 text-white ${errors.email ? 'border-red-500' : ''}`}
              {...register('email')}
              disabled={isLoading || isEditMode}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* DNI */}
          <div className="space-y-2">
            <Label htmlFor="dni" className="text-gray-300">
              DNI <span className="text-red-500">*</span>
            </Label>
            <Input
              id="dni"
              placeholder="12345678"
              maxLength={8}
              className={`bg-gray-800 border-gray-700 text-white ${errors.dni ? 'border-red-500' : ''}`}
              {...register('dni')}
              disabled={isLoading || isEditMode}
            />
            {errors.dni && (
              <p className="text-red-500 text-sm mt-1">{errors.dni.message}</p>
            )}
          </div>

          {/* Teléfono */}
          <div className="space-y-2">
            <Label htmlFor="telefono" className="text-gray-300">
              Teléfono <span className="text-red-500">*</span>
            </Label>
            <Input
              id="telefono"
              placeholder="912345678"
              className={`bg-gray-800 border-gray-700 text-white ${errors.telefono ? 'border-red-500' : ''}`}
              {...register('telefono')}
              disabled={isLoading}
            />
            {errors.telefono && (
              <p className="text-red-500 text-sm mt-1">{errors.telefono.message}</p>
            )}
          </div>

          {/* URL de la imagen */}
          <div className="space-y-2">
            <Label htmlFor="url_img" className="text-gray-300">
              URL de la imagen <span className="text-red-500">*</span>
            </Label>
            <Input
              id="url_img"
              placeholder="https://ejemplo.com/imagen.jpg"
              className={`bg-gray-800 border-gray-700 text-white ${errors.url_img ? 'border-red-500' : ''}`}
              {...register('url_img')}
              disabled={isLoading}
            />
            {errors.url_img && (
              <p className="text-red-500 text-sm mt-1">{errors.url_img.message}</p>
            )}
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <Label htmlFor="estado" className="text-gray-300">
              Estado
            </Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="estado"
                checked={currentStatus === 'A'}
                onCheckedChange={(checked: boolean) => setValue('estado', checked ? 'A' : 'I', { shouldDirty: true })}
                disabled={isLoading}
              />
              <span className="text-sm text-gray-300">
                {currentStatus === 'A' ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>

          {/* Contraseña (solo para nuevo usuario o si se desea cambiar) */}
          {!isEditMode && (
            <>
              <div className="space-y-2">
                <Label htmlFor="contrasena" className="text-gray-300">
                  Contraseña <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contrasena"
                  type="password"
                  placeholder="••••••••"
                  className={`bg-gray-800 border-gray-700 text-white ${errors.contrasena ? 'border-red-500' : ''}`}
                  {...register('contrasena')}
                  disabled={isLoading}
                />
                {errors.contrasena && (
                  <p className="text-red-500 text-sm mt-1">{errors.contrasena.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmarContrasena" className="text-gray-300">
                  Confirmar Contraseña <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="confirmarContrasena"
                  type="password"
                  placeholder="••••••••"
                  className={`bg-gray-800 border-gray-700 text-white ${errors.confirmarContrasena ? 'border-red-500' : ''}`}
                  {...register('confirmarContrasena')}
                  disabled={isLoading}
                />
                {errors.confirmarContrasena && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmarContrasena.message}</p>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-800">
          <Button
            type="button"
            variant="outline"
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
            disabled={isLoading || (!isEditMode && !isDirty) || (isEditMode && !isDirty)}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isEditMode ? 'Guardar Cambios' : 'Crear Usuario'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
