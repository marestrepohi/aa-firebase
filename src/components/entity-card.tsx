import Link from "next/link";
import Image from "next/image";
import type { Entity } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

  const hasValidLogo = entity.logo && isValidUrl(entity.logo);

  return (
    <Card className="flex flex-col transition-all duration-200 hover:shadow-lg hover:border-primary">
      <CardHeader className="flex-row items-center gap-4">
        <div className="bg-white border rounded-lg p-2 flex items-center justify-center h-16 w-16">
          {hasValidLogo ? (
            <Image 
              src={entity.logo} 
              alt={`${entity.name} logo`} 
              width={48} 
              height={48} 
              className="object-contain"
              unoptimized
            />
          ) : (
            <div className="text-2xl font-bold text-muted-foreground">
              {entity.name.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <CardTitle className="text-xl font-bold">{entity.name}</CardTitle>
          <p className="text-sm text-muted-foreground line-clamp-1">{entity.subName}</p>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="grid grid-cols-3 gap-2 text-sm">
          <Stat label="Activos" value={entity.stats.active} />
          <Stat label="Total" value={entity.stats.total} />
          <Stat label="Científicos" value={entity.stats.scientists} />
          <Stat label="En desarollo" value={entity.stats.inDevelopment} />
          <Stat label="Alertas" value={entity.stats.alerts} highlight={entity.stats.alerts > 0} />
          <Stat label="Impacto Total" value={`${entity.stats.totalImpact}M`} />
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="link" asChild className="w-full">
          <Link href={`/${entity.id}`}>Ver detalles</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
