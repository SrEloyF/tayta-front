'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiShoppingCart, FiUser, FiSearch, FiMenu, FiPlusCircle } from 'react-icons/fi';
import { useAuth } from '@/providers/AuthProvider';
import { useState, useRef, useEffect } from 'react';

export function ClientHeader() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const [cartCount, setCartCount] = useState(0);

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchCartCount = async () => {
      if (!user?.id) {
        setCartCount(0);
        return;
      }
      try {
        const token = localStorage.getItem('auth-token');
        const carritoRes = await fetch('/api/carritos/buscar', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            campo: 'id_usuario',
            valor: user.id.toString()
          })
        });
        const carritos = await carritoRes.json();
        const carrito = Array.isArray(carritos)
          ? carritos.find((c: any) => c.estado === 'E')
          : null;

        if (!carrito) {
          setCartCount(0);
          return;
        }

        const productosRes = await fetch('/api/carritos-productos/buscar', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            campo: 'id_carrito',
            valor: carrito.id_carrito.toString()
          })
        });
        const productos = await productosRes.json();
        const total = productos.reduce((sum: number, prod: any) => sum + (prod.cantidad || 0), 0);
        setCartCount(total);
      } catch {
        setCartCount(0);
      }
    };

    fetchCartCount();
  }, [user?.id]);

  const navLinks = [
    { name: 'Inicio', href: '/client' },
    { name: 'Productos', href: '/client/products' },
    { name: 'Servicios', href: '/client/services' },
    { name: 'Mis Pedidos', href: '/client/orders' },
    { name: 'Mis ventas', href: '/client/sells' },
    { name: 'Chats', href: '/client/chats' },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/client" className="text-2xl font-bold text-blue-600">
            Tayta<span className="text-green-600">Service</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Search Bar */}
            <div className="relative w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar productos o servicios..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Vender Button - Only visible when logged in */}
            {user && (
              <Link 
                href="/client/VenderProductos" 
                className="hidden md:flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                <FiPlusCircle className="h-5 w-5" />
                <span>Vender</span>
              </Link>
            )}

            {/* Cart */}
            <Link href="/client/cart" className="p-2 text-gray-600 hover:text-blue-600 relative">
              <FiShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Profile */}
            {user ? (
              <div className="relative" ref={accountMenuRef}>
                <button 
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600"
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                >
                  <FiUser className="h-6 w-6" />
                  <span className="hidden md:inline">Mi cuenta</span>
                </button>
                {accountMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <Link 
                      href="/client/profile" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setAccountMenuOpen(false)}
                    >
                      Perfil
                    </Link>
                    <Link 
                      href="/client/orders" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setAccountMenuOpen(false)}
                    >
                      Mis pedidos
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setAccountMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                href="/auth/login" 
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                Iniciar sesión
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-gray-600 hover:text-blue-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <FiMenu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Secondary Navigation - Desktop */}
        <div className="hidden md:flex justify-center py-2 border-t border-gray-200">
          <nav className="flex space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium ${
                  pathname === link.href ? 'text-blue-600' : 'text-gray-700 hover:text-blue-500'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-gray-200">
            {/* Mobile Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Mobile Navigation Links */}
            <nav className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-base font-medium ${
                    pathname === link.href 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              {/* Mobile Vender Button */}
              {user && (
                <Link 
                  href="/client/VenderProductos" 
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FiPlusCircle className="h-5 w-5" />
                  <span>Vender productos</span>
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}