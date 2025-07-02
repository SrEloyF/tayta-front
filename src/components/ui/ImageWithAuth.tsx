'use client';

import React, { useEffect, useState } from 'react';

interface ImageWithAuthProps {
  imagePath: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  onError?: () => void;
  onLoadSuccess?: () => void;
  showDefaultOnError?: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://taytaback.onrender.com';

export const ImageWithAuth: React.FC<ImageWithAuthProps> = ({ imagePath, alt = '', className = '', onError, onLoadSuccess, showDefaultOnError= true }) => {
  const [imgSrc, setImgSrc] = useState<string | null>(null);

   useEffect(() => {
    const fetchImage = async () => {
      try {
        if (!imagePath || imagePath === 'undefined') {
          if (showDefaultOnError) {
            setImgSrc('/images/default-product.jpg');
          } else {
            setImgSrc(null);
            if (onError) onError();
          }
          return;
        }
        const token = localStorage.getItem('auth-token');
        if (!token) throw new Error('Token no encontrado');

        const response = await fetch(`${API_BASE_URL}/api/uploads/${imagePath}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
          if (showDefaultOnError) {
            setImgSrc('/images/default-product.jpg');
          } else {
            setImgSrc(null);
            if (onError) onError();
          }
          return;
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setImgSrc(url);
        if (onLoadSuccess) onLoadSuccess();
      } catch (error) {
        if (showDefaultOnError) {
          setImgSrc('/images/default-product.jpg');
        } else {
          setImgSrc(null);
          if (onError) onError();
        }
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
