"use client";

import { useState, useMemo } from 'react';
import { SummaryCard } from "@/components/summary-card";
import { EntityCard } from "@/components/entity-card";
import { CaseStatusTable } from "@/components/case-status-table";
import { GlobalFilters } from "@/components/global-filters";
import { Button } from "@/components/ui/button";
import type { Entity, UseCase } from '@/lib/types';

interface HomePageClientProps {
  entities: Entity[];
  allUseCases: UseCase[];
  isEditing: boolean;
}

export default function HomePageClient({ entities, allUseCases, isEditing }: HomePageClientProps) {
  const [showStatusTable, setShowStatusTable] = useState(false);
  const [filters, setFilters] = useState({
    highLevelStatus: 'all',
    estado: 'all',
    tipoProyecto: 'all',
    tipoDesarrollo: 'all',
    suite: 'all',
  });

  const filterOptions = useMemo(() => {
    const highLevelStatuses = new Set<string>();
    const estados = new Set<string>();
    const tiposProyecto = new Set<string>();
    const tiposDesarrollo = new Set<string>();
    const suites = new Set<string>();

    allUseCases.forEach(uc => {
      if (uc.highLevelStatus) highLevelStatuses.add(uc.highLevelStatus);
      if (uc.status) estados.add(uc.status);
      if (uc.tipoProyecto) tiposProyecto.add(uc.tipoProyecto);
      if (uc.tipoDesarrollo) tiposDesarrollo.add(uc.tipoDesarrollo);
      if (uc.suite) suites.add(uc.suite);
    });

    return {
      highLevelStatuses: Array.from(highLevelStatuses).sort(),
      estados: Array.from(estados).sort(),
      tiposProyecto: Array.from(tiposProyecto).sort(),
      tiposDesarrollo: Array.from(tiposDesarrollo).sort(),
      suites: Array.from(suites).sort(),
    };
  }, [allUseCases]);

  const filteredUseCases = useMemo(() => {
    return allUseCases.filter(uc => {
      if (filters.highLevelStatus !== 'all' && uc.highLevelStatus !== filters.highLevelStatus) return false;
      if (filters.estado !== 'all' && uc.status !== filters.estado) return false;
      if (filters.tipoProyecto !== 'all' && uc.tipoProyecto !== filters.tipoProyecto) return false;
      if (filters.tipoDesarrollo !== 'all' && uc.tipoDesarrollo !== filters.tipoDesarrollo) return false;
      if (filters.suite !== 'all' && uc.suite !== filters.suite) return false;
      return true;
    });
  }, [allUseCases, filters]);

  const summaryMetrics = useMemo(() => {
    const uniqueEntities = new Set(filteredUseCases.map(uc => uc.entityId));
    const uniqueDataScientists = new Set(filteredUseCases.map(uc => uc.ds1).filter(Boolean));
    
    return {
      totalCases: filteredUseCases.length,
      entities: uniqueEntities.size,
      dataScientists: uniqueDataScientists.size,
    }
  }, [filteredUseCases]);

  const entitiesWithFilteredStats = useMemo(() => {
    const useCasesByEntity: Record<string, UseCase[]> = {};
    
    filteredUseCases.forEach(uc => {
      if (!useCasesByEntity[uc.entityId]) {
        useCasesByEntity[uc.entityId] = [];
      }
      useCasesByEntity[uc.entityId].push(uc);
    });

    return entities
      .filter(entity => useCasesByEntity[entity.id]) // Only show entities that have filtered cases
      .map(entity => {
        const entityUseCases = useCasesByEntity[entity.id];
        const active = entityUseCases.filter(uc => uc.highLevelStatus === 'Activo').length;
        const inactive = entityUseCases.filter(uc => uc.highLevelStatus === 'Inactivo').length;
        const strategic = entityUseCases.filter(uc => uc.highLevelStatus === 'Estrategico').length;
        
        return {
          ...entity,
          stats: {
            ...entity.stats,
            active,
            inactive,
            strategic,
            total: entityUseCases.length,
          }
        };
      });

  }, [entities, filteredUseCases]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 md:py-8 space-y-6">
      <div>
        <GlobalFilters
          onFilterChange={setFilters}
          highLevelStatusOptions={filterOptions.highLevelStatuses}
          estadoOptions={filterOptions.estados}
          tipoProyectoOptions={filterOptions.tiposProyecto}
          tipoDesarrolloOptions={filterOptions.tiposDesarrollo}
          suiteOptions={filterOptions.suites}
          currentFilters={filters}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard 
          title="TOTAL DE CASOS" 
          value={summaryMetrics.totalCases} 
          action={
            <Button 
              variant="link" 
              className="p-0 h-auto text-blue-600 hover:text-blue-800"
              onClick={() => setShowStatusTable(!showStatusTable)}
            >
              {showStatusTable ? 'Cerrar' : 'Detalle'}
            </Button>
          } 
        />
        <SummaryCard title="ENTIDADES" value={summaryMetrics.entities} />
        <SummaryCard title="CIENTÍFICOS DE DATOS" value={summaryMetrics.dataScientists} />
      </div>

      {showStatusTable && (
        <CaseStatusTable useCases={filteredUseCases} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {entitiesWithFilteredStats.length > 0 ? (
          entitiesWithFilteredStats.map(entity => (
            <EntityCard key={entity.id} entity={entity} isEditing={isEditing} />
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            No se encontraron entidades con los filtros seleccionados
          </div>
        )}
      </div>
    </div>
  );
}
