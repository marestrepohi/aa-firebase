"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface EntityFiltersProps {
  onFilterChange: (filters: {
    estadoAltoNivel: string;
    estado: string;
    tipoProyecto: string;
    tipoDesarrollo: string;
    suite: string;
  }) => void;
  estadoAltoNivelOptions: string[];
  estadoOptions: string[];
  tipoProyectoOptions: string[];
  tipoDesarrolloOptions: string[];
  suiteOptions: string[];
  currentFilters: {
    estadoAltoNivel: string;
    estado: string;
    tipoProyecto: string;
    tipoDesarrollo: string;
    suite: string;
  };
}

export function EntityFilters({
  onFilterChange,
  estadoAltoNivelOptions,
  estadoOptions,
  tipoProyectoOptions,
  tipoDesarrolloOptions,
  suiteOptions,
  currentFilters
}: EntityFiltersProps) {
  
  const handleClearFilters = () => {
    onFilterChange({
      estadoAltoNivel: 'all',
      estado: 'all',
      tipoProyecto: 'all',
      tipoDesarrollo: 'all',
      suite: 'all'
    });
  };

  const hasActiveFilters = 
    currentFilters.estadoAltoNivel !== 'all' || 
    currentFilters.estado !== 'all' || 
    currentFilters.tipoProyecto !== 'all' || 
    currentFilters.tipoDesarrollo !== 'all' ||
    currentFilters.suite !== 'all';

  return (
    <div className="bg-white rounded-lg border p-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* Filtro de Estado Alto Nivel */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600 whitespace-nowrap">Estado Alto Nivel</label>
          <Select
            value={currentFilters.estadoAltoNivel}
            onValueChange={(value) =>
              onFilterChange({ ...currentFilters, estadoAltoNivel: value })
            }
          >
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {estadoAltoNivelOptions.map((status) => (
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
        
        {/* Filtro de Suite */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600 whitespace-nowrap">Suite</label>
          <Select
            value={currentFilters.suite}
            onValueChange={(value) =>
              onFilterChange({ ...currentFilters, suite: value })
            }
          >
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {suiteOptions.map((suite) => (
                <SelectItem key={suite} value={suite}>
                  {suite}
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
