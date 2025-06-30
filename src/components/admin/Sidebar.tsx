"use client";
// components/admin/Sidebar.tsx
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiUsers, FiShoppingBag, FiTool, FiBarChart2, FiSettings } from 'react-icons/fi';

export function Sidebar() {
  const pathname = usePathname();
  
  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: FiHome },
    { name: 'Usuarios', href: '/admin/users', icon: FiUsers },
    { name: 'Productos', href: '/admin/products', icon: FiShoppingBag },
    { name: 'Servicios', href: '/admin/services', icon: FiTool },
    { name: 'Reportes', href: '/admin/reports', icon: FiBarChart2 },
    { name: 'Configuración', href: '/admin/settings', icon: FiSettings },
  ];

  return (
    <div className="w-64 bg-teal-150 shadow-md">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold  text-gray-900">Admin Panel</h2>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  pathname === item.href
                    ? 'bg-teal-200 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon className="mr-3" />
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}