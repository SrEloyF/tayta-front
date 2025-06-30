'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingBag, FiDollarSign, FiClock, FiUser, FiChevronRight, FiCreditCard } from 'react-icons/fi';
import { parseISO, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { fetchDashboardData } from '@/services/dashboardService';

interface VentaReciente {
  id: number;
  usuario: string;
  item: string;
  monto: number;
  fecha: string;
  estado: 'completado' | 'pendiente' | 'cancelado';
  metodoPago: string;
}

const statusStyles: Record<string, string> = {
  completado: 'bg-green-100 text-green-800',
  pendiente: 'bg-yellow-100 text-yellow-800',
  cancelado: 'bg-red-100 text-red-800',
};

const paymentIcons: Record<string, React.ReactNode> = {
  tarjeta: <FiCreditCard className="h-4 w-4 text-blue-500" />,
  efectivo: <FiDollarSign className="h-4 w-4 text-green-500" />,
  transferencia: <FiDollarSign className="h-4 w-4 text-purple-500" />,
};

const paymentLabels: Record<string, string> = {
  tarjeta: 'Tarjeta',
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
};

const getRandomStatus = () => {
  const statuses: Array<'completado' | 'pendiente' | 'cancelado'> = ['completado', 'pendiente', 'cancelado'];
  return statuses[Math.floor(Math.random() * statuses.length)];
};

const getRandomPaymentMethod = () => {
  const methods = ['tarjeta', 'efectivo', 'transferencia'];
  return methods[Math.floor(Math.random() * methods.length)];
};

export function RecentSales() {
  const [sales, setSales] = useState<VentaReciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchDashboardData();
        
        // En una implementación real, estos datos vendrían de la API
        const ventasConDatosCompletos = data.ventasRecientes.map(venta => ({
          ...venta,
          estado: getRandomStatus(),
          metodoPago: getRandomPaymentMethod(),
        }));
        
        setSales(ventasConDatosCompletos);
      } catch (error) {
        console.error('Error loading recent sales:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const displayedSales = showAll ? sales : sales.slice(0, 5);

  if (loading) {
    return (
      <div className="bg-gray-900/50 rounded-2xl p-6 shadow-lg border border-yellow-700/10">
        <h2 className="text-lg font-semibold mb-6 text-yellow-400">Ventas recientes</h2>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-1/4"></div>
              <div className="h-4 bg-gray-700 rounded w-1/3"></div>
              <div className="h-4 bg-gray-700 rounded w-1/6"></div>
            </div>
          ))}
        </div>
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-yellow-400">Ventas recientes</h2>
        <span className="text-xs text-gray-400">
          {sales.length} {sales.length === 1 ? 'venta' : 'ventas'}
        </span>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {displayedSales.map((sale, i) => {
            const fecha = parseISO(sale.fecha);
            const tiempoTranscurrido = formatDistanceToNow(fecha, { 
              addSuffix: true, 
              locale: es 
            });
            
            return (
              <motion.div
                key={sale.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group bg-gray-800/30 hover:bg-gray-800/70 rounded-xl p-3 transition-colors duration-200 cursor-pointer border border-transparent hover:border-yellow-700/30"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-yellow-600/20 rounded-lg">
                        <FiShoppingBag className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-medium text-white truncate">
                          {sale.item}
                        </h3>
                        <div className="flex items-center mt-1 text-xs text-gray-400">
                          <FiUser className="mr-1" />
                          <span className="truncate">{sale.usuario}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4 flex flex-col items-end">
                    <span className="text-sm font-bold text-yellow-400">
                      S/ {sale.monto.toFixed(2)}
                    </span>
                    <div className="mt-1 flex items-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusStyles[sale.estado]}`}>
                        {sale.estado.charAt(0).toUpperCase() + sale.estado.slice(1)}
                      </span>
                      <div className="ml-2 flex items-center text-xs text-gray-500">
                        <FiClock className="mr-1 h-3 w-3" />
                        <span>{tiempoTranscurrido}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-2 pt-2 border-t border-gray-800/50 flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-400">
                    <span className="mr-2">Método de pago:</span>
                    <div className="flex items-center">
                      {paymentIcons[sale.metodoPago] || <FiDollarSign className="h-3 w-3 mr-1" />}
                      <span>{paymentLabels[sale.metodoPago] || sale.metodoPago}</span>
                    </div>
                  </div>
                  <FiChevronRight className="h-4 w-4 text-gray-500 group-hover:text-yellow-400 transition-colors" />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {sales.length > 5 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm font-medium text-yellow-500 hover:text-yellow-400 transition-colors flex items-center mx-auto"
          >
            {showAll ? 'Mostrar menos' : `Mostrar todas las ventas (${sales.length})`}
          </button>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-800/50">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-400">Hoy</p>
            <p className="text-lg font-bold text-yellow-400">
              S/ {sales.slice(0, 3).reduce((sum, sale) => sum + sale.monto, 0).toFixed(2)}
            </p>
          </div>
          <div className="border-x border-gray-800/50">
            <p className="text-sm text-gray-400">Esta semana</p>
            <p className="text-lg font-bold text-yellow-400">
              S/ {sales.reduce((sum, sale) => sum + sale.monto, 0).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Promedio/venta</p>
            <p className="text-lg font-bold text-yellow-400">
              S/ {(sales.reduce((sum, sale) => sum + sale.monto, 0) / sales.length).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
