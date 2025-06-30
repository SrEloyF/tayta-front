import { authFetch } from '@/utils/authFetch';

type ReportFilters = {
  estado?: 'P' | 'R' | 'C';
  fecha_desde?: string;
  fecha_hasta?: string;
  search?: string;
  page?: number;
  limit?: number;
};

type ReportStats = {
  total: number;
  pendientes: number;
  en_revision: number;
  cerrados: number;
  por_motivo: Array<{ motivo: string; cantidad: number }>;
};

export type Report = {
  id_denuncia: number;
  id_motivo: number;
  motivo: string;
  texto: string;
  estado: 'P' | 'R' | 'C';
  fecha_creacion: string;
  usuario: {
    id_usuario: number;
    nombres: string;
    apellidos: string;
    email: string;
  };
};

type UpdateReportStatusResponse = {
  id: number;
  estado: 'P' | 'R' | 'C';
  comentario: string;
};

type MotivosDenuncia = {
  id: number;
  motivo: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export const reportService = {
  async getReports(filters: ReportFilters = {}): Promise<PaginatedResponse<Report>> {
    const params = new URLSearchParams();
    if (filters.estado) params.append('estado', filters.estado);
    if (filters.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
    if (filters.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);
    if (filters.search) params.append('search', filters.search);
    params.append('page', (filters.page || 1).toString());
    params.append('limit', (filters.limit || 10).toString());

    const response = await authFetch(`/api/admin/reports?${params.toString()}`);
    if (!response.ok) throw new Error('Error al obtener los reportes');
    
    const data = await response.json();
    // Ensure the response matches the expected PaginatedResponse type
    return {
      data: data.data || [],
      pagination: data.pagination || {
        total: 0,
        page: filters.page || 1,
        limit: filters.limit || 10,
        totalPages: 0
      }
    };
  },

  async getReportById(id: number) {
    const response = await authFetch(`/api/denuncias/${id}`);
    if (!response.ok) throw new Error('Error al obtener el reporte');
    return response.json();
  },

  async updateReportStatus(id: number, estado: 'P' | 'R' | 'C', comentario?: string) {
    const response = await authFetch(`/api/denuncias/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ estado, comentario }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al actualizar el reporte');
    }
    return response.json();
  },

  async getReportStats(): Promise<ReportStats> {
    const response = await authFetch('/api/denuncias/estadisticas');
    if (!response.ok) throw new Error('Error al obtener las estadísticas');
    return response.json();
  },

  async getMotivosDenuncia() {
    const response = await authFetch('/api/motivos-denuncia');
    if (!response.ok) throw new Error('Error al obtener los motivos de denuncia');
    return response.json();
  },
};
