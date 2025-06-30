"use client";
import React, { useState, useCallback } from "react";
import { ServicesTable, Servicio } from "./components/ServicesTable";
import { ServiceForm } from "./components/ServiceForm";

export default function ServicesPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Servicio | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

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
      await fetch(`/api/items/${id}`, { method: "DELETE" });
      setRefreshKey(k => k + 1);
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
      <ServicesTable
        onEdit={handleEdit}
        onDelete={handleDelete}
        key={refreshKey}
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
    </div>
  );
}
