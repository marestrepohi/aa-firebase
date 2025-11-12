'use client';

import { Header } from '@/components/header';
import HomePageClient from './home-page-client';
import type { Entity, UseCase } from '@/lib/types';

interface HomePageClientWrapperProps {
  entities: Entity[];
  allUseCases: UseCase[];
}

export default function HomePageClientWrapper({ entities, allUseCases }: HomePageClientWrapperProps) {
  // isEditing state is no longer needed as we are disabling edit mode.
  const isEditing = false;

  return (
    <>
      <Header />
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <HomePageClient
          entities={entities}
          allUseCases={allUseCases}
          isEditing={isEditing}
        />
      </div>
    </>
  );
}
