import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getEntity, getUseCase } from '@/lib/data';
import { PageHeader } from '@/components/page-header';
import { UseCasePageClientWrapper } from '@/components/use-case-page-client-wrapper';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';


export const dynamic = 'force-dynamic';

export default async function UseCasePage({ params }: { params: Promise<{ entityId: string; useCaseId: string }> }) {
  const { entityId, useCaseId } = await params;
  
  const [entity, useCase] = await Promise.all([
    getEntity(entityId),
    getUseCase(useCaseId)
  ]);

  if (!entity || !useCase || useCase.entityId !== entity.id) {
    notFound();
  }

  return (
    <UseCasePageClientWrapper entity={entity} useCase={useCase} />
  );
}
