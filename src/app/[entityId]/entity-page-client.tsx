'use client';

import { useState, useMemo } from 'react';
import { UseCaseCard } from '@/components/use-case-card';
import { EntityFilters } from '@/components/entity-filters';
import { EntityStatsPanel } from '@/components/entity-stats-panel';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import type { Entity, UseCase } from '@/lib/types';

interface EntityPageClientProps {
  entity: Entity;
  initialUseCases: UseCase[];
}

export default function EntityPageClient({ entity, initialUseCases }: EntityPageClientProps) {
  const [isEditing, setIsEditing] = useState(false);
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
      if (uc.highLevelStatus) estadosAltoNivel.add(uc.highLevelStatus);
      if (uc.status) estados.add(uc.status);
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
      if (filters.estadoAltoNivel !== 'all' && uc.highLevelStatus !== filters.estadoAltoNivel) return false;
      if (filters.estado !== 'all' && uc.status !== filters.estado) return false;
      if (filters.tipoProyecto !== 'all' && uc.tipoProyecto !== filters.tipoProyecto) return false;
      if (filters.tipoDesarrollo !== 'all' && uc.tipoDesarrollo !== filters.tipoDesarrollo) return false;
      if (filters.suite !== 'all' && uc.suite !== filters.suite) return false;
      return true;
    });
  }, [initialUseCases, filters]);
  
  const stats = useMemo(() => {
    const active = filteredUseCases.filter(uc => uc.highLevelStatus === 'Activo').length;
    const inactive = filteredUseCases.filter(uc => uc.highLevelStatus === 'Inactivo').length;
    const uniqueDS1 = new Set(filteredUseCases.map(uc => uc.ds1).filter(Boolean));
    const uniqueDE = new Set(filteredUseCases.map(uc => uc.de).filter(Boolean));

    const totalImpact = filteredUseCases.reduce((sum, uc) => {
        const impact = parseFloat(String(uc.impactoFinanciero || '0').replace(/[^0-9.-]+/g, ''));
        return sum + (isNaN(impact) ? 0 : impact);
    }, 0);

    return {
      totalCases: filteredUseCases.length,
      active,
      inactive,
      dataScientists: uniqueDS1.size,
      dataEngineers: uniqueDE.size,
      totalImpact: totalImpact,
    };
}, [filteredUseCases]);

  return (
    <div className="p-4 md:p-8 space-y-4">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-grow">
          <EntityFilters
            onFilterChange={setFilters}
            estadoAltoNivelOptions={filterOptions.estadosAltoNivel}
            estadoOptions={filterOptions.estados}
            tipoProyectoOptions={filterOptions.tiposProyecto}
            tipoDesarrolloOptions={filterOptions.tiposDesarrollo}
            suiteOptions={filterOptions.suites}
            currentFilters={filters}
          />
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsEditing(!isEditing)} title="Activar modo de edición">
            <Pencil className="h-4 w-4" />
        </Button>
      </div>
      <EntityStatsPanel stats={stats} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUseCases.length > 0 ? (
          filteredUseCases.map((useCase) => (
            <UseCaseCard key={useCase.id} useCase={useCase} isEditing={isEditing} />
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
