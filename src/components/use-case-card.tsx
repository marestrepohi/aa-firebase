'use client';

import Link from "next/link";
import { useState } from "react";
import type { UseCase } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, User, Pencil, BarChart3, ChevronRight } from "lucide-react";
import { UseCaseForm } from "./use-case-form";
import { MetricsForm } from "./metrics-form";

export function UseCaseCard({ useCase, isEditing }: { useCase: UseCase, isEditing?: boolean }) {
  const [showEditForm, setShowEditForm] = useState(false);
  const [showMetricsForm, setShowMetricsForm] = useState(false);
  
  const estado = useCase.status || 'No definido';
  const tipo = useCase.tipoProyecto || '';
  
  const teamMembers = [
    { label: 'DS1', value: useCase.ds1 },
    { label: 'DS2', value: useCase.ds2 },
    { label: 'DS3', value: useCase.ds3 },
    { label: 'DS4', value: useCase.ds4 },
    { label: 'DE', value: useCase.de },
    { label: 'MDS', value: useCase.mds },
  ].filter(member => member.value);
  
  const nivelImpacto = useCase.nivelImpactoFinanciero || '';
  const impactoFinanciero = useCase.impactoFinanciero;
  const impactoUnidad = useCase.unidadImpactoFinanciero;

  const externalLinks = [
    { name: 'SharePoint', url: useCase.sharepointLink },
    { name: 'Jira', url: useCase.jiraLink },
    { name: 'Confluence', url: useCase.confluenceLink },
  ].filter(link => link.url);
  
  const getStatusColor = (status: string): string => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('entregado') || statusLower.includes('finalizado') || statusLower.includes('producción')) return 'bg-green-100 text-green-800 border-green-200';
    if (statusLower.includes('deprecado') || statusLower.includes('cancelado')) return 'bg-red-100 text-red-800 border-red-200';
    if (statusLower.includes('desarrollo') || statusLower.includes('pilotaje')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };
  
  const getImpactColor = (nivel: string): string => {
    const nivelLower = (nivel || '').toLowerCase();
    if (nivelLower === 'l4') return 'bg-green-50';
    if (nivelLower === 'na' || nivelLower === '') return 'bg-gray-50';
    return 'bg-blue-50';
  };

  return (
    <>
      <Card className="group flex flex-col transition-all duration-300 hover:shadow-lg h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <CardTitle className="text-base font-semibold line-clamp-2 flex-1 pr-4">
               <Link href={`/${useCase.entityId}/casos-uso/${useCase.id}`} className="hover:underline" prefetch={false}>
                {useCase.name}
              </Link>
            </CardTitle>
            <div className={`flex gap-1 transition-opacity ${isEditing ? 'opacity-100' : 'opacity-0'}`}>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setShowEditForm(true)}
                title="Editar caso de uso"
              >
                <Pencil className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setShowMetricsForm(true)}
                title="Editar métricas"
              >
                <BarChart3 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={`text-xs font-medium ${getStatusColor(estado as string)}`}>
              ● {estado}
            </Badge>
            {tipo && (
              <Badge variant="outline" className="text-xs">
                {tipo}
              </Badge>
            )}
          </div>
        </CardHeader>
      
        <CardContent className="flex-grow flex flex-col space-y-4 pt-4">
          <div className="space-y-4">
            {teamMembers.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <User className="w-3 h-3" />
                  Equipo Asignado
                </div>
                <div className="space-y-1">
                  {teamMembers.map((member, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Badge variant="secondary" className="text-xs px-2 py-0.5">
                        {member.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{member.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {impactoFinanciero && impactoFinanciero !== '0' && (
              <div className={`rounded-md p-3 ${getImpactColor(nivelImpacto as string)}`}>
                <div className="text-xs font-medium text-muted-foreground mb-1">
                  💰 Impacto Financiero
                </div>
                <div className="text-lg font-bold">
                  {impactoFinanciero} {impactoUnidad}
                </div>
                {nivelImpacto && <div className="text-xs text-muted-foreground mt-1">Nivel {nivelImpacto}</div>}
              </div>
            )}
          </div>

          <div className="flex-grow" />

          <div className="pt-4 border-t flex justify-between items-center">
            <div className="flex items-center gap-2">
              {externalLinks.map(link => (
                <Button key={link.name} variant="outline" size="sm" asChild className="h-7 text-xs px-2">
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    {link.name}
                  </a>
                </Button>
              ))}
            </div>
            <Link 
              href={`/${useCase.entityId}/casos-uso/${useCase.id}`}
              className="flex items-center text-xs text-blue-600 hover:text-blue-800 font-medium"
              prefetch={false}
            >
              Ver Detalles <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </CardContent>
      </Card>

    {showEditForm && (
      <UseCaseForm
        useCase={useCase}
        entityId={useCase.entityId}
        open={showEditForm}
        onOpenChange={setShowEditForm}
        onSuccess={() => window.location.reload()}
      />
    )}

    {showMetricsForm && (
      <MetricsForm
        entityId={useCase.entityId}
        useCaseId={useCase.id}
        initialPeriod={useCase.metrics.period}
        initialMetrics={useCase.metrics}
        open={showMetricsForm}
        onOpenChange={setShowMetricsForm}
        onSuccess={() => window.location.reload()}
      />
    )}
  </>
  );
}
