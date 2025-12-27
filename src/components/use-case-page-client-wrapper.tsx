'use client';

import { useState } from 'react';
import { PageTitle } from '@/components/page-title';
import { UseCasePageClient } from '@/components/use-case-page-client';
import { UseCaseForm } from '@/components/use-case-form';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BarChart3, Info, MoreHorizontal } from 'lucide-react';
import type { Entity, UseCase } from '@/lib/types';
import { MetricsForm } from './metrics-form';

interface UseCasePageClientWrapperProps {
    entity: Entity;
    useCase: UseCase;
    initialHistory?: any[];
}

export function UseCasePageClientWrapper({ entity, useCase, initialHistory = [] }: UseCasePageClientWrapperProps) {
    const [showEditForm, setShowEditForm] = useState(false);
    const [showMetricsForm, setShowMetricsForm] = useState(false);

    const editOptions = (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <MoreHorizontal className="h-4 w-4" />
                    Opciones
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[160px]">
                <DropdownMenuItem onClick={() => setShowEditForm(true)} className="cursor-pointer">
                    <Info className="mr-2 h-4 w-4" />
                    <span>Información</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowMetricsForm(true)} className="cursor-pointer">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    <span>Métricas</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <>
            <PageTitle
                title={useCase.name}
                breadcrumbs={[
                    { label: 'Inicio', href: '/' },
                    { label: entity.name, href: `/${entity.id}` },
                    { label: useCase.name }
                ]}
                rightContent={editOptions}
            />

            <UseCasePageClient entity={entity} useCase={useCase} />

            {showEditForm && (
                <UseCaseForm
                    useCase={useCase}
                    entityId={entity.id}
                    open={showEditForm}
                    onOpenChange={setShowEditForm}
                    onSuccess={() => window.location.reload()}
                    initialHistory={initialHistory}
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
