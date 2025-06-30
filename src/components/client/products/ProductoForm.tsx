'use client';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { useAuth } from '@/providers/AuthProvider';
import { useEffect, useState, useMemo } from 'react';

type Categoria = {
  id_categoria: number;
  nombre: string;
  descripcion?: string;
};

type ProductoFormData = {
  nombre: string;
  descripcion: string;
  precio: string;
  es_servicio: boolean;
  estado: string;
  id_categoria: string;
  stock: string;
  id_vendedor: number;
  imagen: FileList;
};

import { SubmitHandler } from 'react-hook-form';

type ProductoFormProps = {
  onSubmit: SubmitHandler<ProductoFormData>;
  initialData?: Partial<ProductoFormData>;
  isSubmitting: boolean;
  isEditMode?: boolean;
  categorias: Categoria[];
};

export const ProductoForm = ({ 
  onSubmit, 
  initialData, 
  isSubmitting, 
  isEditMode = false,
  categorias = []
}: ProductoFormProps) => {
  const { user } = useAuth();
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm<ProductoFormData>({
    defaultValues: {
      nombre: '',
      descripcion: '',
      precio: '',
      es_servicio: false,
      estado: 'A',
      id_categoria: '',
      stock: '0',
      id_vendedor: user?.id ? Number(user.id) : 0,
      ...initialData
    }
  });

  const esServicio = watch('es_servicio');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialData?.id_categoria || '');

  // Procesamiento optimizado de categorías
  const categoriasValidas = useMemo(() => {
    return categorias
      .filter(cat => cat?.id_categoria && cat.nombre)
      .map(cat => ({
        id_categoria: cat.id_categoria,
        nombre: cat.nombre.trim(),
        descripcion: cat.descripcion?.trim()
      }));
  }, [categorias]);

  // Registrar y sincronizar campo de categoría
  useEffect(() => {
    register('id_categoria', { 
      required: 'Selecciona una categoría',
      validate: value => value !== '' || 'Selecciona una categoría'
    });
    
    if (selectedCategory) {
      setValue('id_categoria', selectedCategory, { shouldValidate: true });
    }
  }, [register, selectedCategory, setValue]);

  // Establecer valores iniciales
  useEffect(() => {
    if (initialData?.id_categoria) {
      setSelectedCategory(initialData.id_categoria);
    }
    if (user?.id) {
      setValue('id_vendedor', Number(user.id));
    }
  }, [initialData?.id_categoria, user?.id, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm">
      <h2 className="text-2xl font-semibold text-gray-800 border-b pb-4">Información del Producto</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nombre */}
        <div className="space-y-2 col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Nombre del producto/servicio <span className="text-red-500">*</span>
          </label>
          <Input 
            {...register('nombre', { 
              required: 'Este campo es requerido',
              minLength: {
                value: 3,
                message: 'Mínimo 3 caracteres'
              },
              maxLength: {
                value: 100,
                message: 'Máximo 100 caracteres'
              }
            })} 
            placeholder="Ej: Camiseta de algodón"
            className="focus:ring-2 text-black focus:ring-blue-500 focus:border-blue-500 w-full"
          />
          {errors.nombre && (
            <p className="text-red-600 text-xs mt-1">{errors.nombre.message}</p>
          )}
        </div>

        {/* Descripción */}
        <div className="space-y-2 col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Descripción <span className="text-gray-500 text-xs">(Opcional)</span>
          </label>
          <textarea
            {...register('descripcion', {
              maxLength: {
                value: 500,
                message: 'Máximo 500 caracteres'
              }
            })}
            placeholder="Describe tu producto o servicio en detalle"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            rows={3}
          />
          {errors.descripcion && (
            <p className="text-red-600 text-xs mt-1">{errors.descripcion.message}</p>
          )}
        </div>

        {/* Precio */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Precio <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
            <Input 
              type="number" 
              step="0.01" 
              min="0"
              className="pl-8 focus:ring-2 text-black focus:ring-blue-500 focus:border-blue-500"
              {...register('precio', { 
                required: 'Este campo es requerido',
                min: {
                  value: 0.01,
                  message: 'El precio debe ser mayor a 0'
                }
              })} 
              placeholder="0.00"
            />
          </div>
          {errors.precio && (
            <p className="text-red-600 text-xs mt-1">{errors.precio.message}</p>
          )}
        </div>

        {/* Categoría */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Categoría <span className="text-red-500">*</span>
          </label>
          <Select 
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
              <SelectValue placeholder="Selecciona una categoría">
                {selectedCategory && categoriasValidas.find(c => String(c.id_categoria) === selectedCategory)?.nombre}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {categoriasValidas.map((categoria) => (
                <SelectItem 
                  key={`cat-${categoria.id_categoria}`}
                  value={String(categoria.id_categoria)}
                  className="hover:bg-blue-100 focus:bg-blue-50"
                >
                  <div className="flex flex-col">
                    <span className=" text-gray-800 font-medium">{categoria.nombre}</span>
                    {categoria.descripcion && (
                      <span className="text-xs text-gray-600">{categoria.descripcion}</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.id_categoria && (
            <p className="text-red-600 text-xs mt-1">{errors.id_categoria.message}</p>
          )}
        </div>

        <div className="space-y-2 col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Imagen del producto/servicio <span className="text-red-500">*</span>
          </label>
          <Input
            type="file"
            accept="image/*"
            {...register('imagen', {
              required: 'La imagen es obligatoria',
              validate: files => files && files.length > 0 || 'Debes seleccionar una imagen'
            })}
            className="focus:ring-2 text-black focus:ring-blue-500 focus:border-blue-500 w-full"
          />
          {errors.imagen && (
            <p className="text-red-600 text-xs mt-1">{errors.imagen.message}</p>
          )}
        </div>

        {/* Stock (solo si no es servicio) */}
        {!esServicio && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Stock disponible <span className="text-red-500">*</span>
            </label>
            <Input 
              type="number" 
              min="0"
              className="focus:ring-2 text-black focus:ring-blue-500 focus:border-blue-500"
              {...register('stock', { 
                required: !esServicio ? 'Este campo es requerido' : false,
                min: {
                  value: 0,
                  message: 'El stock no puede ser negativo'
                }
              })} 
              placeholder="Cantidad disponible"
            />
            {errors.stock && (
              <p className="text-red-600 text-xs mt-1">{errors.stock.message}</p>
            )}
          </div>
        )}

        {/* Es servicio */}
        <div className="flex items-center space-x-3 col-span-full">
          <input
            type="checkbox"
            id="es_servicio"
            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            {...register('es_servicio')}
          />
          <label htmlFor="es_servicio" className="text-sm font-medium text-gray-700">
            Marcar como servicio (no requiere stock)
          </label>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200">
        <Button 
          type="submit" 
          disabled={isSubmitting || categoriasValidas.length === 0}
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Guardando...
            </span>
          ) : (
            'Guardar Producto'
          )}
        </Button>
      </div>
    </form>
  );
};