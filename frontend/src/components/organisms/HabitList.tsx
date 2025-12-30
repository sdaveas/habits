/**
 * Habit list organism component
 */

import { useState, useMemo } from 'react';
import { useHabitStore } from '../../store/habitStore';
import { HabitItem } from '../molecules/HabitItem';
import { AddHabitForm } from '../molecules/AddHabitForm';
import { Input } from '../atoms/Input';

// Stable empty array reference to prevent infinite loops
const EMPTY_HABITS: never[] = [];

export function HabitList(): JSX.Element {
  const habitData = useHabitStore((state) => state.habitData);
  const habits = useMemo(() => habitData?.habits || EMPTY_HABITS, [habitData]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHabits = habits.filter((habit) =>
    habit.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full">
      <div className="mb-4">
        <AddHabitForm />
      </div>
      {habits.length > 0 && (
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Search habits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}
      <div>
        {filteredHabits.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            {habits.length === 0
              ? 'No habits yet. Add your first habit to get started!'
              : 'No habits match your search.'}
          </p>
        ) : (
          filteredHabits.map((habit) => (
            <HabitItem key={habit.id} habit={habit} />
          ))
        )}
      </div>
    </div>
  );
}

