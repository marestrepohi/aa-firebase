"use client";

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/page-header';
import { CreateUseCaseButton } from '@/components/create-use-case-button';
import { UseCaseCard } from '@/components/use-case-card';
import { EntityStatsPanel } from '@/components/entity-stats-panel';
import { EntityFilters } from '@/components/entity-filters';
import type { Entity, UseCase } from '@/lib/types';

interface EntityPageClientProps {
  entity: Entity;
  initialUseCases: UseCase[];
}

export default function EntityPageClient({ entity, initialUseCases }: EntityPageClientProps) {
  const [filters, setFilters] = useState({
    highLevelStatus: 'all',
    estado: 'all',
    tipoProyecto: 'all',
    tipoDesarrollo: 'all'
  });

  // Obtener opciones únicas para los filtros
  const filterOptions = useMemo(() => {
    const estados = new Set<string>();
    const tiposProyecto = new Set<string>();
    const tiposDesarrollo = new Set<string>();

    initialUseCases.forEach(uc => {
      if (uc.status) estados.add(uc.status);
      if (uc.tipoProyecto) tiposProyecto.add(uc.tipoProyecto);
      if (uc.tipoDesarrollo) tiposDesarrollo.add(uc.tipoDesarrollo);
    });

    return {
      estados: Array.from(estados).sort(),
      tiposProyecto: Array.from(tiposProyecto).sort(),
      tiposDesarrollo: Array.from(tiposDesarrollo).sort()
    };
  }, [initialUseCases]);

  // Filter use cases based on all selected filters
  const filteredUseCases = useMemo(() => {
    return initialUseCases.filter(uc => {
      if (filters.highLevelStatus !== 'all' && uc.highLevelStatus !== filters.highLevelStatus) return false;
      if (filters.estado !== 'all' && uc.status !== filters.estado) return false;
      if (filters.tipoProyecto !== 'all' && uc.tipoProyecto !== filters.tipoProyecto) return false;
      if (filters.tipoDesarrollo !== 'all' && uc.tipoDesarrollo !== filters.tipoDesarrollo) return false;
      return true;
    });
  }, [initialUseCases, filters]);

  // Calculate statistics from filtered use cases
  const statusCounts = filteredUseCases.reduce((acc, uc) => {
    const status = uc.status;
    const existing = acc.find(s => s.label === status);
    if (existing) {
      existing.count++;
    } else {
      let color = 'text-gray-700';
      const statusLower = status.toLowerCase();
      if (statusLower.includes('entregado') || statusLower.includes('finalizado')) {
        color = 'text-green-700';
      } else if (statusLower.includes('deprecado')) {
        color = 'text-red-700';
      } else if (statusLower.includes('desarrollo') || statusLower.includes('pilotaje')) {
        color = 'text-yellow-700';
      } else if (statusLower.includes('consultoria')) {
        color = 'text-blue-700';
      }
      
      acc.push({ label: status, count: 1, color });
    }
    return acc;
  }, [] as Array<{ label: string; count: number; color: string }>);

  // Add total cases at the beginning
  const stats = [
    { label: 'Total de Casos', count: filteredUseCases.length, color: 'text-gray-900' },
    ...statusCounts
  ];

  return (
    <div className="p-4 md:p-8 space-y-6">
      <PageHeader
        title={`Casos de Uso`}
        description={entity.description}
        action={<CreateUseCaseButton entityId={entity.id} />}
      />

      <EntityStatsPanel stats={stats} />

      <EntityFilters
        onFilterChange={setFilters}
        estadoOptions={filterOptions.estados}
        tipoProyectoOptions={filterOptions.tiposProyecto}
        tipoDesarrolloOptions={filterOptions.tiposDesarrollo}
        currentFilters={filters}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUseCases.length > 0 ? (
          filteredUseCases.map((useCase) => (
            <UseCaseCard key={useCase.id} useCase={useCase} />
          ))
        ) : (
          <div className="col-span-full h-24 flex items-center justify-center text-muted-foreground bg-white rounded-lg border">
            No se encontraron casos de uso con el filtro seleccionado.
          </div>
        )}
      </div>
    </div>
  );
}
