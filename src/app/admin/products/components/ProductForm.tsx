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
  
  const imagenUrl = watch('imagen') as string;
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Función para manejar la carga de imágenes
  const handleImageUpload = useCallback((url: string | undefined) => {
    setValue('imagen', url || '');
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

  const onSubmit = async (values: Partial<Producto>) => {
    try {
      setIsLoading(true);
      const method = initialData ? "PUT" : "POST";
      const url = initialData ? `/api/items/${initialData.id_item}` : "/api/items";
      
      // Depuración completa
      console.log('Valores recibidos:', JSON.stringify(values, null, 2));
      console.log('Tipo de imagen:', typeof values.imagen);
      console.log('Contenido de imagen:', values.imagen);

      // Preparar datos para enviar
      const body: Partial<Producto> = { 
        ...values,
        es_servicio: false,
        estado: 'A'
      };

      // Manejar la imagen
      let nombreArchivo = initialData?.url_img;
      
      // Verificación exhaustiva de la imagen
      const imagen = values.imagen 
        ? (values.imagen instanceof FileList 
          ? values.imagen[0] 
          : (Array.isArray(values.imagen) && values.imagen.length > 0
            ? values.imagen[0]
            : (typeof values.imagen === 'object' && 'name' in values.imagen
              ? values.imagen
              : null)))
        : null;

      console.log('Objeto imagen detectado:', imagen);
      console.log('Tipo de imagen detectada:', typeof imagen);
      console.log('Propiedades de imagen:', imagen ? Object.keys(imagen) : 'No hay imagen');

      // Si hay un archivo nuevo para subir
      if (imagen) {
        const uploadData = new FormData();
        uploadData.append('carpeta', 'item_imgs');
        uploadData.append('imagen', imagen);

        console.log('Detalles de imagen a subir:', {
          name: imagen.name,
          type: imagen.type,
          size: imagen.size
        });

        const token = localStorage.getItem('auth-token');

        console.log('Iniciando subida de imagen...');
        const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload-img?carpeta=item_imgs`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: uploadData
        });

        console.log('Respuesta de subida:', {
          status: uploadRes.status,
          statusText: uploadRes.statusText
        });

        // Leer el cuerpo de la respuesta para más detalles
        const responseBody = await uploadRes.text();
        console.log('Cuerpo de la respuesta:', responseBody);

        if (!uploadRes.ok) {
          throw new Error(responseBody || 'Error al subir la imagen');
        }

        let uploadResponseData;
        try {
          uploadResponseData = JSON.parse(responseBody);
        } catch (parseError) {
          console.error('Error parseando respuesta:', parseError);
          throw new Error('Respuesta del servidor no es un JSON válido');
        }

        nombreArchivo = uploadResponseData.nombreArchivo;
        console.log('Nombre de archivo subido:', nombreArchivo);
      } 
      // Si ya es un nombre de archivo de imagen existente
      else if (typeof values.imagen === 'string') {
        nombreArchivo = values.imagen;
        console.log('Usando nombre de archivo existente:', nombreArchivo);
      }

      // Agregar url_img al cuerpo
      body.url_img = nombreArchivo;

      // Eliminar campos undefined
      Object.keys(body).forEach(key => 
        body[key as keyof Partial<Producto>] === undefined && delete body[key as keyof Partial<Producto>]
      );

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
      
      {/* Campo de imagen */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-2">Imágenes del producto</h3>
          <p className="text-xs text-gray-400 mb-3">
            Sube una imagen principal para tu producto. Formatos: JPG, PNG, WEBP (máx. 5MB)
          </p>
          <ImageUpload
            value={imagenUrl} // Update the value to use watch
            disabled={isLoading}
            onChange={handleImageUpload}
            folder="item_imgs"
            label="Imagen principal"
            required={!initialData} // Solo requerido para nuevos productos
            className="border-2 border-dashed border-gray-700 hover:border-yellow-500/50 transition-colors"
          />
        </div>
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
