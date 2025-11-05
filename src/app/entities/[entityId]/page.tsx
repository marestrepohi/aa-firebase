import { notFound } from 'next/navigation';
import { getEntity, getUseCases } from '@/lib/data';
import { PageHeader } from '@/components/page-header';
import { CreateUseCaseButton } from '@/components/create-use-case-button';
import { Header } from '@/components/header';
import { UseCaseCard } from '@/components/use-case-card';

export const dynamic = 'force-dynamic';

export default async function EntityPage({ params }: { params: { entityId: string } }) {
  const [entity, useCases] = await Promise.all([
    getEntity(params.entityId),
    getUseCases(params.entityId)
  ]);

  if (!entity) {
    notFound();
  }

  return (
    <>
      <Header entity={entity} />
      <div className="p-4 md:p-8 space-y-8">
        <PageHeader
          title="Casos de uso"
          description={entity.description}
          action={<CreateUseCaseButton entityId={entity.id} />}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.length > 0 ? (
            useCases.map((useCase) => (
              <UseCaseCard key={useCase.id} useCase={useCase} />
            ))
          ) : (
            <div className="col-span-full h-24 flex items-center justify-center text-muted-foreground bg-white rounded-lg border">
              No use cases found for this entity.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
