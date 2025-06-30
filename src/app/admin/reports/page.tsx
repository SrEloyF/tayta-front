import { ReportsTable } from "./components/ReportsTable";
import { ReportsCharts } from "./components/ReportsCharts";

export default function ReportsPage() {
  return (
    <div className="p-8 space-y-8 bg-gray-950 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-yellow-400">Gestión de Reportes</h1>
      </div>
      <ReportsTable />
      <div className="mt-8">
        <ReportsCharts />
      </div>
    </div>
  );
}
