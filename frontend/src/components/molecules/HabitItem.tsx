/**
 * Habit item molecule component
 */

import { useState } from 'react';
import { useHabitStore } from '../../store/habitStore';
import { Button } from '../atoms/Button';
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
      <div className="p-4 border rounded-lg mb-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border rounded mb-2"
          placeholder="Habit name"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border rounded mb-2"
          placeholder="Description (optional)"
          rows={2}
        />
        <div className="flex gap-2">
          <Button onClick={handleSave} variant="primary">
            Save
          </Button>
          <Button onClick={handleCancel} variant="secondary">
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg mb-2">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{habit.name}</h3>
          {habit.description && (
            <p className="text-gray-600 text-sm mt-1">{habit.description}</p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Created: {format(new Date(habit.createdAt), 'MMM d, yyyy')}
          </p>
        </div>
        <div className="flex gap-2 ml-4">
          <Button
            onClick={handleToggleToday}
            variant={isCompletedToday ? 'secondary' : 'primary'}
          >
            {isCompletedToday ? 'Undo Today' : 'Done Today'}
          </Button>
          <Button onClick={() => setIsEditing(true)} variant="secondary">
            Edit
          </Button>
          <Button onClick={() => deleteHabit(habit.id)} variant="danger">
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

