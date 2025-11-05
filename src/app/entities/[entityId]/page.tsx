import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { getEntity, getUseCases } from '@/lib/data';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusPill } from '@/components/status-pill';
import { ChevronRight } from 'lucide-react';
import { CreateUseCaseButton } from '@/components/create-use-case-button';

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
    <div className="space-y-8">
      <PageHeader
        title={entity.name}
        description={entity.description}
        action={<CreateUseCaseButton entityId={entity.id} />}
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Use Case Name</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Last Updated</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {useCases.length > 0 ? (
                useCases.map((useCase) => (
                  <TableRow key={useCase.id}>
                    <TableCell className="font-medium">{useCase.name}</TableCell>
                    <TableCell><StatusPill status={useCase.status} /></TableCell>
                    <TableCell>
                      <time dateTime={useCase.lastUpdated} title={format(new Date(useCase.lastUpdated), "PPpp")}>
                        {formatDistanceToNow(new Date(useCase.lastUpdated), { addSuffix: true })}
                      </time>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/entities/${entity.id}/use-cases/${useCase.id}`}>
                          <ChevronRight className="h-4 w-4" />
                          <span className="sr-only">View Details</span>
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    No use cases found for this entity.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
