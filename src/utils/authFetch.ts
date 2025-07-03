// src/utils/authFetch.ts
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export async function authFetch(input: RequestInfo, init: RequestInit = {}) {
  // Try to get token from localStorage first
  let token = localStorage.getItem("auth-token");
  
  // If not found in localStorage, try to get from cookies (for admin)
  if (!token) {
    token = Cookies.get('admin_token') || '';
  }
  
  const headers = new Headers(init.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  // Asegúrate de que la URL sea absoluta si es necesario
  const url = typeof input === 'string' && !input.startsWith('http') 
    ? `${API_BASE_URL}${input}` 
    : input;
  
  try {
    const response = await fetch(url, { ...init, headers });
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Error en la solicitud: ${response.status} ${response.statusText}`, errorBody);
      throw new Error(`Error ${response.status}: ${errorBody}`);
    }
    
    return response;
  } catch (error) {
    console.error('Error en la solicitud de red:', error);
    throw error;
  }
}