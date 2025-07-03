'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthService } from '@/features/auth/services/AuthService';
import Cookies from 'js-cookie';
import { jwtVerify } from 'jose';

interface AdminAuthContextType {
  user: {
    id: string;
    email: string;
  } | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminAuthContextType['user']>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Verificar validez del token
  const verifyToken = async (token: string) => {
    if (!token) {
      console.log('[AdminAuthProvider] No token provided');
      return false;
    }

    try {
      // Decodificar payload manualmente
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.log('[AdminAuthProvider] Token inválido - formato incorrecto');
        return false;
      }

      let user = null;
      
      try {
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString('utf-8'));
        
        console.log('[AdminAuthProvider] Token payload:', {
          id: payload.id,
          email: payload.email
        });

        user = {
          id: payload.id.toString(),
          email: payload.email
        };
      } catch (decodeError) {
        console.error('[AdminAuthProvider] Error decodificando payload:', decodeError);
        return false;
      }

      // Verificación de firma
      try {
        // Usar la clave secreta del backend
        const secretKey = new TextEncoder().encode('super_clave_secreta_segura_123');
        await jwtVerify(token, secretKey);
      } catch (signatureError) {
        console.error('[AdminAuthProvider] Error de firma de token:', signatureError);
        return false;
      }

      return user;
    } catch (error) {
      console.error('[AdminAuthProvider] Error verificando token:', error);
      return false;
    }
  };

  // Verificar token al iniciar
  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get('admin_token');
      console.log('[AdminAuthProvider] Token al iniciar:', token);
      
      if (token) {
        try {
          // Verificar si es un token válido
          const verifiedUser = await verifyToken(token);
          
          if (!verifiedUser) {
            console.log('[AdminAuthProvider] Token inválido');
            logout();
            return;
          }

          setUser(verifiedUser);
          setIsAuthenticated(true);
          console.log('[AdminAuthProvider] Usuario establecido:', verifiedUser);

          // Si está en la página de login de admin, redirigir a usuarios
          if (pathname === '/auth/admin') {
            console.log('[AdminAuthProvider] Redirigiendo desde página de login');
            router.replace('/admin/users');
          }
        } catch (error) {
          console.error('[AdminAuthProvider] Error al verificar token:', error);
          logout();
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, [pathname, router]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('[AdminAuthProvider] Intentando iniciar sesión con:', email);
      
      const { token, user: userData } = await AuthService.adminLogin({ 
        email, 
        contrasena: password 
      });

      console.log('[AdminAuthProvider] Respuesta de login:', { token, userData });

      // Guardar token en cookie segura
      Cookies.set('admin_token', token, { 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: 1 // 1 día de expiración
      });

      // Verificar que el token sea válido
      const verifiedUser = await verifyToken(token);
      if (!verifiedUser) {
        throw new Error('Token inválido');
      }

      setUser(verifiedUser);
      setIsAuthenticated(true);
      console.log('[AdminAuthProvider] Usuario establecido:', verifiedUser);

      // Redirigir a la página de usuarios de admin
      console.log('[AdminAuthProvider] Redirigiendo a /admin/users');
      router.replace('/admin/users');

    } catch (error) {
      console.error('[AdminAuthProvider] Error de inicio de sesión:', error);
      
      // Manejar error de inicio de sesión
      const errorMessage = error instanceof Error ? error.message : 'Error de inicio de sesión';
      setIsAuthenticated(false);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('[AdminAuthProvider] Cerrando sesión');
    // Limpiar token de cookies
    Cookies.remove('admin_token');
    setUser(null);
    setIsAuthenticated(false);
    router.push('/auth/admin');
  };

  return (
    <AdminAuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      isAuthenticated 
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto de autenticación de admin
export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth debe ser usado dentro de un AdminAuthProvider');
  }
  return context;
} 