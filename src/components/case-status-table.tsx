
'use client';

import * as React from "react";
import type { UseCase } from "@/lib/types";
import { Pie, PieChart, Cell } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type GroupableKey = 'status' | 'tipoDesarrollo' | 'suite';

interface BreakdownData {
    label: string;
    casos: number;
    porcentaje: number;
    fill: string;
}

interface CaseStatusTableProps {
  useCases: UseCase[];
  currentFilters: {
    highLevelStatus: string;
    [key: string]: string;
  };
}

function buildDistributionArray(cases: UseCase[], groupBy: GroupableKey): BreakdownData[] {
  const dist = cases.reduce((acc, uc) => {
    const key = uc[groupBy] || 'No definido';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const total = cases.length || 1;

  const chartColors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
    'hsl(var(--chart-1) / 0.7)',
    'hsl(var(--chart-2) / 0.7)',
  ];

  return Object.entries(dist)
    .map(([label, casos], index) => ({
      label,
      casos,
      porcentaje: (casos / total) * 100,
      fill: chartColors[index % chartColors.length],
    }))
    .sort((a, b) => b.casos - a.casos);
}

function BreakdownChart({ cases, groupBy }: { cases: UseCase[], groupBy: GroupableKey }) {
  const data = React.useMemo(() => buildDistributionArray(cases, groupBy), [cases, groupBy]);
  
  const chartConfig = React.useMemo(() => {
    return data.reduce((acc, item) => {
      acc[item.label] = { label: item.label, color: item.fill };
      return acc;
    }, {} as ChartConfig);
  }, [data]);

  if (cases.length === 0) {
      return <div className="text-center py-10 text-gray-500">No hay casos para mostrar en esta categoría.</div>
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
      <ChartContainer config={chartConfig} className="mx-auto aspect-square w-full max-w-[250px]">
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={data}
            dataKey="casos"
            nameKey="label"
            innerRadius={60}
            strokeWidth={5}
          >
            {data.map((entry) => (
              <Cell key={entry.label} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50/50">
              <th className="text-left py-2 px-3 font-medium text-gray-600">Categoría</th>
              <th className="text-center py-2 px-3 font-medium text-gray-600">Casos</th>
              <th className="text-center py-2 px-3 font-medium text-gray-600">%</th>
            </tr>
          </thead>
          <tbody>
            {data.map(({ label, casos, porcentaje, fill }) => (
              <tr key={label} className="border-b last:border-b-0">
                <td className="py-2 px-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: fill }} />
                  {label}
                </td>
                <td className="py-2 px-3 text-center font-semibold">{casos}</td>
                <td className="py-2 px-3 text-center text-gray-500">{porcentaje.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function CaseStatusTable({ useCases, currentFilters }: CaseStatusTableProps) {
  const activos = useCases.filter(
    (uc) => (uc.highLevelStatus || '').toLowerCase().startsWith('activo')
  );
  const inactivos = useCases.filter(
    (uc) => (uc.highLevelStatus || '').toLowerCase().startsWith('inactivo')
  );

  const renderTabs = (cases: UseCase[]) => {
    if (cases.length === 0) {
        return <div className="text-center py-10 text-gray-500">No hay casos para mostrar.</div>
    }
    return (
        <Tabs defaultValue="estado" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="estado">Estado</TabsTrigger>
                <TabsTrigger value="tipoDesarrollo">Tipo Desarrollo</TabsTrigger>
                <TabsTrigger value="suite">Suite</TabsTrigger>
            </TabsList>
            <TabsContent value="estado">
                <BreakdownChart cases={cases} groupBy="status" />
            </TabsContent>
            <TabsContent value="tipoDesarrollo">
                <BreakdownChart cases={cases} groupBy="tipoDesarrollo" />
            </TabsContent>
            <TabsContent value="suite">
                <BreakdownChart cases={cases} groupBy="suite" />
            </TabsContent>
        </Tabs>
    );
  }
  
  const showActivos = currentFilters.highLevelStatus === 'all' || currentFilters.highLevelStatus === 'Activo';
  const showInactivos = currentFilters.highLevelStatus === 'all' || currentFilters.highLevelStatus === 'Inactivo';

  return (
    <div className={`grid grid-cols-1 ${showActivos && showInactivos ? 'lg:grid-cols-2' : ''} gap-6`}>
      {showActivos && (
        <Card>
          <CardHeader>
            <CardTitle>Casos Activos ({activos.length})</CardTitle>
            <CardDescription>Desglose de casos de uso activos por diferentes categorías.</CardDescription>
          </CardHeader>
          <CardContent>
              {renderTabs(activos)}
          </CardContent>
        </Card>
      )}

      {showInactivos && (
        <Card>
          <CardHeader>
            <CardTitle>Casos Inactivos ({inactivos.length})</CardTitle>
            <CardDescription>Desglose de casos de uso inactivos por diferentes categorías.</CardDescription>
          </CardHeader>
          <CardContent>
              {renderTabs(inactivos)}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
