"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface GlobalFiltersProps {
  onFilterChange: (filters: {
    estado: string;
    tipoProyecto: string;
    tipoDesarrollo: string;
  }) => void;
  estadoOptions: string[];
  tipoProyectoOptions: string[];
  tipoDesarrolloOptions: string[];
  currentFilters: {
    estado: string;
    tipoProyecto: string;
    tipoDesarrollo: string;
  };
}

export function GlobalFilters({
  onFilterChange,
  estadoOptions,
  tipoProyectoOptions,
  tipoDesarrolloOptions,
  currentFilters
}: GlobalFiltersProps) {
  
  const handleClearFilters = () => {
    onFilterChange({
      estado: 'all',
      tipoProyecto: 'all',
      tipoDesarrollo: 'all'
    });
  };

  const hasActiveFilters = 
    currentFilters.estado !== 'all' || 
    currentFilters.tipoProyecto !== 'all' || 
    currentFilters.tipoDesarrollo !== 'all';

  return (
    <div className="bg-white border rounded-lg p-3">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <span className="text-xs font-semibold text-gray-700">Filtros:</span>
        
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
            <SelectTrigger className="w-[180px] h-8 text-xs">
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
            <SelectTrigger className="w-[180px] h-8 text-xs">
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
