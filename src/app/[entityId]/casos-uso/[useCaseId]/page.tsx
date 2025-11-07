import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getEntity, getUseCase } from '@/lib/data.server';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricsCard } from '@/components/metrics-card';
import { Info, DollarSign, Briefcase, Activity, Settings2, User, Link as LinkIcon } from 'lucide-react';
import { Header } from '@/components/header';


export const dynamic = 'force-dynamic';

function InfoDetail({ label, value }: { label: string; value?: string | number }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}

function LinkDetail({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1">
        <LinkIcon className="h-3 w-3" />
        Abrir enlace
      </a>
    </div>
  );
}


export default async function UseCasePage({ params }: { params: { entityId: string; useCaseId: string } }) {
  const [entity, useCase] = await Promise.all([
    getEntity(params.entityId),
    getUseCase(params.entityId, params.useCaseId)
  ]);

  if (!entity || !useCase || useCase.entityId !== entity.id) {
    notFound();
  }

  const team = [
    { label: "DS1", value: useCase.ds1 },
    { label: "DS2", value: useCase.ds2 },
    { label: "DS3", value: useCase.ds3 },
    { label: "DS4", value: useCase.ds4 },
    { label: "DE", value: useCase.de },
    { label: "MDS", value: useCase.mds },
  ].filter(m => m.value);

  return (
    <>
      <Header title={useCase.name} />
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 space-y-8">
        <Tabs defaultValue="information">
          <div className="flex justify-between items-end">
              <TabsList>
              <TabsTrigger value="information">Información General</TabsTrigger>
              <TabsTrigger value="metrics">Métricas por Período</TabsTrigger>
              </TabsList>
          </div>
          <div className="mt-6">
              <TabsContent value="information">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Info /> Información General</CardTitle>
                    <CardDescription>Detalles, estado y enlaces del caso de uso.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Descripción</p>
                      <p className="text-base">{useCase.observaciones || 'No hay descripción.'}</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <InfoDetail label="Estado" value={useCase.status} />
                      <InfoDetail label="Estado Alto Nivel" value={useCase.highLevelStatus} />
                      <InfoDetail label="Tipo de Proyecto" value={useCase.tipoProyecto} />
                      <InfoDetail label="Tipo de Desarrollo" value={useCase.tipoDesarrollo} />
                      <InfoDetail label="Etapa" value={useCase.etapa} />
                      <InfoDetail label="Suite" value={useCase.suite} />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <LinkDetail label="SharePoint" value={useCase.sharepointLink} />
                      <LinkDetail label="Jira" value={useCase.jiraLink} />
                      <LinkDetail label="Confluence" value={useCase.confluenceLink} />
                    </div>
                    
                    {team.length > 0 && (
                       <div>
                         <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><User className="h-4 w-4" /> Equipo Asignado</h4>
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                           {team.map(member => (
                             <InfoDetail key={member.label} label={member.label} value={member.value} />
                           ))}
                         </div>
                       </div>
                    )}
                    
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="metrics">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <MetricsCard title="Métricas Generales" metrics={useCase.metrics.general} icon={<Settings2 className="h-5 w-5 text-muted-foreground" />} />
                  <MetricsCard title="Métricas Financieras" metrics={useCase.metrics.financial} icon={<DollarSign className="h-5 w-5 text-muted-foreground" />} />
                  <MetricsCard title="Métricas de Negocio" metrics={useCase.metrics.business} icon={<Briefcase className="h-5 w-5 text-muted-foreground" />} />
                  <MetricsCard title="Métricas Técnicas" metrics={useCase.metrics.technical} icon={<Activity className="h-5 w-5 text-muted-foreground" />} />
                </div>
              </TabsContent>
          </div>
        </Tabs>
      </div>
    </>
  );
}
