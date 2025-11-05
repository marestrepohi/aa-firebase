"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface EntityFiltersProps {
  onFilterChange: (filters: {
    highLevelStatus: string;
    estado: string;
    tipoProyecto: string;
    tipoDesarrollo: string;
  }) => void;
  estadoOptions: string[];
  tipoProyectoOptions: string[];
  tipoDesarrolloOptions: string[];
  currentFilters: {
    highLevelStatus: string;
    estado: string;
    tipoProyecto: string;
    tipoDesarrollo: string;
  };
}

export function EntityFilters({
  onFilterChange,
  estadoOptions,
  tipoProyectoOptions,
  tipoDesarrolloOptions,
  currentFilters
}: EntityFiltersProps) {
  
  const handleClearFilters = () => {
    onFilterChange({
      highLevelStatus: 'all',
      estado: 'all',
      tipoProyecto: 'all',
      tipoDesarrollo: 'all'
    });
  };

  const hasActiveFilters = 
    currentFilters.highLevelStatus !== 'all' || 
    currentFilters.estado !== 'all' || 
    currentFilters.tipoProyecto !== 'all' || 
    currentFilters.tipoDesarrollo !== 'all';

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">Filtros</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-8 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Limpiar filtros
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Filtro de Estado Alto Nivel */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600">Estado Alto Nivel</label>
          <Select
            value={currentFilters.highLevelStatus}
            onValueChange={(value) =>
              onFilterChange({ ...currentFilters, highLevelStatus: value })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="Activo">Activo</SelectItem>
              <SelectItem value="Inactivo">Inactivo</SelectItem>
              <SelectItem value="Estrategico">Estratégico</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filtro de Estado */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600">Estado</label>
          <Select
            value={currentFilters.estado}
            onValueChange={(value) =>
              onFilterChange({ ...currentFilters, estado: value })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {estadoOptions.map((estado) => (
                <SelectItem key={estado} value={estado}>
                  {estado}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtro de Tipo Proyecto */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600">Tipo Proyecto</label>
          <Select
            value={currentFilters.tipoProyecto}
            onValueChange={(value) =>
              onFilterChange({ ...currentFilters, tipoProyecto: value })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {tipoProyectoOptions.map((tipo) => (
                <SelectItem key={tipo} value={tipo}>
                  {tipo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtro de Tipo Desarrollo */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600">Tipo Desarrollo</label>
          <Select
            value={currentFilters.tipoDesarrollo}
            onValueChange={(value) =>
              onFilterChange({ ...currentFilters, tipoDesarrollo: value })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar desarrollo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {tipoDesarrolloOptions.map((tipo) => (
                <SelectItem key={tipo} value={tipo}>
                  {tipo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
