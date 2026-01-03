/**
 * Habit data state store
 * 
 * Stores decrypted habit data in memory only
 */

import { create } from 'zustand';
import type { Habit, HabitData, HabitCompletion } from '../types/HabitTypes';
import { v4 as uuidv4 } from 'uuid';
import { isDateCompleted, migrateCompletedDates } from '../types/HabitTypes';

interface HabitState {
  habitData: HabitData | null;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  syncError: string | null;
  needsSync: boolean; // Flag to indicate if sync is needed (debounced)
  immediateSync: boolean; // Flag to indicate if immediate sync is needed
  setHabitData: (data: HabitData) => void;
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'completedDates'>) => void;
  updateHabit: (id: string, updates: Partial<Omit<Habit, 'id'>>) => void;
  deleteHabit: (id: string) => void;
  markComplete: (habitId: string, date: string, comment?: string) => void;
  unmarkComplete: (habitId: string, date: string) => void;
  updateCompletionComment: (habitId: string, date: string, comment?: string) => void;
  reorderHabits: (habitIds: string[]) => void;
  setSyncStatus: (status: HabitState['syncStatus'], error?: string) => void;
  setNeedsSync: (needsSync: boolean) => void;
  setImmediateSync: (immediateSync: boolean) => void;
  clearHabitData: () => void;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habitData: null,
  syncStatus: 'idle',
  syncError: null,
  needsSync: false,
  immediateSync: false,
  setHabitData: (data: HabitData) => {
    // Migrate any old format completedDates to new format
    const migratedData: HabitData = {
      ...data,
      habits: data.habits.map((habit) => ({
        ...habit,
        completedDates: migrateCompletedDates(habit.completedDates as any),
      })),
    };
    set({ habitData: migratedData, needsSync: false }); // Don't sync when setting data from server
  },
  addHabit: (habit) => {
    const state = get();
    if (!state.habitData) {
      return;
    }
    const newHabit: Habit = {
      ...habit,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      completedDates: [],
    };
    set({
      habitData: {
        ...state.habitData,
        habits: [...state.habitData.habits, newHabit],
        lastModified: new Date().toISOString(),
      },
      needsSync: true, // Mark as needing sync
    });
  },
  updateHabit: (id, updates) => {
    const state = get();
    if (!state.habitData) {
      return;
    }
    set({
      habitData: {
        ...state.habitData,
        habits: state.habitData.habits.map((h) =>
          h.id === id ? { ...h, ...updates } : h
        ),
        lastModified: new Date().toISOString(),
      },
      needsSync: true, // Mark as needing sync
    });
  },
  deleteHabit: (id) => {
    const state = get();
    if (!state.habitData) {
      return;
    }
    set({
      habitData: {
        ...state.habitData,
        habits: state.habitData.habits.filter((h) => h.id !== id),
        lastModified: new Date().toISOString(),
      },
      needsSync: true, // Mark as needing sync
    });
  },
  markComplete: (habitId, date, comment) => {
    const state = get();
    if (!state.habitData) {
      return;
    }
    set({
      habitData: {
        ...state.habitData,
        habits: state.habitData.habits.map((h) => {
          if (h.id === habitId) {
            // Check if already completed
            const existingIndex = h.completedDates.findIndex((c) => c.date === date);
            if (existingIndex >= 0) {
              // Update existing completion with comment
              const updated = [...h.completedDates];
              updated[existingIndex] = { date, comment: comment?.trim() || undefined };
              return {
                ...h,
                completedDates: updated,
              };
            } else {
              // Add new completion
              const newCompletion: HabitCompletion = { date, comment: comment?.trim() || undefined };
              return {
                ...h,
                completedDates: [...h.completedDates, newCompletion].sort((a, b) =>
                  a.date.localeCompare(b.date)
                ),
              };
            }
          }
          return h;
        }),
        lastModified: new Date().toISOString(),
      },
      immediateSync: true, // Trigger immediate sync for completion changes
    });
  },
  unmarkComplete: (habitId, date) => {
    const state = get();
    if (!state.habitData) {
      return;
    }
    set({
      habitData: {
        ...state.habitData,
        habits: state.habitData.habits.map((h) => {
          if (h.id === habitId) {
            return {
              ...h,
              completedDates: h.completedDates.filter((c) => c.date !== date),
            };
          }
          return h;
        }),
        lastModified: new Date().toISOString(),
      },
      immediateSync: true, // Trigger immediate sync for completion changes
    });
  },
  updateCompletionComment: (habitId, date, comment) => {
    const state = get();
    if (!state.habitData) {
      return;
    }
    set({
      habitData: {
        ...state.habitData,
        habits: state.habitData.habits.map((h) => {
          if (h.id === habitId) {
            const existingIndex = h.completedDates.findIndex((c) => c.date === date);
            if (existingIndex >= 0) {
              const updated = [...h.completedDates];
              updated[existingIndex] = { date, comment: comment?.trim() || undefined };
              return {
                ...h,
                completedDates: updated,
              };
            }
          }
          return h;
        }),
        lastModified: new Date().toISOString(),
      },
      immediateSync: true,
    });
  },
  reorderHabits: (habitIds) => {
    const state = get();
    if (!state.habitData) {
      return;
    }
    // Create a map of habit ID to habit for quick lookup
    const habitMap = new Map(state.habitData.habits.map((h) => [h.id, h]));
    // Reorder habits according to the provided order
    const reorderedHabits = habitIds
      .map((id) => habitMap.get(id))
      .filter((h): h is Habit => h !== undefined);
    // Add any habits that weren't in the reorder list (shouldn't happen, but safety check)
    const existingIds = new Set(habitIds);
    const remainingHabits = state.habitData.habits.filter((h) => !existingIds.has(h.id));
    
    set({
      habitData: {
        ...state.habitData,
        habits: [...reorderedHabits, ...remainingHabits],
        lastModified: new Date().toISOString(),
      },
      needsSync: true,
    });
  },
  setSyncStatus: (status, error) => {
    set({ syncStatus: status, syncError: error || null });
  },
  setNeedsSync: (needsSync) => {
    set({ needsSync });
  },
  setImmediateSync: (immediateSync) => {
    set({ immediateSync });
  },
  clearHabitData: () => {
    set({ habitData: null, syncStatus: 'idle', syncError: null, needsSync: false, immediateSync: false });
  },
}));

