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

interface HabitManagementModalProps {
  onClose: () => void;
  buttonRef?: React.RefObject<HTMLButtonElement>;
  initialMode?: 'add' | 'manage';
}

export function HabitManagementModal({ onClose, initialMode = 'manage' }: HabitManagementModalProps): JSX.Element {
  const habitData = useHabitStore((state) => state.habitData);
  const habits = useMemo(() => habitData?.habits || [], [habitData]);
  const addHabit = useHabitStore((state) => state.addHabit);
  const updateHabit = useHabitStore((state) => state.updateHabit);
  const deleteHabit = useHabitStore((state) => state.deleteHabit);

  const [isAdding, setIsAdding] = useState(initialMode === 'add');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [showHabitsList, setShowHabitsList] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  
  // Hide habits list when adding/editing
  const shouldShowHabitsList = showHabitsList && !isAdding && !editingId;
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
    
    // Close modal and scroll to top of page
    onClose();
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    
    // Close modal and scroll to top of page
    onClose();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = (): void => {
    setName('');
    setDescription('');
    setColor('#6366f1');
    setIsAdding(false);
    setEditingId(null);
    setShowHabitsList(false);
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Close modal on ESC key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Scroll form into view when adding/editing
  useEffect(() => {
    if ((isAdding || editingId) && formRef.current && modalContentRef.current) {
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
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div
        ref={dropdownRef}
        className="bg-white dark:bg-black max-h-[calc(100vh-120px)] overflow-y-auto overscroll-contain border border-black dark:border-white rounded w-full max-w-2xl"
      >
      <div
        ref={modalContentRef}
        className="w-full"
      >
        <div className="p-4 sm:p-6 border-b border-black dark:border-white sticky top-0 bg-white dark:bg-black z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-black dark:text-white">
              Manage Habits
            </h2>
            <button
              onClick={onClose}
              className="p-2 border border-black dark:border-white bg-white dark:bg-black text-black dark:text-white rounded"
              aria-label="Close"
            >
              <span className="text-xl">×</span>
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          {/* Add Habit Form */}
          {isAdding ? (
            <form 
              ref={formRef}
              onSubmit={handleAddSubmit} 
              className="p-4 border border-black dark:border-white rounded space-y-4"
            >
              <h3 className="font-semibold text-lg text-black dark:text-white">Add New Habit</h3>
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
              <div className="flex gap-3">
                <Button type="submit" variant="primary" className="flex-1">
                  Add Habit
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
              Add New Habit
            </Button>
          )}

          {/* Edit Habit Form */}
          {editingId && (() => {
            const habitToEdit = habits.find((h) => h.id === editingId);
            if (!habitToEdit) return null;
            return (
              <form
                ref={formRef}
                onSubmit={handleEditSubmit}
                className="p-4 border border-black dark:border-white rounded space-y-4"
              >
                <h3 className="font-semibold text-lg text-black dark:text-white">Edit Habit</h3>
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
                <div className="flex gap-3">
                  <Button type="submit" variant="primary" className="flex-1">
                    Save
                  </Button>
                  <Button type="button" onClick={handleCancel} variant="secondary" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            );
          })()}

          {/* Habits List - Collapsible */}
          {habits.length > 0 && !isAdding && !editingId && (
            <div className="border-t border-black dark:border-white pt-4">
              <button
                onClick={() => setShowHabitsList(!showHabitsList)}
                className="w-full flex items-center justify-between p-3 border border-black dark:border-white rounded bg-white dark:bg-black text-black dark:text-white"
              >
                <span className="font-semibold">
                  {habits.length} Habit{habits.length !== 1 ? 's' : ''}
                </span>
                <span className="text-black dark:text-white">
                  {showHabitsList ? '▼' : '▶'}
                </span>
              </button>
              
              {shouldShowHabitsList && (
                <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                  {habits.map((habit) => (
                    <div
                      key={habit.id}
                      className="p-3 border border-black dark:border-white rounded flex items-center justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-black dark:text-white truncate">
                          {habit.name}
                        </h3>
                        {habit.description && (
                          <p className="text-xs text-black dark:text-white truncate mt-0.5">
                            {habit.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => handleEdit(habit)}
                          className="p-1.5 border border-black dark:border-white rounded bg-white dark:bg-black text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                          aria-label={`Edit ${habit.name}`}
                          title="Edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (pendingDeleteId === habit.id) {
                              // Second click - confirm deletion
                              deleteHabit(habit.id);
                              setPendingDeleteId(null);
                              // Close modal and scroll to top
                              onClose();
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            } else {
                              // First click - mark for deletion
                              setPendingDeleteId(habit.id);
                              // Reset after 3 seconds if no second click
                              setTimeout(() => {
                                setPendingDeleteId(null);
                              }, 3000);
                            }
                          }}
                          className={`p-1.5 border rounded ${
                            pendingDeleteId === habit.id
                              ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                              : 'border-black dark:border-white bg-white dark:bg-black text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                          aria-label={`Delete ${habit.name}`}
                          title={pendingDeleteId === habit.id ? 'Click again to confirm deletion' : 'Delete'}
                        >
                          {pendingDeleteId === habit.id ? 'Confirm?' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {habits.length === 0 && !isAdding && !editingId && (
            <div className="text-center py-8 text-black dark:text-white">
              No habits yet. Add your first habit to get started!
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}

