/**
 * Habit data state store
 * 
 * Stores decrypted habit data in memory only
 */

import { create } from 'zustand';
import type { Habit, HabitData } from '../types/HabitTypes';
import { v4 as uuidv4 } from 'uuid';

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
  markComplete: (habitId: string, date: string) => void;
  unmarkComplete: (habitId: string, date: string) => void;
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
    set({ habitData: data, needsSync: false }); // Don't sync when setting data from server
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
  markComplete: (habitId, date) => {
    const state = get();
    if (!state.habitData) {
      return;
    }
    set({
      habitData: {
        ...state.habitData,
        habits: state.habitData.habits.map((h) => {
          if (h.id === habitId && !h.completedDates.includes(date)) {
            return {
              ...h,
              completedDates: [...h.completedDates, date].sort(),
            };
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
              completedDates: h.completedDates.filter((d) => d !== date),
            };
          }
          return h;
        }),
        lastModified: new Date().toISOString(),
      },
      immediateSync: true, // Trigger immediate sync for completion changes
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

