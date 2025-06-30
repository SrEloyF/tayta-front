"use client";
import React, { useState, useCallback } from "react";
import { ProductsTable, Producto } from "./components/ProductsTable";
import { ProductForm } from "./components/ProductForm";

export default function ProductsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Producto | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Abre el formulario para crear
  const handleNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  // Abre el formulario para editar
  const handleEdit = (producto: Producto) => {
    setEditing(producto);
    setFormOpen(true);
  };

  // Borra un producto y refresca la tabla
  const handleDelete = async (id: number) => {
    if (window.confirm("¿Seguro que deseas eliminar este producto?")) {
      await fetch(`/api/items/${id}`, { method: "DELETE" });
      setRefreshKey(k => k + 1);
    }
  };

  // Al guardar/cancelar, cerrar formulario y refrescar tabla
  const handleSuccess = useCallback(() => {
    setFormOpen(false);
    setEditing(null);
    setRefreshKey(k => k + 1);
  }, []);
  const handleCancel = useCallback(() => {
    setFormOpen(false);
    setEditing(null);
  }, []);

  return (
    <div className="p-8 space-y-8 bg-gray-950 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-yellow-400">Gestión de Productos</h1>
        <button
          className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded transition-colors"
          onClick={handleNew}
        >
          Nuevo Producto
        </button>
      </div>
      <ProductsTable
        onEdit={handleEdit}
        onDelete={handleDelete}
        key={refreshKey}
      />
      {formOpen && (
        <div className="mt-8">
          <ProductForm
            initialData={editing}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      )}
    </div>
  );
}
