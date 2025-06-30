"use client";
import { useState } from "react";
import { CategoriesTable } from "./components/CategoriesTable";
import { CategoryForm } from "./components/CategoryForm";
import { Categoria } from "./components/CategoriesTable";

export default function CategoriesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Categoria | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEdit = (categoria: Categoria) => {
    setEditingCategory(categoria);
    setIsFormOpen(true);
  };

  const handleSuccess = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
    setRefreshKey(prev => prev + 1); // Forzar recarga de la tabla
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar esta categoría?")) {
      try {
        const res = await fetch(`/api/categorias/${id}`, { 
          method: "DELETE",
          headers: { "Authorization": `Bearer ${localStorage.getItem("auth-token")}` }
        });
        if (res.ok) setRefreshKey(prev => prev + 1);
      } catch (err) {
        console.error("Error al eliminar:", err);
      }
    }
  };

  return (
    <div className="p-8 space-y-8 bg-gray-950 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-yellow-400">Gestión de Categorías</h1>
        <button 
          onClick={() => {
            setEditingCategory(null);
            setIsFormOpen(true);
          }}
          className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Nueva Categoría
        </button>
      </div>
      
      <CategoriesTable 
        key={refreshKey}
        onEdit={handleEdit} 
        onDelete={handleDelete} 
      />

      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md border border-yellow-700/30">
            <CategoryForm 
              initialData={editingCategory} 
              onSuccess={handleSuccess}
              onCancel={() => setIsFormOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
