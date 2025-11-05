import { PageHeader } from "@/components/page-header";
import { getEntities, getSummaryMetrics } from "@/lib/data";
import { SummaryCard } from "@/components/summary-card";
import { EntityCard } from "@/components/entity-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [entities, summaryMetrics] = await Promise.all([
    getEntities(),
    getSummaryMetrics()
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Casos de Uso por Entidad"
        description="Selecciona una entidad para ver y gestionar sus casos de uso de IA"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          title="TOTAL DE CASOS" 
          value={summaryMetrics.totalCases} 
          action={
            <Button variant="link" asChild className="p-0 h-auto">
              <Link href="#">Detalle</Link>
            </Button>
          } 
        />
        <SummaryCard title="ENTIDADES" value={summaryMetrics.entities} />
        <SummaryCard title="CIENTÍFICOS DE DATOS" value={summaryMetrics.dataScientists} />
        <SummaryCard title="IMPACTO TOTAL" value={`${summaryMetrics.totalImpact} mil`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {entities.map(entity => (
          <EntityCard key={entity.id} entity={entity} />
        ))}
      </div>
    </div>
  );
}
