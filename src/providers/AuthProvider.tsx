"use client";
import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { useRouter, usePathname } from "next/navigation";

// providers/AuthProvider.tsx
import api, { registerLogoutHandler } from "@/features/auth/api";
interface User {
  token: any;
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (token: string, userData: User) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
  initialized: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const validateUserData = (data: any): data is User => {
    return data?.id && data?.name && data?.email;
  };

  const clearAuth = async () => {
    localStorage.removeItem("auth-token");
    localStorage.removeItem("user");
    document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    setUser(null);
  };

  const logout = async () => {
    await clearAuth();
    router.push("/auth/login");
  };

  // Registrar el manejador de logout en axios
  useEffect(() => {
    registerLogoutHandler(logout);
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("auth-token");
        const userData = localStorage.getItem("user");

        if (token) {
          // Establecer cookie para middleware
          document.cookie = `auth-token=${token}; path=/; SameSite=Strict`;
        }

        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          if (validateUserData(parsedUser)) {
            setUser(parsedUser);
          } else {
            console.warn("Datos de usuario inválidos, limpiando autenticación");
            await clearAuth();
          }
        }
      } catch (error) {
        console.error("Error inicializando autenticación:", error);
        await clearAuth();
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  const login = async (token: string, userData: User) => {
    try {
      // 1. Guarda en almacenamiento local
      localStorage.setItem('auth-token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // 2. Establecer cookie para middleware
      document.cookie = `auth-token=${token}; path=/; SameSite=Strict`;
      
      // 3. Actualiza el estado
      setUser(userData);
      
      // 4. Redirige
      router.push('/client');
    } catch (error) {
      console.error('Error en login:', error);
      await clearAuth();
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading,
    initialized,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
};
