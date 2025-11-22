'use client';

import { GlobalDashboard } from '@/components/dashboard/GlobalDashboard';
import type { Entity, UseCase } from '@/lib/types';

interface HomePageClientProps {
  entities: Entity[];
  allUseCases: UseCase[];
  isEditing: boolean;
}

export default function HomePageClient({ entities, allUseCases }: HomePageClientProps) {
  return (
    <GlobalDashboard entities={entities} allUseCases={allUseCases} />
  );
}
