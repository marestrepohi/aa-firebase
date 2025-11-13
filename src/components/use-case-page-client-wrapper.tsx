'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { UseCasePageClient } from '@/components/use-case-page-client';
import { UseCaseForm } from '@/components/use-case-form';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Pencil, BarChart3, Info } from 'lucide-react';
import type { Entity, UseCase } from '@/lib/types';
import { MetricsForm } from './metrics-form';

interface UseCasePageClientWrapperProps {
  entity: Entity;
  useCase: UseCase;
  history: any[];
}

export function UseCasePageClientWrapper({ entity, useCase, history }: UseCasePageClientWrapperProps) {
  const [showEditForm, setShowEditForm] = useState(false);
  const [showMetricsForm, setShowMetricsForm] = useState(false);

  const editOptions = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white">
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Editar</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setShowEditForm(true)}>
          <Info className="mr-2 h-4 w-4" />
          <span>Información General</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setShowMetricsForm(true)}>
          <BarChart3 className="mr-2 h-4 w-4" />
          <span>Métricas por Período</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      <Header
        entity={entity}
        title={useCase.name}
        rightContent={editOptions}
      />
      
      <div className="p-4 md:p-8 space-y-8">
        <UseCasePageClient entity={entity} useCase={useCase} />
      </div>
      
      {showEditForm && (
        <UseCaseForm
          useCase={useCase}
          entityId={entity.id}
          open={showEditForm}
          onOpenChange={setShowEditForm}
          onSuccess={() => window.location.reload()}
          initialHistory={history}
        />
      )}

      {showMetricsForm && (
        <MetricsForm
          useCase={useCase}
          open={showMetricsForm}
          onOpenChange={setShowMetricsForm}
          onSuccess={() => window.location.reload()}
        />
      )}
    </>
  );
}
