'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { createUseCase } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

const useCaseSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
});

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Creating...' : 'Create Use Case'}
    </Button>
  );
}

export function CreateUseCaseForm({ entityId, setOpen }: { entityId: string, setOpen: (open: boolean) => void }) {
  const createUseCaseWithId = createUseCase.bind(null, entityId);
  const [state, formAction] = useFormState(createUseCaseWithId, { message: '', errors: {} });
  const { toast } = useToast();

  const form = useForm<z.infer<typeof useCaseSchema>>({
    resolver: zodResolver(useCaseSchema),
    defaultValues: {
      name: '',
      description: '',
    },
    ...state,
  });

  useEffect(() => {
    if (state.message && !state.errors) {
      toast({
        title: 'Success',
        description: state.message,
      });
      setOpen(false);
    } else if (state.message) {
      toast({
        title: 'Error',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast, setOpen]);

  return (
    <Form {...form}>
      <form action={formAction} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Use Case Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Churn Prediction" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="A brief description of the use case." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <SubmitButton />
      </form>
    </Form>
  );
}
