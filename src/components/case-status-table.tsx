interface CaseStatusTableProps {
  useCases: Array<{ status: string }>;
}

export function CaseStatusTable({ useCases }: CaseStatusTableProps) {
  // Calcular la distribución de estados
  const statusDistribution = useCases.reduce((acc, useCase) => {
    const status = useCase.status;
    if (acc[status]) {
      acc[status]++;
    } else {
      acc[status] = 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Convertir a array y ordenar por cantidad (descendente)
  const statusArray = Object.entries(statusDistribution)
    .map(([estado, casos]) => ({
      estado,
      casos,
      porcentaje: (casos / useCases.length) * 100,
    }))
    .sort((a, b) => b.casos - a.casos);

  const totalCases = useCases.length;

  return (
    <div className="bg-white rounded-lg border">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">
          Estados de Casos
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Distribución detallada por estado
        </p>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Estado
                </th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">
                  Casos
                </th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">
                  % Total
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Barra
                </th>
              </tr>
            </thead>
            <tbody>
              {statusArray.map(({ estado, casos, porcentaje }) => (
                <tr key={estado} className="border-b last:border-b-0 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900">
                    {estado}
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-gray-900">
                    {casos}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-600">
                    {porcentaje.toFixed(1)}%
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-blue-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${porcentaje}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalCases === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay casos disponibles
          </div>
        )}
      </div>
    </div>
  );
}
