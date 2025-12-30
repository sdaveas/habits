/**
 * Habit Management Modal component
 * Allows adding, editing, and deleting habits
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { useHabitStore } from '../../store/habitStore';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import type { Habit } from '../../types/HabitTypes';
import { format } from 'date-fns';

interface HabitManagementModalProps {
  onClose: () => void;
  buttonRef?: React.RefObject<HTMLButtonElement>;
}

export function HabitManagementModal({ onClose, buttonRef }: HabitManagementModalProps): JSX.Element {
  const habitData = useHabitStore((state) => state.habitData);
  const habits = useMemo(() => habitData?.habits || [], [habitData]);
  const addHabit = useHabitStore((state) => state.addHabit);
  const updateHabit = useHabitStore((state) => state.updateHabit);
  const deleteHabit = useHabitStore((state) => state.deleteHabit);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [showHabitsList, setShowHabitsList] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleAddSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!name.trim()) {
      return;
    }

    addHabit({
      name: name.trim(),
      description: description.trim() || undefined,
      color,
    });

    setName('');
    setDescription('');
    setColor('#6366f1');
    setIsAdding(false);
  };

  const handleEdit = (habit: Habit): void => {
    setEditingId(habit.id);
    setName(habit.name);
    setDescription(habit.description || '');
    setColor(habit.color || '#6366f1');
    setIsAdding(false);
  };

  const handleEditSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!name.trim() || !editingId) {
      return;
    }

    updateHabit(editingId, {
      name: name.trim(),
      description: description.trim() || undefined,
      color,
    });

    setName('');
    setDescription('');
    setColor('#6366f1');
    setEditingId(null);
  };

  const handleCancel = (): void => {
    setName('');
    setDescription('');
    setColor('#6366f1');
    setIsAdding(false);
    setEditingId(null);
    setShowHabitsList(false);
  };

  // Position dropdown below button
  useEffect(() => {
    if (buttonRef?.current && dropdownRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const dropdown = dropdownRef.current;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Position below button
      let top = buttonRect.bottom + 8;
      let left = buttonRect.left;
      let width = Math.max(buttonRect.width, 320);
      
      // Adjust for mobile - ensure it fits on screen
      if (viewportWidth < 640) {
        width = Math.min(viewportWidth - 16, 400);
        left = Math.max(8, Math.min(left, viewportWidth - width - 8));
      }
      
      // If dropdown would go off bottom of screen, position above button
      const dropdownHeight = 400; // Approximate, will adjust
      if (top + dropdownHeight > viewportHeight - 16) {
        top = buttonRect.top - dropdownHeight - 8;
        if (top < 8) {
          top = 8;
          dropdown.style.maxHeight = `${viewportHeight - top - 16}px`;
        }
      }
      
      dropdown.style.top = `${top}px`;
      dropdown.style.left = `${left}px`;
      dropdown.style.width = `${width}px`;
    }
  }, [buttonRef]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef?.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose, buttonRef]);

  // Scroll form into view when adding/editing
  useEffect(() => {
    if ((isAdding || editingId) && formRef.current && modalContentRef.current) {
      setShowHabitsList(false); // Hide habits list when adding/editing
      setTimeout(() => {
        // Scroll the modal content to the top to show the form
        modalContentRef.current!.scrollTop = 0;
        // Focus the name input
        setTimeout(() => {
          nameInputRef.current?.focus();
          nameInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
      }, 100);
    }
  }, [isAdding, editingId]);

  return (
    <div
      ref={dropdownRef}
      className="fixed z-50 bg-white dark:bg-gray-800 rounded-xl shadow-strong max-h-[calc(100vh-120px)] overflow-y-auto overscroll-contain border-2 border-gray-200 dark:border-gray-700"
      style={{ maxWidth: '90vw', minWidth: '320px' }}
    >
      <div
        ref={modalContentRef}
        className="w-full"
      >
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Manage Habits
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close"
            >
              <span className="text-xl">✕</span>
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          {/* Add Habit Form */}
          {isAdding ? (
            <form 
              ref={formRef}
              onSubmit={handleAddSubmit} 
              className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl space-y-4"
            >
              <h3 className="font-semibold text-lg">Add New Habit</h3>
              <Input
                ref={nameInputRef}
                type="text"
                label="Habit Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Exercise, Read, Meditate"
                required
                autoFocus
              />
              <Input
                type="text"
                label="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description..."
              />
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Color
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-16 h-16 border-2 border-gray-200 dark:border-gray-600 rounded-xl cursor-pointer hover:border-primary-300 dark:hover:border-primary-500 transition-colors shadow-soft"
                  />
                  <div className="flex-1">
                    <div
                      className="h-12 rounded-xl shadow-soft border-2 border-gray-200 dark:border-gray-600"
                      style={{ backgroundColor: color }}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">{color}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="submit" variant="primary" className="flex-1">
                  ✓ Add Habit
                </Button>
                <Button type="button" onClick={handleCancel} variant="secondary" className="flex-1">
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <Button
              onClick={() => setIsAdding(true)}
              variant="primary"
              className="w-full"
            >
              ➕ Add New Habit
            </Button>
          )}

          {/* Habits List - Collapsible */}
          {habits.length > 0 && !isAdding && !editingId && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <button
                onClick={() => setShowHabitsList(!showHabitsList)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {habits.length} Habit{habits.length !== 1 ? 's' : ''}
                </span>
                <span className={`text-gray-500 dark:text-gray-400 transition-transform ${showHabitsList ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              
              {showHabitsList && (
                <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                  {habits.map((habit) => {
                if (editingId === habit.id) {
                  return (
                    <form
                      key={habit.id}
                      ref={formRef}
                      onSubmit={handleEditSubmit}
                      className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl space-y-4"
                    >
                      <h3 className="font-semibold text-lg">Edit Habit</h3>
                      <Input
                        ref={nameInputRef}
                        type="text"
                        label="Habit Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        autoFocus
                      />
                      <Input
                        type="text"
                        label="Description (optional)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Color
                        </label>
                        <div className="flex items-center gap-4">
                          <input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="w-16 h-16 border-2 border-gray-200 dark:border-gray-600 rounded-xl cursor-pointer hover:border-primary-300 dark:hover:border-primary-500 transition-colors shadow-soft"
                          />
                          <div className="flex-1">
                            <div
                              className="h-12 rounded-xl shadow-soft border-2 border-gray-200 dark:border-gray-600"
                              style={{ backgroundColor: color }}
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">{color}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button type="submit" variant="primary" className="flex-1">
                          ✓ Save
                        </Button>
                        <Button type="button" onClick={handleCancel} variant="secondary" className="flex-1">
                          Cancel
                        </Button>
                      </div>
                    </form>
                  );
                }

                    return (
                      <div
                        key={habit.id}
                        className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-between gap-3"
                        style={{ borderLeftColor: habit.color || '#6366f1', borderLeftWidth: '3px' }}
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                            {habit.name}
                          </h3>
                          {habit.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                              {habit.description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => handleEdit(habit)}
                            className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-600 dark:text-gray-400"
                            aria-label={`Edit ${habit.name}`}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete "${habit.name}"?`)) {
                                deleteHabit(habit.id);
                              }
                            }}
                            className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-red-600 dark:text-red-400"
                            aria-label={`Delete ${habit.name}`}
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          
          {habits.length === 0 && !isAdding && !editingId && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No habits yet. Add your first habit to get started!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

