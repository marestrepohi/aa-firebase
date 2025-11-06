'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import EntityPageClient from '@/app/[entityId]/entity-page-client';
import { EntityForm } from '@/components/entity-form';
import type { Entity, UseCase } from '@/lib/types';

interface EntityPageClientWrapperProps {
  entity: Entity;
  initialUseCases: UseCase[];
}

export function EntityPageClientWrapper({ entity, initialUseCases }: EntityPageClientWrapperProps) {
  const [showEditForm, setShowEditForm] = useState(false);

  return (
    <>
      <Header 
        entity={entity}
        editButton={{
          label: 'Editar entidad',
          onClick: () => setShowEditForm(true)
        }}
      />
      <EntityPageClient entity={entity} initialUseCases={initialUseCases} />
      
      {showEditForm && (
        <EntityForm
          entity={entity}
          open={showEditForm}
          onOpenChange={setShowEditForm}
          onSuccess={() => window.location.reload()}
        />
      )}
    </>
  );
}
