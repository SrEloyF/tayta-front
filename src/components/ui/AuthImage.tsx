'use client';

import { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';

interface AuthImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  fallbackSrc?: string;
}

export const AuthImage = ({
  src,
  alt,
  className = '',
  width = 40,
  height = 40,
  fallbackSrc = '/placeholder-image.png',
  ...props
}: AuthImageProps) => {
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      try {
        console.log('Cargando imagen:', src);
        const token = localStorage.getItem('auth-token');
        console.log('Token encontrado:', token ? 'Sí' : 'No');
        
        if (!token) {
          console.error('No se encontró token de autenticación');
          setError(true);
          return;
        }

        console.log('Realizando solicitud fetch...');
        const response = await fetch(src, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
        });

        console.log('Respuesta recibida:', response.status, response.statusText);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error en la respuesta:', errorText);
          throw new Error(`Error al cargar la imagen: ${response.status} ${response.statusText}`);
        }

        const blob = await response.blob();
        console.log('Blob creado, tamaño:', blob.size, 'bytes');
        const objectUrl = URL.createObjectURL(blob);
        console.log('URL del objeto creada:', objectUrl);
        setImageUrl(objectUrl);
      } catch (err) {
        console.error('Error cargando la imagen:', err);
        setError(true);
      }
    };

    loadImage();

    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [src]);

  if (error || !imageUrl) {
    return (
      <div 
        className={`${className} bg-gray-800 flex items-center justify-center`}
        style={{ width, height }}
      >
        <Image
          src={fallbackSrc}
          alt={alt || 'Image not available'}
          width={width}
          height={height}
          className="object-cover"
          {...props}
        />
      </div>
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={alt || ''}
      width={width}
      height={height}
      className={className}
      {...props}
    />
  );
};
