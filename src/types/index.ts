// User Types

/**
 * Tipo completo de usuario con todos los campos
 */
export type User = {
  id_usuario: number;
  nombres: string;
  apellidos: string;
  email: string;
  dni: string;
  telefono: string;
  estado: 'A' | 'I';
  url_img?: string;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
};

/**
 * Datos para formulario de usuario
 */
export type UserFormData = {
  nombres: string;
  apellidos: string;
  email: string;
  dni: string;
  telefono: string;
  estado: 'A' | 'I';
  url_img: string;
  contrasena?: string;
  confirmarContrasena?: string;
};

/**
 * Versión ligera del tipo User para componentes que solo necesitan información básica
 */
export type BasicUser = {
  id_usuario: number;
  nombres: string;
  apellidos: string;
  url_img?: string;
};

// Report Types
export type Report = {
  id_denuncia: number;
  id_motivo: number;
  motivo: string;
  texto: string;
  estado: 'P' | 'R' | 'C'; // Pendiente, Revisión, Cerrado
  fecha_creacion: string;
  fecha_actualizacion?: string;
  usuario: {
    id_usuario: number;
    nombres: string;
    apellidos: string;
    email: string;
  };
};

export type MotivoDenuncia = {
  id_motivo: number;
  nombre: string;
  descripcion?: string;
};

export type ReportStats = {
  total: number;
  pendientes: number;
  en_revision: number;
  cerrados: number;
  por_motivo: Array<{ motivo: string; cantidad: number }>;
};

// Common Types
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type PaginationParams = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};
