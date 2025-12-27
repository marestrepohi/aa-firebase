'use client';

import { useState } from 'react';
import { PageTitle } from '@/components/page-title';
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
            <PageTitle
                title={entity.name}
                subtitle={entity.description}
                breadcrumbs={[
                    { label: 'Inicio', href: '/' },
                    { label: entity.name }
                ]}
                rightContent={
                    <Button
                        variant={isEditing ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                        className="gap-2"
                    >
                        {isEditing ? (
                            <>
                                <Check className="h-4 w-4" />
                                Listo
                            </>
                        ) : (
                            <>
                                <Pencil className="h-4 w-4" />
                                Editar
                            </>
                        )}
                    </Button>
                }
            />

            <EntityPageClient entity={entity} initialUseCases={initialUseCases} isEditing={isEditing} />

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
