/**
 * Add habit form molecule component
 */

import { useState, FormEvent } from 'react';
import { useHabitStore } from '../../store/habitStore';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';

export function AddHabitForm(): JSX.Element {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3b82f6');
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
    setColor('#3b82f6');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} variant="primary">
        + Add Habit
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-lg mb-4">
      <div className="mb-3">
        <Input
          type="text"
          label="Habit Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g., Exercise, Read, Meditate"
        />
      </div>
      <div className="mb-3">
        <Input
          type="text"
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description..."
        />
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Color
        </label>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-full h-10 border rounded"
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" variant="primary">
          Add Habit
        </Button>
        <Button
          type="button"
          onClick={() => {
            setIsOpen(false);
            setName('');
            setDescription('');
          }}
          variant="secondary"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

