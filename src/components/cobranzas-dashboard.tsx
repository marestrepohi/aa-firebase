"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, DollarSign, Percent, TrendingUp } from 'lucide-react';
import { LineChart, BarChart, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Line, CartesianGrid, Bar } from 'recharts';

interface CobranzasDashboardProps {
  metricsData: any[];
  history: any[];
  descriptions: Record<string, string>;
  selectedHistoryId: string;
  onHistoryChange: (id: string) => void;
}

// Prominent KPI Card
const KPICard = ({ title, value, subValue, icon: Icon, trend }: {
  title: string,
  value: string,
  subValue?: string,
  icon: any,
  trend?: { value: string, isPositive: boolean }
}) => (
  <Card className="card-standard">
    <CardContent className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-lg bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`h-4 w-4 ${!trend.isPositive && 'rotate-180'}`} />
            {trend.value}
          </div>
        )}
      </div>
      <div>
        <p className="text-3xl md:text-4xl font-bold text-foreground mb-1">{value}</p>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {subValue && <p className="text-xs text-muted-foreground mt-1">{subValue}</p>}
      </div>
    </CardContent>
  </Card>
);

// Simplified Chart Card
const ChartCard = ({ title, description, children, className = "" }: {
  title: string,
  description?: string,
  children: React.ReactNode,
  className?: string
}) => (
  <Card className={`card-standard ${className}`}>
    <CardHeader className="pb-4">
      <CardTitle className="text-base md:text-lg font-semibold">{title}</CardTitle>
      {description && <CardDescription className="text-xs md:text-sm">{description}</CardDescription>}
    </CardHeader>
    <CardContent>
      {children}
    </CardContent>
  </Card>
);

export function CobranzasDashboard({ metricsData, history, descriptions, selectedHistoryId, onHistoryChange }: CobranzasDashboardProps) {
  const selectedDate = useMemo(() => {
    const item = history.find(h => h.id === selectedHistoryId);
    return item?.uploadedAt ? new Date(item.uploadedAt).toLocaleDateString() : 'Actual';
  }, [history, selectedHistoryId]);

  const { summary, segmentTableData, temporalChartData } = useMemo(() => {
    if (!metricsData || metricsData.length === 0) {
      return {
        summary: { totalClientes: 0, tasaExito: 0, saldoTotal: 0, tasаRecuperacion: 0 },
        segmentTableData: [],
        temporalChartData: []
      };
    }

    const dataRow = metricsData[0] || {};
    const segments: Record<string, any> = {};
    let totalClientes = 0;
    let totalSaldo = 0;
    let totalPagos = 0;

    // Process segment data
    Object.entries(dataRow).forEach(([key, value]) => {
      const parts = key.split('_');
      const segment = parts[parts.length - 1];

      if (key.startsWith('segmento_') && key.includes('_clientes_')) {
        const segmentName = parts[parts.length - 1];
        if (!segments[segmentName]) {
          segments[segmentName] = { segmento: segmentName };
        }
        segments[segmentName].clientes = Number(value) || 0;
        totalClientes += segments[segmentName].clientes;
      }

      if (key.includes('_saldoTotal_')) {
        if (!segments[segment]) segments[segment] = { segmento: segment };
        segments[segment].saldoTotal = Number(value) || 0;
        totalSaldo += segments[segment].saldoTotal;
      }

      if (key.includes('_pagos3M_')) {
        if (!segments[segment]) segments[segment] = { segmento: segment };
        segments[segment].pagos3M = Number(value) || 0;
        totalPagos += segments[segment].pagos3M;
      }

      if (key.includes('_tasaExito_')) {
        if (!segments[segment]) segments[segment] = { segmento: segment };
        segments[segment].tasaExito = Number(value) || 0;
      }

      if (key.includes('_tasaRecup_')) {
        if (!segments[segment]) segments[segment] = { segmento: segment };
        segments[segment].tasaRecup = Number(value) || 0;
      }
    });

    const segmentData = Object.values(segments);
    const avgTasaExito = segmentData.length > 0
      ? segmentData.reduce((sum, s) => sum + (s.tasaExito || 0), 0) / segmentData.length
      : 0;
    const tasaRecuperacion = totalSaldo > 0 ? (totalPagos / totalSaldo) * 100 : 0;

    // Process temporal data from history
    const temporal = history.map(item => ({
      fecha: new Date(item.uploadedAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
      clientes: item.totalClientes || 0,
      tasaExito: item.tasaExito || 0,
      saldoTotal: item.saldoTotal ? item.saldoTotal / 1000000 : 0, // Convert to millions
    })).reverse(); // Oldest to newest

    return {
      summary: {
        totalClientes,
        tasaExito: avgTasaExito,
        saldoTotal: totalSaldo,
        tasaRecuperacion
      },
      segmentTableData: segmentData,
      temporalChartData: temporal
    };
  }, [metricsData, history]);

  return (
    <div className="space-y-6">
      {/* Header with Date */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Dashboard de Cobranzas</h2>
          <p className="text-sm text-muted-foreground">Datos al {selectedDate}</p>
        </div>
      </div>

      {/* Top KPIs - Most Important Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <KPICard
          title="Total Clientes"
          value={summary?.totalClientes?.toLocaleString() ?? '0'}
          icon={Users}
        />
        <KPICard
          title="Tasa de Éxito"
          value={`${summary?.tasaExito?.toFixed(1) ?? '0.0'}%`}
          subValue="Promedio por segmento"
          icon={Percent}
        />
        <KPICard
          title="Saldo Total"
          value={`$${(summary?.saldoTotal ? summary.saldoTotal / 1000000 : 0).toFixed(1)}M`}
          subValue="Millones de pesos"
          icon={DollarSign}
        />
        <KPICard
          title="Tasa Recuperación"
          value={`${summary?.tasaRecuperacion?.toFixed(1) ?? '0.0'}%`}
          subValue="Últimos 3 meses"
          icon={TrendingUp}
        />
      </div>

      {/* Tabs for Different Views */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:w-auto">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="segments">Segmentos</TabsTrigger>
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Segments Performance Chart */}
            <ChartCard
              title="Rendimiento por Segmento"
              description="Tasa de éxito por segmento de clientes"
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={segmentTableData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="segmento" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="tasaExito" fill="hsl(var(--primary))" name="Tasa Éxito %" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Client Distribution */}
            <ChartCard
              title="Distribución de Clientes"
              description="Por segmento de cartera"
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={segmentTableData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="segmento" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="clientes" fill="hsl(var(--chart-1))" name="Clientes" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </TabsContent>

        {/* Segments Detail Tab */}
        <TabsContent value="segments" className="mt-6">
          <ChartCard
            title="Desglose Detallado por Segmento"
            description="Métricas completas de cada segmento de cartera"
          >
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Segmento</TableHead>
                    <TableHead className="text-right">Clientes</TableHead>
                    <TableHead className="text-right">Tasa Éxito</TableHead>
                    <TableHead className="text-right">Saldo Total</TableHead>
                    <TableHead className="text-right">Pagos 3M</TableHead>
                    <TableHead className="text-right">Tasa Recup.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {segmentTableData.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{row.segmento}</TableCell>
                      <TableCell className="text-right">{(row.clientes || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-right">{(row.tasaExito || 0).toFixed(1)}%</TableCell>
                      <TableCell className="text-right">${((row.saldoTotal || 0) / 1000000).toFixed(2)}M</TableCell>
                      <TableCell className="text-right">${((row.pagos3M || 0) / 1000000).toFixed(2)}M</TableCell>
                      <TableCell className="text-right">{(row.tasaRecup || 0).toFixed(1)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ChartCard>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 gap-4 md:gap-6">
            <ChartCard
              title="Evolución Temporal"
              description="Tendencia histórica de métricas clave"
              className="col-span-full"
            >
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={temporalChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="clientes"
                    stroke="hsl(var(--chart-1))"
                    name="Clientes"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="tasaExito"
                    stroke="hsl(var(--chart-2))"
                    name="Tasa Éxito %"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
