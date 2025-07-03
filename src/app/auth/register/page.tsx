'use client';

import { useRouter } from 'next/navigation';
import { AuthForm } from '../../../components/auth/AuthForm';
import { RegisterFormData } from '../../../features/types';
import { AuthService } from '@/features/auth/services/AuthService';
import axios from 'axios';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';

const RegisterPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (formData: RegisterFormData) => {
    setIsLoading(true);
    
    try {
      // Ensure imagen is properly typed as FileList
      const imagen = formData.imagen as unknown as FileList;

      if (!imagen || imagen.length === 0) {
        throw new Error('Debe seleccionar una imagen.');
      }

      // Upload the image first
      const uploadFormData = new FormData();
      uploadFormData.append('carpeta', 'user_imgs');
      uploadFormData.append('imagen', imagen[0]);

      const uploadRes = await axios.post<{ nombreArchivo: string }>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/upload-img`,
        uploadFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Create a new object with the correct type
      const registerData = {
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        email: formData.email,
        dni: formData.dni,
        contrasena: formData.contrasena,
        telefono: formData.telefono,
        url_img: uploadRes.data.nombreArchivo,
      };

      await AuthService.register(registerData);
      router.push('/auth/login');
    } catch (error: unknown) {
      let errorMessage = 'Error desconocido al registrar';

      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as any).response === 'object'
      ) {
        const response = (error as any).response;
        
        if (response.status === 400) {
          // Handle validation errors
          if (response.data?.error === 'SequelizeUniqueConstraintError') {
            // Check which field caused the unique constraint error
            if (response.data?.fields?.includes('email')) {
              errorMessage = 'El correo electrónico ya está en uso';
            } else if (response.data?.fields?.includes('dni')) {
              errorMessage = 'El DNI ya está registrado';
            } else {
              errorMessage = 'Uno o más datos ya están en uso';
            }
          } else {
            errorMessage = response.data?.message || 'Ingrese datos válidos';
          }
        } else if (response.status === 409) {
          errorMessage = 'El usuario ya existe';
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      console.error('Error al registrar:', errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 px-4">
      <Toaster />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-6xl bg-white shadow-xl rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2"
      >
        <div className="bg-gradient-to-br from-blue-600 to-violet-700 text-white p-10 flex flex-col justify-center">
          <h2 className="text-3xl font-bold mb-4">¡Bienvenido a TaytaService!</h2>
          <p className="text-sm mb-6">
            Crea tu cuenta y comienza a vender o contratar servicios fácilmente.
          </p>
          <div className="relative w-full h-48">
            <Image
              src="/logo.png"
              alt="Registro de cuenta"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        <div className="p-10 flex flex-col justify-center">
          <h3 className="text-2xl font-semibold mb-6 text-center text-gray-800">
            Crear cuenta
          </h3>
          <AuthForm
            type="register"
            onSubmit={handleRegister as (data: RegisterFormData | { email: string; contrasena: string }) => void}
            loading={isLoading}
          />
          <p className="text-sm text-center mt-6 text-gray-600">
            ¿Ya tienes una cuenta?{' '}
            <button
              onClick={() => router.push('/auth/login')}
              className="text-indigo-600 hover:underline font-medium"
            >
              Inicia sesión
            </button>
          </p>
        </div>
      </motion.div>
    </main>
  );
};

export default RegisterPage;
