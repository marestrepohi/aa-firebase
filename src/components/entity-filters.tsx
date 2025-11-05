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
  highLevelStatusOptions: string[];
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
  highLevelStatusOptions,
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
    <div className="bg-white rounded-lg border p-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-semibold text-gray-700">Filtros:</span>
        
        {/* Filtro de Estado Alto Nivel */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600 whitespace-nowrap">Estado Alto Nivel</label>
          <Select
            value={currentFilters.highLevelStatus}
            onValueChange={(value) =>
              onFilterChange({ ...currentFilters, highLevelStatus: value })
            }
          >
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {highLevelStatusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtro de Estado */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600 whitespace-nowrap">Estado</label>
          <Select
            value={currentFilters.estado}
            onValueChange={(value) =>
              onFilterChange({ ...currentFilters, estado: value })
            }
          >
            <SelectTrigger className="w-[180px] h-8 text-xs">
              <SelectValue placeholder="Todos" />
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
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600 whitespace-nowrap">Tipo Proyecto</label>
          <Select
            value={currentFilters.tipoProyecto}
            onValueChange={(value) =>
              onFilterChange({ ...currentFilters, tipoProyecto: value })
            }
          >
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <SelectValue placeholder="Todos" />
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
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600 whitespace-nowrap">Tipo Desarrollo</label>
          <Select
            value={currentFilters.tipoDesarrollo}
            onValueChange={(value) =>
              onFilterChange({ ...currentFilters, tipoDesarrollo: value })
            }
          >
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <SelectValue placeholder="Todos" />
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

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-8 text-xs ml-auto"
          >
            <X className="h-3 w-3 mr-1" />
            Limpiar
          </Button>
        )}
      </div>
    </div>
  );
}
