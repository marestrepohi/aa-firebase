"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface GlobalFiltersProps {
  onFilterChange: (filters: {
    highLevelStatus: string;
    estado: string;
    tipoProyecto: string;
    tipoDesarrollo: string;
    suite: string;
  }) => void;
  highLevelStatusOptions: string[];
  estadoOptions: string[];
  tipoProyectoOptions: string[];
  tipoDesarrolloOptions: string[];
  suiteOptions: string[];
  currentFilters: {
    highLevelStatus: string;
    estado: string;
    tipoProyecto: string;
    tipoDesarrollo: string;
    suite: string;
  };
}

export function GlobalFilters({
  onFilterChange,
  highLevelStatusOptions,
  estadoOptions,
  tipoProyectoOptions,
  tipoDesarrolloOptions,
  suiteOptions,
  currentFilters
}: GlobalFiltersProps) {
  
  const handleClearFilters = () => {
    onFilterChange({
      highLevelStatus: 'all',
      estado: 'all',
      tipoProyecto: 'all',
      tipoDesarrollo: 'all',
      suite: 'all',
    });
  };

  const hasActiveFilters = 
    currentFilters.highLevelStatus !== 'all' || 
    currentFilters.estado !== 'all' ||
    currentFilters.tipoProyecto !== 'all' || 
    currentFilters.tipoDesarrollo !== 'all' ||
    currentFilters.suite !== 'all';

  return (
    <div className="bg-white border rounded-lg p-3 w-full">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600 whitespace-nowrap">Estado Alto Nivel</label>
          <Select
            value={currentFilters.highLevelStatus}
            onValueChange={(value) =>
              onFilterChange({ ...currentFilters, highLevelStatus: value })
            }
          >
            <SelectTrigger className="w-[180px] h-8 text-xs">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {highLevelStatusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
              {estadoOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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

        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600 whitespace-nowrap">Suite</label>
          <Select
            value={currentFilters.suite}
            onValueChange={(value) =>
              onFilterChange({ ...currentFilters, suite: value })
            }
          >
            <SelectTrigger className="w-[180px] h-8 text-xs">
              <SelectValue placeholder="Todas" />
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
