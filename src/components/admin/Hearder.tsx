// components/admin/Header.tsx
import { FiBell, FiSearch, FiUser } from 'react-icons/fi';

export function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-between p-4">
        <div className="relative w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Buscar..."
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100">
            <FiBell className="h-5 w-5" />
          </button>
          
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <FiUser className="h-5 w-5" />
            </div>
            <span className="ml-2 text-sm font-medium text-gray-900">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}