/**
 * CSV Import/Export utilities for habit data
 */

import type { Habit, HabitData, HabitCompletion } from '../types/HabitTypes';
import { v4 as uuidv4 } from 'uuid';

export interface CSVRow {
  habitId: string;
  habitName: string;
  description: string;
  color: string;
  createdAt: string;
  completionDate: string;
  comment: string;
}

const CSV_HEADER = 'Habit ID,Habit Name,Description,Color,Created At,Completion Date,Comment';

/**
 * Escape CSV field (handle commas, quotes, newlines)
 */
function escapeCSVField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

/**
 * Convert habit data to CSV format
 */
export function exportToCSV(habitData: HabitData): string {
  const rows: string[] = [CSV_HEADER];

  for (const habit of habitData.habits) {
    if (habit.completedDates.length === 0) {
      // Habit with no completions - export as single row with empty completion
      const row = [
        habit.id,
        escapeCSVField(habit.name),
        escapeCSVField(habit.description || ''),
        escapeCSVField(habit.color || ''),
        habit.createdAt,
        '',
        '',
      ].join(',');
      rows.push(row);
    } else {
      // Export each completion as a separate row
      for (const completion of habit.completedDates) {
        const row = [
          habit.id,
          escapeCSVField(habit.name),
          escapeCSVField(habit.description || ''),
          escapeCSVField(habit.color || ''),
          habit.createdAt,
          completion.date,
          escapeCSVField(completion.comment || ''),
        ].join(',');
        rows.push(row);
      }
    }
  }

  return rows.join('\n');
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string = 'habits-export.csv'): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Parse CSV content
 */
function parseCSV(csvContent: string): CSVRow[] {
  const lines = csvContent.split('\n').filter((line) => line.trim());
  
  if (lines.length === 0) {
    throw new Error('CSV file is empty');
  }

  // Check header
  const header = lines[0].trim();
  if (header !== CSV_HEADER) {
    throw new Error(`Invalid CSV format. Expected header: ${CSV_HEADER}`);
  }

  const rows: CSVRow[] = [];

  // Parse rows (skip header)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple CSV parser (handles quoted fields)
    const fields: string[] = [];
    let currentField = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      const nextChar = line[j + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          currentField += '"';
          j++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator
        fields.push(currentField);
        currentField = '';
      } else {
        currentField += char;
      }
    }
    
    // Add last field
    fields.push(currentField);

    if (fields.length < 7) {
      throw new Error(`Invalid CSV row at line ${i + 1}: expected 7 fields, got ${fields.length}`);
    }

    rows.push({
      habitId: fields[0].trim(),
      habitName: fields[1].trim(),
      description: fields[2].trim(),
      color: fields[3].trim(),
      createdAt: fields[4].trim(),
      completionDate: fields[5].trim(),
      comment: fields[6].trim(),
    });
  }

  return rows;
}

/**
 * Import habit data from CSV
 */
export function importFromCSV(csvContent: string): HabitData {
  const rows = parseCSV(csvContent);

  // Group rows by habit ID
  const habitMap = new Map<string, {
    id: string;
    name: string;
    description?: string;
    color?: string;
    createdAt: string;
    completions: HabitCompletion[];
  }>();

  for (const row of rows) {
    const habitId = row.habitId;
    
    if (!habitMap.has(habitId)) {
      // Create habit entry
      habitMap.set(habitId, {
        id: habitId,
        name: row.habitName,
        description: row.description || undefined,
        color: row.color || undefined,
        createdAt: row.createdAt,
        completions: [],
      });
    }

    // Add completion if date is present
    if (row.completionDate) {
      const habit = habitMap.get(habitId)!;
      // Check if completion already exists (avoid duplicates)
      const existingIndex = habit.completions.findIndex(
        (c) => c.date === row.completionDate
      );
      
      if (existingIndex >= 0) {
        // Update existing completion with comment if provided
        if (row.comment) {
          habit.completions[existingIndex] = {
            date: row.completionDate,
            comment: row.comment || undefined,
          };
        }
      } else {
        // Add new completion
        habit.completions.push({
          date: row.completionDate,
          comment: row.comment || undefined,
        });
      }
    }
  }

  // Convert map to habits array
  const habits: Habit[] = Array.from(habitMap.values()).map((habit) => ({
    id: habit.id,
    name: habit.name,
    description: habit.description,
    color: habit.color,
    createdAt: habit.createdAt,
    completedDates: habit.completions.sort((a, b) => a.date.localeCompare(b.date)),
  }));

  return {
    habits,
    lastModified: new Date().toISOString(),
    version: 1,
  };
}

/**
 * Read CSV file from file input
 */
export function readCSVFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        resolve(content);
      } else {
        reject(new Error('Failed to read file as text'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

