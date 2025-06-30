// app/api/uploads/item_imgs/[filename]/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Esta ruta no es compatible con exportación estática
// Se recomienda manejar las imágenes directamente desde tu backend

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { filename: string } }) {
  // En producción, redirigir directamente al backend
  if (process.env.NODE_ENV === 'production') {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://taytaback.onrender.com';
    return NextResponse.redirect(`${baseUrl}/uploads/item_imgs/${params.filename}`);
  }

  // Solo para desarrollo local
  const token = req.cookies.get('auth-token')?.value;

  if (!token) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/item_imgs/${params.filename}`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return new NextResponse('Error al obtener imagen', { status: response.status });
    }

    const imageBuffer = await response.arrayBuffer();

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
      },
    });
  } catch (error) {
    console.error('Error fetching image:', error);
    return new NextResponse('Error al procesar la solicitud', { status: 500 });
  }
}

// Esta función es necesaria para que Next.js sepa qué rutas generar estáticamente
// Pero en este caso, como manejamos imágenes dinámicas, devolvemos un array vacío
export function generateStaticParams() {
  return [];
}
