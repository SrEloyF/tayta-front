'use client';

import { useState, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/Button';
import { Loader2, UploadCloud, X, Image as ImageIcon } from 'lucide-react';
import { authFetch } from '@/utils/authFetch';
import { toast } from 'sonner';
import Image from 'next/image';

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  folder?: string;
  disabled?: boolean;
  maxSize?: number; // en bytes
  itemId?: number | string; // ID del ítem al que pertenece la imagen
  className?: string;
  label?: string;
  required?: boolean;
}

// Format bytes to human-readable format
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  folder,
  disabled = false,
  maxSize = 5 * 1024 * 1024, // 5MB default
  itemId,
  className = '',
  label,
  required = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // Create preview for the image
  const createPreview = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle file drop/selection
  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: any[]) => {
      setFileError(null);

      // Handle rejected files
      if (rejectedFiles.length > 0) {
        const { errors } = rejectedFiles[0];
        const errorMessage = errors[0]?.code === 'file-too-large'
          ? `El archivo es demasiado grande. Tamaño máximo: ${formatFileSize(maxSize)}`
          : 'Tipo de archivo no soportado. Usa imágenes JPG, PNG o WEBP.';
        
        setFileError(errorMessage);
        toast.error(errorMessage);
        return;
      }

      const file = acceptedFiles[0];
      if (!file) return;

      // Validate file size
      if (file.size > maxSize) {
        const errorMessage = `El archivo es demasiado grande. Tamaño máximo: ${formatFileSize(maxSize)}`;
        setFileError(errorMessage);
        toast.error(errorMessage);
        return;
      }

      // Create preview
      createPreview(file);

      // Upload file
      const formData = new FormData();
      formData.append('imagen', file);
      const folderName = String(folder || 'item_imgs');
      
      // Crear la URL con el parámetro de consulta
      const uploadUrl = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/upload-img`);
      uploadUrl.searchParams.append('carpeta', folderName);

      // Agregar el ID del ítem si está disponible
      if (itemId) {
        uploadUrl.searchParams.append('itemId', String(itemId));
      }
      
      try {
        setIsLoading(true);
        console.log('Enviando archivo a carpeta:', folderName);
        
        // Usar fetch directamente con la URL completa
        const token = localStorage.getItem('auth-token');
        const headers = new Headers();
        
        if (token) {
          headers.append('Authorization', `Bearer ${token}`);
        }
        
        // No establecer Content-Type, dejar que el navegador lo maneje para FormData
        const res = await fetch(uploadUrl.toString(), {
          method: 'POST',
          body: formData,
          headers,
          credentials: 'include' // Importante para enviar cookies de autenticación
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || 'Error al subir la imagen');
        }
        
        const data = await res.json();
        console.log('Respuesta de subida de imagen:', data);
        
        // Actualizar el valor de la imagen
        onChange(data.nombreArchivo);
        toast.success('Imagen subida correctamente');
      } catch (error) {
        console.error('Error al subir la imagen:', error);
        setFileError('Error al subir la imagen');
        toast.error(error instanceof Error ? error.message : 'Error al subir la imagen');
      } finally {
        setIsLoading(false);
      }
    },
    [onChange, folder, maxSize, itemId]
  );

  // Configure dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: isLoading || disabled,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxFiles: 1,
    maxSize
  });

  // Handle remove image
  const onRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setPreview(null);
    onChange('');
    setFileError(null);
  };

  // Display current image or preview
  const imageUrl = useMemo(() => {
    if (preview) return preview;
    if (value) return `${process.env.NEXT_PUBLIC_API_URL}/api/uploads/${folder}/${value}`;
    return null;
  }, [value, preview, folder]);

  // Render the image preview
  const renderPreview = () => (
    <div className="relative w-full h-48 rounded-lg overflow-hidden group bg-gray-800/50 flex items-center justify-center">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt="Vista previa de la imagen"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={false}
        />
      ) : (
        <div className="flex flex-col items-center text-gray-500">
          <ImageIcon className="h-12 w-12 mb-2" />
          <span className="text-sm">Vista previa no disponible</span>
        </div>
      )}
      
      {!disabled && (
        <button
          type="button"
          onClick={onRemove}
          disabled={isLoading}
          className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
          aria-label="Eliminar imagen"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      )}
    </div>
  );

  // Render the upload area
  const renderUploadArea = () => {
    const isDisabled = isLoading || disabled;
    
    return (
      <div 
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-gray-400'}
          ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <UploadCloud className={`h-10 w-10 mx-auto ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
          <div>
            <p className="text-sm font-medium text-gray-300">
              {isDragActive ? 'Suelta la imagen aquí' : 'Arrastra y suelta una imagen, o haz clic para seleccionar'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Formatos soportados: JPG, PNG, WEBP (Máx. {formatFileSize(maxSize)})
            </p>
            {fileError && (
              <p className="text-xs text-red-500 mt-2">{fileError}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      {imageUrl ? renderPreview() : renderUploadArea()}
      
      {required && !value && !preview && (
        <p className="text-xs text-red-500">Se requiere una imagen</p>
      )}
    </div>
  );
};
