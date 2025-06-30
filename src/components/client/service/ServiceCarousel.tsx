'use client';

import { useState, useEffect } from 'react';
import { ServiceCard } from './ServiceCard';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FaServicestack } from 'react-icons/fa';

interface Service {
  id: number;
  name: string;
  price: number;
  image: string;
  rating?: number;
  description: string;
  estado?: string;
  id_categoria?: number;
  id_vendedor?: number;
  fecha_y_hora?: string;
  categoria?: string;
  vendedor?: string;
}

interface ServiceCarouselProps {
  services: Service[];
  itemsPerView?: number;
  autoPlay?: boolean;
  interval?: number;
}

export function ServiceCarousel({ 
  services = [], 
  itemsPerView = 3, 
  autoPlay = false, 
  interval = 5000 
}: ServiceCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (autoPlay && !isHovered && services.length > itemsPerView) {
      intervalId = setInterval(() => {
        nextSlide();
      }, interval);
    }
    
    return () => clearInterval(intervalId);
  }, [autoPlay, isHovered, services.length, interval, itemsPerView]);

  const nextSlide = () => {
    setCurrentIndex(prev => (prev + 1) % services.length);
  };

  const prevSlide = () => {
    setCurrentIndex(prev => (prev - 1 + services.length) % services.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const getVisibleServices = () => {
    const visible = [];
    for (let i = 0; i < itemsPerView; i++) {
      const index = (currentIndex + i) % services.length;
      visible.push(services[index]);
    }
    return visible;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4">
        <div className="flex items-center mb-6">
          <FaServicestack className="mr-3 text-3xl text-blue-600" />
          <h2 className="text-3xl font-bold text-gray-800">Servicios Destacados</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(itemsPerView)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-2xl shadow-lg p-6">
              <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="container mx-auto px-4 text-center py-12 bg-gray-50 rounded-lg">
        <FaServicestack className="mx-auto text-5xl text-blue-600 mb-4" />
        <p className="text-2xl text-gray-500">No hay servicios disponibles</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <FaServicestack className="mr-3 text-3xl text-blue-600" />
          <h2 className="text-3xl font-bold text-gray-800">Servicios Destacados</h2>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={prevSlide}
            className="bg-white hover:bg-gray-100 text-gray-700 rounded-full p-2 shadow-md"
            disabled={services.length <= itemsPerView}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="outline"
            onClick={nextSlide}
            className="bg-white hover:bg-gray-100 text-gray-700 rounded-full p-2 shadow-md"
            disabled={services.length <= itemsPerView}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>

      <div 
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {getVisibleServices().map((service) => (
            <ServiceCard
              key={`${service.id}-${currentIndex}`}
              service={{
                id_item: service.id,
                nombre: service.name,
                descripcion: service.description,
                precio: service.price,
                es_servicio: true,
                estado: service.estado || 'A',
                fecha_y_hora: service.fecha_y_hora || new Date().toISOString(),
                imagen_url: service.image,
                categoria: service.categoria || null,
                vendedor: service.vendedor || 'Vendedor no disponible'
              }}
              onDelete={() => {}}
            />
          ))}
        </div>

        {/* Pagination indicators */}
        {services.length > itemsPerView && (
          <div className="flex justify-center mt-8 gap-2">
            {Array.from({ length: Math.ceil(services.length / itemsPerView) }).map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i * itemsPerView)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIndex >= i * itemsPerView && currentIndex < (i + 1) * itemsPerView 
                    ? 'bg-blue-600 w-8' 
                    : 'bg-gray-300 w-2'
                }`}
                aria-label={`Ir al slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}