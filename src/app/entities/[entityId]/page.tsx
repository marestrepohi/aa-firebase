import { notFound } from 'next/navigation';
import { getEntity, getUseCases } from '@/lib/data.server';
import { EntityPageClientWrapper } from '@/components/entity-page-client-wrapper';

export const dynamic = 'force-dynamic';

export default async function EntityPage({ params }: { params: { entityId: string } }) {
  const [entity, allUseCases] = await Promise.all([
    getEntity(params.entityId),
    getUseCases(params.entityId)
  ]);

  if (!entity) {
    notFound();
  }

  return <EntityPageClientWrapper entity={entity} initialUseCases={allUseCases} />;
}
