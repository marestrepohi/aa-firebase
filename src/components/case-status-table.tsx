'use client';

import { useState } from "react";
import type { UseCase } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CaseStatusTableProps {
  useCases: UseCase[];
}

type GroupableKey = 'status' | 'tipoDesarrollo' | 'suite';

function buildDistributionArray(cases: UseCase[], groupBy: GroupableKey) {
  const dist = cases.reduce((acc, uc) => {
    const key = uc[groupBy] || 'No definido';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const total = cases.length || 1;
  return Object.entries(dist)
    .map(([label, casos]) => ({ label, casos, porcentaje: (casos / total) * 100 }))
    .sort((a, b) => b.casos - a.casos);
}

function BreakdownTable({
  cases,
  groupBy,
  color = "blue"
}: {
  cases: UseCase[];
  groupBy: GroupableKey;
  color?: "blue" | "green" | "red";
}) {
  const distributionArray = buildDistributionArray(cases, groupBy);
  const totalCases = cases.length;
  const barColor = color === "green" ? "bg-green-500" : color === "red" ? "bg-red-500" : "bg-blue-500";
  const headerLabel = {
    status: 'Estado',
    tipoDesarrollo: 'Tipo Desarrollo',
    suite: 'Suite'
  }[groupBy];

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="text-left py-3 px-4 font-medium text-gray-700">{headerLabel}</th>
            <th className="text-center py-3 px-4 font-medium text-gray-700">Casos</th>
            <th className="text-center py-3 px-4 font-medium text-gray-700">% Tabla</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700 w-[40%]">Barra</th>
          </tr>
        </thead>
        <tbody>
          {distributionArray.map(({ label, casos, porcentaje }) => (
            <tr key={label} className="border-b last:border-b-0 hover:bg-gray-50">
              <td className="py-3 px-4 text-gray-900">{label}</td>
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

      {totalCases === 0 && (
        <div className="text-center py-8 text-gray-500">No hay casos disponibles para esta vista.</div>
      )}
    </div>
  );
}

function TabbedBreakdown({ title, cases, color }: { title: string; cases: UseCase[]; color?: "blue" | "green" | "red" }) {
  return (
     <div className="bg-white rounded-lg border">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">{title}</h2>
        <p className="text-sm text-gray-500 mb-6">Distribución de casos de uso.</p>
        
        <Tabs defaultValue="status">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="status">Estado</TabsTrigger>
            <TabsTrigger value="tipoDesarrollo">Tipo Desarrollo</TabsTrigger>
            <TabsTrigger value="suite">Suite</TabsTrigger>
          </TabsList>
          
          <TabsContent value="status">
            <BreakdownTable cases={cases} groupBy="status" color={color} />
          </TabsContent>
          <TabsContent value="tipoDesarrollo">
            <BreakdownTable cases={cases} groupBy="tipoDesarrollo" color={color} />
          </TabsContent>
          <TabsContent value="suite">
            <BreakdownTable cases={cases} groupBy="suite" color={color} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
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
      <TabbedBreakdown title="Casos Activos" cases={activos} color="green" />
      <TabbedBreakdown title="Casos Inactivos" cases={inactivos} color="red" />
    </div>
  );
}
