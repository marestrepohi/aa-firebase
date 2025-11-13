'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { AllMetrics } from '@/lib/types';

interface BacktestingDashboardProps {
  allMetrics: AllMetrics;
  descriptions: Record<string, string>;
}

interface ChartData {
  period: string;
  precision?: number;
  recall?: number;
  auc?: number;
  f1_score?: number;
}

const METRIC_KEYS = {
  PRECISION: 'precision',
  RECALL: 'recall',
  AUC: 'auc',
  F1_SCORE: 'f1_score',
};

const METRIC_COLORS = {
  [METRIC_KEYS.PRECISION]: 'hsl(var(--chart-1))',
  [METRIC_KEYS.RECALL]: 'hsl(var(--chart-2))',
  [METRIC_KEYS.AUC]: 'hsl(var(--chart-3))',
  [METRIC_KEYS.F1_SCORE]: 'hsl(var(--chart-4))',
};

export function BacktestingDashboard({ allMetrics, descriptions }: BacktestingDashboardProps) {
  const periods = useMemo(() => {
    return Object.keys(allMetrics || {}).sort();
  }, [allMetrics]);

  const chartData = useMemo<ChartData[]>(() => {
    return periods.map(period => {
      const techMetrics = allMetrics[period]?.technical || {};
      const data: ChartData = { period };
      for (const key in METRIC_KEYS) {
        const metricKey = METRIC_KEYS[key as keyof typeof METRIC_KEYS];
        if (techMetrics[metricKey] !== undefined) {
          const value = parseFloat(techMetrics[metricKey]);
          if (!isNaN(value)) {
            data[metricKey as keyof ChartData] = value;
          }
        }
      }
      return data;
    });
  }, [allMetrics, periods]);
  
  const allTechnicalMetricNames = useMemo(() => {
    const metricSet = new Set<string>();
    periods.forEach(period => {
      const techMetrics = allMetrics[period]?.technical || {};
      Object.keys(techMetrics).forEach(key => metricSet.add(key));
    });
    return Array.from(metricSet).sort();
  }, [allMetrics, periods]);


  if (periods.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Seguimiento de Backtesting</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12 text-muted-foreground">
          <p>No hay datos de métricas técnicas disponibles.</p>
          <p className="text-sm mt-2">Sube un archivo CSV en la sección de Métricas para empezar.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div>
            <CardTitle>Tablero de Seguimiento de Backtesting</CardTitle>
            <CardDescription>Análisis de la evolución del rendimiento del modelo a lo largo del tiempo.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Evolución de Métricas Clave</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                <XAxis dataKey="period" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} domain={[0, 1]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey={METRIC_KEYS.PRECISION} name="Precisión" stroke={METRIC_COLORS.precision} strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey={METRIC_KEYS.RECALL} name="Recall" stroke={METRIC_COLORS.recall} strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey={METRIC_KEYS.AUC} name="AUC" stroke={METRIC_COLORS.auc} strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey={METRIC_KEYS.F1_SCORE} name="F1-Score" stroke={METRIC_COLORS.f1_score} strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Comparativa de Métricas Técnicas por Período</h3>
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-3 font-medium text-muted-foreground sticky left-0 bg-muted/50 z-10 min-w-[200px]">Métrica</th>
                  {periods.map(period => (
                    <th key={period} className="p-3 font-medium text-muted-foreground text-center min-w-[120px]">{period}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allTechnicalMetricNames.map((metricName) => (
                  <tr key={metricName} className="border-b last:border-b-0">
                    <td className="p-3 font-medium capitalize sticky left-0 bg-background z-10" title={descriptions[metricName] || ''}>
                      {metricName.replace(/_/g, ' ')}
                    </td>
                    {periods.map(period => {
                      const value = allMetrics[period]?.technical?.[metricName];
                      return (
                        <td key={period} className="p-3 text-center">
                          {value !== undefined ? String(value) : <span className="text-muted-foreground">-</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
