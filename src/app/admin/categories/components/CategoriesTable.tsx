"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Edit, Trash2 } from "lucide-react";
import { authFetch } from "@/utils/authFetch";

export interface Categoria {
  id_categoria: number;
  nombre: string;
  descripcion: string;
}

type CategoriaResponse = Categoria[] | { data: Categoria[] } | { error: string };

interface CategoriesTableProps {
  onEdit: (categoria: Categoria) => void;
  onDelete: (id: number) => void;
}

export const CategoriesTable: React.FC<CategoriesTableProps> = ({ onEdit, onDelete }) => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategorias = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch("/api/categorias");
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }
      const data: CategoriaResponse = await res.json();
      
      // Manejar diferentes formatos de respuesta
      if (Array.isArray(data)) {
        setCategorias(data);
      } else if (data && 'data' in data) {
        setCategorias(data.data);
      } else {
        setCategorias([]);
      }
    } catch (err) {
      console.error("Error al cargar categorías:", err);
      setError("Error al cargar las categorías. Intenta recargar la página.");
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  if (loading) return <div className="text-gray-400 p-4">Cargando categorías...</div>;
  if (error) return <div className="text-red-400 p-4">{error}</div>;
  if (!categorias.length) return <div className="text-gray-400 p-4">No hay categorías registradas.</div>;

  return (
    <div className="bg-gray-900 rounded-xl p-6 shadow-lg border border-yellow-700/10">
      <h2 className="text-lg font-semibold mb-4 text-yellow-400">Categorías</h2>
      <table className="w-full text-left">
        <thead>
          <tr className="text-gray-400">
            <th className="pb-2">ID</th>
            <th className="pb-2">Nombre</th>
            <th className="pb-2">Descripción</th>
            <th className="pb-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categorias.map((cat) => (
            <tr key={cat.id_categoria} className="border-b border-gray-800 hover:bg-gray-800 transition-colors">
              <td className="py-2">{cat.id_categoria}</td>
              <td>{cat.nombre}</td>
              <td>{cat.descripcion}</td>
              <td>
                <Button variant="outline" onClick={() => onEdit(cat)} className="mr-2">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="destructive" onClick={() => onDelete(cat.id_categoria)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
