
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getEntity, getUseCase } from '@/lib/data.server';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/header';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

function InfoBox({ title, children, className = '' }: { title: string, children: React.ReactNode, className?: string }) {
  if (!children) return null;
  return (
    <div className={`border border-primary rounded-md p-3 relative ${className}`}>
      <h2 className="absolute -top-2.5 left-3 bg-background px-1 text-sm font-semibold text-primary">{title}</h2>
      <div className="text-sm text-gray-700 pt-2">{children}</div>
    </div>
  );
}

function Roadmap({ phases }: { phases: any }) {
    if (!phases || !Array.isArray(phases)) return null;
    const totalPhases = 4;
    const completedPhases = phases.filter(p => p.completed).length;
    const progress = (completedPhases / totalPhases) * 100;

    return (
        <div className="border border-primary rounded-md p-3 relative">
            <h2 className="absolute -top-2.5 left-3 bg-background px-1 text-sm font-semibold text-primary">RoadMap y entregables:</h2>
            <div className="pt-4">
                <div className="flex justify-between mb-2">
                    {phases.map((phase, index) => (
                        <div key={index} className={`text-xs text-center ${phase.completed ? 'font-bold' : 'text-gray-500'}`} style={{ flex: 1 }}>
                            Fase {index + 1}: {phase.name}
                        </div>
                    ))}
                </div>
                <Progress value={progress} className="h-2" />
            </div>
        </div>
    );
}

export default async function UseCasePage({ params }: { params: { entityId: string; useCaseId: string } }) {
  const [entity, useCase] = await Promise.all([
    getEntity(params.entityId),
    getUseCase(params.entityId, params.useCaseId)
  ]);

  if (!entity || !useCase || useCase.entityId !== entity.id) {
    notFound();
  }
  
  const team = [useCase.ds1, useCase.ds2, useCase.ds3, useCase.ds4, useCase.de, useCase.mds].filter(Boolean).join(' - ');

  const technicalMetrics = useCase.metrics?.technical;
  const technicalMetricsList = Array.isArray(technicalMetrics)
    ? technicalMetrics.map(m => `${m.label}: ${m.value}`).join(' | ')
    : '';


  const roadmapPhases = useCase.roadmap || [
      { name: 'Definición y Desarrollo', completed: false },
      { name: 'Piloto', completed: false },
      { name: 'Automatización y Operativización', completed: false },
      { name: 'Seguimiento y Recalibración', completed: false },
  ];

  return (
    <>
      <Header title={useCase.name} entity={entity}/>
      <div className="px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <div className="p-6 border-2 border-primary/50 bg-background rounded-lg space-y-6">
          
          {/* Fila del Encabezado */}
          <div className="grid grid-cols-12 gap-4 items-start">
            <div className="col-span-4">
              <InfoBox title="Proyecto">{useCase.name}</InfoBox>
            </div>
            <div className="col-span-4 flex items-center justify-center h-full">
              <div className="flex items-center gap-4">
                {entity.logo && <Image src={entity.logo} alt={entity.name} width={100} height={40} className="object-contain" unoptimized />}
              </div>
            </div>
            <div className="col-span-2">
              <InfoBox title="Estado">{useCase.status}</InfoBox>
            </div>
            <div className="col-span-2">
              <InfoBox title="Fecha actualización">
                {useCase.lastUpdated ? format(new Date(useCase.lastUpdated), 'dd/MM/yyyy') : 'N/A'}
              </InfoBox>
            </div>
          </div>
          
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-8">
                <InfoBox title="Sponsor del proyecto">{useCase.sponsor}</InfoBox>
            </div>
            <div className="col-span-4">
                <InfoBox title="Equipo Técnico">{team}</InfoBox>
            </div>
          </div>

          {/* Fila Objetivo y Dolores */}
          <div className="grid grid-cols-2 gap-6">
            <InfoBox title="Objetivo" className="min-h-[120px]">{useCase.objetivo}</InfoBox>
            <InfoBox title="Dolores" className="min-h-[120px]">{useCase.dolores}</InfoBox>
          </div>

          {/* Fila Solución y Riesgos */}
          <div className="grid grid-cols-2 gap-6">
            <InfoBox title="Solución" className="min-h-[120px]">{useCase.solucion}</InfoBox>
            <InfoBox title="Riesgos" className="min-h-[120px]">{useCase.riesgos}</InfoBox>
          </div>
          
          {/* Fila Métricas e Impacto */}
          <div className="grid grid-cols-2 gap-6">
            <InfoBox title="Métricas Técnicas" className="min-h-[100px]">{technicalMetricsList}</InfoBox>
            <InfoBox title="Impacto Generado KPIs" className="min-h-[100px]">{useCase.impactoGenerado}</InfoBox>
          </div>
          
          {/* Fila Impacto Esperado */}
          <div>
            <InfoBox title="Impacto Esperado KPIs" className="min-h-[100px]">{useCase.impactoEsperado}</InfoBox>
          </div>
          
          {/* Fila Roadmap */}
          <div>
            <Roadmap phases={roadmapPhases} />
          </div>

          {/* Fila Observaciones */}
          <div>
            <InfoBox title="Observaciones">{useCase.observaciones}</InfoBox>
          </div>

        </div>
      </div>
    </>
  );
}
