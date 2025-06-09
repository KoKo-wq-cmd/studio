import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { differenceInDays, format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | number, formatString: string = "PPP") {
  return format(new Date(date), formatString);
}

export function getTimelineCategory(movingDate: Date): string {
  const today = new Date();
  const daysDifference = differenceInDays(movingDate, today);

  if (daysDifference < 0) return "Past Date"; // Should be handled by validation
  if (daysDifference < 7) return "Urgent";
  if (daysDifference >= 7 && daysDifference <= 14) return "Urgent Moderate";
  return "Urgent Low";
}

export function getUrgencyFromTimeline(timelineCategory: string): string {
  return timelineCategory;
}

interface EstimateInput {
  numberOfRooms: string; // Assuming this is a string like '1', '2', '3', etc.
  approximateBoxesCount: string; // Assuming this is a string
  approximateFurnitureCount: string; // Assuming this is a string
  // Add other relevant fields like zip codes, house size later
}

interface EstimateRange {
  minEstimate: number;
  maxEstimate: number;
}

// Simple placeholder function for approximate estimate calculation
export async function calculateApproximateEstimate(input: EstimateInput): Promise<EstimateRange> {
  // Basic estimation logic (can be expanded later)
  const roomFactor = parseInt(input.numberOfRooms) || 1; // Default to 1 if parsing fails
  const boxesFactor = parseInt(input.approximateBoxesCount) || 0;
  const furnitureFactor = parseInt(input.approximateFurnitureCount) || 0;

  // Simple linear model (replace with actual pricing logic)
  const baseCost = 500; // Example base cost
  const costPerRoom = 200; // Example cost per room
  const costPerBox = 5; // Example cost per box
  const costPerFurniture = 20; // Example cost per furniture piece

  const baseEstimate = baseCost +
                       (roomFactor * costPerRoom) +
                       (boxesFactor * costPerBox) +
                       (furnitureFactor * costPerFurniture);

  // Calculate the range (approx. $800 difference)
  const rangeOffset = 400; // Half of the desired range difference
  const minEstimate = Math.max(0, baseEstimate - rangeOffset); // Ensure min is not negative
  const maxEstimate = baseEstimate + rangeOffset;

  return { minEstimate, maxEstimate };
}

// Define the Lead type based on the fields used in convertLeadsToCSV
interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

interface Lead {
  name: string;
  email: string;
  phone: string;
  currentAddress: Address;
  destinationAddress: Address;
  movingDate: Date | string | number;
  numberOfRooms: string;
  approximateBoxesCount?: string;
  approximateFurnitureCount?: string;
  specialInstructions?: string;
  movingPreference: string;
  category: string;
  minEstimate?: number;
  maxEstimate?: number;
  createdAt: Date | string | number;
  urgency?: string;
}

export function convertLeadsToCSV(leads: Lead[]): string {
  // Define CSV headers - match exactly with Admin table columns
  const headers = [
    'Name',
    'Email',
    'Phone',
    'Current Street',
    'Current City',
    'Current State',
    'Current ZipCode',
    'Destination Street',
    'Destination City',
    'Destination State',
    'Destination ZipCode',
    'Move Date',
    'Number of Rooms',
    'Approximate Boxes Count',
    'Approximate Furniture Count',
    'Special Instructions',
    'Move Type',
    'Category',
    'Urgency',  // Added Urgency header
    'Created At'
  ].join(',');

  // Convert each lead to CSV row - match column order with headers
  const rows = leads.map(lead => {
    // Calculate urgency if not present
    const urgency = lead.urgency || getTimelineCategory(new Date(lead.movingDate));

    return [
      lead.name,
      lead.email,
      lead.phone,
      `"${lead.currentAddress.street}"`,
      lead.currentAddress.city,
      lead.currentAddress.state,
      lead.currentAddress.zipCode,
      `"${lead.destinationAddress.street}"`,
      lead.destinationAddress.city,
      lead.destinationAddress.state,
      lead.destinationAddress.zipCode,
      new Date(lead.movingDate).toLocaleDateString(),
      lead.numberOfRooms,
      lead.approximateBoxesCount || 'N/A',
      lead.approximateFurnitureCount || 'N/A',
      `"${lead.specialInstructions || ''}"`,
      lead.movingPreference,
      lead.category || 'Residential',
      urgency,  // Added Urgency value
      new Date(lead.createdAt).toLocaleDateString()
    ].map(value => {
      // Properly escape values containing commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });

  return [headers, ...rows].join('\n');
}
