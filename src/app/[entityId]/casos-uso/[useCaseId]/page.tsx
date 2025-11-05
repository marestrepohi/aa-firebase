import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getEntity, getUseCase } from '@/lib/data';
import { PageHeader } from '@/components/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricsCard } from '@/components/metrics-card';
import { GenerateAlertButton } from '@/components/generate-alert-button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Info, DollarSign, Briefcase, Activity, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/header';


export const dynamic = 'force-dynamic';

export default async function UseCasePage({ params }: { params: { entityId: string; useCaseId: string } }) {
  const [entity, useCase] = await Promise.all([
    getEntity(params.entityId),
    getUseCase(params.useCaseId)
  ]);

  if (!entity || !useCase || useCase.entityId !== entity.id) {
    notFound();
  }

  return (
    <>
      <Header entity={entity} />
      <div className="p-4 md:p-8 space-y-8">
        <PageHeader
          title={useCase.name}
          description={
              <div className="flex items-center gap-2 text-base">
                  <Button variant="link" asChild className="p-0 h-auto text-base text-muted-foreground hover:text-primary">
                      <Link href={`/${entity.id}`}>{entity.name}</Link>
                  </Button>
                  <span>/</span>
                  <span>{useCase.name}</span>
              </div>
          }
          action={
              <Button variant="outline" asChild>
                  <Link href={`/${entity.id}`}>
                      <ChevronLeft className="-ml-1 mr-2 h-4 w-4" />
                      Volver a Casos de Uso
                  </Link>
              </Button>
          }
        />

        <Tabs defaultValue="information">
          <div className="flex justify-between items-end">
              <TabsList>
              <TabsTrigger value="information">Information</TabsTrigger>
              <TabsTrigger value="general">General Metrics</TabsTrigger>
              <TabsTrigger value="financial">Financial Metrics</TabsTrigger>
              <TabsTrigger value="business">Business Metrics</TabsTrigger>
              <TabsTrigger value="technical">Technical Metrics</TabsTrigger>
              </TabsList>
              <GenerateAlertButton useCase={useCase} />
          </div>
          <div className="mt-6">
              <TabsContent value="information">
                  <Card>
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2"><Info /> Information</CardTitle>
                          <CardDescription>Details and description of the use case.</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <p className="text-base">{useCase.description}</p>
                          <div className="mt-4 flex gap-4">
                              <Badge variant="secondary">Status: {useCase.status}</Badge>
                              <Badge variant="secondary">Last Updated: {new Date(useCase.lastUpdated).toLocaleDateString()}</Badge>
                          </div>
                      </CardContent>
                  </Card>
              </TabsContent>
              <TabsContent value="general">
                  <MetricsCard title="General Metrics" metrics={useCase.metrics.general} icon={<Settings2 className="h-5 w-5 text-muted-foreground" />} />
              </TabsContent>
              <TabsContent value="financial">
                  <MetricsCard title="Financial Metrics" metrics={useCase.metrics.financial} icon={<DollarSign className="h-5 w-5 text-muted-foreground" />} />
              </TabsContent>
              <TabsContent value="business">
                  <MetricsCard title="Business Metrics" metrics={useCase.metrics.business} icon={<Briefcase className="h-5 w-5 text-muted-foreground" />} />
              </TabsContent>
              <TabsContent value="technical">
                  <MetricsCard title="Technical Metrics" metrics={useCase.metrics.technical} icon={<Activity className="h-5 w-5 text-muted-foreground" />} />
              </TabsContent>
          </div>
        </Tabs>
      </div>
    </>
  );
}
