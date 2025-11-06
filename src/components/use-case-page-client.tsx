'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricsCard } from '@/components/metrics-card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Briefcase, Activity, Info } from 'lucide-react';
import type { Entity, UseCase } from '@/lib/types';

export function UseCasePageClient({ entity, useCase }: { entity: Entity; useCase: UseCase }) {
  return (
    <Tabs defaultValue="information">
      <TabsList>
        <TabsTrigger value="information">Información</TabsTrigger>
        <TabsTrigger value="financial">Métricas Financieras</TabsTrigger>
        <TabsTrigger value="business">Métricas de Negocio</TabsTrigger>
        <TabsTrigger value="technical">Métricas Técnicas</TabsTrigger>
      </TabsList>

      <div className="mt-6">
        <TabsContent value="information">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info /> Detalles del Caso de Uso
              </CardTitle>
              <CardDescription>Información y descripción del proyecto.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-base">{useCase.description || 'Sin descripción'}</p>
              <div className="mt-4 space-y-2">
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="secondary">Estado: {useCase.status}</Badge>
                  <Badge variant="secondary">Nivel: {useCase.highLevelStatus}</Badge>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline">Tipo: {useCase.tipoProyecto}</Badge>
                  <Badge variant="outline">Desarrollo: {useCase.tipoDesarrollo}</Badge>
                </div>
                {useCase.observaciones && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="text-sm">
                      <strong>Observaciones:</strong> {useCase.observaciones}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial">
          <MetricsCard
            title="Métricas Financieras"
            metrics={useCase.metrics.financial}
            icon={<DollarSign className="h-5 w-5 text-muted-foreground" />}
          />
        </TabsContent>

        <TabsContent value="business">
          <MetricsCard
            title="Métricas de Negocio"
            metrics={useCase.metrics.business}
            icon={<Briefcase className="h-5 w-5 text-muted-foreground" />}
          />
        </TabsContent>

        <TabsContent value="technical">
          <MetricsCard
            title="Métricas Técnicas"
            metrics={useCase.metrics.technical}
            icon={<Activity className="h-5 w-5 text-muted-foreground" />}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
}
