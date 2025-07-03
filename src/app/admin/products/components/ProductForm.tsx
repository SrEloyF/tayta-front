"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Producto } from "./ProductsTable";
import { authFetch } from "@/utils/authFetch";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { toast } from "sonner";

interface Categoria {
  id_categoria: number;
  nombre: string;
}
interface Vendedor {
  id_usuario: number;
  nombres: string;
}   

interface ProductFormProps {
  initialData?: Producto | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<Partial<Producto>>({
    defaultValues: initialData || { estado: "A" }
  });
  
  const imagenUrl = watch('url_img') as string;
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Validación para url_img
  useEffect(() => {
    register('url_img', { required: 'La imagen es obligatoria' });
  }, [register]);

  // Función para manejar la carga de imágenes
  const handleImageUpload = useCallback((nombreArchivo: string) => {
    setValue('url_img', nombreArchivo, { shouldValidate: true });
  }, [setValue]);

  useEffect(() => {
    reset(initialData || { estado: "A" });
  }, [initialData, reset]);

  const fetchData = async () => {
    try {
      // Obtener categorías
      const catRes = await authFetch("/api/categorias");
      if (!catRes.ok) throw new Error("Error al cargar categorías");
      const catData = await catRes.json();
      setCategorias(Array.isArray(catData) ? catData : catData.data || []);

      // Obtener vendedores
      const vendRes = await authFetch("/api/usuarios");
      if (!vendRes.ok) throw new Error("Error al cargar vendedores");
      const vendData = await vendRes.json();
      setVendedores(Array.isArray(vendData) ? vendData : vendData.data || []);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      // Mostrar mensaje de error al usuario
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // url_img será manejado por ImageUpload y guardado en el form
  const onSubmit = async (values: any) => {
    try {
      setIsLoading(true);
      const method = initialData ? "PUT" : "POST";
      const url = initialData ? `/api/items/${initialData.id_item}` : "/api/items";
      const token = localStorage.getItem('auth-token');
      
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      // Ya no subimos la imagen aquí, solo validamos que url_img esté presente
      if (!values.url_img) {
        throw new Error('Debes seleccionar y subir una imagen para el producto');
      }

      // 2) Preparar datos del ítem
      const body: any = { 
        nombre: values.nombre.trim(),
        descripcion: values.descripcion || 'Sin descripción',
        precio: parseFloat(values.precio),
        id_categoria: parseInt(values.id_categoria),
        id_vendedor: parseInt(values.id_vendedor),
        es_servicio: false,
        estado: 'A',
        url_img: values.url_img,
        stock: values.stock ? parseInt(values.stock) : 0
      };

      // Eliminar campos vacíos
      Object.keys(body).forEach(key => {
        if (body[key] === undefined || body[key] === '') {
          delete body[key];
        }
      });

      const res = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al guardar el producto');
      }

      toast.success(initialData ? 'Producto actualizado correctamente' : 'Producto creado correctamente');
      onSuccess();
      reset();
    } catch (error) {
      console.error('Error completo:', error);
      toast.error(error instanceof Error ? error.message : 'Error al procesar la solicitud');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-900 rounded-xl p-6 shadow-lg border border-yellow-700/10 grid grid-cols-1 gap-4">
      <h2 className="text-lg font-semibold text-yellow-400 mb-2">{initialData ? "Editar" : "Crear"} Producto</h2>
      
      {/* Imagen del producto */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Imagen del producto <span className="text-red-500">*</span>
        </label>
        <ImageUpload
          value={imagenUrl}
          onChange={(nombreArchivo) => handleImageUpload(nombreArchivo)}
          folder="item_imgs"
          required={!initialData} // Solo requerido para nuevos productos
        />
        {errors.url_img && (
          <p className="text-red-600 text-xs mt-1">{errors.url_img.message}</p>
        )}
      </div>
      
      <div>
        <input 
          className="w-full p-2 rounded bg-gray-800 text-gray-200 border border-gray-700 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-colors" 
          placeholder="Nombre del producto" 
          {...register("nombre", { 
            required: { value: true, message: 'El nombre es obligatorio' } 
          })} 
        />
        {errors.nombre && (
          <p className="mt-1 text-sm text-red-400">{errors.nombre.message?.toString()}</p>
        )}
      </div>
      
      <div>
        <textarea 
          className="w-full p-2 rounded bg-gray-800 text-gray-200 border border-gray-700 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-colors min-h-[100px]" 
          placeholder="Descripción del producto" 
          {...register("descripcion", { 
            required: { value: true, message: 'La descripción es obligatoria' } 
          })} 
        />
        {errors.descripcion && (
          <p className="mt-1 text-sm text-red-400">{errors.descripcion.message?.toString()}</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <input 
            className="w-full p-2 rounded bg-gray-800 text-gray-200 border border-gray-700 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-colors" 
            type="number" 
            step="0.01"
            placeholder="Precio (S/)" 
            {...register("precio", { 
              required: { value: true, message: 'El precio es obligatorio' },
              min: { value: 0.01, message: 'El precio debe ser mayor a 0' },
              valueAsNumber: true 
            })} 
          />
          {errors.precio && (
            <p className="mt-1 text-sm text-red-400">{errors.precio.message?.toString()}</p>
          )}
        </div>
        
        <div>
          <input 
            className="w-full p-2 rounded bg-gray-800 text-gray-200 border border-gray-700 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-colors" 
            type="number" 
            placeholder="Stock" 
            {...register("stock", { 
              required: { value: true, message: 'El stock es obligatorio' },
              min: { value: 0, message: 'El stock no puede ser negativo' },
              valueAsNumber: true 
            })} 
          />
          {errors.stock && (
            <p className="mt-1 text-sm text-red-400">{errors.stock.message?.toString()}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <select 
            className="w-full p-2 rounded bg-gray-800 text-gray-200 border border-gray-700 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-colors" 
            {...register("id_categoria", { 
              required: { value: true, message: 'La categoría es obligatoria' } 
            })}
            disabled={isLoading}
          >
            <option value="">Selecciona categoría</option>
            {categorias.map(c => (
              <option key={c.id_categoria} value={c.id_categoria}>
                {c.nombre}
              </option>
            ))}
          </select>
          {errors.id_categoria && (
            <p className="mt-1 text-sm text-red-400">{errors.id_categoria.message?.toString()}</p>
          )}
        </div>
        
        <div>
          <select 
            className="w-full p-2 rounded bg-gray-800 text-gray-200 border border-gray-700 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-colors" 
            {...register("id_vendedor", { 
              required: { value: true, message: 'El vendedor es obligatorio' } 
            })}
            disabled={isLoading}
          >
            <option value="">Selecciona vendedor</option>
            {vendedores.map(u => (
              <option key={u.id_usuario} value={u.id_usuario}>
                {u.nombres}
              </option>
            ))}
          </select>
          {errors.id_vendedor && (
            <p className="mt-1 text-sm text-red-400">{errors.id_vendedor.message?.toString()}</p>
          )}
        </div>
      </div>
      
      <div>
        <select 
          className="w-full p-2 rounded bg-gray-800 text-gray-200 border border-gray-700 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-colors" 
          {...register("estado", { 
            required: { value: true, message: 'El estado es obligatorio' } 
          })}
          disabled={isLoading}
        >
          <option value="A">Activo</option>
          <option value="I">Inactivo</option>
        </select>
      </div>
      
      <div className="flex justify-end gap-3 pt-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading}
          className="px-6"
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading || isSubmitting}
          isLoading={isLoading}
          className="px-6"
        >
          {initialData ? "Guardar Cambios" : "Crear Producto"}
        </Button>
      </div>
    </form>
  );
};
