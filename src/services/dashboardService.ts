const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface DashboardStats {
  totalUsuarios: number;
  totalProductos: number;
  totalVentas: number;
  totalDenuncias: number;
  ventasRecientes: Array<{
    id: number;
    usuario: string;
    item: string;
    monto: number;
    fecha: string;
  }>;
  productosPopulares: Array<{
    id: number;
    nombre: string;
    ventas: number;
    imagen: string | null;
  }>;
  tendenciaVentas: Array<{
    fecha: string;
    ventas: number;
  }>;
}

export const fetchDashboardData = async (): Promise<DashboardStats> => {
  try {
    // En una implementación real, haríamos llamadas a la API
    // Por ahora, devolvemos datos de ejemplo
    return {
      totalUsuarios: 1245,
      totalProductos: 356,
      totalVentas: 12450,
      totalDenuncias: 8,
      ventasRecientes: [
        { id: 1, usuario: 'Juan Pérez', item: 'Laptop Gamer Pro', monto: 2500, fecha: '2023-06-08' },
        { id: 2, usuario: 'Ana Ruiz', item: 'Servicio Técnico', monto: 150, fecha: '2023-06-08' },
        { id: 3, usuario: 'Carlos Díaz', item: 'iPhone 13', monto: 2800, fecha: '2023-06-07' },
        { id: 4, usuario: 'María López', item: 'Audífonos Inalámbricos', monto: 120, fecha: '2023-06-07' },
        { id: 5, usuario: 'Luis Gómez', item: 'Teclado Mecánico', monto: 95, fecha: '2023-06-06' },
      ],
      productosPopulares: [
        { id: 1, nombre: 'Laptop Gamer Pro', ventas: 45, imagen: '/images/placeholder-product.jpg' },
        { id: 2, nombre: 'iPhone 13', ventas: 38, imagen: '/images/placeholder-product.jpg' },
        { id: 3, nombre: 'Audífonos Inalámbricos', ventas: 29, imagen: '/images/placeholder-product.jpg' },
      ],
      tendenciaVentas: [
        { fecha: '2023-06-01', ventas: 1200 },
        { fecha: '2023-06-02', ventas: 1900 },
        { fecha: '2023-06-03', ventas: 1500 },
        { fecha: '2023-06-04', ventas: 2100 },
        { fecha: '2023-06-05', ventas: 1800 },
        { fecha: '2023-06-06', ventas: 2300 },
        { fecha: '2023-06-07', ventas: 2500 },
      ],
    };
  } catch (error) {
    console.error('Error al cargar los datos del dashboard:', error);
    throw error;
  }
};
