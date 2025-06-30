'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { fetchDashboardData } from '@/services/dashboardService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 shadow-lg">
        <p className="text-sm text-gray-300">
          {label}
        </p>
        <p className="text-yellow-400 font-semibold">
          S/ {payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const CustomBarTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 shadow-lg">
        <p className="text-sm text-gray-300">{label}</p>
        <p className="text-green-400 font-semibold">{payload[0].value} ventas</p>
      </div>
    );
  }
  return null;
};

export function Charts() {
  const [chartData, setChartData] = useState<Array<{fecha: string, ventas: number}>>([]);
  const [productData, setProductData] = useState<Array<{name: string, ventas: number}>>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ventas');

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchDashboardData();
        
        // Formatear datos para el gráfico de tendencia
        const formattedChartData = data.tendenciaVentas.map(item => ({
          fecha: format(new Date(item.fecha), 'dd MMM', { locale: es }),
          ventas: item.ventas
        }));
        
        // Formatear datos para el gráfico de productos
        const formattedProductData = data.productosPopulares.map(producto => ({
          name: producto.nombre.length > 15 ? `${producto.nombre.substring(0, 15)}...` : producto.nombre,
          ventas: producto.ventas
        }));
        
        setChartData(formattedChartData);
        setProductData(formattedProductData);
      } catch (error) {
        console.error('Error loading chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-900/50 rounded-2xl p-6 shadow-lg border border-yellow-700/10 h-96 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Cargando gráficos...</div>
      </div>
    );
  }


  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-900/50 rounded-2xl p-6 shadow-lg border border-yellow-700/10"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-yellow-400">Estadísticas</h2>
        <div className="flex space-x-2 bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('ventas')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              activeTab === 'ventas' 
                ? 'bg-yellow-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Ventas
          </button>
          <button
            onClick={() => setActiveTab('productos')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              activeTab === 'productos' 
                ? 'bg-yellow-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Productos
          </button>
        </div>
      </div>

      <div className="h-64">
        {activeTab === 'ventas' ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="fecha" 
                tick={{ fill: '#9CA3AF' }}
                tickLine={{ stroke: '#4B5563' }}
                axisLine={{ stroke: '#4B5563' }}
              />
              <YAxis 
                tick={{ fill: '#9CA3AF' }}
                tickLine={{ stroke: '#4B5563' }}
                axisLine={{ stroke: '#4B5563' }}
                tickFormatter={(value) => `S/ ${value}`}
              />
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="ventas"
                stroke="#eab308"
                fillOpacity={1}
                fill="url(#colorVentas)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={productData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              layout="vertical"
            >
              <XAxis 
                type="number" 
                tick={{ fill: '#9CA3AF' }}
                tickLine={{ stroke: '#4B5563' }}
                axisLine={{ stroke: '#4B5563' }}
              />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={100}
                tick={{ fill: '#9CA3AF' }}
                tickLine={{ stroke: '#4B5563' }}
                axisLine={{ stroke: '#4B5563' }}
              />
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar 
                dataKey="ventas" 
                fill="#10B981" 
                radius={[0, 4, 4, 0]}
                animationDuration={1500}
              >
                <animate
                  attributeName="opacity"
                  values="0;1"
                  dur="1s"
                  repeatCount="1"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="mt-4 text-xs text-gray-500 text-center">
        {activeTab === 'ventas' 
          ? 'Tendencia de ventas de los últimos 7 días' 
          : 'Productos más vendidos'}
      </div>
    </motion.div>
  );
}
