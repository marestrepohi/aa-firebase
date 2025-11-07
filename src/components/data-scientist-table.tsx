'use client';

import { useState } from "react";
import Link from 'next/link';
import type { UseCase } from "@/lib/types";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface DataScientistTableProps {
  useCases: UseCase[];
}

interface GroupedCases {
    [entityName: string]: UseCase[];
}

interface DsInfo {
    dsName: string;
    caseCount: number;
    groupedCases: GroupedCases;
}

function buildDsArray(cases: UseCase[]): DsInfo[] {
  const dist = cases.reduce((acc, uc) => {
    const dsName = uc.ds1;
    if (dsName) {
        if (!acc[dsName]) {
            acc[dsName] = [];
        }
        acc[dsName].push(uc);
    }
    return acc;
  }, {} as Record<string, UseCase[]>);

  return Object.entries(dist)
    .map(([dsName, userCases]) => {
        const groupedCases = userCases.reduce((acc, currentCase) => {
            const entityName = entitiesMap[currentCase.entityId] || currentCase.entityId;
            if (!acc[entityName]) {
                acc[entityName] = [];
            }
            acc[entityName].push(currentCase);
            return acc;
        }, {} as GroupedCases);

        return { dsName, caseCount: userCases.length, groupedCases };
    })
    .sort((a, b) => b.caseCount - a.caseCount);
}

// A map to get entity names from IDs - assumes allUseCases are passed with entity info
// This is a simplification. A better approach would be to have entities available.
const entitiesMap: Record<string, string> = {};


export function DataScientistTable({ useCases }: DataScientistTableProps) {
  useCases.forEach(uc => {
      // This is a temporary way to populate the map. 
      // In a real app, you'd pass entities down or have a better lookup.
      // @ts-ignore - uc.entity might not exist on type, but we pass it.
      if(uc.entity) entitiesMap[uc.entityId] = uc.entity.name;
  });
  
  const dsArray = buildDsArray(useCases);

  return (
    <div className="bg-white rounded-lg border">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Casos por Científico de Datos (DS1)</h2>
        <p className="text-sm text-gray-500 mb-6">Conteo de proyectos asignados a cada científico de datos principal.</p>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-3 px-4 font-medium text-gray-700 w-full">Científico de Datos</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Nº de Casos</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {dsArray.map(({ dsName, caseCount, groupedCases }) => (
                <Collapsible asChild key={dsName} className="group">
                  <>
                    <tr className="border-b last:border-b-0 hover:bg-gray-50 data-[state=open]:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900 font-medium">{dsName}</td>
                      <td className="py-3 px-4 text-center font-semibold text-gray-900">{caseCount}</td>
                      <td className="py-3 px-4 text-center">
                        <CollapsibleTrigger asChild>
                           <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                                <span className="sr-only">Desplegar</span>
                           </Button>
                        </CollapsibleTrigger>
                      </td>
                    </tr>
                    <CollapsibleContent asChild>
                        <tr className="bg-gray-100/50">
                            <td colSpan={3} className="p-0">
                                <div className="p-4 space-y-3">
                                    {Object.entries(groupedCases).map(([entityName, cases]) => (
                                        <div key={entityName}>
                                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{entityName}</h4>
                                            <ul className="space-y-1 pl-4">
                                                {cases.map(c => (
                                                    <li key={c.id}>
                                                      <Link href={`/${c.entityId}/casos-uso/${c.id}`} className="text-sm text-blue-600 hover:underline">
                                                        {c.name}
                                                      </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </td>
                        </tr>
                    </CollapsibleContent>
                  </>
                </Collapsible>
              ))}
            </tbody>
          </table>
        </div>

        {dsArray.length === 0 && (
          <div className="text-center py-8 text-gray-500">No hay científicos de datos asignados en los casos filtrados.</div>
        )}
      </div>
    </div>
  );
}