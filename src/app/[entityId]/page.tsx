import { notFound } from 'next/navigation';
import { getEntity, getUseCases } from '@/lib/data';
import { Header } from '@/components/header';
import EntityPageClient from './entity-page-client';

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
    <>
      <Header entity={entity} />
      <EntityPageClient entity={entity} initialUseCases={allUseCases} />
    </>
  );
}
