import { notFound } from 'next/navigation';
import { getEntity, getUseCases } from '@/lib/data';
import { EntityPageClientWrapper } from '@/components/entity-page-client-wrapper';

export const dynamic = 'force-dynamic';

export default async function EntityPage({ params }: { params: Promise<{ entityId: string }> }) {
  const { entityId } = await params;
  
  const [entity, allUseCases] = await Promise.all([
    getEntity(entityId),
    getUseCases(entityId)
  ]);

  if (!entity) {
    notFound();
  }

  return <EntityPageClientWrapper entity={entity} initialUseCases={allUseCases} />;
}
