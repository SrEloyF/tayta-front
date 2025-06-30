import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth-token')?.value;

  // Rutas de API públicas
  const publicApiPaths = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/refresh',
    '/',
  ];

  // Rutas de API que requieren autenticación
  const protectedApiPaths = [
    '/api/categorias',
    '/api/productos',
    '/api/items',
    '/api/usuarios'
  ];

  // Rutas de la aplicación que requieren autenticación
  const protectedAppPaths = [
    '/admin', 
    '/dashboard', 
    '/profile', 
    '/client'
  ];

  // Verificar si la ruta es completamente pública
  const isPublicPath = publicApiPaths.some(path => 
    pathname === path || pathname.startsWith(path)
  );

  // Verificar si la ruta de API requiere autenticación
  const isProtectedApiPath = protectedApiPaths.some(path => 
    pathname.startsWith(path)
  );

  // Verificar si la ruta de aplicación requiere autenticación
  const isProtectedAppPath = protectedAppPaths.some(path => 
    pathname.startsWith(path)
  );

  // Rutas de API
  const isApiPath = pathname.startsWith('/api/');

  // Si es una ruta pública, permitir el acceso
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Manejar rutas de API protegidas
  if (isApiPath && isProtectedApiPath) {
    // Si no hay token, devolver error de no autorizado
    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado', message: 'Se requiere autenticación para acceder a este recurso' },
        { status: 401 }
      );
    }
  }

  // Manejar rutas de aplicación protegidas
  if (isProtectedAppPath && !token) {
    // Redirigir a login si no hay token
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Permitir el acceso para todas las demás rutas
  return NextResponse.next();
}

// Configuración de las rutas donde se aplicará el middleware
export const config = {
  matcher: [
    // Aplicar middleware a rutas de API y rutas protegidas
    '/(api|admin|dashboard|profile|client)/:path*',
  ],
};
