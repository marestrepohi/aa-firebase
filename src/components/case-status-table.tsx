
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

interface CaseStatusTableProps {
  useCases: UseCase[];
}

function buildDistributionArray(cases: UseCase[], groupBy: 'status') {
  const dist = cases.reduce((acc, uc) => {
    const key = uc[groupBy] || 'No definido';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const total = cases.length || 1;

  return Object.entries(dist)
    .map(([label, casos]) => ({
      label,
      casos,
      porcentaje: (casos / total) * 100,
      fill: `hsl(var(--chart-${Object.keys(dist).indexOf(label) + 1}))`,
    }))
    .sort((a, b) => b.casos - a.casos);
}

function BreakdownChart({
  cases,
  groupBy,
  color,
}: {
  cases: UseCase[];
  groupBy: 'status';
  color: "blue" | "green" | "red";
}) {
  const data = React.useMemo(() => buildDistributionArray(cases, groupBy), [cases, groupBy]);
  const totalCases = React.useMemo(() => cases.length, [cases]);
  
  const chartConfig = React.useMemo(() => {
    return data.reduce((acc, item) => {
      acc[item.label] = { label: item.label, color: item.fill };
      return acc;
    }, {} as ChartConfig);
  }, [data]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50/50">
              <th className="text-left py-2 px-3 font-medium text-gray-600">Estado</th>
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
      <Card>
        <CardHeader>
          <CardTitle>Casos Activos ({activos.length})</CardTitle>
          <CardDescription>Distribución de casos de uso activos por estado.</CardDescription>
        </CardHeader>
        <CardContent>
            {activos.length > 0 ? (
                <BreakdownChart cases={activos} groupBy="status" color="green" />
            ) : (
                <div className="text-center py-10 text-gray-500">No hay casos activos.</div>
            )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Casos Inactivos ({inactivos.length})</CardTitle>
          <CardDescription>Distribución de casos de uso inactivos por estado.</CardDescription>
        </CardHeader>
        <CardContent>
            {inactivos.length > 0 ? (
                <BreakdownChart cases={inactivos} groupBy="status" color="red" />
            ): (
                <div className="text-center py-10 text-gray-500">No hay casos inactivos.</div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
