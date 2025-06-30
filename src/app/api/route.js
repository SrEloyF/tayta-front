import { NextResponse } from 'next/server';

// Esta ruta no es compatible con exportación estática
// Se recomienda mover la lógica de la API a un servidor externo o deshabilitar la exportación estática en next.config.js
export async function GET() {
  return NextResponse.json({ 
    message: 'Esta ruta de API no está disponible en modo de exportación estática',
    error: true
  }, { status: 501 });
}
