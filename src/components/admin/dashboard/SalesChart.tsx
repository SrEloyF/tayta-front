// components/admin/dashboard/SalesChart.tsx
import { LineChart, Title, Card } from '@tremor/react';

interface MonthlySalesData {
  date: string;
  Productos: number;
  Servicios: number;
}

const monthlySalesData: MonthlySalesData[] = [
  { date: 'Ene', Productos: 1200, Servicios: 900 },
  { date: 'Feb', Productos: 1500, Servicios: 1000 },
  { date: 'Mar', Productos: 1800, Servicios: 1200 },
  { date: 'Abr', Productos: 2100, Servicios: 1400 },
  { date: 'May', Productos: 2400, Servicios: 1600 },
  { date: 'Jun', Productos: 2800, Servicios: 1900 },
];

const chartCategories = ['Productos', 'Servicios'] as const;

export default function SalesChart() {
  return (
    <Card className="h-full">
      <Title className="text-gray-900 dark:text-white">Ventas Mensuales</Title>
      <div className="h-80 mt-6">
        <LineChart
          data={monthlySalesData}
          index="date"
          categories={[...chartCategories]}
          colors={['blue', 'emerald']}
          yAxisWidth={60}
          valueFormatter={(value: number) => `$${value.toLocaleString()}`}
          onValueChange={(v) => console.log(v)}
          showLegend={true}
          showXAxis={true}
          showYAxis={true}
          showGridLines={true}
          showAnimation={true}
          className="h-full"
        />
      </div>
    </Card>
  );
}