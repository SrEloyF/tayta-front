import axios from 'axios';
import { LoginFormData, RegisterFormData } from '../../types';

const BASE_URL = 'https://taytaback.onrender.com/api';

interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export const AuthService = {
  async login(credentials: LoginFormData): Promise<AuthResponse> {
    try {
      console.log('Login attempt:', {
        email: credentials.email.trim(),
        baseUrl: BASE_URL
      });

      const response = await axios.post(
        `${BASE_URL}/auth/login`,
        {
          email: credentials.email.trim(),
          contrasena: credentials.contrasena
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000
        }
      );

      console.log('Full server response:', response.data);

      // Ajustar según la estructura real de respuesta
      const { accessToken, refreshToken } = response.data;

      // Intentar extraer información del token
      const tokenParts = accessToken.split('.');
      let user = null;
      
      try {
        const decodedPayload = JSON.parse(atob(tokenParts[1]));
        user = {
          id: decodedPayload.id.toString(),
          email: credentials.email.trim(),
          name: decodedPayload.name || credentials.email.split('@')[0]
        };
      } catch (decodeError) {
        console.error('Error decoding token:', decodeError);
        throw new Error('No se pudo procesar la información de usuario');
      }

      if (!accessToken || !user) {
        console.error('Invalid server response structure');
        throw new Error('Respuesta del servidor inválida');
      }

      return {
        token: accessToken,
        refreshToken,
        user
      };
    } catch (error) {
      // Loguear el error completo para más detalles
      if (axios.isAxiosError(error)) {
        console.error('Axios Login Error:', {
          response: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers
        });
      } else {
        console.error('Unexpected Login Error:', error);
      }
      
      throw new Error('Error al iniciar sesión. Por favor, verifica tus credenciales.');
    }
  },

  async register(userData: RegisterFormData) {
    const response = await axios.post(`${BASE_URL}/usuarios`, userData);
    return response.data;
  }
};

// Función para decodificar JWT
function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    console.error('Error decoding token:', e);
    return {};
  }
}
