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
