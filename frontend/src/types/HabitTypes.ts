/**
 * Habit data structure types
 */

export interface Habit {
  id: string; // UUID v4
  name: string;
  description?: string;
  color?: string; // Hex color code
  createdAt: string; // ISO 8601 timestamp
  completedDates: string[]; // Array of ISO 8601 dates (YYYY-MM-DD)
}

export interface HabitData {
  habits: Habit[];
  lastModified: string; // ISO 8601 timestamp
  version: number; // Schema version for future migrations
}

