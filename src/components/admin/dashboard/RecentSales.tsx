// components/admin/dashboard/RecentSales.tsx
import { Table, Badge } from '@tremor/react';

interface Sale {
  name: string;
  email: string;
  amount: string;
  status?: 'completed' | 'pending' | 'failed';
}

interface RecentSalesProps {
  data: Sale[];
}

export default function RecentSales({ data }: RecentSalesProps) {
  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow">
      <h3 className="font-medium text-lg text-white mb-4">Ventas Recientes</h3>
      <Table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Cliente</th>
            <th>Monto</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {data.map((sale, idx) => (
            <tr key={idx}>
              <td className="text-white">{sale.name}</td>
              <td className="text-gray-300">{sale.email}</td>
              <td className="text-white font-medium">{sale.amount}</td>
              <td>
                <Badge color={sale.status === 'completed' ? 'emerald' : sale.status === 'pending' ? 'yellow' : 'red'}>
                  {sale.status === 'completed' ? 'Completado' : sale.status === 'pending' ? 'Pendiente' : 'Fallido'}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}