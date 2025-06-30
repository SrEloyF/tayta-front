import { string, z } from 'zod';

// features/types.ts

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  contrasena: z.string().min(6, 'Mínimo 6 caracteres'),
});


// En tus schemas (features/types.ts)
export const registerSchema = z.object({
  nombres: z.string().min(3, 'Mínimo 3 caracteres'),
  apellidos: z.string().min(3, 'Mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  dni: z.string().min(8, 'DNI inválido'),
  contrasena: z.string().min(6, 'Mínimo 6 caracteres'),
  telefono: z.string().min(8, 'Teléfono inválido'),
  imagen: z
    .any()
    .refine(
      (files) => files instanceof FileList && files.length === 1,
      'Debes seleccionar una imagen'
    )
    .refine(
      (files) => {
        const file = (files as FileList)[0];
        return file && file.type.startsWith('image/');
      },
      'El archivo debe ser una imagen'
    ),
});

export interface ProductoBase {
  id_categoria: number;
  id_vendedor: number;
  nombre: string;
  precio: number;
  es_servicio: boolean;
  estado: string;
  fecha_y_hora?: Date;
  stock: number;
}

export type LoginFormData = z.infer<typeof loginSchema>;

export type RegisterFormData = z.infer<typeof registerSchema> & {
  nombres: string;
  apellidos: string;
  email: string;
  dni: string;
  contrasena: string;
  telefono: string;
  url_img: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role?: 'user' | 'admin'; // Opcional: para manejar roles
};

export interface Item {
  id_item: number;
  id_categoria: number;
  id_vendedor: number;
  nombre: string;
  precio: number;
  es_servicio: boolean;
  estado: string;
  fecha_y_hora: string;
  Categoria?: {
    id_categoria: number;
    nombre: string;
  };
}

export interface Producto extends ProductoBase {
  id_producto: number;
  stock: number;
  Item?: Item; // Relación con Item
}

export type ProductoCompleto = Producto & {
  Item: Item; // Aseguramos que siempre venga el Item
};

export type AuthContextType = {
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
};