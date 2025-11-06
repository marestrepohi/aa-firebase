'use client';

import { useState, useMemo } from 'react';
import { UseCaseCard } from '@/components/use-case-card';
import { EntityFilters } from '@/components/entity-filters';
import { EntityStatsPanel } from '@/components/entity-stats-panel';
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
    tipoDesarrollo: 'all',
  });

  const filterOptions = useMemo(() => {
    const highLevelStatuses = new Set<string>();
    const estados = new Set<string>();
    const tiposProyecto = new Set<string>();
    const tiposDesarrollo = new Set<string>();

    initialUseCases.forEach((uc) => {
      if (uc.highLevelStatus) highLevelStatuses.add(uc.highLevelStatus);
      if (uc.status) estados.add(uc.status);
      if (uc.tipoProyecto) tiposProyecto.add(uc.tipoProyecto);
      if (uc.tipoDesarrollo) tiposDesarrollo.add(uc.tipoDesarrollo);
    });

    return {
      highLevelStatuses: Array.from(highLevelStatuses).sort(),
      estados: Array.from(estados).sort(),
      tiposProyecto: Array.from(tiposProyecto).sort(),
      tiposDesarrollo: Array.from(tiposDesarrollo).sort(),
    };
  }, [initialUseCases]);

  const filteredUseCases = useMemo(() => {
    return initialUseCases.filter((uc) => {
      if (filters.highLevelStatus !== 'all' && uc.highLevelStatus !== filters.highLevelStatus) return false;
      if (filters.estado !== 'all' && uc.status !== filters.estado) return false;
      if (filters.tipoProyecto !== 'all' && uc.tipoProyecto !== filters.tipoProyecto) return false;
      if (filters.tipoDesarrollo !== 'all' && uc.tipoDesarrollo !== filters.tipoDesarrollo) return false;
      return true;
    });
  }, [initialUseCases, filters]);
  
  const stats = [
    { label: 'Casos de Uso Totales', count: filteredUseCases.length, color: 'text-gray-800' },
    { label: 'Activos', count: filteredUseCases.filter(uc => uc.highLevelStatus === 'Activo').length, color: 'text-green-600' },
    { label: 'Inactivos', count: filteredUseCases.filter(uc => uc.highLevelStatus === 'Inactivo').length, color: 'text-red-600' },
    { label: 'Estratégicos', count: filteredUseCases.filter(uc => uc.highLevelStatus === 'Estrategico').length, color: 'text-blue-600' },
  ];

  return (
    <div className="p-4 md:p-8 space-y-8">
      <EntityStatsPanel stats={stats} />
      <EntityFilters
        onFilterChange={setFilters}
        highLevelStatusOptions={filterOptions.highLevelStatuses}
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
          <div className="col-span-full text-center py-12 text-gray-500">
            No se encontraron casos de uso con los filtros seleccionados
          </div>
        )}
      </div>
    </div>
  );
}
