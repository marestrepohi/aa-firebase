'use client';

import Link from "next/link";
import { useState } from "react";
import type { UseCase } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Pencil, BarChart3, ChevronRight, Users, History as HistoryIcon, ArrowRight } from "lucide-react";
import { UseCaseForm } from "./use-case-form";
import { MetricsForm } from "./metrics-form";
import { cn } from "@/lib/utils";

export function UseCaseCard({ useCase, isEditing, className }: { useCase: UseCase, isEditing?: boolean, className?: string }) {
  const [showEditForm, setShowEditForm] = useState(false);
  const [showMetricsForm, setShowMetricsForm] = useState(false);

  // Handlers
  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowEditForm(true);
  };

  const handleHistoryClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Implementation for history view would go here
    console.log("History clicked");
  };

  const externalLinks = [
    { name: 'SP', url: useCase.sharepointLink, title: 'SharePoint' },
    { name: 'Jira', url: useCase.jiraLink, title: 'Jira' },
    { name: 'CF', url: useCase.confluenceLink, title: 'Confluence' },
  ].filter(link => link.url);

  return (
    <>
      <Card
        className={cn(
          "group relative overflow-hidden transition-all duration-300",
          "border border-neutral-200 hover:border-brand/50", // Vibe: Border change
          "bg-white",
          "shadow-soft hover:shadow-elevated hover:-translate-y-1", // Vibe: Shadows & Lift
          "flex flex-col h-full",
          className,
          !isEditing && "cursor-pointer"
        )}
      >
        {/* Vibe: Decorative circle */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700 pointer-events-none" />

        <CardHeader className="pb-3 pt-4 px-4 relative z-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <CardTitle className="text-sm font-semibold line-clamp-2 flex-1 pr-2 group-hover:text-brand transition-colors">
              <Link href={`/${useCase.entityId}/casos-uso/${useCase.id}`} className="hover:underline" prefetch={false}>
                {useCase.name}
              </Link>
            </CardTitle>

            {isEditing && (
              <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon-sm" onClick={handleEditClick} className="h-7 w-7 hover:text-brand hover:bg-brand/5">
                  <Pencil className="h-3.5 w-3.5" />
                  <span className="sr-only">Editar</span>
                </Button>
                {/* Placeholder for history if functionality exists */}
                {/* <Button variant="ghost" size="icon-sm" onClick={handleHistoryClick} className="h-7 w-7 hover:text-brand hover:bg-brand/5">
                  <HistoryIcon className="h-3.5 w-3.5" />
                  <span className="sr-only">Historial</span>
                </Button> */}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-auto">
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] bg-brand/5 border-brand/20 text-brand font-medium",
                useCase.metrics && Object.keys(useCase.metrics).length > 0 && "bg-emerald-50 text-emerald-700 border-emerald-200"
              )}
            >
              {useCase.metrics && Object.keys(useCase.metrics).length > 0 ? "Con Métricas" : "Sin Métricas"}
            </Badge>
            {useCase.etapa && (
              <Badge variant="secondary" className="text-[10px] bg-gray-100 text-gray-600 hover:bg-gray-200 border-transparent">
                {useCase.etapa}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-grow flex flex-col space-y-3 px-4 pb-4 pt-1 relative z-0">
          {(useCase.description || useCase.objetivo) && (
            <p className="text-xs text-muted-foreground line-clamp-3 mb-4">
              {useCase.description || useCase.objetivo}
            </p>
          )}

          <div className="grid grid-cols-2 gap-2 mt-auto">
            <div className="bg-gray-50 rounded-lg p-2 border border-gray-100 group-hover:border-brand/10 transition-colors">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-0.5">Estado</p>
              <p className="text-xs font-medium text-gray-900 truncate">
                {useCase.status || "N/A"}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2 border border-gray-100 group-hover:border-brand/10 transition-colors">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-0.5">Prioridad</p>
              <p className="text-xs font-medium text-gray-900 truncate">
                {useCase.highLevelStatus || "Normal"}
              </p>
            </div>
          </div>

          <div className="flex-grow" />

          {/* Footer - Minimalist */}
          <div className="pt-3 border-t border-gray-100 flex justify-between items-center mt-3">
            <div className="flex items-center gap-1">
              {externalLinks.map(link => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-[10px] text-muted-foreground hover:text-brand px-1.5 py-1 hover:bg-brand/5 rounded transition-colors font-medium"
                  title={link.title}
                >
                  {link.name}
                </a>
              ))}
            </div>
            <Link
              href={`/${useCase.entityId}/casos-uso/${useCase.id}`}
              className="group flex items-center text-[10px] text-muted-foreground hover:text-brand font-medium transition-colors"
              prefetch={false}
            >
              Ver <ArrowRight className="w-3 h-3 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
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
          useCase={useCase}
          open={showMetricsForm}
          onOpenChange={setShowMetricsForm}
          onSuccess={() => window.location.reload()}
        />
      )}
    </>
  );
}
