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

export function EntityCard({ entity }: { entity: Entity }) {
  const [logoError, setLogoError] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  // Validate URL
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
    e.preventDefault(); // Prevent Link navigation
    e.stopPropagation();
    setShowEditForm(true);
  };

  return (
    <>
      <Link href={`/${entity.id}`}>
        <Card className="group flex flex-col transition-all duration-200 hover:shadow-lg hover:border-primary cursor-pointer h-full">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl font-bold">{entity.name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleEditClick}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">{entity.subName}</p>
              </div>
              <div className="ml-4">
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
          <CardContent className="flex-grow pt-4">
            <div className="grid grid-cols-3 gap-2 text-sm">
              <Stat label="Casos Activos" value={entity.stats.active} />
              <Stat label="Casos Inactivos" value={entity.stats.inDevelopment} />
              <Stat label="Cantidad DS" value={entity.stats.total} />
            </div>
          </CardContent>
        </Card>
      </Link>

      <EntityForm
        entity={{
          id: entity.id,
          name: entity.name,
          description: entity.description || '',
          logo: entity.logo || '',
        }}
        open={showEditForm}
        onOpenChange={setShowEditForm}
        onSuccess={() => window.location.reload()}
      />
    </>
  );
}
