// components/client/ClientFooter.tsx
import Link from 'next/link';
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi';

export function ClientFooter() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">TiendaPlus</h3>
            <p className="text-gray-400">
              La mejor plataforma para comprar productos y contratar servicios de calidad.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <FiFacebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <FiTwitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <FiInstagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <FiLinkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Comprar</h4>
            <ul className="space-y-2">
              <li><Link href="/client/products" className="text-gray-400 hover:text-white">Productos</Link></li>
              <li><Link href="/client/services" className="text-gray-400 hover:text-white">Servicios</Link></li>
              <li><Link href="/client/cart" className="text-gray-400 hover:text-white">Carrito</Link></li>
              <li><Link href="/client/orders" className="text-gray-400 hover:text-white">Mis pedidos</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Empresa</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-400 hover:text-white">Nosotros</Link></li>
              <li><Link href="/blog" className="text-gray-400 hover:text-white">Blog</Link></li>
              <li><Link href="/careers" className="text-gray-400 hover:text-white">Carreras</Link></li>
              <li><Link href="/press" className="text-gray-400 hover:text-white">Prensa</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-gray-400 hover:text-white">Privacidad</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-white">Términos</Link></li>
              <li><Link href="/security" className="text-gray-400 hover:text-white">Seguridad</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white">Contacto</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-700">
          <p className="text-gray-400 text-sm text-center">
            &copy; {new Date().getFullYear()} TiendaPlus. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}