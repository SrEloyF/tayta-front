"use client";
import React, { useState, useCallback } from "react";
import { CategoriesTable } from "./components/CategoriesTable";
import { CategoryForm } from "./components/CategoryForm";
import { Button } from '@/components/ui/Button';
import { Plus, Edit2, ArrowLeft } from 'lucide-react';
import { Categoria } from "./components/CategoriesTable";

export default function CategoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState<Categoria | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Abre el formulario para crear nueva categoría
  const handleNewCategory = () => {
    setSelectedCategory(null);
    setShowCategoryForm(true);
  };

  // Abre el formulario para editar categoría
  const handleEditCategory = (categoria: Categoria) => {
    setSelectedCategory(categoria);
    setShowCategoryForm(true);
  };

  // Maneja el éxito al guardar (crear o editar)
  const handleFormSuccess = useCallback(() => {
    setShowCategoryForm(false);
    setSelectedCategory(null);
    // Forzar actualización de la tabla
    setRefreshKey(prev => prev + 1);
  }, []);

  // Cancela el formulario
  const handleFormCancel = useCallback(() => {
    setShowCategoryForm(false);
    setSelectedCategory(null);
  }, []);

  // Maneja la eliminación de una categoría
  const handleDeleteCategory = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar esta categoría?")) {
      try {
        const res = await fetch(`/api/categorias/${id}`, { 
          method: "DELETE",
          headers: { 
            "Authorization": `Bearer ${localStorage.getItem("auth-token")}`,
            "Content-Type": "application/json"
          }
        });
        
        if (res.ok) {
          // Forzar actualización de la tabla
          setRefreshKey(prev => prev + 1);
        } else {
          const errorData = await res.json();
          alert(`Error al eliminar: ${errorData.message || 'Intento de eliminación fallido'}`);
        }
      } catch (error) {
        console.error('Error al eliminar categoría:', error);
        alert('Ocurrió un error al intentar eliminar la categoría');
      }
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 bg-gray-950 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center space-x-4">
          {showCategoryForm && (
            <Button 
              onClick={handleFormCancel}
              variant="outline"
              className="text-gray-300 hover:text-white border-gray-700"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Volver
            </Button>
          )}
          <h1 className="text-2xl font-bold text-yellow-400">
            {showCategoryForm 
              ? (selectedCategory ? 'Editar Categoría' : 'Nueva Categoría') 
              : 'Gestión de Categorías'}
          </h1>
        </div>
        
        {!showCategoryForm && (
          <Button 
            onClick={handleNewCategory}
            className="bg-yellow-600 hover:bg-yellow-700 text-white flex items-center"
          >
            <Plus className="mr-2 h-5 w-5" />
            Nueva Categoría
          </Button>
        )}
      </div>

      {showCategoryForm ? (
        <div className="bg-gray-900 rounded-xl p-6 shadow-lg border border-yellow-700/10">
          <CategoryForm 
            initialData={selectedCategory} 
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      ) : (
        <CategoriesTable 
          key={refreshKey} 
          onEdit={handleEditCategory} 
          onDelete={handleDeleteCategory}
        />
      )}
    </div>
  );
}
