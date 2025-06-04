// app/actions/submitInquiry.ts
"use server";

import { z } from "zod";
import { addLead, updateLeadWithAIResults } from "@/lib/firestore";
import type { InquiryFormValues, Lead, AddressDetail } from "@/types";
import { categorizeInquiry } from "@/ai/flows/inquiry-categorization";
import { scoreLead } from "@/ai/flows/lead-scoring";
import { getTimelineCategory, getUrgencyFromTimeline, calculateApproximateEstimate } from "@/lib/utils";
import { Timestamp as FirestoreTimestamp, Timestamp } from "firebase/firestore"; // Explicit import for clarity

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
  numberOfRooms: z.string().min(1), // Adjusted to match form
  approximateBoxesCount: z.string().trim().min(1, "Required"),
  approximateFurnitureCount: z.string().trim().min(1, "Required"),
  specialInstructions: z.string().optional().nullable(), // Matches form field
}).strict();

// Define the type for the data passed to addLead, omitting only id and AI fields
type LeadDataForFirestore = Omit<Lead, "id" | "category" | "urgencyScore" | "categoryReason" | "leadScore" | "priority" | "scoreReasoning">;

export async function submitInquiryAction(
  values: z.infer<typeof formSchema>
): Promise<{
  estimate: undefined; success: boolean; leadId?: string; error?: string; minEstimate?: number; maxEstimate?: number 
}> { // Updated return type
  const validatedFields = formSchema.safeParse(values);

  if (!validatedFields.success) {
    console.error(validatedFields.error.flatten().fieldErrors);
    return { success: false, error: "Invalid form data. Please check the fields and try again." };
  }

  const data = validatedFields.data;
  const movingDateISO = data.movingDate.toISOString(); // Convert Date to ISO string for Lead
  const createdAt = FirestoreTimestamp.now(); // Set current timestamp for Firestore

  try {
    const leadDataForFirestore: LeadDataForFirestore = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      currentAddress: data.currentAddress,
      destinationAddress: data.destinationAddress,
      movingDate: movingDateISO,
      movingPreference: data.movingPreference,
      additionalNotes: data.specialInstructions || null, // Map specialInstructions to additionalNotes
      createdAt: createdAt as Timestamp, // Include createdAt here
      // Include the new fields in the data to be saved
      approximateBoxesCount: data.approximateBoxesCount,
      approximateFurnitureCount: data.approximateFurnitureCount,
       numberOfRooms: parseInt(data.numberOfRooms) // Save numberOfRooms as number if needed
    };

    const leadId = await addLead(leadDataForFirestore);

    // Calculate the approximate estimate
    const estimateRange = await calculateApproximateEstimate({
      numberOfRooms: data.numberOfRooms,
      approximateBoxesCount: data.approximateBoxesCount,
      approximateFurnitureCount: data.approximateFurnitureCount,
      // Add other relevant fields here when the function is expanded
    });

    // Asynchronously run AI flows and update the lead
    processLeadWithAI(leadId, data);

    return { success: true, leadId, minEstimate: estimateRange.minEstimate, maxEstimate: estimateRange.maxEstimate }; // Return range
  } catch (e: any) {
    console.error(e);
    return { success: false, error: e.message || "Failed to submit inquiry." };
  }
}

function formatAddressToString(address: AddressDetail): string {
  return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
}

async function processLeadWithAI(leadId: string, formData: z.infer<typeof formSchema>) {
  try {
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
        movingDate: movingDateObj.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
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
        priority: scoringResult.priority as Lead["priority"],
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