"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { reportService } from "@/services/reportService";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#eab308", "#3b82f6", "#10b981"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 p-3 border border-gray-700 rounded shadow-lg">
        <p className="font-medium">{payload[0].payload.name}</p>
        <p className="text-sm">
          {payload[0].name}: <span className="font-medium">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

export function ReportsCharts() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["reportStats"],
    queryFn: () => reportService.getReportStats(),
  });

  if (isLoading) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 shadow-lg border border-yellow-700/10">
        <h2 className="text-lg font-semibold mb-6 text-yellow-400">Estadísticas de reportes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full bg-gray-800 rounded-lg" />
          <Skeleton className="h-64 w-full bg-gray-800 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 shadow-lg border border-yellow-700/10">
        <h2 className="text-lg font-semibold mb-4 text-yellow-400">Estadísticas de reportes</h2>
        <div className="text-red-500 p-4 bg-red-900/20 rounded-lg">
          Error al cargar las estadísticas. Intente nuevamente.
        </div>
      </div>
    );
  }

  const statusData = [
    { name: "Pendientes", value: data?.pendientes || 0, color: COLORS[0] },
    { name: "En revisión", value: data?.en_revision || 0, color: COLORS[1] },
    { name: "Cerrados", value: data?.cerrados || 0, color: COLORS[2] },
  ];

  const motivoData = data?.por_motivo?.map((item: any) => ({
    name: item.motivo,
    value: item.cantidad,
  })) || [];

  return (
    <div className="bg-gray-900 rounded-xl p-6 shadow-lg border border-yellow-700/10">
      <h2 className="text-lg font-semibold mb-6 text-yellow-400">Estadísticas de reportes</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gráfico de estado de reportes */}
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <h3 className="text-center font-medium mb-4">Reportes por estado</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de reportes por motivo */}
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <h3 className="text-center font-medium mb-4">Reportes por motivo</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={motivoData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="name" 
                  stroke="#9ca3af" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937',
                    borderColor: '#374151',
                    borderRadius: '0.5rem',
                  }}
                  itemStyle={{ color: '#f3f4f6' }}
                />
                <Bar dataKey="value" fill="#eab308" name="Cantidad" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Resumen de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-gray-800/50 p-4 rounded-lg border-l-4 border-yellow-500">
          <h3 className="text-sm font-medium text-gray-400">Total de reportes</h3>
          <p className="text-2xl font-bold text-yellow-400">{data?.total || 0}</p>
        </div>
        <div className="bg-gray-800/50 p-4 rounded-lg border-l-4 border-blue-500">
          <h3 className="text-sm font-medium text-gray-400">En revisión</h3>
          <p className="text-2xl font-bold text-blue-400">{data?.en_revision || 0}</p>
        </div>
        <div className="bg-gray-800/50 p-4 rounded-lg border-l-4 border-green-500">
          <h3 className="text-sm font-medium text-gray-400">Cerrados</h3>
          <p className="text-2xl font-bold text-green-400">{data?.cerrados || 0}</p>
        </div>
      </div>
    </div>
  );
}
