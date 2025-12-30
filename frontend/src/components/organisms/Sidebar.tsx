/**
 * Sidebar organism component
 */

import { HabitList } from './HabitList';

export function Sidebar(): JSX.Element {
  return (
    <aside className="w-80 bg-gray-50 p-4 border-r overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Habits</h2>
      <HabitList />
    </aside>
  );
}

