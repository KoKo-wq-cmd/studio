// Lead Scoring Genkit flow.

'use server';

/**
 * @fileOverview AI-powered lead scoring tool.
 *
 * This file defines a Genkit flow for scoring leads based on moving distance, timeline, and completeness of contact information.
 * - scoreLead - A function that handles the lead scoring process.
 * - ScoreLeadInput - The input type for the scoreLead function.
 * - ScoreLeadOutput - The return type for the scoreLead function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ScoreLeadInputSchema = z.object({
  movingDistance: z
    .string()
    .describe('The moving distance of the lead (local or long distance).'),
  timeline: z
    .string()
    .describe(
      'The timeline of the lead (e.g., immediate, within 1 month, within 3 months, etc.).'
    ),
  contactInfoComplete: z
    .boolean()
    .describe(
      'Whether the contact information of the lead is complete (true or false).'
    ),
  urgency: z
    .string()
    .describe(
      'How urgent is the move? (e.g., very urgent, somewhat urgent, not urgent).'
    ),
});
export type ScoreLeadInput = z.infer<typeof ScoreLeadInputSchema>;

const ScoreLeadOutputSchema = z.object({
  leadScore: z
    .number()
    .describe(
      'A numerical score (0-100) representing the likelihood of the lead to convert. Higher score indicates higher likelihood.'
    ),
  priority: z
    .string()
    .describe(
      'A priority level (high, medium, low) assigned to the lead based on the score.'
    ),
  reasoning: z
    .string()
    .describe(
      'The reasoning behind the assigned lead score and priority, explaining the factors that influenced the scoring.'
    ),
});
export type ScoreLeadOutput = z.infer<typeof ScoreLeadOutputSchema>;

export async function scoreLead(input: ScoreLeadInput): Promise<ScoreLeadOutput> {
  return scoreLeadFlow(input);
}

const prompt = ai.definePrompt({
  name: 'scoreLeadPrompt',
  input: {schema: ScoreLeadInputSchema},
  output: {schema: ScoreLeadOutputSchema},
  prompt: `You are an AI assistant that scores leads for a moving company.

You will receive information about a lead, including their moving distance, timeline, completeness of contact information and urgency.

Based on this information, you will assign a lead score (0-100), a priority level (high, medium, low), and provide reasoning for your assessment.

Consider these factors when scoring:

- Moving distance: Long distance moves are generally higher value.
- Timeline: Immediate or short timelines indicate higher urgency and likelihood to convert.
- Contact information: Complete contact information makes it easier to follow up and increases the chances of conversion.
- Urgency: Very urgent moves indicate higher likelihood to convert.

Input:
Moving Distance: {{{movingDistance}}}
Timeline: {{{timeline}}}
Contact Info Complete: {{{contactInfoComplete}}}
Urgency: {{{urgency}}}

Output:`,
});

const scoreLeadFlow = ai.defineFlow(
  {
    name: 'scoreLeadFlow',
    inputSchema: ScoreLeadInputSchema,
    outputSchema: ScoreLeadOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
