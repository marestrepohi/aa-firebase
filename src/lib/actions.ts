'use server';

import { z } from 'zod';
import { addEntity, addUseCase } from './data';
import { revalidatePath } from 'next/cache';

const entitySchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters long.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters long.' }),
});

export async function createEntity(prevState: any, formData: FormData) {
  const validatedFields = entitySchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Error: Please check the form fields.',
    };
  }
  
  try {
    await addEntity(validatedFields.data);
    revalidatePath('/');
    revalidatePath('/entities');
    return { message: 'Entity created successfully.', errors: {} };
  } catch (error) {
    return { message: 'Failed to create entity.', errors: {} };
  }
}

const useCaseSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters long.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters long.' }),
});

export async function createUseCase(entityId: string, prevState: any, formData: FormData) {
  const validatedFields = useCaseSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Error: Please check the form fields.',
    };
  }

  try {
    await addUseCase(entityId, validatedFields.data);
    revalidatePath(`/${entityId}`);
    return { message: 'Use case created successfully.', errors: {} };
  } catch (error) {
    return { message: 'Failed to create use case.', errors: {} };
  }
}
