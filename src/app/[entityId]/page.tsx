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

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <EntityPageClientWrapper entity={entity} initialUseCases={allUseCases} />
    </div>
    );
}
