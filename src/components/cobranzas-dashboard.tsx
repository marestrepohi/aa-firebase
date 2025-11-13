"use client";

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, DollarSign, Percent, TrendingUp, History } from 'lucide-react';
import { LineChart, BarChart, ScatterChart, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Line, CartesianGrid, Bar } from 'recharts';
import type { AllMetrics } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CobranzasDashboardProps {
  allMetrics: AllMetrics;
  descriptions: Record<string, string>;
}

const StatCard = ({ title, value, subValue, icon, color }: { title: string, value: string, subValue?: string, icon: React.ReactNode, color: string }) => (
  <Card className="shadow-sm">
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg bg-${color}-100`}>{icon}</div>
        <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
      </div>
      <p className="text-sm font-medium text-gray-700 truncate">{title}</p>
      {subValue && <p className="text-xs text-gray-500">{subValue}</p>}
    </CardContent>
  </Card>
);

const ChartCard = ({ title, description, children }: { title: string, description: string, children: React.ReactNode }) => (
  <Card className="shadow-sm col-span-1">
    <CardHeader>
        <div>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          <CardDescription className="text-xs">{description}</CardDescription>
        </div>
    </CardHeader>
    <CardContent>
      {children}
    </CardContent>
  </Card>
);

interface SegmentData {
  segmento: string;
  clientes: number;
  respuesta: number;
  tasaExito: number;
  saldoTotal: number;
  pagos3M: number;
  tasaRecup: number;
}


export function CobranzasDashboard({ allMetrics, descriptions }: CobranzasDashboardProps) {
  const periods = useMemo(() => Object.keys(allMetrics || {}).sort(), [allMetrics]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>(periods[periods.length - 1] || '');

  const { summary, segmentTableData, temporalChartData } = useMemo(() => {
    if (!allMetrics || Object.keys(allMetrics).length === 0) {
      return { summary: {}, segmentTableData: [], temporalChartData: [] };
    }
    
    const currentMetrics = allMetrics[selectedPeriod]?.business || {};
    const segments: Record<string, any> = {};

    Object.entries(currentMetrics).forEach(([key, value]) => {
      const parts = key.split('_');
      const metricName = parts.slice(0, -1).join('_');
      const segment = parts[parts.length-1];

      if(key.startsWith('segmento_')){
        if (!segments[segment]) segments[segment] = { segmento: value };
      } else if (metricName && segment) {
        if (!segments[segment]) segments[segment] = { segmento: segment };
        segments[segment][metricName] = parseFloat(String(value).replace(/[^0-9.-]+/g, '')) || 0;
      }
    });

    const segmentTableData: SegmentData[] = Object.values(segments).map(s => ({
      segmento: s.segmento,
      clientes: s.clientes || 0,
      respuesta: s.respuesta || 0,
      tasaExito: s.clientes > 0 ? (s.respuesta / s.clientes) * 100 : 0,
      saldoTotal: s.saldo_total || 0,
      pagos3M: s.pagos_3m || 0,
      tasaRecup: s.saldo_total > 0 ? (s.pagos_3m / s.saldo_total) * 100 : 0,
    }));
    
    const totalSummary = segmentTableData.reduce((acc, s) => {
        acc.totalClientes += s.clientes;
        acc.totalRespuesta += s.respuesta;
        acc.saldoTotal += s.saldoTotal;
        acc.pagosTotal += s.pagos3M;
        return acc;
    }, { totalClientes: 0, totalRespuesta: 0, saldoTotal: 0, pagosTotal: 0 });

    const summary = {
        totalClientes: totalSummary.totalClientes,
        tasaExito: totalSummary.totalClientes > 0 ? (totalSummary.totalRespuesta / totalSummary.totalClientes) * 100 : 0,
        saldoTotal: totalSummary.saldoTotal,
        tasaRecuperacion: totalSummary.saldoTotal > 0 ? (totalSummary.pagosTotal / totalSummary.saldoTotal) * 100 : 0,
    };
    
    const temporalData = periods.map(p => {
        const techMetrics = allMetrics[p]?.technical || {};
        return {
            period: p,
            psi: parseFloat(techMetrics['psi'] || 0),
            ks: parseFloat(techMetrics['ks'] || 0),
            roc: parseFloat(techMetrics['roc_auc'] || techMetrics['auc_roc'] || techMetrics['roc'] || techMetrics['auc'] || 0),
            lift: parseFloat(techMetrics['lift'] || 0)
        }
    });

    return { summary, segmentTableData, temporalChartData: temporalData };
  }, [allMetrics, selectedPeriod, periods]);


  if (periods.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dashboard de Cobranzas</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12 text-muted-foreground">
          <p>No hay datos de métricas disponibles para este caso de uso.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Dashboard de Cobranzas</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Período:</span>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Seleccionar período" />
              </SelectTrigger>
              <SelectContent>
                {periods.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Clientes" value={summary.totalClientes?.toLocaleString() || '0'} icon={<Users className="text-blue-500" />} color="blue" />
        <StatCard title="Tasa de Éxito Gral." value={`${summary.tasaExito?.toFixed(1) || '0'}%`} icon={<Percent className="text-sky-500" />} color="sky" />
        <StatCard title="Saldo Total" value={`$${((summary.saldoTotal || 0) / 1_000_000).toFixed(1)}M`} icon={<DollarSign className="text-amber-500" />} color="amber" />
        <StatCard title="Tasa Recuperación Gral." value={`${summary.tasaRecuperacion?.toFixed(1) || '0'}%`} icon={<TrendingUp className="text-purple-500" />} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Evolución de Métricas del Modelo" description="Seguimiento de PSI, KS, ROC y Lift a lo largo del tiempo.">
             <ResponsiveContainer width="100%" height={300}>
                <LineChart data={temporalChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="psi" stroke="#8884d8" name="PSI" />
                    <Line type="monotone" dataKey="ks" stroke="#82ca9d" name="KS" />
                    <Line type="monotone" dataKey="roc" stroke="#ffc658" name="ROC/AUC" />
                    <Line type="monotone" dataKey="lift" stroke="#ff8042" name="Lift" />
                </LineChart>
             </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Efectividad por Segmento" description={`Análisis de clientes vs respuesta para el período ${selectedPeriod}`}>
             <ResponsiveContainer width="100%" height={300}>
                <BarChart data={segmentTableData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="segmento" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="clientes" fill="#8884d8" name="Clientes" />
                    <Bar dataKey="respuesta" fill="#82ca9d" name="Respuesta" />
                </BarChart>
             </ResponsiveContainer>
          </ChartCard>
      </div>
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Análisis Detallado por Segmento ({selectedPeriod})</CardTitle>
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
              {segmentTableData.map((row) => (
                <TableRow key={row.segmento}>
                  <TableCell className="font-medium">{row.segmento}</TableCell>
                  <TableCell className="text-right">{row.clientes.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{row.respuesta.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{row.tasaExito.toFixed(1)}%</TableCell>
                  <TableCell className="text-right">${row.saldoTotal.toLocaleString()}</TableCell>
                  <TableCell className="text-right">${row.pagos3M.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{row.tasaRecup.toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
