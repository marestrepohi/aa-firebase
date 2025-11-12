
import { notFound } from 'next/navigation';
import { getEntity, getUseCase } from '@/lib/data.server';
import { UseCasePageClientWrapper } from '@/components/use-case-page-client-wrapper';

export const dynamic = 'force-dynamic';

export default async function UseCasePage({ params }: { params: { entityId: string; useCaseId: string } }) {
  const [entity, useCase] = await Promise.all([
    getEntity(params.entityId),
    getUseCase(params.entityId, params.useCaseId)
  ]);

  if (!entity || !useCase || useCase.entityId !== entity.id) {
    notFound();
  }

  return (
    <UseCasePageClientWrapper entity={entity} useCase={useCase} />
  );
}
