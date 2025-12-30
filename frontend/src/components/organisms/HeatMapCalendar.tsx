/**
 * GitHub-style heat map calendar component
 * Shows combined activity at top, then each habit as a separate activity row
 */

import { useState, useMemo } from 'react';
import { useHabitStore } from '../../store/habitStore';
import {
  calculateIntensity,
  generateDateRange,
  getColorForIntensity,
  getDefaultDateRange,
  formatDate,
  getHabitsForDate,
} from '../../utils/calendarUtils';
import { format, isSameDay } from 'date-fns';
import type { Habit } from '../../types/HabitTypes';

// Stable empty array reference to prevent infinite loops
const EMPTY_HABITS: Habit[] = [];

export function HeatMapCalendar(): JSX.Element {
  const habitData = useHabitStore((state) => state.habitData);
  const habits = useMemo(() => habitData?.habits || EMPTY_HABITS, [habitData]);
  const markComplete = useHabitStore((state) => state.markComplete);
  const unmarkComplete = useHabitStore((state) => state.unmarkComplete);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [hoveredHabit, setHoveredHabit] = useState<Habit | null>(null);

  const { start, end } = getDefaultDateRange();
  const dates = useMemo(() => generateDateRange(start, end), [start, end]);

  // Calculate max intensity for combined view
  const maxIntensity = useMemo(() => {
    return Math.max(
      1,
      ...dates.map((date) => calculateIntensity(habits, date))
    );
  }, [dates, habits]);

  // Check if a habit is completed on a specific date
  const isHabitCompletedOnDate = (habit: Habit, date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return habit.completedDates.includes(dateStr);
  };

  const handleCellClick = (habit: Habit, date: Date): void => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const isCompleted = isHabitCompletedOnDate(habit, date);
    
    if (isCompleted) {
      unmarkComplete(habit.id, dateStr);
    } else {
      markComplete(habit.id, dateStr);
    }
  };

  const handleCellHover = (date: Date | null, habit: Habit | null): void => {
    setHoveredDate(date);
    setHoveredHabit(habit);
  };

  // Group dates by week for display
  const weeks = useMemo(() => {
    const weekGroups: Date[][] = [];
    let currentWeek: Date[] = [];

    dates.forEach((date, index) => {
      const dayOfWeek = date.getDay();
      
      // Start new week on Sunday or first day
      if (dayOfWeek === 0 || index === 0) {
        if (currentWeek.length > 0) {
          weekGroups.push(currentWeek);
        }
        currentWeek = [];
      }

      currentWeek.push(date);
    });

    if (currentWeek.length > 0) {
      weekGroups.push(currentWeek);
    }

    return weekGroups;
  }, [dates]);

  const handleCombinedCellClick = (date: Date): void => {
    const dateStr = format(date, 'yyyy-MM-dd');
    // Toggle all habits for this date
    habits.forEach((habit) => {
      const isCompleted = isHabitCompletedOnDate(habit, date);
      if (isCompleted) {
        unmarkComplete(habit.id, dateStr);
      } else {
        markComplete(habit.id, dateStr);
      }
    });
  };

  if (habits.length === 0) {
    return (
      <div className="w-full">
        <h2 className="text-2xl font-bold mb-4">Activity Calendar</h2>
        <p className="text-gray-500 text-center py-8">
          No habits yet. Add your first habit to see it on the calendar!
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4">Activity Calendar</h2>
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Combined Activity Board */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-32 text-sm font-semibold">All Activities</div>
              <div className="flex gap-1 flex-1">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {week.map((date) => {
                      const intensity = calculateIntensity(habits, date);
                      const color = getColorForIntensity(intensity, maxIntensity);
                      const isHovered = hoveredDate && isSameDay(date, hoveredDate) && !hoveredHabit;
                      const dateHabits = getHabitsForDate(habits, date);

                      return (
                        <div
                          key={date.toISOString()}
                          className="w-3 h-3 rounded-sm cursor-pointer transition-all"
                          style={{
                            backgroundColor: color,
                            border: isHovered ? '2px solid #000' : '1px solid rgba(0,0,0,0.1)',
                            transform: isHovered ? 'scale(1.2)' : 'scale(1)',
                          }}
                          onClick={() => handleCombinedCellClick(date)}
                          onMouseEnter={() => handleCellHover(date, null)}
                          onMouseLeave={() => handleCellHover(null, null)}
                          title={`${formatDate(date)}: ${intensity} habit${intensity !== 1 ? 's' : ''} completed`}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleCombinedCellClick(date);
                            }
                          }}
                          aria-label={`${formatDate(date)}: ${intensity} habit${intensity !== 1 ? 's' : ''} completed`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Individual Habit Rows */}
          <div className="space-y-2">
            {habits.map((habit) => {
              const habitColor = habit.color || '#40c463';
              
              return (
                <div key={habit.id} className="flex items-center gap-2">
                  <div className="w-32 text-sm font-medium truncate" title={habit.name}>
                    {habit.name}
                  </div>
                  <div className="flex gap-1 flex-1">
                    {weeks.map((week, weekIndex) => (
                      <div key={weekIndex} className="flex flex-col gap-1">
                        {week.map((date) => {
                          const isCompleted = isHabitCompletedOnDate(habit, date);
                          const isHovered = hoveredDate && isSameDay(date, hoveredDate) && hoveredHabit?.id === habit.id;
                          const color = isCompleted ? habitColor : '#ebedf0';

                          return (
                            <div
                              key={date.toISOString()}
                              className="w-3 h-3 rounded-sm cursor-pointer transition-all"
                              style={{
                                backgroundColor: color,
                                border: isHovered ? '2px solid #000' : '1px solid rgba(0,0,0,0.1)',
                                transform: isHovered ? 'scale(1.2)' : 'scale(1)',
                                opacity: isCompleted ? 1 : 0.3,
                              }}
                              onClick={() => handleCellClick(habit, date)}
                              onMouseEnter={() => handleCellHover(date, habit)}
                              onMouseLeave={() => handleCellHover(null, null)}
                              title={`${habit.name} - ${formatDate(date)}: ${isCompleted ? 'Completed' : 'Not completed'}`}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handleCellClick(habit, date);
                                }
                              }}
                              aria-label={`${habit.name} - ${formatDate(date)}: ${isCompleted ? 'Completed' : 'Not completed'}`}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {hoveredDate && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          {hoveredHabit ? (
            <>
              <p className="font-semibold">{hoveredHabit.name}</p>
              <p className="text-sm text-gray-600">{formatDate(hoveredDate)}</p>
              <p className="text-sm text-gray-600 mt-1">
                {isHabitCompletedOnDate(hoveredHabit, hoveredDate) ? '✓ Completed' : 'Not completed'}
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold">{formatDate(hoveredDate)}</p>
              <p className="text-sm text-gray-600">
                {calculateIntensity(habits, hoveredDate)} habit
                {calculateIntensity(habits, hoveredDate) !== 1 ? 's' : ''} completed
              </p>
              {getHabitsForDate(habits, hoveredDate).length > 0 && (
                <ul className="mt-2 text-sm">
                  {getHabitsForDate(habits, hoveredDate).map((habit) => (
                    <li key={habit.id}>• {habit.name}</li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      )}
      <div className="mt-4 flex items-center gap-4 text-sm">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-[#ebedf0]" />
          <div className="w-3 h-3 rounded-sm bg-[#9be9a8]" />
          <div className="w-3 h-3 rounded-sm bg-[#40c463]" />
          <div className="w-3 h-3 rounded-sm bg-[#30a14e]" />
          <div className="w-3 h-3 rounded-sm bg-[#216e39]" />
        </div>
        <span>More</span>
        <span className="ml-4 text-xs text-gray-500">
          (Each habit shows its own activity pattern)
        </span>
      </div>
    </div>
  );
}

