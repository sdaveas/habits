/**
 * Habit data structure types
 */

export interface HabitCompletion {
  date: string; // ISO 8601 date (YYYY-MM-DD)
  comment?: string; // Optional comment for this completion
}

// Helper function to check if a date string exists in completedDates (for backward compatibility)
export function isDateCompleted(completedDates: HabitCompletion[], date: string): boolean {
  return completedDates.some((completion) => completion.date === date);
}

// Helper function to get completion for a date
export function getCompletionForDate(
  completedDates: HabitCompletion[],
  date: string
): HabitCompletion | undefined {
  return completedDates.find((completion) => completion.date === date);
}

/**
 * Migrate old format (string[]) to new format (HabitCompletion[])
 * This ensures backward compatibility with existing data
 */
export function migrateCompletedDates(
  completedDates: HabitCompletion[] | string[]
): HabitCompletion[] {
  // Handle empty array
  if (completedDates.length === 0) {
    return [];
  }
  // If already in new format, return as is
  if (typeof completedDates[0] === 'object' && completedDates[0] !== null && 'date' in completedDates[0]) {
    return completedDates as HabitCompletion[];
  }
  // Migrate from old format (string[]) to new format
  return (completedDates as string[]).map((date) => ({ date }));
}

export interface Habit {
  id: string; // UUID v4
  name: string;
  description?: string;
  color?: string; // Hex color code
  createdAt: string; // ISO 8601 timestamp
  completedDates: HabitCompletion[]; // Array of completion records with optional comments
}

export interface HabitData {
  habits: Habit[];
  lastModified: string; // ISO 8601 timestamp
  version: number; // Schema version for future migrations
}

