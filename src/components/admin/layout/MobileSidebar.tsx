"use client";

import React from "react";
import { X, LayoutDashboard, Users, Package, Wrench, List, AlertCircle, BarChart2, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { 
    name: "Dashboard", 
    href: "/admin/dashboard", 
    icon: LayoutDashboard 
  },
  { 
    name: "Usuarios", 
    href: "/admin/users", 
    icon: Users 
  },
  { 
    name: "Productos", 
    href: "/admin/products", 
    icon: Package 
  },
  { 
    name: "Servicios", 
    href: "/admin/services", 
    icon: Wrench 
  },
  { 
    name: "Categorías", 
    href: "/admin/categories", 
    icon: List 
  },
  { 
    name: "Reportes", 
    href: "/admin/reports", 
    icon: AlertCircle 
  },
  { 
    name: "Estadísticas", 
    href: "/admin/statistics", 
    icon: BarChart2 
  }
];

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Fondo oscuro */}
      <div 
        className="fixed inset-0 bg-gray-600 bg-opacity-75"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Panel lateral */}
      <div className="fixed inset-y-0 left-0 flex max-w-xs w-full">
        <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
          {/* Encabezado */}
          <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
            <span className="text-xl font-bold text-blue-600">TaytaService</span>
            <button
              type="button"
              className="rounded-md p-2.5 text-gray-700 hover:bg-gray-100"
              onClick={onClose}
            >
              <span className="sr-only">Cerrar menú</span>
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          
          {/* Navegación */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "group flex items-center rounded-md px-3 py-3 text-base font-medium",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-4 h-6 w-6 flex-shrink-0",
                      isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500"
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          {/* Pie de página */}
          <div className="border-t border-gray-200 p-4">
            <Link
              href="/admin/configuracion"
              onClick={onClose}
              className={cn(
                "group flex items-center rounded-md px-3 py-3 text-base font-medium",
                pathname === "/admin/configuracion"
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Settings
                className={cn(
                  "mr-4 h-6 w-6 flex-shrink-0",
                  pathname === "/admin/configuracion" ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500"
                )}
                aria-hidden="true"
              />
              Configuración
            </Link>
            <button
              className="group flex w-full items-center rounded-md px-3 py-3 text-base font-medium text-red-600 hover:bg-red-50"
              onClick={() => {
                // Lógica de cierre de sesión
                onClose();
              }}
            >
              <LogOut className="mr-4 h-6 w-6 flex-shrink-0 text-red-400 group-hover:text-red-500" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
