// components/client/ServiceCategoryFilter.tsx
'use client';

import { useState } from 'react';

interface ServiceCategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

// Lista de categorías de servicios (puedes modificarla según tus necesidades)
const serviceCategories = [
  { id: 'all', name: 'Todos' },
  { id: 'design', name: 'Diseño' },
  { id: 'development', name: 'Desarrollo' },
  { id: 'marketing', name: 'Marketing' },
  { id: 'writing', name: 'Redacción' },
  { id: 'business', name: 'Negocios' },
  { id: 'photography', name: 'Fotografía' },
];

export function ServiceCategoryFilter({
  selectedCategory,
  onSelectCategory,
}: ServiceCategoryFilterProps) {
  const [showAll, setShowAll] = useState(false);

  // Mostrar solo 5 categorías inicialmente y un botón "Ver más"
  const visibleCategories = showAll 
    ? serviceCategories 
    : serviceCategories.slice(0, 5);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {visibleCategories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === category.id
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          {category.name}
        </button>
      ))}

      {serviceCategories.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="px-4 py-2 rounded-full text-sm font-medium text-blue-600 hover:bg-blue-50"
        >
          {showAll ? 'Ver menos' : 'Ver más'}
        </button>
      )}
    </div>
  );
}