import type { Timestamp } from "firebase/firestore";

export interface Lead {
  id?: string; // Firestore document ID
  name: string;
  email: string;
  phone: string;
  currentAddress: string;
  destinationAddress: string;
  movingDate: string; // ISO string date
  movingPreference: "local" | "longDistance";
  additionalNotes?: string;
  createdAt: Timestamp;

  // From categorizeInquiry AI flow
  category?: string; // e.g., 'localUrgent', 'longDistanceNonUrgent'
  urgencyScore?: number; // 0-1
  categoryReason?: string;

  // From scoreLead AI flow
  leadScore?: number; // 0-100
  priority?: "high" | "medium" | "low";
  scoreReasoning?: string;
}

// Schema for form validation
export type InquiryFormValues = Omit<Lead, "id" | "createdAt" | "category" | "urgencyScore" | "categoryReason" | "leadScore" | "priority" | "scoreReasoning"> & {
  movingDate: Date; // Use Date object in form, convert to string for storage
};
