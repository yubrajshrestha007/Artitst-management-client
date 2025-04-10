import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDistanceToNow as formatDistanceToNowFn } from "date-fns"; // Rename imported function


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const formatRelativeTime = (date: Date | string | null | undefined): string | null => {
  if (!date) return null;
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return null; // Check if date is valid
    return formatDistanceToNowFn(dateObj, { addSuffix: true });
  } catch (err) {
    console.error("Date formatting error", err);
    return null;
  }
};

// Helper to get the latest valid date from an array of objects
export const getLatestValidDate = (items: Array<{ created?: string | Date | null }>): Date | null => {
  const validDates = items
    .map((item) => {
      if (!item?.created) return null;
      const date = new Date(item.created);
      return isNaN(date.getTime()) ? null : date;
    })
    .filter((date): date is Date => date !== null); // Type guard ensures only valid Dates remain

  return validDates.length > 0 ? new Date(Math.max(...validDates.map((d) => d.getTime()))) : null;
};
