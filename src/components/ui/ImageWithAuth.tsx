'use client';

import React, { useEffect, useState } from 'react';

interface ImageWithAuthProps {
  imagePath: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://taytaback.onrender.com';

export const ImageWithAuth: React.FC<ImageWithAuthProps> = ({ imagePath, alt = '', className = '' }) => {
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        // Si no hay ruta de imagen, usar imagen por defecto
        if (!imagePath || imagePath === 'undefined') {
          setImgSrc('/images/default-product.jpg');
          return;
        }
        
        const token = localStorage.getItem('auth-token');
        if (!token) throw new Error('Token no encontrado');

        const response = await fetch(`${API_BASE_URL}/api/uploads/${imagePath}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 404) {
            //console.error(`Imagen no encontrada en el servidor: ${imagePath}`);
          } else {
            console.error(`Error al obtener la imagen, código de estado: ${response.status}`);
          }
          // Si la imagen no se puede cargar, usar imagen por defecto
          setImgSrc('/images/default-product.jpg');
          return;
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setImgSrc(url);
      } catch (error) {
        console.error('No se pudo cargar la imagen:', error);
        // En caso de cualquier error, usar imagen por defecto
        setImgSrc('/images/default-product.jpg');
      }
    };

    fetchImage();

    // Limpieza
    return () => {
      if (imgSrc) {
        URL.revokeObjectURL(imgSrc);
      }
    };
  }, [imagePath]);

  if (!imgSrc) {
    return <div className="w-full h-full bg-gray-200 animate-pulse rounded-t-2xl" />;
  }

  return <img src={imgSrc} alt={alt} className={className} />;
};
