import type { UseCase } from "@/lib/types";

interface DataScientistTableProps {
  useCases: UseCase[];
}

function buildDsArray(cases: UseCase[]) {
  const dist = cases.reduce((acc, uc) => {
    const dsName = uc.ds1;
    if (dsName) {
        acc[dsName] = (acc[dsName] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(dist)
    .map(([dsName, caseCount]) => ({ dsName, caseCount }))
    .sort((a, b) => b.caseCount - a.caseCount);
}

export function DataScientistTable({ useCases }: DataScientistTableProps) {
  const dsArray = buildDsArray(useCases);

  return (
    <div className="bg-white rounded-lg border">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Casos por Científico de Datos (DS1)</h2>
        <p className="text-sm text-gray-500 mb-6">Conteo de proyectos asignados a cada científico de datos principal.</p>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Científico de Datos</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Nº de Casos</th>
              </tr>
            </thead>
            <tbody>
              {dsArray.map(({ dsName, caseCount }) => (
                <tr key={dsName} className="border-b last:border-b-0 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900">{dsName}</td>
                  <td className="py-3 px-4 text-center font-semibold text-gray-900">{caseCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {dsArray.length === 0 && (
          <div className="text-center py-8 text-gray-500">No hay científicos de datos asignados en los casos filtrados.</div>
        )}
      </div>
    </div>
  );
}
