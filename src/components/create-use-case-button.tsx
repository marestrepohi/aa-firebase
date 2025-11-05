'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { CreateUseCaseForm } from '@/components/create-use-case-form';
import { Plus } from 'lucide-react';

export function CreateUseCaseButton({ entityId }: { entityId: string }) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="-ml-1 mr-2 h-4 w-4" />
          Create Use Case
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Use Case</DialogTitle>
          <DialogDescription>
            This use case will be created under the current entity.
          </DialogDescription>
        </DialogHeader>
        <CreateUseCaseForm entityId={entityId} setOpen={setIsOpen} />
      </DialogContent>
    </Dialog>
  );
}
