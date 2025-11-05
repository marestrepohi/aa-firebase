'use server';
/**
 * @fileOverview A smart alerting system that analyzes metrics and generates alerts.
 *
 * - generateAlert - A function that generates alerts based on use case metrics.
 * - SmartAlertingSystemInput - The input type for the generateAlert function.
 * - SmartAlertingSystemOutput - The return type for the generateAlert function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartAlertingSystemInputSchema = z.object({
  generalMetrics: z.record(z.any()).describe('General metrics of the use case.'),
  financialMetrics: z.record(z.any()).describe('Financial metrics of the use case.'),
  businessMetrics: z.record(z.any()).describe('Business metrics of the use case.'),
  technicalMetrics: z.record(z.any()).describe('Technical metrics of the use case.'),
});
export type SmartAlertingSystemInput = z.infer<typeof SmartAlertingSystemInputSchema>;

const SmartAlertingSystemOutputSchema = z.object({
  alerts: z.array(
    z.object({
      metric: z.string().describe('The metric that triggered the alert.'),
      message: z.string().describe('The alert message.'),
      severity: z.enum(['high', 'medium', 'low']).describe('The severity of the alert.'),
    })
  ).describe('A list of alerts generated based on the metrics.'),
});
export type SmartAlertingSystemOutput = z.infer<typeof SmartAlertingSystemOutputSchema>;

export async function generateAlert(input: SmartAlertingSystemInput): Promise<SmartAlertingSystemOutput> {
  return smartAlertingSystemFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartAlertingSystemPrompt',
  input: {schema: SmartAlertingSystemInputSchema},
  output: {schema: SmartAlertingSystemOutputSchema},
  prompt: `You are an intelligent alerting system designed to analyze the metrics of a use case and generate alerts when anomalies or potential issues are detected.

Analyze the following metrics and generate alerts as needed. Each alert should include the metric name, a descriptive message, and a severity level (high, medium, or low).

General Metrics: {{{generalMetrics}}}
Financial Metrics: {{{financialMetrics}}}
Business Metrics: {{{businessMetrics}}}
Technical Metrics: {{{technicalMetrics}}}

Consider the typical ranges and expected values for each metric when determining if an alert is necessary. Focus on identifying deviations that could indicate problems or opportunities for improvement.

Output the alerts in JSON format:
{{#json alerts}}{{{this}}}{{/json}}`,
});

const smartAlertingSystemFlow = ai.defineFlow(
  {
    name: 'smartAlertingSystemFlow',
    inputSchema: SmartAlertingSystemInputSchema,
    outputSchema: SmartAlertingSystemOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
