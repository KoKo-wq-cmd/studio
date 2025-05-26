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
} from "firebase/firestore";
import { db } from "./firebase";
import type { Lead } from "@/types";

const LEADS_COLLECTION = "leads";

export async function addLead(leadData: Omit<Lead, "id" | "createdAt" | "category" | "urgencyScore" | "categoryReason" | "leadScore" | "priority" | "scoreReasoning"> & { movingDate: string }): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, LEADS_COLLECTION), {
      ...leadData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding lead to Firestore: ", error);
    throw new Error("Could not save lead information.");
  }
}

export async function updateLeadWithAIResults(leadId: string, aiData: Partial<Lead>): Promise<void> {
  try {
    const leadRef = doc(db, LEADS_COLLECTION, leadId);
    await updateDoc(leadRef, aiData);
  } catch (error) {
    console.error("Error updating lead with AI results: ", error);
    // Not throwing error here to allow main process to continue if AI update fails
  }
}

export async function getAllLeads(): Promise<Lead[]> {
  try {
    const leadsQuery = query(
      collection(db, LEADS_COLLECTION),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(leadsQuery);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      // Ensure movingDate is string and createdAt is properly typed if needed for display
      movingDate: doc.data().movingDate as string,
      createdAt: doc.data().createdAt as Timestamp,
    })) as Lead[];
  } catch (error) {
    console.error("Error fetching leads from Firestore: ", error);
    throw new Error("Could not fetch leads.");
  }
}
