'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import HomePageClient from './home-page-client';
import { Button } from '@/components/ui/button';
import { Pencil, Check } from 'lucide-react';
import type { Entity, UseCase } from '@/lib/types';

interface HomePageClientWrapperProps {
  entities: Entity[];
  allUseCases: UseCase[];
}

export default function HomePageClientWrapper({ entities, allUseCases }: HomePageClientWrapperProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <>
      <Header
        rightContent={
          <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Finalizar Edición
              </>
            ) : (
              <>
                <Pencil className="mr-2 h-4 w-4" />
                Editar Entidades
              </>
            )}
          </Button>
        }
      />
      <HomePageClient
        entities={entities}
        allUseCases={allUseCases}
        isEditing={isEditing}
      />
    </>
  );
}
