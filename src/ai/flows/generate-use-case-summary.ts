'use server';

/**
 * @fileOverview A use case summary generator AI agent.
 *
 * - generateUseCaseSummary - A function that handles the use case summary generation process.
 * - GenerateUseCaseSummaryInput - The input type for the generateUseCaseSummary function.
 * - GenerateUseCaseSummaryOutput - The return type for the generateUseCaseSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateUseCaseSummaryInputSchema = z.object({
  generalMetrics: z.string().describe('General metrics for the use case.'),
  financialMetrics: z.string().describe('Financial metrics for the use case.'),
  businessMetrics: z.string().describe('Business metrics for the use case.'),
  technicalMetrics: z.string().describe('Technical metrics for the use case.'),
});
export type GenerateUseCaseSummaryInput = z.infer<typeof GenerateUseCaseSummaryInputSchema>;

const GenerateUseCaseSummaryOutputSchema = z.object({
  summary: z.string().describe('A summary of the use case based on the provided metrics.'),
});
export type GenerateUseCaseSummaryOutput = z.infer<typeof GenerateUseCaseSummaryOutputSchema>;

export async function generateUseCaseSummary(input: GenerateUseCaseSummaryInput): Promise<GenerateUseCaseSummaryOutput> {
  return generateUseCaseSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateUseCaseSummaryPrompt',
  input: {schema: GenerateUseCaseSummaryInputSchema},
  output: {schema: GenerateUseCaseSummaryOutputSchema},
  prompt: `You are an expert business analyst specializing in summarizing use case performance.

You will use the provided metrics to generate a concise and informative summary of the use case's overall status and performance. Focus on key insights and trends.

General Metrics: {{{generalMetrics}}}
Financial Metrics: {{{financialMetrics}}}
Business Metrics: {{{businessMetrics}}}
Technical Metrics: {{{technicalMetrics}}}`,
});

const generateUseCaseSummaryFlow = ai.defineFlow(
  {
    name: 'generateUseCaseSummaryFlow',
    inputSchema: GenerateUseCaseSummaryInputSchema,
    outputSchema: GenerateUseCaseSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
