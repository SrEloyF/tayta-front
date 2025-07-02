"use client";
import React, { useState, useCallback } from "react";
import { ProductsTable } from "./components/ProductsTable";
import { ProductForm } from "./components/ProductForm";
import { Button } from '@/components/ui/Button';
import { Plus, Edit2, ArrowLeft } from 'lucide-react';
import { Producto } from "@/features/types";

export default function ProductsPage() {
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Abre el formulario para crear nuevo producto
  const handleNewProduct = () => {
    setSelectedProduct(null);
    setShowProductForm(true);
  };

  // Abre el formulario para editar producto
  const handleEditProduct = (producto: Producto) => {
    setSelectedProduct(producto);
    setShowProductForm(true);
  };

  // Maneja el éxito al guardar (crear o editar)
  const handleFormSuccess = useCallback(() => {
    setShowProductForm(false);
    setSelectedProduct(null);
    // Forzar actualización de la tabla
    setRefreshKey(prev => prev + 1);
  }, []);

  // Cancela el formulario
  const handleFormCancel = useCallback(() => {
    setShowProductForm(false);
    setSelectedProduct(null);
  }, []);

  return (
    <div className="p-4 md:p-8 space-y-8 bg-gray-950 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center space-x-4">
          {showProductForm && (
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
            {showProductForm 
              ? (selectedProduct ? 'Editar Producto' : 'Nuevo Producto') 
              : 'Gestión de Productos'}
          </h1>
        </div>
        
        {!showProductForm && (
          <Button 
            onClick={handleNewProduct}
            className="bg-yellow-600 hover:bg-yellow-700 text-white flex items-center"
          >
            <Plus className="mr-2 h-5 w-5" />
            Nuevo Producto
          </Button>
        )}
      </div>

      {showProductForm ? (
        <div className="bg-gray-900 rounded-xl p-6 shadow-lg border border-yellow-700/10">
          <ProductForm 
            initialData={selectedProduct} 
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      ) : (
        <ProductsTable 
          key={refreshKey} 
          onEdit={handleEditProduct} 
        />
      )}
    </div>
  );
}
