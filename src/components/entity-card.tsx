'use client';

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { Entity } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Pencil, TrendingUp, Users } from "lucide-react";
import { EntityForm } from "./entity-form";
import { cn } from "@/lib/utils";

interface StatProps {
  label: string;
  value: string | number;
  highlight?: boolean;
  icon?: React.ReactNode;
}

function Stat({ label, value, highlight = false, icon }: StatProps) {
  return (
    <div className="text-center">
      <p className={cn(
        "text-lg font-bold tracking-tight mb-0.5",
        highlight && Number(value) > 0 ? 'text-state-error' : 'text-foreground'
      )}>{value}</p>
      <div className="flex items-center justify-center gap-1">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
      </div>
    </div>
  );
}

export function EntityCard({ entity, isEditing, index = 0, className }: { entity: Entity; isEditing?: boolean; index?: number; className?: string }) {
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
      <Card
        className={cn(
          "group relative overflow-hidden transition-all duration-300",
          "border border-neutral-200 hover:border-brand/50", // Vibe: Border change
          "bg-white",
          "shadow-soft hover:shadow-elevated hover:-translate-y-1", // Vibe: Shadows & Lift
          className
        )}
      >
        {/* Vibe: Decorative circle */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700 pointer-events-none" />

        {isEditing && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm hover:bg-white hover:text-brand"
            onClick={handleEditClick}
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Editar Entidad</span>
          </Button>
        )}

        <CardContentLink>
          <CardHeader className="pb-4 border-b border-neutral-100 w-full relative z-0"> {/* Relative z-0 to sit above circle if needed, but circle is background */}
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold text-gray-900 leading-tight group-hover:text-brand transition-colors">
                  {entity.name}
                </CardTitle>
                <CardDescription className="line-clamp-2 text-xs text-gray-500">
                  {entity.description || "Sin descripción"}
                </CardDescription>
              </div>

              {/* Logo area */}
              <div className="flex-shrink-0 h-14 w-14 md:h-16 md:w-16 flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden p-2 group-hover:bg-brand/5 transition-colors duration-300 border border-gray-100 group-hover:border-brand/20">
                {entity.logo ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={entity.logo}
                      alt={`Logo ${entity.name}`}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 56px, 64px"
                    />
                  </div>
                ) : (
                  <Building2 className="h-6 w-6 text-gray-400 group-hover:text-brand transition-colors" />
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-grow pt-4 w-full relative z-0">
            <div className="flex justify-around items-center gap-1 text-sm">
              <div className="flex flex-col items-center">
                <span className="text-xl font-bold text-gray-900 group-hover:text-brand transition-colors">{entity.stats.total}</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">Casos</span>
              </div>
              <div className="w-px h-8 bg-gray-100"></div>

              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-xl font-bold text-gray-900 group-hover:text-brand transition-colors">{entity.stats.active}</span>
                </div>
                <span className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">Activos</span>
              </div>

              <div className="w-px h-8 bg-gray-100"></div>

              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-blue-500" />
                  <span className="text-xl font-bold text-gray-900 group-hover:text-brand transition-colors">{entity.stats.scientists}</span>
                </div>
                <span className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">Equipo</span>
              </div>
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
