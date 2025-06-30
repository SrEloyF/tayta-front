'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Componente de carga para estadísticas
const LoadingStats = () => (
  <div className="bg-gray-900/50 rounded-2xl p-6 h-36 animate-pulse">
    <div className="h-4 bg-gray-800 rounded w-3/4 mb-4"></div>
    <div className="h-8 bg-gray-800 rounded w-1/2 mt-2"></div>
  </div>
);

// Componente de carga para ventas recientes
const LoadingSales = () => (
  <div className="bg-gray-900/50 rounded-2xl p-6 h-80 animate-pulse">
    <div className="h-6 bg-gray-800 rounded w-1/2 mb-4"></div>
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-12 bg-gray-800 rounded w-full"></div>
      ))}
    </div>
  </div>
);

// Componente de carga para gráficos
const LoadingCharts = () => (
  <div className="bg-gray-900/50 rounded-2xl p-6 h-80 animate-pulse">
    <div className="h-6 bg-gray-800 rounded w-1/2 mb-4"></div>
    <div className="h-48 bg-gray-800 rounded w-full mt-4"></div>
  </div>
);

// Cargar componentes dinámicamente
const DynamicStatsGrid = dynamic(
  () => import('./components/StatsGrid').then(mod => mod.StatsGrid),
  { loading: () => <LoadingStats />, ssr: false }
);

const DynamicRecentSales = dynamic(
  () => import('./components/RecentSales').then(mod => mod.RecentSales),
  { loading: () => <LoadingSales />, ssr: false }
);

const DynamicCharts = dynamic(
  () => import('./components/Charts').then(mod => mod.Charts),
  { loading: () => <LoadingCharts />, ssr: false }
);

export default function DashboardPage() {
  return (
    <div className="p-8 space-y-8 bg-gray-950 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <DynamicStatsGrid />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <DynamicRecentSales />
        <DynamicCharts />
      </div>
    </div>
  );
}