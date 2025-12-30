/**
 * Add habit form molecule component
 */

import { useState } from 'react';
import type { FormEvent } from 'react';
import { useHabitStore } from '../../store/habitStore';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';

export function AddHabitForm(): JSX.Element {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [isOpen, setIsOpen] = useState(false);
  const addHabit = useHabitStore((state) => state.addHabit);

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
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
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full px-3 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors touch-manipulation flex items-center justify-center gap-2"
        aria-label="Add new habit"
      >
        <span className="text-base">➕</span>
        <span className="hidden sm:inline">Add Habit</span>
      </button>
    );
  }

  return (
    <form 
      onSubmit={handleSubmit} 
      className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-medium border-2 border-gray-100 dark:border-gray-700 animate-slide-down space-y-3 sm:space-y-4"
    >
      <div>
        <Input
          type="text"
          label="Habit Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g., Exercise, Read, Meditate"
          autoFocus
        />
      </div>
      <div>
        <Input
          type="text"
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description..."
        />
      </div>
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
      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="primary" className="flex-1">
          ✓ Add Habit
        </Button>
        <Button
          type="button"
          onClick={() => {
            setIsOpen(false);
            setName('');
            setDescription('');
          }}
          variant="secondary"
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

