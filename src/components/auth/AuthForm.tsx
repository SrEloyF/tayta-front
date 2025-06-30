'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { registerSchema, loginSchema } from '../../features/types';
import { RegisterFormData, LoginFormData } from '../../features/types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Loader2 } from "lucide-react";

type FormData = LoginFormData | RegisterFormData;

type FormErrors = {
  [key: string]: { message?: string } | undefined;
};

interface AuthFormProps {
  type: 'login' | 'register';
  onSubmit: (data: FormData) => void;
  loading?: boolean;
}

export const AuthForm: React.FC<AuthFormProps> = ({ type, onSubmit, loading }) => {
  const schema = type === 'register' ? registerSchema : loginSchema;

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(schema as any),
    mode: 'onChange',
    defaultValues: type === 'register' ? {
      nombres: '',
      apellidos: '',
      email: '',
      dni: '',
      contrasena: '',
      telefono: '',
      imagen: undefined
    } : {
      email: '',
      contrasena: ''
    }
  });

  const onSubmitHandler = (data: FormData) => {
    onSubmit(data);
  };

  // Type assertion for form errors
  const formErrors = errors as unknown as FormErrors;

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
      {type === 'register' && (
        <>
          <Input 
            placeholder="Nombres" 
            {...register('nombres' as never)} 
            error={formErrors.nombres?.message}
          />
          <Input 
            placeholder="Apellidos" 
            {...register('apellidos' as never)} 
            error={formErrors.apellidos?.message}
          />
          <Input 
            placeholder="DNI" 
            {...register('dni' as never)} 
            error={formErrors.dni?.message}
          />
          <Input 
            placeholder="Teléfono" 
            {...register('telefono' as never)} 
            error={formErrors.telefono?.message}
          />
          <div>
            <label className="block text-sm font-medium text-gray-400">Foto de perfil</label>
            <input
              type="file"
              accept="image/*"
              {...register('imagen' as never)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {formErrors.imagen?.message && (
              <p className="text-red-500 text-sm">{formErrors.imagen.message}</p>
            )}
          </div>

        </>
      )}

      {/* Campos comunes */}
      <div>
        <Input 
          placeholder="Email" 
          {...register('email' as never)} 
          error={formErrors.email?.message}
        />
      </div>

      <div>
        <Input 
          type="password" 
          placeholder="Contraseña" 
          {...register('contrasena' as never)} 
          error={formErrors.contrasena?.message}
        />
      </div>

      <Button 
        type="submit" 
        disabled={loading}
        className="w-full flex justify-center items-center"
      >
        {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
        {type === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
      </Button>
    </form>
  );
};
