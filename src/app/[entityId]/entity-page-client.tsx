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
    estadoAltoNivel: 'all',
    estado: 'all',
    tipoProyecto: 'all',
    tipoDesarrollo: 'all',
    suite: 'all',
  });

  const filterOptions = useMemo(() => {
    const estadosAltoNivel = new Set<string>();
    const estados = new Set<string>();
    const tiposProyecto = new Set<string>();
    const tiposDesarrollo = new Set<string>();
    const suites = new Set<string>();

    initialUseCases.forEach((uc) => {
      if (uc.estadoAltoNivel) estadosAltoNivel.add(uc.estadoAltoNivel);
      if (uc.estado) estados.add(uc.estado);
      if (uc.tipoProyecto) tiposProyecto.add(uc.tipoProyecto);
      if (uc.tipoDesarrollo) tiposDesarrollo.add(uc.tipoDesarrollo);
      if (uc.suite) suites.add(uc.suite);
    });

    return {
      estadosAltoNivel: Array.from(estadosAltoNivel).sort(),
      estados: Array.from(estados).sort(),
      tiposProyecto: Array.from(tiposProyecto).sort(),
      tiposDesarrollo: Array.from(tiposDesarrollo).sort(),
      suites: Array.from(suites).sort(),
    };
  }, [initialUseCases]);

  const filteredUseCases = useMemo(() => {
    return initialUseCases.filter((uc) => {
      if (filters.estadoAltoNivel !== 'all' && uc.estadoAltoNivel !== filters.estadoAltoNivel) return false;
      if (filters.estado !== 'all' && uc.estado !== filters.estado) return false;
      if (filters.tipoProyecto !== 'all' && uc.tipoProyecto !== filters.tipoProyecto) return false;
      if (filters.tipoDesarrollo !== 'all' && uc.tipoDesarrollo !== filters.tipoDesarrollo) return false;
      if (filters.suite !== 'all' && uc.suite !== filters.suite) return false;
      return true;
    });
  }, [initialUseCases, filters]);
  
  const stats = useMemo(() => {
    const active = filteredUseCases.filter(uc => uc.estadoAltoNivel === 'Activo').length;
    const inactive = filteredUseCases.filter(uc => uc.estadoAltoNivel === 'Inactivo').length;
    const strategic = filteredUseCases.filter(uc => uc.estadoAltoNivel === 'Estrategico').length;
    
    return [
      { label: 'Casos de Uso Totales', count: filteredUseCases.length, color: 'text-gray-800' },
      { label: 'Activos', count: active, color: 'text-green-600' },
      { label: 'Inactivos', count: inactive, color: 'text-red-600' },
      { label: 'Estratégicos', count: strategic, color: 'text-blue-600' },
    ];
  }, [filteredUseCases]);

  return (
    <div className="p-4 md:p-8 space-y-8">
      <EntityStatsPanel stats={stats} />
      <EntityFilters
        onFilterChange={setFilters}
        estadoAltoNivelOptions={filterOptions.estadosAltoNivel}
        estadoOptions={filterOptions.estados}
        tipoProyectoOptions={filterOptions.tiposProyecto}
        tipoDesarrolloOptions={filterOptions.tiposDesarrollo}
        suiteOptions={filterOptions.suites}
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
