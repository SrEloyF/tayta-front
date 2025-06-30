'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useEffect, useState } from 'react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, initialized, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!loading && initialized) {
      setIsChecking(false);
    }
  }, [loading, initialized]);

  useEffect(() => {
    if (!initialized) return;
    const token = localStorage.getItem('auth-token');
    const user = localStorage.getItem('user');
    const isAuth = !!token && !!user;
    console.log('AuthGuard Verification:', {
      tokenExists: !!token,
      userExists: !!user,
      isAuth,
      pathname
    });
    const isAuthRoute = ['/auth/login', '/auth/register'].includes(pathname);
    if (!isAuth && !isAuthRoute) {
      router.replace(`/auth/login?redirect=${pathname}`);
    } else if (isAuth && isAuthRoute) {
      const redirectTo = new URLSearchParams(window.location.search).get('redirect') || '/client';
      router.replace(redirectTo);
    }
  }, [initialized, pathname]);

  if (isChecking) {
    return <div>Verificando autenticación...</div>;
  }

  return <>{children}</>;
}