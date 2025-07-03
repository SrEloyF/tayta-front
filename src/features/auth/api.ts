// lib/api.ts
import axios from 'axios';
import { useRouter } from 'next/navigation';

const api = axios.create({
  baseURL: 'https://taytaback.onrender.com/api',
  timeout: 10000, // 10 segundos de timeout
});

// Variable para almacenar la función de logout
let handleLogout: (() => Promise<void>) | null = null;

// Función para registrar el logout
export const registerLogoutHandler = (logoutFn: () => Promise<void>) => {
  handleLogout = logoutFn;
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-token');
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }
  /*
  // Log de solicitudes para depuración
  console.log('Solicitud Axios:', {
    url: config.url,
    method: config.method,
    headers: config.headers
  });*/
  
  return config;
}, (error) => {
  console.error('Error en la configuración de la solicitud:', error);
  return Promise.reject(error);
});

api.interceptors.response.use(
  response => {
    // Log de respuestas para depuración
    /*console.log('Respuesta Axios:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });*/
    return response;
  },
  error => {
    console.error('Error en la respuesta de Axios:', {
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
      config: error.config
    });

    if (error.response?.status === 401) {
      console.warn('Token inválido o expirado, cerrando sesión');
      localStorage.removeItem('auth-token');
      localStorage.removeItem('user');
      
      // Usar la función de logout si está disponible
      if (handleLogout) {
        handleLogout();
      } else {
        // Fallback: redirigir manualmente
        window.location.href = '/auth/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;