import { z } from "zod";
import { inquiryFormSchema, AddressDetail } from "@/components/InquiryForm";
import { db } from "@/lib/firebase";
import { serverTimestamp, FieldValue } from "firebase/firestore";
import { addLead, updateLeadWithAIResults } from "@/lib/firestore";
import { calculateApproximateEstimate } from "@/lib/utils";
import { getTimelineCategory } from "@/lib/utils";
import type { Lead } from "@/types";

type InitialLeadData = Omit<Lead, "id" | "priority" | "category" | "submitted" | "urgency"> & {
  createdAt: FieldValue;
  submitted: FieldValue;
  specialInstructions: string;
  category: "Residential" | "Commercial";
  urgency: string;
  minEstimate?: number;
  maxEstimate?: number;
};

export async function submitInquiryAction(
  values: z.infer<typeof inquiryFormSchema>
): Promise<{
  success: boolean;
  leadId?: string;
  error?: string;
  minEstimate?: number;
  maxEstimate?: number;
}> {
  const validatedFields = inquiryFormSchema.safeParse(values);

  if (!validatedFields.success) {
    console.error(validatedFields.error.flatten().fieldErrors);
    return { success: false, error: "Invalid form data. Please check the fields and try again." };
  }

  const data = validatedFields.data;
  const movingDateISO = data.movingDate.toISOString(); // Convert Date to ISO string for Lead

  try {
    // Calculate the estimate first
    const estimateRange = await calculateApproximateEstimate({
      numberOfRooms: data.numberOfRooms,
      approximateBoxesCount: data.approximateBoxesCount,
      approximateFurnitureCount: data.approximateFurnitureCount,
    });

    // Then include it in initialLeadData
    const initialLeadData: InitialLeadData = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      currentAddress: data.currentAddress,
      destinationAddress: data.destinationAddress,
      movingDate: movingDateISO,
      numberOfRooms: parseInt(data.numberOfRooms),
      approximateBoxesCount: data.approximateBoxesCount,
      approximateFurnitureCount: data.approximateFurnitureCount,
      movingPreference: data.movingPreference,
      additionalNotes: data.additionalNotes ?? null,
      specialInstructions: data.additionalNotes ?? "",
      minEstimate: estimateRange.minEstimate,
      maxEstimate: estimateRange.maxEstimate,
      category: data.category,
      createdAt: serverTimestamp(),
      submitted: serverTimestamp(),
      urgency: getTimelineCategory(new Date(movingDateISO)),
    };

    const leadId = await addLead(initialLeadData as any); // Use 'as any' temporarily if addLead signature is strict

    // Asynchronously run AI flows and update the lead
    processLeadWithAI(leadId, data);

    return { 
      success: true, 
      leadId, 
      minEstimate: estimateRange.minEstimate, 
      maxEstimate: estimateRange.maxEstimate 
    };
  } catch (e: any) {
    console.error(e);
    return { success: false, error: e.message || "Failed to submit inquiry." };
  }
}

function formatAddressToString(address: AddressDetail): string {
  return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
}

async function processLeadWithAI(leadId: string, data: z.infer<typeof inquiryFormSchema>) {
  try {
      // 1. Get Timeline Category
      const timelineCategory = getTimelineCategory(data.movingDate);

      // 2. Map Timeline Category to Urgency (Priority) Field
      let urgency: "Urgent" | "Urgent Moderate" | "Urgent Low" | null | undefined;
      let priority: string; // Assume priority is a string in Lead type

      switch (timelineCategory) {
          case "Urgent":
              urgency = "Urgent";
              priority = "High"; // Map urgency to a priority string value
              break;
          case "Urgent Moderate":
              urgency = "Urgent Moderate";
              priority = "Medium"; // Map urgency to a priority string value
              break;
          case "Urgent Low":
              urgency = "Urgent Low";
              priority = "Low"; // Map urgency to a priority string value
              break;
          default:
              urgency = null; // Or handle the default case as needed
              priority = "None"; // Default priority
              break;
      }

      // 3. Potentially determine Category based on data (if not done elsewhere)
      // This part is speculative as category logic is not in the provided snippet
      let category: "Residential" | "Commercial" | undefined = undefined; // Assign a valid value or undefined

      // 4. Update Lead with Urgency, Priority, and Category Values
      // Ensure updateLeadWithAIResults can handle partial updates and FieldValues
      await updateLeadWithAIResults(leadId, { urgency, priority, category });

  } catch (error) {
      console.error("Error processing lead with AI:", error);
  }
}