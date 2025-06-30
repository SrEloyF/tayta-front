'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UserGroupIcon, 
  ShoppingBagIcon, 
  CurrencyDollarIcon, 
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { fetchDashboardData } from '@/services/dashboardService';

const stats = [
  { 
    id: 'usuarios', 
    name: 'Usuarios', 
    icon: UserGroupIcon,
    color: 'from-blue-500 to-blue-600',
    border: 'border-blue-500/20',
    change: 12.5,
    changeType: 'increase'
  },
  { 
    id: 'productos', 
    name: 'Productos', 
    icon: ShoppingBagIcon,
    color: 'from-green-500 to-green-600',
    border: 'border-green-500/20',
    change: 5.3,
    changeType: 'increase'
  },
  { 
    id: 'ventas', 
    name: 'Ventas', 
    icon: CurrencyDollarIcon,
    color: 'from-yellow-500 to-yellow-600',
    border: 'border-yellow-500/20',
    change: 28.1,
    changeType: 'increase',
    isCurrency: true
  },
  { 
    id: 'denuncias', 
    name: 'Denuncias', 
    icon: ExclamationTriangleIcon,
    color: 'from-red-500 to-red-600',
    border: 'border-red-500/20',
    change: 3.2,
    changeType: 'decrease'
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export function StatsGrid() {
  const [data, setData] = useState({
    totalUsuarios: 0,
    totalProductos: 0,
    totalVentas: 0,
    totalDenuncias: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const dashboardData = await fetchDashboardData();
        setData({
          totalUsuarios: dashboardData.totalUsuarios,
          totalProductos: dashboardData.totalProductos,
          totalVentas: dashboardData.totalVentas,
          totalDenuncias: dashboardData.totalDenuncias,
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getStatValue = (statId: string) => {
    switch (statId) {
      case 'usuarios':
        return data.totalUsuarios.toLocaleString();
      case 'productos':
        return data.totalProductos.toLocaleString();
      case 'ventas':
        return `S/ ${data.totalVentas.toLocaleString()}`;
      case 'denuncias':
        return data.totalDenuncias.toLocaleString();
      default:
        return '0';
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-900/50 rounded-2xl p-6 h-36 animate-pulse">
            <div className="h-4 bg-gray-800 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-800 rounded w-1/2 mt-2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
    >
      {stats.map((stat) => (
        <motion.div 
          key={stat.id}
          variants={item}
          className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 shadow-lg border ${stat.border} hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">{stat.name}</p>
              <p className="mt-2 text-2xl font-bold text-white">
                {getStatValue(stat.id)}
              </p>
              <div className={`mt-2 flex items-center text-xs ${stat.changeType === 'increase' ? 'text-green-300' : 'text-red-300'}`}>
                {stat.changeType === 'increase' ? (
                  <ArrowUpIcon className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownIcon className="h-3 w-3 mr-1" />
                )}
                <span>{stat.change}% vs mes anterior</span>
              </div>
            </div>
            <div className={`p-3 rounded-lg bg-white/10`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
