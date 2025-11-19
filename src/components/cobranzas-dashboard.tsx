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
  metricsData: any[]; // Raw data for the selected version
  history: any[]; // History for trend chart
  descriptions: Record<string, string>;
  selectedHistoryId: string;
  onHistoryChange: (id: string) => void;
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


export function CobranzasDashboard({ metricsData, history, descriptions, selectedHistoryId, onHistoryChange }: CobranzasDashboardProps) {
  const selectedDate = useMemo(() => {
    const item = history.find(h => h.id === selectedHistoryId);
    return item?.uploadedAt ? new Date(item.uploadedAt).toLocaleDateString() : selectedHistoryId;
  }, [history, selectedHistoryId]);

  const { summary, segmentTableData, temporalChartData } = useMemo(() => {
    if (!metricsData || metricsData.length === 0) {
      return { summary: {}, segmentTableData: [], temporalChartData: [] };
    }

    // Process current metrics data (metricsData is an array of rows)
    const segments: Record<string, any> = {};

    // If metricsData is an array of rows, we iterate them.
    // We assume the rows contain the segment info.
    // If the format is flattened keys in a single row (old format), metricsData[0] would have keys like 'segmento_A_clientes'.
    // If the format is multi-row (new format?), each row might be a segment.

    // Let's try to handle both or assume the new format is raw CSV rows.
    // If raw CSV rows: [{ Segmento: 'A', Clientes: 100, ... }]
    // We need to know the column names.

    // However, the previous code assumed keys like 'segmento_...'.
    // If the user uploads the SAME CSV as before, `Papa.parse` produces an array of objects.
    // If the CSV was "Key,Value" format, then `metricsData` is `[{ Key: 'segmento_A_clientes', Value: 100 }]`.
    // If the CSV was wide format "segmento_A_clientes, segmento_B_clientes\n100, 200", then `metricsData` is `[{ 'segmento_A_clientes': 100, ... }]`.

    // Given the previous code iterated `Object.entries(currentMetrics)`, it implies `currentMetrics` was an object with keys.
    // If `metricsData` is the raw array, we should probably use the first row if it looks like the old format.

    const dataRow = metricsData.length > 0 ? metricsData[0] : {};

    Object.entries(dataRow).forEach(([key, value]) => {
      const parts = key.split('_');
      const metricName = parts.slice(0, -1).join('_');
      const segment = parts[parts.length - 1];

      if (key.startsWith('segmento_')) {
        if (!segments[segment]) segments[segment] = { segmento: value }; // This looks wrong in original code too? 'segmento' key value is value?
        // Original code: if (!segments[segment]) segments[segment] = { segmento: value };
        // Wait, if key is 'segmento_A', value is 'A'?
        // If key is 'segmento_A_clientes', metricName is 'segmento_A', segment is 'clientes'.
        // The split logic in original code:
        // key.split('_').
        // If key is 'segmento_A_clientes': parts=['segmento', 'A', 'clientes'].
        // metricName = 'segmento_A'. segment = 'clientes'.
        // This seems to assume the LAST part is the segment? No, 'clientes' is the metric.
        // The original code was:
        // const metricName = parts.slice(0, -1).join('_');
        // const segment = parts[parts.length-1];
        // This implies 'segmento_A' is the metric name, and 'clientes' is the segment? That's weird.
        // Usually it's 'metric_segment'.

        // Let's look at original code again.
        // if(key.startsWith('segmento_')){ if (!segments[segment]) segments[segment] = { segmento: value }; }
        // else if (metricName && segment) { ... segments[segment][metricName] = ... }

        // It seems it tries to parse 'segmento_X' keys to establish segments?
        // And then other keys.

        // Let's preserve the logic but apply it to `dataRow`.
      }
    });

    // Re-implementing the original logic exactly as it was, but using dataRow
    Object.entries(dataRow).forEach(([key, value]) => {
      const parts = key.split('_');
      const metricName = parts.slice(0, -1).join('_');
      const segment = parts[parts.length - 1];

      if (key.startsWith('segmento_')) {
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

    // Temporal data from history
    const temporalData = history.map(h => {
      // We expect PSI, KS etc to be top-level fields in history items (summary)
      // Or inside a 'technical' field if we structured it that way?
      // In MetricsForm, we spread summary at top level.
      // So h.psi, h.ks should exist if they were in the CSV.
      return {
        period: h.uploadedAt ? new Date(h.uploadedAt).toLocaleDateString() : h.id, // Use date as period label
        psi: parseFloat(h['psi'] || 0),
        ks: parseFloat(h['ks'] || 0),
        roc: parseFloat(h['roc_auc'] || h['auc_roc'] || h['roc'] || h['auc'] || 0),
        lift: parseFloat(h['lift'] || 0)
      }
    }).reverse(); // History is usually desc, chart wants asc?

    return { summary, segmentTableData, temporalChartData: temporalData };
  }, [metricsData, history]);


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
        <ChartCard title="Efectividad por Segmento" description={`Análisis de clientes vs respuesta para el período ${selectedDate}`}>
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
          <CardTitle>Análisis Detallado por Segmento ({selectedDate})</CardTitle>
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
