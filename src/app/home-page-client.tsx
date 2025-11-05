"use client";

import { useState, useMemo } from 'react';
import { PageHeader } from "@/components/page-header";
import { SummaryCard } from "@/components/summary-card";
import { EntityCard } from "@/components/entity-card";
import { CaseStatusTable } from "@/components/case-status-table";
import { GlobalFilters } from "@/components/global-filters";
import { Button } from "@/components/ui/button";
import type { Entity, SummaryMetrics, UseCase } from '@/lib/types';

interface HomePageClientProps {
  entities: Entity[];
  summaryMetrics: SummaryMetrics;
  allUseCases: UseCase[];
}

export default function HomePageClient({ entities, summaryMetrics, allUseCases }: HomePageClientProps) {
  const [showStatusTable, setShowStatusTable] = useState(false);
  const [filters, setFilters] = useState({
    estado: 'all',
    tipoProyecto: 'all',
    tipoDesarrollo: 'all'
  });

  // Obtener opciones únicas para los filtros
  const filterOptions = useMemo(() => {
    const estados = new Set<string>();
    const tiposProyecto = new Set<string>();
    const tiposDesarrollo = new Set<string>();

    allUseCases.forEach(uc => {
      if (uc.status) estados.add(uc.status);
      if (uc.tipoProyecto) tiposProyecto.add(uc.tipoProyecto);
      if (uc.tipoDesarrollo) tiposDesarrollo.add(uc.tipoDesarrollo);
    });

    return {
      estados: Array.from(estados).sort(),
      tiposProyecto: Array.from(tiposProyecto).sort(),
      tiposDesarrollo: Array.from(tiposDesarrollo).sort()
    };
  }, [allUseCases]);

  // Filtrar casos de uso
  const filteredUseCases = useMemo(() => {
    return allUseCases.filter(uc => {
      if (filters.estado !== 'all' && uc.status !== filters.estado) return false;
      if (filters.tipoProyecto !== 'all' && uc.tipoProyecto !== filters.tipoProyecto) return false;
      if (filters.tipoDesarrollo !== 'all' && uc.tipoDesarrollo !== filters.tipoDesarrollo) return false;
      return true;
    });
  }, [allUseCases, filters]);

  // Filtrar entidades que tengan casos de uso que cumplan los filtros
  const filteredEntities = useMemo(() => {
    const entitiesWithCases = new Set(filteredUseCases.map(uc => uc.entityId));
    return entities.filter(entity => entitiesWithCases.has(entity.id));
  }, [entities, filteredUseCases]);

  return (
    <div className="p-4 md:p-8 space-y-8">
      <PageHeader
        title="Casos de Uso por Entidad"
        description="Selecciona una entidad para ver y gestionar sus casos de uso de IA"
      />

      {/* Filtros globales */}
      <GlobalFilters
        onFilterChange={setFilters}
        estadoOptions={filterOptions.estados}
        tipoProyectoOptions={filterOptions.tiposProyecto}
        tipoDesarrolloOptions={filterOptions.tiposDesarrollo}
        currentFilters={filters}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        <SummaryCard title="IMPACTO TOTAL" value={`${summaryMetrics.totalImpact} mil`} />
      </div>

      {showStatusTable && (
        <CaseStatusTable useCases={filteredUseCases} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEntities.length > 0 ? (
          filteredEntities.map(entity => (
            <EntityCard key={entity.id} entity={entity} />
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
