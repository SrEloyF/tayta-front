import axios from 'axios';
import { LoginFormData, RegisterFormData } from '../../types';

type AxiosResponse<T = any> = {
  data: T;
  status: number;
  statusText: string;
  headers: any;
  config: any;
  request?: any;
};

type AxiosError = Error & {
  config: any;
  code?: string;
  request?: any;
  response?: AxiosResponse;
  isAxiosError: boolean;
  toJSON: () => object;
};

const isAxiosError = (error: any): error is AxiosError => {
  return error.isAxiosError === true;
};

interface AuthResponseData {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
  fields?: string[];
}

const BASE_URL = 'https://taytaback.onrender.com/api';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: User;
}

export const AuthService = {
  async login(credentials: LoginFormData): Promise<AuthResponse> {
    try {
      console.log('Login attempt:', {
        email: credentials.email.trim(),
        baseUrl: BASE_URL
      });

      const response = await axios.post<{
        accessToken: string;
        refreshToken?: string;
        user: User;
      }>(
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

      const { accessToken, refreshToken, user } = response.data;

      if (!accessToken || !user) {
        console.error('Invalid server response structure');
        throw new Error('Respuesta del servidor inválida');
      }

      return {
        token: accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name || user.email.split('@')[0]
        }
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios Login Error:', {
          response: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers
        });
        
        const errorData = error.response?.data as ApiErrorResponse | undefined;
        throw new Error(
          errorData?.message || 'Error al iniciar sesión. Por favor, verifica tus credenciales.'
        );
      }
      
      console.error('Unexpected Login Error:', error);
      throw new Error('Error inesperado al iniciar sesión');
    }
  },

  async register(userData: RegisterFormData) {
    try {
      const response = await axios.post<AuthResponseData>(
        `${BASE_URL}/usuarios`, 
        userData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          validateStatus: (status) => status < 500, // Don't throw for 4xx errors
        }
      );

      if (response.status >= 400) {
        const errorData = response.data as unknown as ApiErrorResponse;
        const error = new Error(errorData?.message || 'Error en el registro') as Error & { 
          response?: AxiosResponse<ApiErrorResponse>;
        };
        error.response = {
          ...response,
          data: errorData
        };
        throw error;
      }

      return response.data;
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Error en el registro';
        const errorWithResponse = new Error(errorMessage) as Error & { 
          response?: AxiosResponse<ApiErrorResponse>;
        };
        
        if (error.response) {
          errorWithResponse.response = error.response;
        }
        
        throw errorWithResponse;
      }
      
      throw error;
    }
  },

  async adminLogin(credentials: LoginFormData): Promise<AuthResponse> {
    try {
      console.log('Admin Login Attempt:', {
        email: credentials.email.trim(),
        baseUrl: BASE_URL
      });

      const response = await axios.post(
        `${BASE_URL}/auth/login/admin`,
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

      console.log('Full admin login server response:', response.data);

      const { accessToken, refreshToken } = response.data;

      // Intentar extraer información del token
      const tokenParts = accessToken.split('.');
      let user = null;
      
      try {
        // Decodificar payload manualmente
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString('utf-8'));
        
        console.log('Token payload decoded:', {
          id: payload.id,
          email: payload.email
        });

        user = {
          id: payload.id.toString(),
          email: payload.email || credentials.email.trim()
        };
      } catch (decodeError) {
        console.error('Error decoding admin token payload:', decodeError);
        throw new Error('No se pudo procesar la información de usuario');
      }

      if (!accessToken || !user) {
        console.error('Invalid admin server response structure');
        throw new Error('Respuesta del servidor inválida');
      }

      return {
        token: accessToken,
        refreshToken,
        user
      };
    } catch (error) {
      console.error('Unexpected Admin Login Error:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('Axios Error Details:', {
          response: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers
        });
      }
      
      throw new Error('Error al iniciar sesión como administrador. Verifica tus credenciales.');
    }
  },
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
