import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
  Timestamp,
  limit,
  startAfter,
  where,
  FieldValue,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Lead } from "@/types";

const LEADS_COLLECTION = "leads";
const PAGE_SIZE = 10; // Number of leads per page

// Define the expected type for the initial lead data passed to addLead
type AddLeadData = Omit<Lead, "id" | "priority" | "urgency"> & {
  createdAt: FieldValue;
  submitted: FieldValue;
  category: "Residential" | "Commercial"; // Make sure category is required
  minEstimate?: number;
  maxEstimate?: number;
};

export async function addLead(
  leadData: AddLeadData
): Promise<string> {
  try {
    console.log('Adding lead with data:', leadData); // Debug log
    const docRef = await addDoc(collection(db, LEADS_COLLECTION), leadData);
    return docRef.id;
  } catch (error) {
    console.error("Error adding lead to Firestore: ", error);
    throw new Error("Could not save lead information.");
  }
}

export async function updateLeadWithAIResults(
  leadId: string,
  aiData: Partial<Lead>
): Promise<void> {
  try {
    // Remove any undefined values from aiData
    const cleanData = Object.entries(aiData).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    // Only update if we have data to update
    if (Object.keys(cleanData).length > 0) {
      const leadRef = doc(db, LEADS_COLLECTION, leadId);
      await updateDoc(leadRef, cleanData);
    }
  } catch (error) {
    console.error("Error updating lead with AI results: ", error);
    // Not throwing error here to allow main process to continue if AI update fails
  }
}

export async function getLeadsPage(cursor: any): Promise<{ leads: Lead[]; lastVisible: any }> {
  try {
    let leadsQuery = query(
      collection(db, LEADS_COLLECTION),
      orderBy("createdAt", "desc"),
      limit(PAGE_SIZE)
    );

    if (cursor) {
      leadsQuery = query(
        collection(db, LEADS_COLLECTION),
        orderBy("createdAt", "desc"),
        startAfter(cursor),
        limit(PAGE_SIZE)
      );
    }

    const querySnapshot = await getDocs(leadsQuery);
    const leads = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      console.log('Raw Firestore data:', data); // Debug log
      
      const lead: Lead = {
        id: doc.id,
        name: data.name ?? "",
        email: data.email ?? "",
        phone: data.phone ?? "",
        currentAddress: data.currentAddress ?? { street: "", city: "", state: "", zipCode: "" },
        destinationAddress: data.destinationAddress ?? { street: "", city: "", state: "", zipCode: "" },
        movingDate: data.movingDate ? new Date(data.movingDate).toISOString() : "",
        movingPreference: data.movingPreference ?? "local",
        additionalNotes: data.additionalNotes ?? null,
        createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate() : new Date(),
        numberOfRooms: data.numberOfRooms as number | undefined,
        approximateBoxesCount: data.approximateBoxesCount as string | undefined,
        approximateFurnitureCount: data.approximateFurnitureCount as string | undefined,
        specialInstructions: data.specialInstructions ?? data.additionalNotes ?? "",
        urgency: data.urgency,
        priority: data.priority ?? "None",
        category: data.category as "Residential" | "Commercial", // Use type assertion
        submitted: data.submitted ? (data.submitted as Timestamp).toDate() : new Date(),
        minEstimate: data.minEstimate ? Number(data.minEstimate) : undefined,
        maxEstimate: data.maxEstimate ? Number(data.maxEstimate) : undefined,
      };
      console.log('Processed lead:', lead); // Debug log
      return lead;
    });

    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

    return { leads, lastVisible };
  } catch (error) {
    console.error("Error fetching leads from Firestore: ", error);
    throw new Error("Could not fetch leads.");
  }
}

// Delete all leads in the collection
export async function deleteAllLeads(): Promise<void> {
  try {
    const leadsSnapshot = await getDocs(collection(db, LEADS_COLLECTION));
    const deletePromises = leadsSnapshot.docs.map((docSnap) =>
      deleteDoc(doc(db, LEADS_COLLECTION, docSnap.id))
    );
    await Promise.all(deletePromises);
  } catch (error) {
    console.error("Error deleting all leads: ", error);
    throw new Error("Could not delete all leads.");
  }
}

