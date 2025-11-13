"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Users, DollarSign, Percent, TrendingUp, History, LineChart, ScatterChart } from 'lucide-react';
import type { AllMetrics } from '@/lib/types';

interface CobranzasDashboardProps {
  allMetrics: AllMetrics;
}

const StatCard = ({ title, value, subValue, progress, icon, color }: { title: string, value: string, subValue?: string, progress: number, icon: React.ReactNode, color: string }) => (
  <Card className="shadow-md">
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-full bg-${color}-100`}>{icon}</div>
        <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
      </div>
      <p className="text-sm font-medium text-gray-700">{title}</p>
      {subValue && <p className="text-xs text-gray-500">{subValue}</p>}
      <Progress value={progress} className={`mt-2 h-1 bg-${color}-100 [&>*]:bg-${color}-500`} />
    </CardContent>
  </Card>
);

const ChartCard = ({ title, description, icon, children }: { title: string, description: string, icon: React.ReactNode, children: React.ReactNode }) => (
  <Card className="shadow-md col-span-1">
    <CardHeader>
      <div className="flex items-start gap-3">
        <div className="p-2 bg-gray-100 rounded-md text-gray-600">{icon}</div>
        <div>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          <CardDescription className="text-xs">{description}</CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      {children}
    </CardContent>
  </Card>
);

export function CobranzasDashboard({ allMetrics }: CobranzasDashboardProps) {
  // NOTE: This is a placeholder for actual data processing and filtering logic.
  // In a real implementation, you would process `allMetrics` to derive these values,
  // likely based on a selected time period.
  const summary = {
    totalClientes: 0,
    tasaExito: 0,
    saldoTotal: 0,
    tasaRecuperacion: 0
  };

  const tableData = [
    // Placeholder data
    { segmento: 'Segmento 1', clientes: 100, respuesta: 50, tasaExito: '50%', saldoTotal: '$10,000', pagos3M: '$2,000', tasaRecup: '20%' },
    { segmento: 'Segmento 2', clientes: 150, respuesta: 60, tasaExito: '40%', saldoTotal: '$15,000', pagos3M: '$3,000', tasaRecup: '20%' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Clientes" value={summary.totalClientes.toString()} icon={<Users className="text-blue-500" />} color="blue" progress={75} />
        <StatCard title="Tasa de Éxito" value={`${summary.tasaExito.toFixed(1)}%`} subValue="Mejorable" icon={<Percent className="text-sky-500" />} color="sky" progress={summary.tasaExito} />
        <StatCard title="Saldo Total" value={`$${(summary.saldoTotal / 1_000_000).toFixed(1)}M`} icon={<DollarSign className="text-amber-500" />} color="amber" progress={60} />
        <StatCard title="Tasa Recuperación" value={`${summary.tasaRecuperacion.toFixed(1)}%`} subValue="Mejorable" icon={<TrendingUp className="text-purple-500" />} color="purple" progress={summary.tasaRecuperacion} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Efectividad por Segmento" description="Análisis de clientes vs respuesta y tasa de éxito" icon={<BarChart />}>
             <div className="h-64 bg-gray-50 flex items-center justify-center rounded-md">
                <p className="text-sm text-gray-400">Gráfico de barras</p>
             </div>
          </ChartCard>
          <ChartCard title="Rendimiento Financiero por Segmento" description="Saldo total vs pagos recuperados y tasa de recuperación" icon={<DollarSign />}>
             <div className="h-64 bg-gray-50 flex items-center justify-center rounded-md">
                <p className="text-sm text-gray-400">Gráfico de barras</p>
             </div>
          </ChartCard>
          <ChartCard title="Tendencia Temporal de Recuperación" description="Evolución de pagos y recuperación por fecha" icon={<History />}>
             <div className="h-64 bg-gray-50 flex items-center justify-center rounded-md">
                <p className="text-sm text-gray-400">Gráfico de líneas</p>
             </div>
          </ChartCard>
          <div className="grid grid-cols-1 gap-6">
            <ChartCard title="Balance vs Payments Scatter" description="Relación entre saldo total y pagos por segmento" icon={<ScatterChart />}>
                <div className="h-24 bg-gray-50 flex items-center justify-center rounded-md">
                    <p className="text-sm text-gray-400">Gráfico de dispersión</p>
                </div>
            </ChartCard>
            <ChartCard title="Recovery Rate by Decile" description="Tasa de recuperación por decil de probabilidad" icon={<LineChart />}>
                <div className="h-24 bg-gray-50 flex items-center justify-center rounded-md">
                    <p className="text-sm text-gray-400">Gráfico de líneas</p>
                </div>
            </ChartCard>
          </div>
      </div>
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Análisis Detallado por Segmento</CardTitle>
          <CardDescription>Métricas completas de rendimiento del modelo por cada segmento.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Segmento</TableHead>
                <TableHead className="text-right">Clientes</TableHead>
                <TableHead className="text-right">Respuesta</TableHead>
                <TableHead className="text-right">Tasa Éxito</TableHead>
                <TableHead className="text-right">Saldo Total</TableHead>
                <TableHead className="text-right">Pagos 3M</TableHead>
                <TableHead className="text-right">Tasa Recup.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{row.segmento}</TableCell>
                  <TableCell className="text-right">{row.clientes}</TableCell>
                  <TableCell className="text-right">{row.respuesta}</TableCell>
                  <TableCell className="text-right">{row.tasaExito}</TableCell>
                  <TableCell className="text-right">{row.saldoTotal}</TableCell>
                  <TableCell className="text-right">{row.pagos3M}</TableCell>
                  <TableCell className="text-right">{row.tasaRecup}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
