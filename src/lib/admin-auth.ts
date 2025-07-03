import Cookies from 'js-cookie';

export const AdminAuthUtils = {
  // Guardar token de admin
  setAdminToken(token: string) {
    try {
      // Guardar token en cookie
      Cookies.set('admin_token', token, { 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: 1 // 1 día de expiración
      });

      // Intentar decodificar el token para verificar
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('[AdminAuthUtils] Token guardado:', payload);

      return true;
    } catch (error) {
      console.error('[AdminAuthUtils] Error al guardar token:', error);
      return false;
    }
  },

  // Obtener token de admin
  getAdminToken() {
    return Cookies.get('admin_token');
  },

  // Verificar si hay token de admin válido
  isAdminAuthenticated() {
    const token = this.getAdminToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Verificar si el token no ha expirado
      return payload.exp > Math.floor(Date.now() / 1000);
    } catch (error) {
      console.error('[AdminAuthUtils] Error al verificar token:', error);
      return false;
    }
  },

  // Eliminar token de admin
  removeAdminToken() {
    Cookies.remove('admin_token');
  },

  // Redirigir a la página de admin
  redirectToAdminUsers() {
    console.log('[AdminAuthUtils] Redirigiendo a usuarios de admin');
    window.location.replace('/admin/users');
  },

  // Redirigir al login de admin
  redirectToAdminLogin() {
    console.log('[AdminAuthUtils] Redirigiendo a login de admin');
    window.location.replace('/auth/admin');
  }
}; 