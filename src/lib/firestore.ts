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
} from "firebase/firestore";
import { db } from "./firebase";
import type { Lead } from "@/types";

const LEADS_COLLECTION = "leads";
const PAGE_SIZE = 10; // Number of leads per page

// Corrected type: Omit only id and AI-related fields, but include createdAt
export async function addLead(
  leadData: Omit<
    Lead,
    "id" |
    "category" |
    "urgencyScore" |
    "categoryReason" |
    "leadScore" |
    "priority" |
    "scoreReasoning"
  > & { movingDate: string; approximateBoxesCount?: string; approximateFurnitureCount?: string; numberOfRooms?: number } // Include new fields and ensure movingDate is string
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, LEADS_COLLECTION), {
      ...leadData,
      createdAt: serverTimestamp(), // createdAt is now allowed by the type
    });
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
    const leadRef = doc(db, LEADS_COLLECTION, leadId);
    await updateDoc(leadRef, aiData);
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
    const leads = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      // Ensure movingDate is string and createdAt is properly typed if needed for display
      movingDate: doc.data().movingDate as string,
      createdAt: doc.data().createdAt as Timestamp,
      // Include new fields, handling potential undefined
      approximateBoxesCount: doc.data().approximateBoxesCount as string | undefined,
      approximateFurnitureCount: doc.data().approximateFurnitureCount as string | undefined,
      numberOfRooms: doc.data().numberOfRooms as number | undefined,
    })) as Lead[];

    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

    return { leads, lastVisible };
  } catch (error) {
    console.error("Error fetching leads from Firestore: ", error);
    throw new Error("Could not fetch leads.");
  }
}
