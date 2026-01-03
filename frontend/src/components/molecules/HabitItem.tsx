/**
 * Habit item molecule component
 */

import { useState, useEffect, useRef } from 'react';
import { useHabitStore } from '../../store/habitStore';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import type { Habit } from '../../types/HabitTypes';
import { getCompletionForDate, isDateCompleted } from '../../types/HabitTypes';
import { format } from 'date-fns';

interface HabitItemProps {
  habit: Habit;
}

export function HabitItem({ habit }: HabitItemProps): React.JSX.Element {
  const [isEditing, setIsEditing] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [name, setName] = useState(habit.name);
  const [description, setDescription] = useState(habit.description || '');
  const [color, setColor] = useState(habit.color || '#6366f1');
  const [pendingDelete, setPendingDelete] = useState(false);
  const updateHabit = useHabitStore((state) => state.updateHabit);
  const deleteHabit = useHabitStore((state) => state.deleteHabit);
  const markComplete = useHabitStore((state) => state.markComplete);
  const unmarkComplete = useHabitStore((state) => state.unmarkComplete);
  const updateCompletionComment = useHabitStore((state) => state.updateCompletionComment);

  // Sync state with habit prop when habit ID changes (but not when editing)
  // Using habit.id as key ensures we reset when switching habits
  const prevHabitIdRef = useRef(habit.id);
  useEffect(() => {
    if (prevHabitIdRef.current !== habit.id && !isEditing) {
      prevHabitIdRef.current = habit.id;
      // Use setTimeout to defer state updates and avoid synchronous setState warning
      setTimeout(() => {
        setName(habit.name);
        setDescription(habit.description || '');
        setColor(habit.color || '#6366f1');
      }, 0);
    }
  }, [habit.id, habit.name, habit.description, habit.color, isEditing]);

  const today = format(new Date(), 'yyyy-MM-dd');
  const isCompletedToday = isDateCompleted(habit.completedDates, today);
  const todayCompletion = getCompletionForDate(habit.completedDates, today);
  const habitColor = habit.color || '#6366f1';
  
  // Sort completions by date (newest first)
  const sortedCompletions = [...habit.completedDates].sort((a, b) => 
    b.date.localeCompare(a.date)
  );

  const handleSave = (): void => {
    updateHabit(habit.id, { 
      name, 
      description: description || undefined,
      color: color || undefined,
    });
    setIsEditing(false);
    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = (): void => {
    setName(habit.name);
    setDescription(habit.description || '');
    setColor(habit.color || '#6366f1');
    setIsEditing(false);
  };

  const handleToggleToday = (): void => {
    setSelectedDate(today);
    if (isCompletedToday) {
      // If already completed, open comment modal to edit/remove
      setComment(todayCompletion?.comment || '');
    } else {
      // If not completed, open comment modal to add with optional comment
      setComment('');
    }
    setShowCommentModal(true);
  };

  const handleEditComment = (date: string): void => {
    setSelectedDate(date);
    const completion = getCompletionForDate(habit.completedDates, date);
    setComment(completion?.comment || '');
    setShowCommentModal(true);
  };

  const handleCommentSubmit = (): void => {
    if (!selectedDate) return;
    
    const isCompleted = isDateCompleted(habit.completedDates, selectedDate);
    
    if (isCompleted) {
      if (comment.trim()) {
        // Update comment
        updateCompletionComment(habit.id, selectedDate, comment.trim());
      } else {
        // Remove comment (but keep completion)
        updateCompletionComment(habit.id, selectedDate, '');
      }
    } else {
      // Mark as complete with comment
      markComplete(habit.id, selectedDate, comment.trim() || undefined);
    }
    setShowCommentModal(false);
    setComment('');
    setSelectedDate(null);
  };

  const handleRemoveCompletion = (): void => {
    if (!selectedDate) return;
    unmarkComplete(habit.id, selectedDate);
    setShowCommentModal(false);
    setComment('');
    setSelectedDate(null);
  };

  if (isEditing) {
    console.log('Rendering edit form, isEditing is true');
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-medium border-2 border-gray-100 dark:border-gray-700 animate-scale-in">
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Edit Habit</h3>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Habit name"
            autoFocus
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:shadow-glow resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
            placeholder="Description (optional)"
            rows={3}
          />
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} variant="primary" className="flex-1">
              Save
            </Button>
            <Button onClick={handleCancel} variant="secondary" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  console.log('Rendering habit item, isEditing is false');

  return (
    <>
      <div 
        className="group p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-soft border-l-4 transition-all duration-300 hover:shadow-medium hover:scale-[1.02]"
        style={{ borderLeftColor: habitColor }}
      >
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg sm:text-xl text-gray-900 dark:text-gray-100 mb-1">{habit.name}</h3>
            {habit.description && (
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 sm:mb-3 leading-relaxed">{habit.description}</p>
            )}
            {isCompletedToday && todayCompletion?.comment && (
              <div className="mb-2 sm:mb-3 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Today's note:</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{todayCompletion.comment}"</p>
              </div>
            )}
            {habit.completedDates.length > 0 && (
              <div className="mb-2 sm:mb-3">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium flex items-center gap-1"
                >
                  {showHistory ? '▼' : '▶'} {habit.completedDates.length} completion{habit.completedDates.length !== 1 ? 's' : ''}
                </button>
                {showHistory && (
                  <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                    {sortedCompletions.map((completion) => {
                      const completionDate = new Date(completion.date);
                      const isToday = completion.date === today;
                      return (
                        <div
                          key={completion.date}
                          className="p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                {isToday ? 'Today' : format(completionDate, 'MMM d, yyyy')}
                              </p>
                              {completion.comment ? (
                                <p className="text-sm text-gray-600 dark:text-gray-400 italic mt-1">
                                  "{completion.comment}"
                                </p>
                              ) : (
                                <p className="text-xs text-gray-400 dark:text-gray-500 italic mt-1">No note</p>
                              )}
                            </div>
                            <button
                              onClick={() => handleEditComment(completion.date)}
                              className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                            >
                              {completion.comment ? 'Edit' : 'Add Note'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
              Created: {format(new Date(habit.createdAt), 'MMM d, yyyy')}
            </p>
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0">
            <Button
              onClick={handleToggleToday}
              variant={isCompletedToday ? 'secondary' : 'primary'}
              className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 whitespace-nowrap touch-manipulation"
            >
              {isCompletedToday ? 'Edit Note' : '✓ Done Today'}
            </Button>
            <div className="flex gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Edit button clicked, current isEditing:', isEditing);
                  setIsEditing((prev) => {
                    console.log('Setting isEditing from', prev, 'to true');
                    return true;
                  });
                }}
                className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 border border-black dark:border-white rounded bg-white dark:bg-black text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 touch-manipulation cursor-pointer"
              >
                Edit
              </button>
              <Button 
                onClick={() => {
                  if (pendingDelete) {
                    // Second click - confirm deletion
                    deleteHabit(habit.id);
                    setPendingDelete(false);
                    // Scroll to top of page
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    // First click - mark for deletion
                    setPendingDelete(true);
                    // Reset after 3 seconds if no second click
                    setTimeout(() => {
                      setPendingDelete(false);
                    }, 3000);
                  }
                }}
                variant={pendingDelete ? 'danger' : 'secondary'}
                className={`text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 touch-manipulation ${
                  pendingDelete ? 'animate-pulse' : ''
                }`}
              >
                {pendingDelete ? 'Confirm?' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Comment Modal */}
      {showCommentModal && selectedDate && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-black border border-black dark:border-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-black dark:text-white mb-2">
              {(() => {
                const isCompleted = isDateCompleted(habit.completedDates, selectedDate);
                const isToday = selectedDate === today;
                if (isCompleted) {
                  return 'Edit Note';
                }
                return isToday ? 'Mark as Done' : `Mark as Done for ${format(new Date(selectedDate), 'MMM d, yyyy')}`;
              })()}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {selectedDate === today ? 'Today' : format(new Date(selectedDate), 'MMMM d, yyyy')}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-4 italic">
              Add a note (optional) to remember what you did or how it went
            </p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Type your note here... (e.g., 'Ran 5km in the park', 'Read chapter 3', 'Felt great!')"
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-black text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none mb-4"
              rows={5}
              autoFocus
            />
            <div className="flex gap-3">
              <Button
                onClick={handleCommentSubmit}
                variant="primary"
                className="flex-1"
              >
                {isDateCompleted(habit.completedDates, selectedDate) ? 'Save' : 'Mark Done'}
              </Button>
              {isDateCompleted(habit.completedDates, selectedDate) && (
                <Button
                  onClick={handleRemoveCompletion}
                  variant="danger"
                  className="flex-1"
                >
                  Remove
                </Button>
              )}
              <Button
                onClick={() => {
                  setShowCommentModal(false);
                  setComment('');
                  setSelectedDate(null);
                }}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

