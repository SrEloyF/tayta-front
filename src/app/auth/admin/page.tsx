'use client';

import React, { useState } from 'react';
import { useAdminAuth } from '@/providers/AdminAuthProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAdminAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Intentando login de admin:', email);
      
      await login(email, password);
      
      // El proveedor de autenticación ya maneja la redirección
      toast({
        title: '¡Inicio de sesión exitoso!',
        description: 'Bienvenido al panel de administración',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error en login de admin:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Error desconocido al iniciar sesión';

      toast({
        title: 'Error de inicio de sesión',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Inicio de Sesión - Administrador
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block mb-2">
              Correo Electrónico
            </label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@ejemplo.com"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="password" className="block mb-2">
              Contraseña
            </label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              required
              disabled={isLoading}
            />
          </div>
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </form>
      </div>
    </div>
  );
} 