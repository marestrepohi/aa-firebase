'use client';

import * as React from "react";
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
            // @ts-ignore - uc.entity might not exist on type, but we pass it.
            const entityName = currentCase.entity?.name || currentCase.entityId;
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

export function DataScientistTable({ useCases }: DataScientistTableProps) {
  const dsArray = buildDsArray(useCases);

  return (
    <div className="bg-white rounded-lg border">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Casos por Científico de Datos (DS1)</h2>
        <p className="text-sm text-gray-500 mb-6">Conteo de proyectos asignados a cada científico de datos principal.</p>

        <div className="space-y-2">
            {/* Header */}
            <div className="flex items-center px-4 py-2 bg-gray-50 rounded-md text-sm font-medium text-gray-700">
                <div className="flex-1">Científico de Datos</div>
                <div className="w-32 text-center">Nº de Casos</div>
                <div className="w-12"></div>
            </div>

            {/* Body */}
            {dsArray.map(({ dsName, caseCount, groupedCases }) => (
                <Collapsible key={dsName} className="group border-b last:border-b-0">
                    <CollapsibleTrigger asChild>
                        <div className="flex items-center w-full text-left px-4 py-3 hover:bg-gray-50 cursor-pointer rounded-md">
                            <div className="flex-1 font-medium text-gray-900">{dsName}</div>
                            <div className="w-32 text-center font-semibold text-gray-900">{caseCount}</div>
                            <div className="w-12 flex justify-center">
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                                    <span className="sr-only">Desplegar</span>
                                </Button>
                            </div>
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <div className="bg-gray-100/50 p-4 space-y-3">
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
                    </CollapsibleContent>
                </Collapsible>
            ))}
        </div>

        {dsArray.length === 0 && (
          <div className="text-center py-8 text-gray-500">No hay científicos de datos asignados en los casos filtrados.</div>
        )}
      </div>
    </div>
  );
}
