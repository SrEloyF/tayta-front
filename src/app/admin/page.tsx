// app/admin/page.tsx
'use client';

// Marcar la página como dinámica
export const dynamicConfig = 'force-dynamic';

import { Card, Metric, Text } from '@tremor/react';
import dynamic from 'next/dynamic';

// Importar componentes dinámicamente para evitar problemas de SSR
const RecentSales = dynamic(
  () => import('@/components/admin/dashboard/RecentSales').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => <p>Cargando ventas recientes...</p>
  }
);

const SalesChart = dynamic(
  () => import('@/components/admin/dashboard/SalesChart').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => <p>Cargando gráfico de ventas...</p>
  }
);

export default function DashboardPage() {
  // Datos estáticos para demostración
  const stats = [
    { title: 'Ventas Totales', value: '$12,345', change: '+12%' },
    { title: 'Usuarios Activos', value: '1,234', change: '+5%' },
    { title: 'Productos', value: '567', change: '+3%' },
    { title: 'Servicios', value: '321', change: '+7%' },
  ];

  const recentSales = [
    { name: 'Producto A', email: 'user1@example.com', amount: '$100', status: 'completed' as const },
    { name: 'Servicio B', email: 'user2@example.com', amount: '$200', status: 'pending' as const },
    { name: 'Producto C', email: 'user3@example.com', amount: '$150', status: 'completed' as const },
    { name: 'Servicio D', email: 'user4@example.com', amount: '$300', status: 'failed' as const },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
      
      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 text-gray-900 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <Text>{stat.title}</Text>
            <Metric>{stat.value}</Metric>
            <Text color={stat.change.startsWith('+') ? 'emerald' : 'red'}>
              {stat.change} desde ayer
            </Text>
          </Card>
        ))}
      </div>

      {/* Gráficos y datos */}
      <div className="grid grid-cols-1 text-gray-900 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart />
        </div>
        <div className="lg:col-span-1">
          <RecentSales data={recentSales} />
        </div>
      </div>
    </div>
  );
}