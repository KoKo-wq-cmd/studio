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
  if (daysDifference <= 7) return "Immediate (within 7 days)";
  if (daysDifference <= 30) return "Within 1 month";
  if (daysDifference <= 90) return "Within 1-3 months";
  return "More than 3 months";
}

export function getUrgencyFromTimeline(timelineCategory: string): string {
  if (timelineCategory.startsWith("Immediate")) return "Very Urgent";
  if (timelineCategory === "Within 1 month") return "Urgent";
  if (timelineCategory === "Within 1-3 months") return "Somewhat Urgent";
  return "Not Urgent";
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
