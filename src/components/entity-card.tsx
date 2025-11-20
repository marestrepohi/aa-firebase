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
      <Link href={`/${entity.id}`} className="flex flex-col flex-grow p-0" prefetch={false}>
        {children}
      </Link>
    );

  return (
    <>
      <Card className="group relative flex flex-col card-standard h-full">
        {isEditing && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 btn-icon-sm z-10"
            onClick={handleEditClick}
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Editar Entidad</span>
          </Button>
        )}
        <CardContentLink>
          <CardHeader className="pb-4 border-b w-full">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg md:text-xl font-bold truncate">{entity.name}</CardTitle>
              </div>
              <div className="flex-shrink-0 h-12 w-12 md:h-16 md:w-16 flex items-center justify-center">
                {hasValidLogo ? (
                  <Image
                    src={entity.logo}
                    alt={`${entity.name} logo`}
                    width={64}
                    height={64}
                    className="object-contain h-full w-full"
                    unoptimized
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <Building2 className="w-10 h-10 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-grow pt-6 w-full">
            <div className="flex justify-around items-center gap-2 text-sm">
              <Stat label="Activos" value={entity.stats.active || 0} />
              <div className="w-px h-12 bg-border" />
              <Stat label="Inactivos" value={entity.stats.inactive || 0} />
              <div className="w-px h-12 bg-border" />
              <Stat label="Total" value={entity.stats.total || 0} />
            </div>
          </CardContent>
        </CardContentLink>
      </Card>

      {isEditing && showEditForm && (
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
      )}
    </>
  );
}
