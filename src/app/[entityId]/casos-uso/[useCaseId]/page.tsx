
import { notFound } from 'next/navigation';
import { getEntity, getUseCase, getUseCaseHistory } from '@/lib/data.server';
import { UseCasePageClientWrapper } from '@/components/use-case-page-client-wrapper';

export const dynamic = 'force-dynamic';

export default async function UseCasePage({ params }: { params: Promise<{ entityId: string; useCaseId: string }> }) {
  const { entityId, useCaseId } = await params;

  const [entity, useCase, history] = await Promise.all([
    getEntity(entityId),
    getUseCase(entityId, useCaseId),
    getUseCaseHistory(entityId, useCaseId)
  ]);

  if (!entity || !useCase || useCase.entityId !== entity.id) {
    notFound();
  }

  return (
    <UseCasePageClientWrapper
      entity={entity}
      useCase={useCase}
      initialHistory={history}
    />
  );
}
