"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Edit, Trash2 } from "lucide-react";
import { authFetch } from "@/utils/authFetch";

export interface Servicio {
  id_item: number;
  nombre: string;
  descripcion: string;
  precio: number;
  estado: string;
  fecha_y_hora: string;
  id_categoria: number;
  id_vendedor: number;
  categoria_nombre?: string;
  vendedor_nombre?: string;
}

interface ServicesTableProps {
  onEdit: (servicio: Servicio) => void;
  onDelete: (id: number) => void;
}

export const ServicesTable: React.FC<ServicesTableProps> = ({ onEdit, onDelete }) => {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServicios = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch("/api/items?es_servicio=true");
      if (!res.ok) {
        throw new Error(`Error ${res.status}: No se pudieron cargar los servicios`);
      }
      const data = await res.json();
      setServicios(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error("Error al cargar servicios:", err);
      setError("No se pudieron cargar los servicios. Intenta recargar la página.");
      setServicios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicios();
  }, []);

  if (loading) return <div className="text-gray-400 p-4">Cargando servicios...</div>;
  if (error) return <div className="text-red-400 p-4">{error}</div>;
  if (!servicios.length) return <div className="text-gray-400 p-4">No hay servicios registrados.</div>;

  return (
    <div className="bg-gray-900 rounded-xl p-6 shadow-lg border border-yellow-700/10">
      <h2 className="text-lg font-semibold mb-4 text-yellow-400">Servicios</h2>
      <table className="w-full text-left">
        <thead>
          <tr className="text-gray-400">
            <th className="pb-2">ID</th>
            <th className="pb-2">Nombre</th>
            <th className="pb-2">Descripción</th>
            <th className="pb-2">Precio</th>
            <th className="pb-2">Estado</th>
            <th className="pb-2">Categoría</th>
            <th className="pb-2">Vendedor</th>
            <th className="pb-2">Fecha</th>
            <th className="pb-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {servicios.map((serv) => (
            <tr key={serv.id_item} className="border-b border-gray-800 hover:bg-gray-800 transition-colors">
              <td className="py-2">{serv.id_item}</td>
              <td>{serv.nombre}</td>
              <td>{serv.descripcion}</td>
              <td>{serv.precio}</td>
              <td>{serv.estado}</td>
              <td>{serv.categoria_nombre || serv.id_categoria}</td>
              <td>{serv.vendedor_nombre || serv.id_vendedor}</td>
              <td>{serv.fecha_y_hora ? new Date(serv.fecha_y_hora).toLocaleString() : ""}</td>
              <td>
                <Button variant="outline" onClick={() => onEdit(serv)} className="mr-2">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="destructive" onClick={() => onDelete(serv.id_item)}>
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
