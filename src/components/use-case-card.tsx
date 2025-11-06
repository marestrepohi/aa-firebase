'use client';

import Link from "next/link";
import { useState } from "react";
import type { UseCase } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, User, Pencil, BarChart3 } from "lucide-react";
import { UseCaseForm } from "./use-case-form";
import { MetricsForm } from "./metrics-form";

export function UseCaseCard({ useCase }: { useCase: UseCase }) {
  const [showEditForm, setShowEditForm] = useState(false);
  const [showMetricsForm, setShowMetricsForm] = useState(false);

  // Get status and type from general metrics
  const estado = useCase.metrics.general.find(m => m.label === 'Estado')?.value || useCase.status;
  const tipo = useCase.metrics.general.find(m => m.label === 'Tipo')?.value || '';
  
  // Get team members from technical metrics
  const teamMembers = useCase.metrics.technical || [];
  
  // Get financial impact
  const nivelImpacto = useCase.metrics.financial.find(m => m.label === 'Nivel')?.value || '';
  const impactoFinanciero = useCase.metrics.financial.find(m => m.label === 'Impacto');
  
  // Get links from business metrics
  const sharepointLink = useCase.metrics.business.find(m => m.label === 'SharePoint')?.value;
  const jiraLink = useCase.metrics.business.find(m => m.label === 'Jira')?.value;
  const confluenceLink = useCase.metrics.business.find(m => m.label === 'Confluence')?.value;
  
  // Determine status color
  const getStatusColor = (status: string): string => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('entregado') || statusLower.includes('finalizado')) return 'bg-green-100 text-green-800 border-green-200';
    if (statusLower.includes('deprecado')) return 'bg-red-100 text-red-800 border-red-200';
    if (statusLower.includes('desarrollo') || statusLower.includes('pilotaje')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (statusLower.includes('activo')) return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };
  
  const getImpactColor = (nivel: string): string => {
    if (nivel === 'L4') return 'bg-green-50';
    if (nivel === 'NA') return 'bg-gray-50';
    return 'bg-blue-50';
  };

  return (
    <>
      <Card className="group flex flex-col transition-all duration-300 hover:shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <CardTitle className="text-base font-semibold line-clamp-2 flex-1">
              {useCase.name}
            </CardTitle>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
      
      <CardContent className="flex-grow space-y-4">
        {/* Team Members */}
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
        
        {/* Financial Impact */}
        {nivelImpacto && (
          <div className={`rounded-md p-3 ${getImpactColor(nivelImpacto as string)}`}>
            <div className="text-xs font-medium text-muted-foreground mb-1">
              💰 Impacto Financiero
            </div>
            {impactoFinanciero && (
              <div className="text-lg font-bold">
                {impactoFinanciero.value} {impactoFinanciero.unit}
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-1">
              Nivel {nivelImpacto}
            </div>
          </div>
        )}
        
        {/* Links */}
        {(sharepointLink || jiraLink || confluenceLink) && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {sharepointLink && typeof sharepointLink === 'string' && (
              <div className="flex items-center gap-2 text-xs">
                <a
                  href={sharepointLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="w-3 h-3" />
                  SharePoint
                </a>
                {useCase.metrics.business.find(m => m.label === 'SharePoint Actividades')?.value && (
                  <span className="text-gray-600">
                    ({useCase.metrics.business.find(m => m.label === 'SharePoint Actividades')?.value})
                  </span>
                )}
              </div>
            )}
            {jiraLink && typeof jiraLink === 'string' && (
              <div className="flex items-center gap-2 text-xs">
                <a
                  href={jiraLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="w-3 h-3" />
                  Jira
                </a>
                {useCase.metrics.business.find(m => m.label === 'Jira Actividades')?.value && (
                  <span className="text-gray-600">
                    ({useCase.metrics.business.find(m => m.label === 'Jira Actividades')?.value})
                  </span>
                )}
              </div>
            )}
            {confluenceLink && typeof confluenceLink === 'string' && (
              <a
                href={confluenceLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="w-3 h-3" />
                Confluence
              </a>
            )}
          </div>
        )}
        
        <Link 
          href={`/${useCase.entityId}/casos-uso/${useCase.id}`}
          className="block text-xs text-blue-600 hover:text-blue-800 font-medium pt-2"
        >
          Ver Métricas →
        </Link>
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
        initialMetrics={useCase.metrics}
        open={showMetricsForm}
        onOpenChange={setShowMetricsForm}
        onSuccess={() => window.location.reload()}
      />
    )}
  </>
  );
}
