// components/client/PromoBanner.tsx
import Link from 'next/link';
import { FaTag, FaArrowRight } from 'react-icons/fa';

export function PromoBanner({
  title,
  subtitle,
  image,
  ctaText,
  ctaLink,
}: {
  title: string;
  subtitle: string;
  image: string;
  ctaText: string;
  ctaLink: string;
}) {
  return (
    <div className="relative group overflow-hidden rounded-3xl shadow-2xl transform transition hover:scale-[1.02] duration-300">
      {/* Imagen de fondo con efecto de zoom */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
        style={{
          backgroundImage: `url(${image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Gradiente oscuro */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30"></div>
      </div>

      {/* Contenido superpuesto */}
      <div className="relative z-10 px-6 py-16 md:px-12 md:py-24 text-white">
        <div className="flex items-center mb-4">
          <FaTag className="mr-3 text-yellow-400 text-2xl" />
          <span className="text-sm uppercase tracking-wider text-yellow-300">
            Oferta Especial
          </span>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 max-w-2xl leading-tight">
          {title}
        </h2>
        
        <p className="text-xl md:text-2xl mb-8 max-w-xl text-white/90">
          {subtitle}
        </p>
        
        <Link
          href={ctaLink}
          className="inline-flex items-center px-8 py-4 bg-white text-blue-800 rounded-full font-bold 
          hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg group"
        >
          {ctaText}
          <FaArrowRight className="ml-3 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-tr-full"></div>
    </div>
  );
}