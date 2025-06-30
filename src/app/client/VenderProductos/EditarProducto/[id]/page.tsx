"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProductoForm } from "@/components/client/products/ProductoForm";
import { ProductoService } from "@/features/productos/services/ProductoService";
import { toast } from "react-hot-toast";
import { useAuth } from "@/providers/AuthProvider";

type Categoria = {
  id_categoria: number;
  nombre: string;
};

export default function EditarProductoPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, initialized } = useAuth();
  const [producto, setProducto] = useState<any>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  // Verificar autenticación
  useEffect(() => {
    if (initialized && !user?.id) {
      toast.error("Debes iniciar sesión");
      router.push("/auth/login");
    }
  }, [user?.id, initialized, router]);

  // Cargar datos
  useEffect(() => {
    const cargarDatos = async () => {
      if (!id || isNaN(Number(id))) {
        toast.error("ID inválido");
        return router.push("/client/VenderProductos");
      }

      try {
        setLoading(true);

        // Cargar datos en paralelo
        const [categoriasData, productoData] = await Promise.all([
          ProductoService.getCategorias(),
          ProductoService.getProductoCompleto(Number(id)),
        ]);

        // Verificar tipos y permisos (CORRECCIÓN 1: Mejor conversión numérica)
        if (Number(productoData.id_vendedor) !== Number(user?.id)) {
          throw new Error("No tienes permisos para editar este producto");
        }

        setProducto({
          ...productoData,
          id_categoria: productoData.id_categoria.toString(),
          precio: Number(productoData.precio).toFixed(2),
          stock: productoData.stock?.toString() || "0",
        });

        setCategorias(categoriasData as Categoria[]);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        toast.error(error instanceof Error ? error.message : "Error cargando datos");
        router.push("/client/VenderProductos");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id && initialized) {
      cargarDatos();
    }
  }, [id, user?.id, initialized, router]);

  // Manejar actualización (CORRECCIÓN PRINCIPAL)
  const handleSubmit = async (formData: any) => {
    try {
      // Validación reforzada
      if (!user?.id || !producto) {
        router.push("/auth/login");
        return toast.error("Sesión expirada o producto no cargado");
      }

      // Conversión numérica explícita (CORRECCIÓN 2)
      const vendedorId = Number(producto.id_vendedor);
      const usuarioId = Number(user.id);

      if (vendedorId !== usuarioId) {
        throw new Error("Acceso no autorizado");
      }

      // Actualización segura (CORRECCIÓN 3: Validación adicional)
      const updatePayload = {
        nombre: formData.nombre,
        precio: Number(formData.precio),
        es_servicio: formData.es_servicio,
        estado: formData.estado,
        id_categoria: Number(formData.id_categoria),
        id_vendedor: vendedorId, // Usar valor convertido
      };

      await ProductoService.updateItem(Number(id), updatePayload);

      if (!formData.es_servicio) {
        await ProductoService.updateProducto(Number(id), {
          stock: Number(formData.stock),
        });
      }

      toast.success("Producto actualizado correctamente");
      router.push("/client/VenderProductos");
    } catch (error) {
      console.error("Error al actualizar:", error);
      toast.error(
        error instanceof Error ? error.message : "Error en la actualización"
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Producto no encontrado</p>
        <button
          onClick={() => router.push("/client/VenderProductos")}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Volver a mis productos
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 border-b pb-2">
          Editar Producto
        </h1>
        <ProductoForm
          onSubmit={handleSubmit}
          initialData={producto}
          categorias={categorias}
          isEditMode={true}
          isSubmitting={loading}
        />
      </div>
    </div>
  );
}
