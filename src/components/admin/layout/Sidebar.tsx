"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Wrench,
  List, 
  AlertCircle, 
  BarChart2,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { 
    name: "Dashboard", 
    href: "/admin/dashboard", 
    icon: LayoutDashboard,
    color: "text-blue-400"
  },
  { 
    name: "Usuarios", 
    href: "/admin/users", 
    icon: Users,
    color: "text-purple-400"
  },
  { 
    name: "Productos", 
    href: "/admin/products", 
    icon: Package,
    color: "text-green-400"
  },
  { 
    name: "Servicios", 
    href: "/admin/services", 
    icon: Wrench,
    color: "text-yellow-400"
  },
  { 
    name: "Categorías", 
    href: "/admin/categories", 
    icon: List,
    color: "text-pink-400"
  },
  { 
    name: "Reportes", 
    href: "/admin/reports", 
    icon: AlertCircle,
    color: "text-red-400"
  },
  { 
    name: "Estadísticas", 
    href: "/admin/statistics", 
    icon: BarChart2,
    color: "text-cyan-400"
  },
  { 
    name: "Configuración", 
    href: "/admin/settings", 
    icon: Settings,
    color: "text-gray-400"
  }
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobile: boolean;
}

export function Sidebar({ isOpen, onToggle, isMobile }: SidebarProps) {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  
  // Eliminamos el estado local de isMobile ya que ahora lo recibimos como prop

  const sidebarVariants = {
    open: { 
      width: isMobile ? '100%' : '16rem',
      x: 0,
      transition: { type: 'spring', damping: 25, stiffness: 300 }
    },
    closed: { 
      width: isMobile ? '0' : '5rem',
      x: isMobile ? '-100%' : 0,
      transition: { type: 'spring', damping: 25, stiffness: 300 }
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-gradient-to-b from-gray-900 to-gray-800 shadow-2xl ${
          isMobile ? 'w-72' : 'w-64'
        }`}
        variants={sidebarVariants}
        initial="closed"
        animate={isOpen ? 'open' : 'closed'}
        onHoverStart={() => !isMobile && setIsHovered(true)}
        onHoverEnd={() => !isMobile && !isOpen && setIsHovered(false)}
        transition={{
          type: 'spring',
          damping: 25,
          stiffness: 300,
          mass: 0.5
        }}
      >
        <div className="flex flex-col h-full">
          {/* Logo and Toggle */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
            <motion.div
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                delay: 0.1,
                type: 'spring',
                stiffness: 500,
                damping: 30
              }}
            >
              <motion.div 
                className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl cursor-pointer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                T
              </motion.div>
              <motion.span 
                className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent whitespace-nowrap"
                initial={{ opacity: 0, width: 0 }}
                animate={{ 
                  opacity: isOpen ? 1 : 0,
                  width: isOpen ? 'auto' : 0,
                  marginLeft: isOpen ? 12 : 0
                }}
                transition={{ duration: 0.3 }}
              >
                TaytaService
              </motion.span>
            </motion.div>
            <motion.button
              onClick={onToggle}
              className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors"
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronLeft 
                className={`h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-0' : 'rotate-180'}`} 
              />
            </motion.button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4">
            <div className="space-y-1 px-4">
              {navItems.map((item, index) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.1 + (index * 0.05),
                      type: 'spring',
                      stiffness: 300,
                      damping: 25
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href={item.href}
                      className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-white shadow-lg'
                          : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                      }`}
                    >
                      <motion.span
                        className={`p-1 rounded-lg ${
                          isActive 
                            ? 'bg-blue-500/20' 
                            : 'bg-gray-800/50 group-hover:bg-gray-700/50'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <item.icon
                          className={`h-5 w-5 flex-shrink-0 ${
                            isActive ? item.color : 'text-gray-400 group-hover:text-white'
                          }`}
                          aria-hidden="true"
                        />
                      </motion.span>
                      <motion.span 
                        className="truncate ml-3"
                        initial={{ opacity: 1 }}
                        animate={{ 
                          opacity: isOpen ? 1 : 0,
                          width: isOpen ? 'auto' : 0,
                          marginLeft: isOpen ? 12 : 0
                        }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                      >
                        {item.name}
                      </motion.span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </nav>

          {/* Logout */}
          <motion.div 
            className="border-t border-gray-700/50 p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="flex items-center space-x-3">
              <motion.div 
                className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <User className="h-5 w-5" />
              </motion.div>
              <motion.div 
                className="flex-1 min-w-0"
                initial={{ opacity: 1 }}
                animate={{ 
                  opacity: isOpen ? 1 : 0,
                  width: isOpen ? 'auto' : 0,
                  marginLeft: isOpen ? 12 : 0
                }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                <p className="text-sm font-medium text-white truncate">Admin User</p>
                <p className="text-xs text-gray-400 truncate">admin@taytaservice.com</p>
              </motion.div>
              <motion.button 
                className="text-gray-400 hover:text-white"
                whileHover={{ scale: 1.1, color: '#fff' }}
                whileTap={{ scale: 0.9 }}
              >
                <LogOut className="h-5 w-5" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.aside>
    </>
  );
}
