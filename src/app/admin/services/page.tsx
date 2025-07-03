"use client";
import React, { useState, useCallback } from "react";
import { ServicesTable } from "./components/ServicesTable";
import { ServiceForm } from "./components/ServiceForm";
import { Button } from '@/components/ui/Button';
import { Plus, Edit2, ArrowLeft } from 'lucide-react';
import { Servicio } from "./components/ServicesTable";

export default function ServicesPage() {
  const [selectedService, setSelectedService] = useState<Servicio | null>(null);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Abre el formulario para crear nuevo servicio
  const handleNewService = () => {
    setSelectedService(null);
    setShowServiceForm(true);
  };

  // Abre el formulario para editar servicio
  const handleEditService = (servicio: Servicio) => {
    setSelectedService(servicio);
    setShowServiceForm(true);
  };

  // Maneja el éxito al guardar (crear o editar)
  const handleFormSuccess = useCallback(() => {
    setShowServiceForm(false);
    setSelectedService(null);
    // Forzar actualización de la tabla
    setRefreshKey(prev => prev + 1);
  }, []);

  // Cancela el formulario
  const handleFormCancel = useCallback(() => {
    setShowServiceForm(false);
    setSelectedService(null);
  }, []);

  // Maneja la eliminación de un servicio
  const handleDeleteService = async (id: number) => {
    try {
      const response = await fetch(`/api/items/${id}`, { method: 'DELETE' });
      if (response.ok) {
        // Forzar actualización de la tabla
        setRefreshKey(prev => prev + 1);
      } else {
        const errorData = await response.json();
        alert(`Error al eliminar: ${errorData.message || 'Intento de eliminación fallido'}`);
      }
    } catch (error) {
      console.error('Error al eliminar servicio:', error);
      alert('Ocurrió un error al intentar eliminar el servicio');
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 bg-gray-950 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center space-x-4">
          {showServiceForm && (
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
            {showServiceForm 
              ? (selectedService ? 'Editar Servicio' : 'Nuevo Servicio') 
              : 'Gestión de Servicios'}
          </h1>
        </div>
        
        {!showServiceForm && (
          <Button 
            onClick={handleNewService}
            className="bg-yellow-600 hover:bg-yellow-700 text-white flex items-center"
          >
            <Plus className="mr-2 h-5 w-5" />
            Nuevo Servicio
          </Button>
        )}
      </div>

      {showServiceForm ? (
        <div className="bg-gray-900 rounded-xl p-6 shadow-lg border border-yellow-700/10">
          <ServiceForm 
            initialData={selectedService} 
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      ) : (
        <ServicesTable 
          key={refreshKey} 
          onEdit={handleEditService} 
          onDelete={handleDeleteService}
        />
      )}
    </div>
  );
}
