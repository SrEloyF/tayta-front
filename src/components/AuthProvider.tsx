'use client';

import { User } from "@/features/types";
import { useRouter } from "next/navigation";
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const login = useCallback((token: string, userData: User) => {
    try {
      if (!token || !userData?.id) {
        throw new Error('Datos de autenticación inválidos');
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('auth-token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        const storedToken = localStorage.getItem('auth-token');
        if (storedToken !== token) {
          throw new Error('Error al guardar el token');
        }
      }

      setUser(userData);
      router.push('/');
      
    } catch (error) {
      console.error('Error en login:', error);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-token');
        localStorage.removeItem('user');
      }
      setUser(null);
      throw error;
    }
  }, [router]);

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('user');
    }
    setUser(null);
    router.push('/login');
  }, [router]);

  useEffect(() => {
    // Check for existing session on mount
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('Error parsing user data', e);
          logout();
        }
      }
    }
  }, [logout]);

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
