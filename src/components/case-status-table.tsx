import type { UseCase } from "@/lib/types";

interface CaseStatusTableProps {
  useCases: UseCase[];
}

function buildStatusArray(cases: UseCase[]) {
  const dist = cases.reduce((acc, uc) => {
    const status = uc.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const total = cases.length || 1;
  return Object.entries(dist)
    .map(([estado, casos]) => ({ estado, casos, porcentaje: (casos / total) * 100 }))
    .sort((a, b) => b.casos - a.casos);
}

function StatusTable({ title, cases, color = "blue" }: { title: string; cases: UseCase[]; color?: "blue" | "green" | "red" }) {
  const statusArray = buildStatusArray(cases);
  const totalCases = cases.length;
  const barColor = color === "green" ? "bg-green-500" : color === "red" ? "bg-red-500" : "bg-blue-500";

  return (
    <div className="bg-white rounded-lg border">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">{title}</h2>
        <p className="text-sm text-gray-500 mb-6">Distribución por estado</p>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Estado</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Casos</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">% Tabla</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Barra</th>
              </tr>
            </thead>
            <tbody>
              {statusArray.map(({ estado, casos, porcentaje }) => (
                <tr key={estado} className="border-b last:border-b-0 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900">{estado}</td>
                  <td className="py-3 px-4 text-center font-semibold text-gray-900">{casos}</td>
                  <td className="py-3 px-4 text-center text-gray-600">{porcentaje.toFixed(1)}%</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div className={`${barColor} h-full rounded-full transition-all duration-300`} style={{ width: `${porcentaje}%` }} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalCases === 0 && (
          <div className="text-center py-8 text-gray-500">No hay casos disponibles</div>
        )}
      </div>
    </div>
  );
}

export function CaseStatusTable({ useCases }: CaseStatusTableProps) {
  const activos = useCases.filter(
    (uc) => (uc.highLevelStatus || '').toLowerCase().startsWith('activo')
  );
  const inactivos = useCases.filter(
    (uc) => (uc.highLevelStatus || '').toLowerCase().startsWith('inactivo')
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <StatusTable title="Activos por Estado" cases={activos} color="green" />
      <StatusTable title="Inactivos por Estado" cases={inactivos} color="red" />
    </div>
  );
}
