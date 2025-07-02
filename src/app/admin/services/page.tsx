"use client";
import React, { useState, useCallback } from "react";
import { ServicesTable, Servicio } from "./components/ServicesTable";
import { ServiceForm } from "./components/ServiceForm";
import { Input } from "@/components/ui/Input";

export default function ServicesPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Servicio | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const handleNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (servicio: Servicio) => {
    setEditing(servicio);
    setFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Seguro que deseas eliminar este servicio?")) {
      try {
        const response = await fetch(`/api/items/${id}`, { method: "DELETE" });
        if (response.ok) {
          setRefreshKey(k => k + 1);
        } else {
          const errorData = await response.json();
          alert(`Error al eliminar: ${errorData.message || 'Intento de eliminación fallido'}`);
        }
      } catch (error) {
        console.error("Error al eliminar servicio:", error);
        alert("Ocurrió un error al intentar eliminar el servicio");
      }
    }
  };

  const handleSuccess = useCallback(() => {
    setFormOpen(false);
    setEditing(null);
    setRefreshKey(k => k + 1);
  }, []);

  const handleCancel = useCallback(() => {
    setFormOpen(false);
    setEditing(null);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="p-8 space-y-8 bg-gray-950 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-yellow-400">Gestión de Servicios</h1>
        <button
          className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded transition-colors"
          onClick={handleNew}
        >
          Nuevo Servicio
        </button>
      </div>
      
      <div className="mb-4 flex justify-between items-center">
        <Input 
          placeholder="Buscar servicios..." 
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full max-w-md"
        />
      </div>

      <ServicesTable
        onEdit={handleEdit}
        onDelete={handleDelete}
        key={refreshKey}
        searchTerm={searchTerm}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onTotalPagesChange={setTotalPages}
      />

      {formOpen && (
        <div className="mt-8">
          <ServiceForm
            initialData={editing}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(index + 1)}
              className={`px-4 py-2 rounded ${
                currentPage === index + 1 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
