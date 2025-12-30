/**
 * GitHub-style heat map calendar component
 * Shows combined activity at top, then each habit as a separate activity row
 */

import { useState, useMemo, useRef, useEffect } from 'react';
import { useHabitStore } from '../../store/habitStore';
import { useThemeStore } from '../../store/themeStore';
import {
  calculateIntensity,
  generateDateRange,
  getDefaultDateRange,
  formatDate,
  getHabitsForDate,
} from '../../utils/calendarUtils';
import { format } from 'date-fns';
import type { Habit } from '../../types/HabitTypes';

// Stable empty array reference to prevent infinite loops
const EMPTY_HABITS: Habit[] = [];

export function HeatMapCalendar(): JSX.Element {
  const habitData = useHabitStore((state) => state.habitData);
  const habits = useMemo(() => habitData?.habits || EMPTY_HABITS, [habitData]);
  const markComplete = useHabitStore((state) => state.markComplete);
  const unmarkComplete = useHabitStore((state) => state.unmarkComplete);
  const theme = useThemeStore((state) => state.theme);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [hoveredHabit, setHoveredHabit] = useState<Habit | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const calendarScrollRef = useRef<HTMLDivElement | null>(null);
  const habitNameRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const { start, end } = getDefaultDateRange();
  const dates = useMemo(() => generateDateRange(start, end), [start, end]);

  // Auto-scroll to the right (current day) on mount and when habits change
  useEffect(() => {
    if (calendarScrollRef.current) {
      // Small delay to ensure DOM is fully rendered
      const timeoutId = setTimeout(() => {
        if (calendarScrollRef.current) {
          // Scroll to the right end to show the most recent dates (including today)
          calendarScrollRef.current.scrollLeft = calendarScrollRef.current.scrollWidth;
        }
      }, 150);
      
      return () => clearTimeout(timeoutId);
    }
  }, [habits.length, dates.length]);

  // Check if a habit is completed on a specific date
  const isHabitCompletedOnDate = (habit: Habit, date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return habit.completedDates.includes(dateStr);
  };

  const handleCellClick = (habit: Habit, date: Date): void => {
    // Only allow toggling for today or yesterday
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);
    
    const isToday = dateToCheck.getTime() === today.getTime();
    const isYesterday = dateToCheck.getTime() === yesterday.getTime();
    
    if (!isToday && !isYesterday) {
      return; // Don't allow editing history
    }
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const isCompleted = isHabitCompletedOnDate(habit, date);
    
    if (isCompleted) {
      unmarkComplete(habit.id, dateStr);
    } else {
      markComplete(habit.id, dateStr);
    }
  };

  const handleCellHover = (date: Date | null, habit: Habit | null): void => {
    // Clear any pending timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    if (date) {
      // Immediately show hover when entering a cell
      setHoveredDate(date);
      setHoveredHabit(habit);
    } else {
      // Delay clearing hover when leaving a cell to prevent flickering
      hoverTimeoutRef.current = setTimeout(() => {
        setHoveredDate(null);
        setHoveredHabit(null);
        hoverTimeoutRef.current = null;
      }, 150); // 150ms delay before hiding tooltip
    }
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

  // Auto-scroll to current day on mount
  useEffect(() => {
    if (calendarScrollRef.current) {
      const scrollContainer = calendarScrollRef.current;
      const scrollWidth = scrollContainer.scrollWidth;
      const clientWidth = scrollContainer.clientWidth;
      scrollContainer.scrollLeft = scrollWidth - clientWidth;
    }
  }, [weeks]);

  // Update habit name positions to keep them centered in viewport smoothly
  useEffect(() => {
    const updatePositions = (): void => {
      if (!calendarScrollRef.current) return;
      
      const container = calendarScrollRef.current;
      const containerRect = container.getBoundingClientRect();
      const viewportCenter = window.innerWidth / 2;
      const relativeLeft = viewportCenter - containerRect.left;
      
      // Update all habit name positions
      habitNameRefs.current.forEach((ref) => {
        if (ref) {
          ref.style.left = `${relativeLeft}px`;
        }
      });
    };

    const container = calendarScrollRef.current;
    if (!container) return;

    // Initial position
    updatePositions();

    // Use requestAnimationFrame for smooth updates during scroll
    let rafId: number | null = null;
    let isScrolling = false;

    const handleScroll = (): void => {
      if (!isScrolling) {
        isScrolling = true;
        const animate = (): void => {
          updatePositions();
          if (isScrolling) {
            rafId = requestAnimationFrame(animate);
          }
        };
        rafId = requestAnimationFrame(animate);
      }
    };

    const handleScrollEnd = (): void => {
      isScrolling = false;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      updatePositions();
    };

    // Update on scroll and resize
    container.addEventListener('scroll', handleScroll, { passive: true });
    container.addEventListener('scrollend', handleScrollEnd, { passive: true });
    window.addEventListener('resize', updatePositions, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      container.removeEventListener('scrollend', handleScrollEnd);
      window.removeEventListener('resize', updatePositions);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [habits]);

  if (habits.length === 0) {
    return (
      <div className="w-full">
        <h2 className="text-3xl font-bold mb-6 text-black dark:text-white">
          Activity Calendar
        </h2>
        <div className="bg-white dark:bg-black border border-black dark:border-white rounded p-6 sm:p-12 text-center">
          <p className="text-black dark:text-white font-medium text-base sm:text-lg mb-2">
            No habits yet
          </p>
          <p className="text-black dark:text-white text-sm">
            Add your first habit to see it on the calendar!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-black dark:text-white">
        Activity Calendar
      </h2>
      <div 
        ref={calendarScrollRef}
        className="bg-white dark:bg-black border border-black dark:border-white rounded p-3 sm:p-6 overflow-x-auto -mx-2 sm:mx-0"
      >
        <div className="inline-block min-w-full">
          {/* Individual Habit Rows */}
          <div className="space-y-4 sm:space-y-6 relative">
            {habits.map((habit) => {
              const todayDate = new Date();
              const today = format(todayDate, 'yyyy-MM-dd');
              const yesterdayDate = new Date(todayDate);
              yesterdayDate.setDate(yesterdayDate.getDate() - 1);
              const yesterday = format(yesterdayDate, 'yyyy-MM-dd');
              const isCompletedToday = habit.completedDates.includes(today);
              const isCompletedYesterday = habit.completedDates.includes(yesterday);
              
              const handleToggleToday = (): void => {
                if (isCompletedToday) {
                  unmarkComplete(habit.id, today);
                } else {
                  markComplete(habit.id, today);
                }
              };
              
              const handleToggleYesterday = (): void => {
                if (isCompletedYesterday) {
                  unmarkComplete(habit.id, yesterday);
                } else {
                  markComplete(habit.id, yesterday);
                }
              };
              
              return (
                <div key={habit.id} className="space-y-2 relative">
                  {/* Habit name and toggles in one row - sticky to viewport center */}
                  <div 
                    ref={(el) => {
                      if (el) {
                        habitNameRefs.current.set(habit.id, el);
                      } else {
                        habitNameRefs.current.delete(habit.id);
                      }
                    }}
                    className="sticky z-30 flex items-center justify-center gap-2 mb-2 w-fit bg-white dark:bg-black px-3 py-1.5 border border-black dark:border-white rounded"
                    style={{ 
                      transform: 'translateX(-50%)',
                    }}
                  >
                      <button
                        onClick={handleToggleYesterday}
                        className={`w-4 h-4 border border-black dark:border-white rounded flex-shrink-0 ${
                          isCompletedYesterday
                            ? 'bg-black dark:bg-white'
                            : 'bg-white dark:bg-black'
                        }`}
                        aria-label={`Mark ${habit.name} as ${isCompletedYesterday ? 'not done' : 'done'} yesterday`}
                        title={isCompletedYesterday ? 'Done yesterday - Click to undo' : 'Not done yesterday - Click to mark done'}
                      />
                      <h3 className="text-base sm:text-lg font-semibold text-black dark:text-white whitespace-nowrap" title={habit.name}>
                        {habit.name}
                      </h3>
                      <button
                        onClick={handleToggleToday}
                        className={`w-4 h-4 border border-black dark:border-white rounded flex-shrink-0 ${
                          isCompletedToday
                            ? 'bg-black dark:bg-white'
                            : 'bg-white dark:bg-black'
                        }`}
                        aria-label={`Mark ${habit.name} as ${isCompletedToday ? 'not done' : 'done'} today`}
                        title={isCompletedToday ? 'Done today - Click to undo' : 'Not done today - Click to mark done'}
                      />
                  </div>
                  {/* Heatmap row */}
                  <div className="flex gap-1 sm:gap-1.5 justify-center">
                    {weeks.map((week, weekIndex) => (
                      <div key={weekIndex} className="flex flex-col gap-1 sm:gap-1.5">
                        {week.map((date) => {
                          const isCompleted = isHabitCompletedOnDate(habit, date);
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const yesterday = new Date(today);
                          yesterday.setDate(yesterday.getDate() - 1);
                          const dateToCheck = new Date(date);
                          dateToCheck.setHours(0, 0, 0, 0);
                          const isToday = dateToCheck.getTime() === today.getTime();
                          const isYesterday = dateToCheck.getTime() === yesterday.getTime();
                          const isClickable = isToday || isYesterday;

                          return (
                            <div
                              key={date.toISOString()}
                              className="w-3 h-3 sm:w-4 sm:h-4 border border-black dark:border-white rounded relative"
                              style={{
                                backgroundColor: theme === 'light' 
                                  ? (isCompleted ? 'black' : 'white')
                                  : (isCompleted ? 'white' : 'black'),
                                minWidth: '12px',
                                minHeight: '12px',
                                cursor: isClickable ? 'pointer' : 'default',
                              }}
                              onClick={() => {
                                // Only allow clicking on today or yesterday
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                const yesterday = new Date(today);
                                yesterday.setDate(yesterday.getDate() - 1);
                                
                                const dateToCheck = new Date(date);
                                dateToCheck.setHours(0, 0, 0, 0);
                                
                                const isToday = dateToCheck.getTime() === today.getTime();
                                const isYesterday = dateToCheck.getTime() === yesterday.getTime();
                                
                                if (isToday || isYesterday) {
                                  handleCellClick(habit, date);
                                  handleCellHover(date, habit);
                                }
                              }}
                              onMouseEnter={() => handleCellHover(date, habit)}
                              onMouseLeave={() => handleCellHover(null, null)}
                              onTouchStart={() => handleCellHover(date, habit)}
                              title={`${habit.name} - ${formatDate(date)}: ${isCompleted ? 'Completed' : 'Not completed'}`}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0);
                                  const yesterday = new Date(today);
                                  yesterday.setDate(yesterday.getDate() - 1);
                                  
                                  const dateToCheck = new Date(date);
                                  dateToCheck.setHours(0, 0, 0, 0);
                                  
                                  const isToday = dateToCheck.getTime() === today.getTime();
                                  const isYesterday = dateToCheck.getTime() === yesterday.getTime();
                                  
                                  if (isToday || isYesterday) {
                                    handleCellClick(habit, date);
                                  }
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
      
      {hoveredDate ? (
        <div 
          className="fixed bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-50 p-3 sm:p-4 bg-white dark:bg-black border border-black dark:border-white rounded max-w-md w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)]"
          onMouseEnter={() => {
            if (hoverTimeoutRef.current) {
              clearTimeout(hoverTimeoutRef.current);
              hoverTimeoutRef.current = null;
            }
          }}
          onMouseLeave={() => handleCellHover(null, null)}
          onTouchStart={() => {
            if (hoverTimeoutRef.current) {
              clearTimeout(hoverTimeoutRef.current);
              hoverTimeoutRef.current = null;
            }
          }}
        >
          {hoveredHabit ? (
            <>
              <p className="font-bold text-lg text-black dark:text-white mb-1">{hoveredHabit.name}</p>
              <p className="text-sm text-black dark:text-white font-medium mb-2">{formatDate(hoveredDate)}</p>
              <p className="text-sm font-semibold text-black dark:text-white">
                {isHabitCompletedOnDate(hoveredHabit, hoveredDate) ? 'Completed' : 'Not completed'}
              </p>
            </>
          ) : (
            <>
              <p className="font-bold text-lg text-black dark:text-white mb-1">{formatDate(hoveredDate)}</p>
              <p className="text-sm text-black dark:text-white font-medium mb-2">
                {calculateIntensity(habits, hoveredDate)} habit
                {calculateIntensity(habits, hoveredDate) !== 1 ? 's' : ''} completed
              </p>
              {getHabitsForDate(habits, hoveredDate).length > 0 && (
                <ul className="mt-3 space-y-1">
                  {getHabitsForDate(habits, hoveredDate).map((habit) => (
                    <li key={habit.id} className="text-sm text-black dark:text-white flex items-center gap-2">
                      <span 
                        className="w-3 h-3 border border-black dark:border-white rounded inline-block"
                        style={{ backgroundColor: theme === 'light' ? 'black' : 'white' }}
                      />
                      {habit.name}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      ) : null}
      <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-white dark:bg-black border border-black dark:border-white rounded flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
        <span className="font-medium text-black dark:text-white">Less</span>
        <div className="flex gap-1 sm:gap-1.5">
          <div className="w-3 h-3 sm:w-4 sm:h-4 border border-black dark:border-white rounded bg-white dark:bg-black" />
          <div className="w-3 h-3 sm:w-4 sm:h-4 border border-black dark:border-white rounded bg-black dark:bg-white" />
        </div>
        <span className="font-medium text-black dark:text-white">More</span>
      </div>
    </div>
  );
}

