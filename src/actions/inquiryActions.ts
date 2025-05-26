"use server";

import { z } from "zod";
import { addLead, updateLeadWithAIResults } from "@/lib/firestore";
import type { InquiryFormValues, Lead, AddressDetail } from "@/types";
import { categorizeInquiry } from "@/ai/flows/inquiry-categorization";
import { scoreLead } from "@/ai/flows/lead-scoring";
import { getTimelineCategory, getUrgencyFromTimeline } from "@/lib/utils";

const addressSchema = z.object({
  street: z.string().min(3),
  city: z.string().min(2),
  state: z.string().min(2),
  zipCode: z.string().regex(/^\d{5}(?:-\d{4})?$/),
});

const formSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  currentAddress: addressSchema,
  destinationAddress: addressSchema,
  movingDate: z.date(),
  movingPreference: z.enum(["local", "longDistance"]),
  additionalNotes: z.string().optional(),
});

function formatAddressToString(address: AddressDetail): string {
  return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
}

export async function submitInquiryAction(
  values: InquiryFormValues
): Promise<{ success: boolean; leadId?: string; error?: string }> {
  const validatedFields = formSchema.safeParse(values);

  if (!validatedFields.success) {
    // For detailed error reporting, you might want to flatten the errors:
    // console.error(validatedFields.error.flatten().fieldErrors);
    return { success: false, error: "Invalid form data. Please check the fields and try again." };
  }

  const data = validatedFields.data;
  const movingDateISO = data.movingDate.toISOString();

  const currentAddressString = formatAddressToString(data.currentAddress);
  const destinationAddressString = formatAddressToString(data.destinationAddress);

  try {
    const leadDataForFirestore = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      currentAddress: currentAddressString,
      destinationAddress: destinationAddressString,
      movingDate: movingDateISO,
      movingPreference: data.movingPreference,
      additionalNotes: data.additionalNotes,
    };
    
    const leadId = await addLead(leadDataForFirestore);

    // Asynchronously run AI flows and update the lead
    // No need to wait for these to complete for the user response
    processLeadWithAI(leadId, data); // Pass original validated data
    
    return { success: true, leadId };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to submit inquiry." };
  }
}

// formData type here should be InquiryFormValues as it's the validated form data
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
        movingDate: movingDateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
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
        // Note: Address details are not directly used by scoreLead currently.
        // If needed in the future, pass formData.currentAddress or formData.destinationAddress (the structured objects)
      };
      const scoringResult = await scoreLead(scoringInput);
      aiUpdates = {
        ...aiUpdates,
        leadScore: scoringResult.leadScore,
        priority: scoringResult.priority as Lead['priority'],
        scoreReasoning: scoringResult.reasoning,
      };
    } catch (aiError) {
      console.error(`Error scoring lead for lead ${leadId}:`, aiError);
    }

    // Update Firestore with AI results
    if (Object.keys(aiUpdates).length > 0) {
      await updateLeadWithAIResults(leadId, aiUpdates);
    }

  } catch (error) {
    console.error(`Error processing AI flows for lead ${leadId}:`, error);
  }
}
