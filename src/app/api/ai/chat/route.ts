import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Obtener los datos de la solicitud
    const { model, messages } = await request.json();

    // Validar que se hayan proporcionado los datos necesarios
    if (!model || !messages || !Array.isArray(messages)) {
      return NextResponse.json({ 
        error: 'Se requiere un modelo y un array de mensajes' 
      }, { status: 400 });
    }

    // Verificar que la clave API esté configurada
    const OPENROUTER_KEY = process.env.OPENROUTER_KEY;
    if (!OPENROUTER_KEY) {
      return NextResponse.json({ 
        error: 'Clave de API no configurada' 
      }, { status: 500 });
    }

    // Realizar la solicitud a OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': request.headers.get('origin') || '',
        'X-Title': request.headers.get('origin') || ''
      },
      body: JSON.stringify({ 
        model, 
        messages 
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Error desde OpenRouter:', data);
      return NextResponse.json(
        { error: data.error || 'Error desconocido al conectar con la IA' }, 
        { status: response.status }
      );
    }

    // Extraer la respuesta de la IA
    const answer = data.choices?.[0]?.message?.content || '(Respuesta vacía)';

    // Devolver la respuesta
    return NextResponse.json({ answer });

  } catch (error) {
    console.error('Error en la solicitud de IA:', error);

    // Manejar diferentes tipos de errores
    let errorMessage = 'Error desconocido al procesar la solicitud de IA';
    let statusCode = 500;

    if (error instanceof Error) {
      // Mensajes de error más específicos
      if (error.message.includes('403 Forbidden')) {
        errorMessage = 'No se tiene autorización para acceder a la API. Verifica las credenciales.';
        statusCode = 403;
      } else if (error.message.includes('401 Unauthorized')) {
        errorMessage = 'Credenciales de autenticación inválidas.';
        statusCode = 401;
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json({ 
      error: errorMessage 
    }, { status: statusCode });
  }
}

// Configurar CORS para permitir solicitudes del cliente
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
} 