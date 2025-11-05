"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UseCaseFilterProps {
  onFilterChange: (filter: string) => void;
  initialFilter?: string;
}

export function UseCaseFilter({ onFilterChange, initialFilter = "all" }: UseCaseFilterProps) {
  const [filter, setFilter] = useState(initialFilter);

  const handleFilterChange = (value: string) => {
    setFilter(value);
    onFilterChange(value);
  };

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-medium">Filtrar por estado:</span>
      <Select value={filter} onValueChange={handleFilterChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Selecciona un estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="Activo">Activo</SelectItem>
          <SelectItem value="Inactivo">Inactivo</SelectItem>
        </SelectContent>
      </Select>
      {filter !== "all" && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFilterChange("all")}
        >
          Limpiar filtro
        </Button>
      )}
    </div>
  );
}
