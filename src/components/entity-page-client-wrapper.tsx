'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import EntityPageClient from '@/app/[entityId]/entity-page-client';
import { EntityForm } from '@/components/entity-form';
import { Button } from '@/components/ui/button';
import { Pencil, Check } from 'lucide-react';
import type { Entity, UseCase } from '@/lib/types';

interface EntityPageClientWrapperProps {
  entity: Entity;
  initialUseCases: UseCase[];
}

export function EntityPageClientWrapper({ entity, initialUseCases }: EntityPageClientWrapperProps) {
  const [showEditForm, setShowEditForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <>
      <Header 
        entity={entity}
        rightContent={
          <Button variant="ghost" size="icon" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? (
              <Check className="h-4 w-4" />
            ) : (
              <Pencil className="h-4 w-4" />
            )}
            <span className="sr-only">{isEditing ? 'Finalizar Edición' : 'Editar Casos de Uso'}</span>
          </Button>
        }
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <EntityPageClient entity={entity} initialUseCases={initialUseCases} isEditing={isEditing} />
      </div>
      
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
