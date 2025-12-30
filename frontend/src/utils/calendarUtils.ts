/**
 * Calendar utility functions
 */

import { format, subDays, startOfYear, eachDayOfInterval, isSameDay } from 'date-fns';
import type { Habit } from '../types/HabitTypes';

/**
 * Calculate intensity for a specific date based on completed habits
 */
export function calculateIntensity(habits: Habit[], date: Date): number {
  const dateStr = format(date, 'yyyy-MM-dd');
  return habits.filter((habit) => habit.completedDates.includes(dateStr)).length;
}

/**
 * Generate date range for calendar display
 */
export function generateDateRange(startDate: Date, endDate: Date): Date[] {
  return eachDayOfInterval({ start: startDate, end: endDate });
}

/**
 * Get color for intensity level (GitHub-style gradient)
 */
export function getColorForIntensity(
  intensity: number,
  maxIntensity: number
): string {
  if (intensity === 0) {
    return '#ebedf0'; // Light gray (no activity)
  }

  // Calculate intensity level (0-4)
  const level = Math.min(4, Math.ceil((intensity / maxIntensity) * 4));

  // GitHub-style color palette (color-blind friendly)
  const colors = [
    '#9be9a8', // Level 1: Light green
    '#40c463', // Level 2: Medium green
    '#30a14e', // Level 3: Dark green
    '#216e39', // Level 4: Very dark green
  ];

  return colors[level - 1] || colors[0];
}

/**
 * Get default date range (last year)
 */
export function getDefaultDateRange(): { start: Date; end: Date } {
  const end = new Date();
  const start = subDays(end, 364); // Last 365 days
  return { start, end };
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return format(date, 'MMM d, yyyy');
}

/**
 * Get list of habits completed on a specific date
 */
export function getHabitsForDate(habits: Habit[], date: Date): Habit[] {
  const dateStr = format(date, 'yyyy-MM-dd');
  return habits.filter((habit) => habit.completedDates.includes(dateStr));
}

