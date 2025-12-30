/**
 * Habit item molecule component
 */

import { useState } from 'react';
import { useHabitStore } from '../../store/habitStore';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import type { Habit } from '../../types/HabitTypes';
import { format } from 'date-fns';

interface HabitItemProps {
  habit: Habit;
}

export function HabitItem({ habit }: HabitItemProps): JSX.Element {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(habit.name);
  const [description, setDescription] = useState(habit.description || '');
  const updateHabit = useHabitStore((state) => state.updateHabit);
  const deleteHabit = useHabitStore((state) => state.deleteHabit);
  const markComplete = useHabitStore((state) => state.markComplete);
  const unmarkComplete = useHabitStore((state) => state.unmarkComplete);

  const today = format(new Date(), 'yyyy-MM-dd');
  const isCompletedToday = habit.completedDates.includes(today);
  const habitColor = habit.color || '#6366f1';

  const handleSave = (): void => {
    updateHabit(habit.id, { name, description: description || undefined });
    setIsEditing(false);
  };

  const handleCancel = (): void => {
    setName(habit.name);
    setDescription(habit.description || '');
    setIsEditing(false);
  };

  const handleToggleToday = (): void => {
    if (isCompletedToday) {
      unmarkComplete(habit.id, today);
    } else {
      markComplete(habit.id, today);
    }
  };

  if (isEditing) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-medium border-2 border-gray-100 dark:border-gray-700 animate-scale-in">
        <div className="space-y-4">
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Habit name"
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

  return (
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
            {isCompletedToday ? 'Done' : 'Done Today'}
          </Button>
          <div className="flex gap-1.5 sm:gap-2">
            <Button 
              onClick={() => setIsEditing(true)} 
              variant="secondary"
              className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 touch-manipulation"
            >
              Edit
            </Button>
            <Button 
              onClick={() => deleteHabit(habit.id)} 
              variant="danger"
              className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 touch-manipulation"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

