/**
 * Habit list organism component
 */

import { useState, useMemo } from 'react';
import { useHabitStore } from '../../store/habitStore';
import { HabitItem } from '../molecules/HabitItem';
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
    <div className="w-full space-y-4 sm:space-y-6">
      {habits.length > 0 && (
        <div>
          <Input
            type="text"
            placeholder="🔍 Search habits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white/80 dark:bg-gray-700/80"
          />
        </div>
      )}
      <div className="space-y-3">
        {filteredHabits.length === 0 ? (
          <div className="text-center py-12 px-4 animate-fade-in">
            <div className="text-6xl mb-4">🎯</div>
            <p className="text-gray-600 dark:text-gray-300 font-medium text-lg mb-2">
              {habits.length === 0
                ? 'No habits yet'
                : 'No habits match your search'}
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {habits.length === 0
                ? 'Add your first habit to get started!'
                : 'Try a different search term.'}
            </p>
          </div>
        ) : (
          filteredHabits.map((habit, index) => (
            <div
              key={habit.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <HabitItem habit={habit} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

