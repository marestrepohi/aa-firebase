'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricsCard } from '@/components/metrics-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Briefcase, Activity, Info, Settings2, BarChart3 } from 'lucide-react';
import type { Entity, UseCase } from '@/lib/types';
import { MetricsForm } from './metrics-form';
import { format } from 'date-fns';

function InfoBox({ title, children, className = '' }: { title: string, children: React.ReactNode, className?: string }) {
  const content = children || <span className="text-muted-foreground italic">No definido</span>;
  return (
    <div className={`border border-gray-200 rounded-md p-3 relative ${className}`}>
      <h2 className="absolute -top-2.5 left-3 bg-background px-1 text-sm font-semibold text-gray-500">{title}</h2>
      <div className="text-sm text-gray-700 pt-2">{content}</div>
    </div>
  );
}


export function UseCasePageClient({ entity, useCase }: { entity: Entity; useCase: UseCase }) {
  const team = [useCase.ds1, useCase.ds2, useCase.ds3, useCase.ds4, useCase.de, useCase.mds].filter(Boolean).join(' - ');
  const technicalMetricsList = Array.isArray(useCase.metrics?.technical)
    ? useCase.metrics.technical.map(m => `${m.label}: ${m.value}`).join(' | ')
    : '';

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
                          <div className="grid grid-cols-2 gap-6">
                             <InfoBox title="Impacto Esperado (KPIs)" className="min-h-[100px]">{useCase.impactoEsperado}</InfoBox>
                             <InfoBox title="Impacto Generado (KPIs)" className="min-h-[100px]">{useCase.impactoGenerado}</InfoBox>
                          </div>
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
