/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  // Configuración de variables de entorno
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://taytaback.onrender.com',
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://taytaback.onrender.com',
  },

  // Configuración de reescritura de rutas para la API (solo en modo desarrollo)
  async rewrites() {
    if (process.env.NODE_ENV === 'production') {
      return [];
    }
    
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://taytaback.onrender.com';
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },

  // Configuración de imágenes
  images: {
    unoptimized: true, // Deshabilitar optimización de imágenes para exportación estática
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'taytaback.onrender.com',
        port: '',
        pathname: '/api/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/api/uploads/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Configuración de generación estática
  output: 'standalone',
  
  // Configuración de webpack
  webpack: (config, { isServer }) => {
    // Configuración de alias para las rutas
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
      '@/*': path.resolve(__dirname, 'src/*'),
      '@/components': path.resolve(__dirname, 'src/components'),
      '@/components/*': path.resolve(__dirname, 'src/components/*'),
      '@/utils': path.resolve(__dirname, 'src/utils'),
      '@/utils/*': path.resolve(__dirname, 'src/utils/*'),
      '@/services': path.resolve(__dirname, 'src/services'),
      '@/services/*': path.resolve(__dirname, 'src/services/*'),
      'next/font/google': path.resolve(__dirname, 'node_modules/next/font/google'),
      'next/font/local': path.resolve(__dirname, 'node_modules/next/font/local'),
    };

    // Configuraciones específicas del cliente
    if (!isServer) {
      config.resolve.fallback = { 
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        querystring: false,
        url: false,
        net: false,
        tls: false,
        child_process: false,
        dns: false,
        dgram: false,
        tty: false,
      };
    }
    
    return config;
  },
  
  // Configuración de compresión
  compress: true,
  
  // Configuración de redirecciones para exportación estáta
  trailingSlash: true,
  
  // Otras configuraciones
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  productionBrowserSourceMaps: false,
  optimizeFonts: true,
  
  // Deshabilitar la verificación de TypeScript durante el build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Deshabilitar la verificación de ESLint durante el build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
