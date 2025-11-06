'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricsCard } from '@/components/metrics-card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Briefcase, Activity, Info, Settings2 } from 'lucide-react';
import type { Entity, UseCase } from '@/lib/types';
import { GenerateAlertButton } from './generate-alert-button';

export function UseCasePageClient({ entity, useCase }: { entity: Entity; useCase: UseCase }) {
  return (
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
                            <Badge variant="secondary">Last Updated: {new Date(useCase.lastUpdated || Date.now()).toLocaleDateString()}</Badge>
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
  );
}
