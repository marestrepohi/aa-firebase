'use client';

import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricsCard } from '@/components/metrics-card';
import { BacktestingDashboard } from '@/components/backtesting-dashboard';
import { DollarSign, Briefcase, Activity, Info } from 'lucide-react';
import type { Entity, UseCase, Kpi } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

function isValidDate(dateString: string | undefined): boolean {
    if (!dateString) return false;
    // Check if it's a valid date string that JS can parse
    const date = new Date(dateString);
    return !isNaN(date.getTime());
}

function InfoBox({ title, children, className = '' }: { title: string, children: React.ReactNode, className?: string }) {
  const content = children || <span className="text-muted-foreground italic">No definido</span>;
  return (
    <div className={`border border-gray-200 rounded-lg p-4 relative ${className}`}>
      <h2 className="absolute -top-2.5 left-3 bg-background px-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</h2>
      <div className="text-sm text-gray-800 pt-2">{content}</div>
    </div>
  );
}

const KpiMetricsDisplay = ({ title, kpis }: { title: string, kpis?: Kpi[] }) => {
    const getLatestValorGenerado = (kpi: Kpi) => {
        if (!kpi.valoresGenerados || kpi.valoresGenerados.length === 0) {
            return null;
        }
        // Filter for valid dates before sorting
        const sorted = [...kpi.valoresGenerados]
            .filter(v => isValidDate(v.date))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        return sorted.length > 0 ? sorted[0] : null;
    };

    return (
        <InfoBox title={title} className="col-span-full">
            {kpis && kpis.length > 0 ? (
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b">
                            <th className="pb-2 text-left font-medium text-muted-foreground">KPI</th>
                            <th className="pb-2 text-left font-medium text-muted-foreground">Descripción</th>
                            <th className="pb-2 text-left font-medium text-muted-foreground">Valor Esperado</th>
                            <th className="pb-2 text-left font-medium text-muted-foreground">Último Valor Generado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {kpis.map((kpi, index) => {
                            const latestValor = getLatestValorGenerado(kpi);
                            return (
                                <tr key={index} className="border-b last:border-0">
                                    <td className="py-2.5 pr-4 font-medium">{kpi.nombre}</td>
                                    <td className="py-2.5 pr-4 text-muted-foreground">{kpi.descripcion}</td>
                                    <td className="py-2.5 pr-4">{kpi.valorEsperado}</td>
                                    <td className="py-2.5 pr-4">
                                        {latestValor ? (
                                            <span>
                                                {latestValor.value}{' '}
                                                <span className="text-xs text-muted-foreground">
                                                  ({latestValor.date})
                                                </span>
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground italic">N/A</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            ) : (
                <p className="text-muted-foreground italic">No hay KPIs definidos.</p>
            )}
        </InfoBox>
    );
}

export function UseCasePageClient({ entity, useCase }: { entity: Entity; useCase: UseCase }) {
  const team = [useCase.ds1, useCase.ds2, useCase.ds3, useCase.ds4, useCase.de, useCase.mds].filter(Boolean).join(' - ');
  
  const availablePeriods = useMemo(() => {
    return Object.keys(useCase.metrics || {}).sort().reverse();
  }, [useCase.metrics]);

  const [selectedPeriod, setSelectedPeriod] = useState<string>(availablePeriods[0] || '');

  const financialMetrics = useMemo(() => {
    return useCase.metrics?.[selectedPeriod]?.financial || {};
  }, [useCase.metrics, selectedPeriod]);
  
  const businessMetrics = useMemo(() => {
    return useCase.metrics?.[selectedPeriod]?.business || {};
  }, [useCase.metrics, selectedPeriod]);
  
  const descriptions = useMemo(() => {
    const allDescriptions: Record<string, string> = {};
    if (useCase.metricsConfig) {
      Object.values(useCase.metricsConfig).forEach(config => {
        Object.assign(allDescriptions, config.descriptions);
      });
    }
    return allDescriptions;
  }, [useCase.metricsConfig]);


  return (
    <>
      <Tabs defaultValue="information">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="information">Información General</TabsTrigger>
            <TabsTrigger value="technical">Seguimiento Técnico</TabsTrigger>
            <TabsTrigger value="business">Métricas de Negocio</TabsTrigger>
            <TabsTrigger value="financial">Métricas Financieras</TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
              <TabsContent value="information">
                  <Card>
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2"><Info /> Información del Proyecto</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <InfoBox title="Estado">{useCase.status}</InfoBox>
                            <InfoBox title="Fecha actualización">
                                {useCase.lastUpdated ? format(new Date(useCase.lastUpdated), 'dd/MM/yyyy') : "N/A"}
                            </InfoBox>
                            <InfoBox title="Sponsor" className="col-span-2">{useCase.sponsor}</InfoBox>
                          </div>
                          <InfoBox title="Equipo Técnico">{team}</InfoBox>
                          <div className="grid grid-cols-2 gap-6">
                            <InfoBox title="Objetivo" className="min-h-[120px]">{useCase.objetivo}</InfoBox>
                            <InfoBox title="Dolores" className="min-h-[120px]">{useCase.dolores}</InfoBox>
                            <InfoBox title="Solución" className="min-h-[120px]">{useCase.solucion}</InfoBox>
                            <InfoBox title="Riesgos" className="min-h-[120px]">{useCase.riesgos}</InfoBox>
                          </div>
                          <KpiMetricsDisplay title="Impacto (KPIs)" kpis={useCase.kpis} />
                          <InfoBox title="Observaciones">{useCase.observaciones}</InfoBox>
                      </CardContent>
                  </Card>
              </TabsContent>
              <TabsContent value="technical">
                  <BacktestingDashboard allMetrics={useCase.metrics} descriptions={descriptions} />
              </TabsContent>
              <TabsContent value="business" className="space-y-6">
                <div className="flex justify-end">
                    {availablePeriods.length > 0 && (
                         <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">Período:</span>
                            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Seleccionar período" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availablePeriods.map(period => (
                                        <SelectItem key={period} value={period}>{period}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
                <MetricsCard title="Métricas de Negocio" metrics={businessMetrics} descriptions={descriptions} icon={<Briefcase className="h-5 w-5 text-muted-foreground" />} />
              </TabsContent>
              <TabsContent value="financial" className="space-y-6">
                <div className="flex justify-end">
                    {availablePeriods.length > 0 && (
                         <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">Período:</span>
                            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Seleccionar período" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availablePeriods.map(period => (
                                        <SelectItem key={period} value={period}>{period}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
                <MetricsCard title="Métricas Financieras" metrics={financialMetrics} descriptions={descriptions} icon={<DollarSign className="h-5 w-5 text-muted-foreground" />} />
              </TabsContent>
          </div>
      </Tabs>
    </>
  );
}
