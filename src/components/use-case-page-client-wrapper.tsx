'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Header } from '@/components/header';
import { PageHeader } from '@/components/page-header';
import { UseCasePageClient } from '@/components/use-case-page-client';
import { UseCaseForm } from '@/components/use-case-form';
import { MetricsForm } from '@/components/metrics-form';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import type { Entity, UseCase } from '@/lib/types';

interface UseCasePageClientWrapperProps {
  entity: Entity;
  useCase: UseCase;
}

export function UseCasePageClientWrapper({ entity, useCase }: UseCasePageClientWrapperProps) {
  const [showEditForm, setShowEditForm] = useState(false);
  const [showMetricsForm, setShowMetricsForm] = useState(false);

  return (
    <>
      <Header 
        entity={entity}
        editButton={{
          label: 'Editar caso de uso',
          onClick: () => setShowEditForm(true)
        }}
      />
      
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

        <UseCasePageClient entity={entity} useCase={useCase} />
      </div>
      
      {showEditForm && (
        <UseCaseForm
          useCase={useCase}
          entityId={entity.id}
          open={showEditForm}
          onOpenChange={setShowEditForm}
          onSuccess={() => window.location.reload()}
        />
      )}

      {showMetricsForm && (
        <MetricsForm
          entityId={entity.id}
          useCaseId={useCase.id}
          initialMetrics={useCase.metrics}
          open={showMetricsForm}
          onOpenChange={setShowMetricsForm}
          onSuccess={() => window.location.reload()}
        />
      )}
    </>
  );
}
