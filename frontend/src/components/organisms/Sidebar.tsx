/**
 * Sidebar organism component
 */

import { HabitList } from './HabitList';
import { AddHabitForm } from './../molecules/AddHabitForm';

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps): JSX.Element {
  return (
    <aside className="w-80 h-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-strong border-r border-gray-200/50 dark:border-gray-700/50 overflow-y-auto">
      <div className="p-4 sm:p-6 sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 z-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Habits
          </h2>
          {/* Close button for mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Close menu"
            >
              <span className="text-xl">×</span>
            </button>
          )}
        </div>
        <AddHabitForm />
      </div>
      <div className="p-4 sm:p-6">
        <HabitList />
      </div>
    </aside>
  );
}

