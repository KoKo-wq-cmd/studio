"use server";

import { z } from "zod";
import { addLead, updateLeadWithAIResults } from "@/lib/firestore";
import type { InquiryFormValues, Lead } from "@/types";
import { categorizeInquiry } from "@/ai/flows/inquiry-categorization";
import { scoreLead } from "@/ai/flows/lead-scoring";
import { getTimelineCategory, getUrgencyFromTimeline } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  currentAddress: z.string().min(5),
  destinationAddress: z.string().min(5),
  movingDate: z.date(),
  movingPreference: z.enum(["local", "longDistance"]),
  additionalNotes: z.string().optional(),
});

export async function submitInquiryAction(
  values: InquiryFormValues
): Promise<{ success: boolean; leadId?: string; error?: string }> {
  const validatedFields = formSchema.safeParse(values);

  if (!validatedFields.success) {
    return { success: false, error: "Invalid form data." };
  }

  const data = validatedFields.data;
  const movingDateISO = data.movingDate.toISOString();

  try {
    const leadId = await addLead({
      ...data,
      movingDate: movingDateISO, // Store date as ISO string
    });

    // Asynchronously run AI flows and update the lead
    // No need to wait for these to complete for the user response
    processLeadWithAI(leadId, data);
    
    return { success: true, leadId };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to submit inquiry." };
  }
}

async function processLeadWithAI(leadId: string, formData: InquiryFormValues) {
  try {
    // Prepare inputs for AI flows
    const movingDateObj = new Date(formData.movingDate);
    const timeline = getTimelineCategory(movingDateObj);
    const urgency = getUrgencyFromTimeline(timeline);
    const contactInfoComplete = !!(formData.name && formData.email && formData.phone);
    const contactCompletenessScore = [formData.name, formData.email, formData.phone].filter(Boolean).length / 3;

    let aiUpdates: Partial<Lead> = {};

    // 1. Inquiry Categorization
    try {
      const categorizationInput = {
        movingDistance: formData.movingPreference,
        movingDate: movingDateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), // User-friendly date string for AI
        contactInformationCompleteness: contactCompletenessScore,
      };
      const categorizationResult = await categorizeInquiry(categorizationInput);
      aiUpdates = {
        ...aiUpdates,
        category: categorizationResult.category,
        urgencyScore: categorizationResult.urgencyScore,
        categoryReason: categorizationResult.reason,
      };
    } catch (aiError) {
      console.error(`Error categorizing inquiry for lead ${leadId}:`, aiError);
    }
    
    // 2. Lead Scoring
    try {
      const scoringInput = {
        movingDistance: formData.movingPreference === "longDistance" ? "long distance" : "local",
        timeline: timeline,
        contactInfoComplete: contactInfoComplete,
        urgency: urgency,
      };
      const scoringResult = await scoreLead(scoringInput);
      aiUpdates = {
        ...aiUpdates,
        leadScore: scoringResult.leadScore,
        priority: scoringResult.priority as Lead['priority'],
        scoreReasoning: scoringResult.reasoning,
      };
    } catch (aiError) {
      console.error(`Error scoring lead ${leadId}:`, aiError);
    }

    // Update Firestore with AI results
    if (Object.keys(aiUpdates).length > 0) {
      await updateLeadWithAIResults(leadId, aiUpdates);
    }

  } catch (error) {
    console.error(`Error processing AI flows for lead ${leadId}:`, error);
    // Log error, but don't let it break the main flow if submission was successful
  }
}
