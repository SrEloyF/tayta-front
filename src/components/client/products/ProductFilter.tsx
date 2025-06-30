// components/client/ProductFilter.tsx
'use client';

import { useState, useEffect } from 'react';
import { FiFilter, FiX } from 'react-icons/fi';

interface ProductFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
  categories: string[];
}

export function ProductFilter({
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceChange,
  categories = [],
}: ProductFilterProps) {
  const [minPrice, maxPrice] = priceRange;
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Agregar "Todas" como primera opción
  const allCategories = ['Todas', ...categories];

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      {/* Mobile filter dialog */}
      <div className="lg:hidden mb-4">
        <button
          type="button"
          className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
          onClick={() => setMobileFiltersOpen(true)}
        >
          <FiFilter className="mr-2 h-5 w-5" />
          Filtros
        </button>

        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-40 overflow-y-auto bg-black bg-opacity-50">
            <div className="relative bg-white w-full max-w-xs h-full ml-auto shadow-xl">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-lg font-medium text-gray-900">Filtros</h2>
                <button
                  type="button"
                  className="-mr-2 w-10 h-10 flex items-center justify-center"
                  onClick={() => setMobileFiltersOpen(false)}
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              <div className="p-4">
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-3">Categorías</h3>
                  <div className="space-y-2">
                    {allCategories.map((category) => (
                      <div key={category} className="flex items-center">
                        <input
                          id={`mobile-category-${category}`}
                          name="category"
                          type="radio"
                          checked={selectedCategory === category}
                          onChange={() => {
                            onCategoryChange(category);
                            setMobileFiltersOpen(false);
                          }}
                          className="h-4 w-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <label
                          htmlFor={`mobile-category-${category}`}
                          className="ml-3 text-sm text-gray-600"
                        >
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Rango de precios</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>${minPrice}</span>
                      <span>${maxPrice}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      value={minPrice}
                      onChange={(e) => onPriceChange([Number(e.target.value), maxPrice])}
                      className="w-full"
                    />
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      value={maxPrice}
                      onChange={(e) => onPriceChange([minPrice, Number(e.target.value)])}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop filters */}
      <div className="hidden lg:block">
        <h3 className="font-medium text-gray-900 mb-3">Categorías</h3>
        <div className="space-y-2 mb-6">
          {allCategories.map((category) => (
            <div key={category} className="flex items-center">
              <input
                id={`desktop-category-${category}`}
                name="category"
                type="radio"
                checked={selectedCategory === category}
                onChange={() => onCategoryChange(category)}
                className="h-4 w-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor={`desktop-category-${category}`}
                className="ml-3 text-sm text-gray-600"
              >
                {category}
              </label>
            </div>
          ))}
        </div>

        <h3 className="font-medium text-gray-900 mb-3">Rango de precios</h3>
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-gray-600">
            <span>${minPrice}</span>
            <span>${maxPrice}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="minPrice" className="block text-xs text-gray-500 mb-1">
                Mínimo
              </label>
              <input
                type="number"
                id="minPrice"
                min="0"
                max={maxPrice}
                value={minPrice}
                onChange={(e) => onPriceChange([Number(e.target.value), maxPrice])}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="maxPrice" className="block text-xs text-gray-500 mb-1">
                Máximo
              </label>
              <input
                type="number"
                id="maxPrice"
                min={minPrice}
                max="10000"
                value={maxPrice}
                onChange={(e) => onPriceChange([minPrice, Number(e.target.value)])}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="range"
              min="0"
              max="1000"
              value={minPrice}
              onChange={(e) => onPriceChange([Number(e.target.value), maxPrice])}
              className="w-full"
            />
            <input
              type="range"
              min="0"
              max="1000"
              value={maxPrice}
              onChange={(e) => onPriceChange([minPrice, Number(e.target.value)])}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}