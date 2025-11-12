'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Header } from '@/components/header';
import { PageHeader } from '@/components/page-header';
import { UseCasePageClient } from '@/components/use-case-page-client';
import { UseCaseForm } from '@/components/use-case-form';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import type { Entity, UseCase } from '@/lib/types';

interface UseCasePageClientWrapperProps {
  entity: Entity;
  useCase: UseCase;
}

export function UseCasePageClientWrapper({ entity, useCase }: UseCasePageClientWrapperProps) {
  const [showEditForm, setShowEditForm] = useState(false);

  return (
    <>
      <Header 
        entity={entity}
        title={useCase.name}
      />
      
      <div className="p-4 md:p-8 space-y-8">
        <PageHeader
          title={useCase.name}
          description={
              <div className="flex items-center gap-2 text-base">
                  <span className="text-muted-foreground">Caso de uso de:</span>
                  <Button variant="link" asChild className="p-0 h-auto text-base text-primary hover:text-primary/80">
                      <Link href={`/${entity.id}`}>{entity.name}</Link>
                  </Button>
              </div>
          }
          action={
              <Button onClick={() => setShowEditForm(true)}>
                  <Pencil className="-ml-1 mr-2" />
                  Editar Información General
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
    </>
  );
}
