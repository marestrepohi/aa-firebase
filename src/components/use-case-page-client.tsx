'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricsCard } from '@/components/metrics-card';
import { DollarSign, Briefcase, Activity, Info } from 'lucide-react';
import type { Entity, UseCase, Kpi } from '@/lib/types';
import { format } from 'date-fns';

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
        // Assuming dates are in 'YYYY-MM-DD' format, string comparison works for sorting
        const sorted = [...kpi.valoresGenerados].sort((a, b) => b.date.localeCompare(a.date));
        return sorted[0];
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
                                            <span>{latestValor.value} <span className="text-xs text-muted-foreground">({format(new Date(`${latestValor.date}T00:00:00`), 'dd/MM/yyyy')})</span></span>
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
  
  return (
    <>
      <Tabs defaultValue="information">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="information">Información General</TabsTrigger>
            <TabsTrigger value="technical">Métricas Técnicas</TabsTrigger>
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
                                {useCase.lastUpdated ? format(new Date(useCase.lastUpdated), 'dd/MM/yyyy') : 'N/A'}
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
                  <MetricsCard title="Métricas Técnicas" metrics={useCase.metrics.technical} icon={<Activity className="h-5 w-5 text-muted-foreground" />} />
              </TabsContent>
              <TabsContent value="business">
                  <MetricsCard title="Métricas de Negocio" metrics={useCase.metrics.business} icon={<Briefcase className="h-5 w-5 text-muted-foreground" />} />
              </TabsContent>
              <TabsContent value="financial">
                  <MetricsCard title="Métricas Financieras" metrics={useCase.metrics.financial} icon={<DollarSign className="h-5 w-5 text-muted-foreground" />} />
              </TabsContent>
          </div>
      </Tabs>
    </>
  );
}
