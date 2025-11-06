'use client';

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { Entity } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Pencil } from "lucide-react";
import { EntityForm } from "./entity-form";

interface StatProps {
  label: string;
  value: string | number;
  highlight?: boolean;
}

function Stat({ label, value, highlight = false }: StatProps) {
  return (
    <div className={`text-center p-2 rounded-md ${highlight ? 'bg-red-100' : ''}`}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}

export function EntityCard({ entity, isEditing }: { entity: Entity; isEditing?: boolean }) {
  const [logoError, setLogoError] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  const isValidUrl = (url: string): boolean => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const hasValidLogo = entity.logo && isValidUrl(entity.logo) && !logoError;

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowEditForm(true);
  };

  const CardContentLink = ({ children }: { children: React.ReactNode }) =>
    isEditing ? (
      <div className="flex flex-col flex-grow p-0 cursor-default">{children}</div>
    ) : (
      <Link href={`/${entity.id}`} className="flex flex-col flex-grow p-0">
        {children}
      </Link>
    );

  return (
    <>
      <Card className="group relative flex flex-col transition-all duration-200 hover:shadow-lg hover:border-primary h-full">
        {isEditing && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 z-10"
            onClick={handleEditClick}
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Editar Entidad</span>
          </Button>
        )}
        <CardContentLink>
          <CardHeader className="pb-3 border-b w-full">
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-8">
                <CardTitle className="text-xl font-bold">{entity.name}</CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-1">{entity.subName}</p>
              </div>
              <div className="ml-auto flex-shrink-0">
                {hasValidLogo ? (
                  <Image 
                    src={entity.logo} 
                    alt={`${entity.name} logo`} 
                    width={64} 
                    height={64} 
                    className="object-contain"
                    unoptimized
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <Building2 className="w-16 h-16 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-grow pt-4 w-full">
            <div className="grid grid-cols-3 gap-2 text-sm">
              <Stat label="Casos Activos" value={entity.stats.active} />
              <Stat label="Casos Inactivos" value={entity.stats.inDevelopment} />
              <Stat label="Cantidad DS" value={entity.stats.total} />
            </div>
          </CardContent>
        </CardContentLink>
      </Card>

      <EntityForm
        entity={{
          id: entity.id,
          name: entity.name,
          description: entity.description || '',
          logo: entity.logo || '',
        }}
        open={showEditForm}
        onOpenChange={setShowEditForm}
        onSuccess={() => {
          setShowEditForm(false);
          window.location.reload();
        }}
      />
    </>
  );
}
