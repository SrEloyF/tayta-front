"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Categoria } from "./CategoriesTable";
import { authFetch } from "@/utils/authFetch";

interface CategoryFormProps {
  initialData?: Categoria | null;
  onSuccess: () => void;
  onCancel: () => void;
}

type ApiError = {
  error: string;
  msg?: string;
  details?: Record<string, string>;
};

export const CategoryForm: React.FC<CategoryFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors },
    setError: setFormFieldError
  } = useForm<Partial<Categoria>>({
    defaultValues: initialData || {}
  });

  useEffect(() => {
    reset(initialData || {});
    setFormError(null); // Limpiar errores al cambiar entre crear/editar
  }, [initialData, reset]);

  const onSubmit = async (values: Partial<Categoria>) => {
    if (isSubmitting) return;
    
    setFormError(null);
    setIsSubmitting(true);
    
    try {
      const method = initialData ? "PUT" : "POST";
      const url = initialData 
        ? `/api/categorias/${initialData.id_categoria}` 
        : "/api/categorias";

      const res = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });

      const data = await res.json();

      if (!res.ok) {
        // Manejar errores de validación del servidor
        if (res.status === 400 && data.error === "Validation error") {
          if (data.msg?.includes("SequelizeUniqueConstraintError")) {
            setFormError("Ya existe una categoría con este nombre.");
          } else {
            // Mapear errores de validación a campos específicos
            Object.entries(data.details || {}).forEach(([field, message]) => {
              setFormFieldError(field as keyof Categoria, {
                type: "server",
                message: String(message)
              });
            });
          }
        } else {
          setFormError(data.message || "Error al guardar la categoría");
        }
        return;
      }

      // Éxito
      onSuccess();
      reset();
    } catch (error) {
      console.error("Error en el formulario:", error);
      setFormError("Error de conexión. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit(onSubmit)} 
      className="bg-gray-900 rounded-xl p-6 shadow-lg border border-yellow-700/10 grid grid-cols-1 gap-4"
    >
      <div>
        <h2 className="text-lg font-semibold text-yellow-400 mb-4">
          {initialData ? "Editar" : "Nueva"} Categoría
        </h2>
        
        {formError && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded text-red-200 text-sm">
            {formError}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input 
              className={`w-full p-2 rounded bg-gray-800 text-gray-200 border ${
                errors.nombre ? 'border-red-500' : 'border-gray-700'
              } focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500`}
              placeholder="Ej: Postres"
              {...register("nombre", { 
                required: "El nombre es obligatorio",
                minLength: {
                  value: 3,
                  message: "Mínimo 3 caracteres"
                }
              })}
              disabled={isSubmitting}
            />
            {errors.nombre && (
              <p className="mt-1 text-sm text-red-400">{errors.nombre.message as string}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Descripción <span className="text-red-500">*</span>
            </label>
            <textarea
              className={`w-full p-2 rounded bg-gray-800 text-gray-200 border ${
                errors.descripcion ? 'border-red-500' : 'border-gray-700'
              } focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 min-h-[100px]`}
              placeholder="Describe la categoría"
              {...register("descripcion", { 
                required: "La descripción es obligatoria",
                minLength: {
                  value: 10,
                  message: "Mínimo 10 caracteres"
                }
              })}
              disabled={isSubmitting}
            />
            {errors.descripcion && (
              <p className="mt-1 text-sm text-red-400">
                {errors.descripcion.message as string}
              </p>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-yellow-600 hover:bg-yellow-700"
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {initialData ? 'Guardando...' : 'Creando...'}
            </span>
          ) : (
            <span>{initialData ? 'Guardar Cambios' : 'Crear Categoría'}</span>
          )}
        </Button>
      </div>
    </form>
  );
};
