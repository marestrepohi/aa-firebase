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
import { createEntity } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

const entitySchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
});

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Creating...' : 'Create Entity'}
    </Button>
  );
}

export function CreateEntityForm({ setOpen }: { setOpen: (open: boolean) => void }) {
  const [state, formAction] = useFormState(createEntity, { message: '', errors: {} });
  const { toast } = useToast();

  const form = useForm<z.infer<typeof entitySchema>>({
    resolver: zodResolver(entitySchema),
    defaultValues: {
      name: '',
      description: '',
    },
    ...state,
  });

  useEffect(() => {
    if (state.message && state.errors && Object.keys(state.errors).length === 0) {
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
              <FormLabel>Entity Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Customer Analytics" {...field} />
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
                <Textarea placeholder="A brief description of the entity." {...field} />
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
