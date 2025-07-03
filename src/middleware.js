import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request) {
  const token = request.cookies.get('admin_token')?.value;
  const path = request.nextUrl.pathname;

  // Rutas de administrador que requieren autenticación
  const adminRoutes = [
    '/admin',
    '/admin/dashboard',
    '/admin/categories',
    '/admin/products',
    '/admin/services',
    '/admin/users',
    '/admin/reports'
  ];

  // Rutas de autenticación de admin
  const adminAuthRoutes = ['/auth/admin', '/auth/admin/login'];

  // Verificar si la ruta actual es una ruta de administrador
  const isAdminRoute = adminRoutes.some(route => 
    path.startsWith(route)
  );

  // Función para crear una respuesta de redirección
  const createRedirectResponse = (url, request) => {
    const response = NextResponse.redirect(new URL(url, request.url));
    return response;
  };

  // Función para verificar la validez del token
  const verifyToken = async (token) => {
    if (!token) {
      console.log('Middleware: No token provided');
      return false;
    }

    try {
      // Verificar formato del token
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.log('Middleware: Token inválido - formato incorrecto');
        return false;
      }

      // Decodificar payload
      try {
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString('utf-8'));
        
        console.log('Middleware: Token payload decoded:', {
          id: payload.id,
          email: payload.email
        });

        // Verificaciones adicionales
        if (!payload.id || !payload.email) {
          console.log('Middleware: Payload incompleto');
          return false;
        }
      } catch (payloadError) {
        console.error('Middleware: Error decodificando payload:', payloadError);
        return false;
      }

      // Verificación de firma
      try {
        // Usar la clave secreta del backend
        const secretKey = new TextEncoder().encode('super_clave_secreta_segura_123');
        await jwtVerify(token, secretKey);
      } catch (signatureError) {
        console.error('Middleware: Error de firma de token:', signatureError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Middleware: Error verificando token:', error);
      return false;
    }
  };

  // Si es una ruta de admin
  if (isAdminRoute) {
    console.log('Middleware: Accediendo a ruta de admin', {
      path,
      token: token ? 'Token presente' : 'Sin token'
    });

    // Si no hay token, redirigir al login de admin
    if (!token) {
      console.log('Middleware: No token for admin route, redirecting');
      return createRedirectResponse('/auth/admin', request);
    }

    // Verificar validez del token
    const isValidToken = await verifyToken(token);
    
    if (!isValidToken) {
      console.log('Middleware: Invalid token, redirecting');
      return createRedirectResponse('/auth/admin', request);
    }

    // Token válido, permitir acceso a la ruta
    console.log('Middleware: Token válido, permitiendo acceso a ruta de admin');
    return NextResponse.next();
  }

  // Si está en una ruta de autenticación de admin
  if (adminAuthRoutes.includes(path)) {
    // Si hay token válido, redirigir a usuarios de admin
    if (token) {
      const isValidToken = await verifyToken(token);
      
      if (isValidToken) {
        console.log('Middleware: Valid token in auth route, redirecting to users');
        return createRedirectResponse('/admin/users', request);
      }
    }
    
    // No hay token o no es válido, permitir acceso a la página de login
    return NextResponse.next();
  }

  // Para otras rutas, continuar normalmente
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/auth/admin/:path*'
  ]
};
