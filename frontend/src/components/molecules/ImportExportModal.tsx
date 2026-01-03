/**
 * Import/Export Modal component
 */

import { useState, useRef, useEffect } from 'react';
import { useHabitStore } from '../../store/habitStore';
import { Button } from '../atoms/Button';
import { exportToCSV, downloadCSV, importFromCSV, readCSVFile } from '../../utils/csvImportExport';

interface ImportExportModalProps {
  onClose: () => void;
}

export function ImportExportModal({ onClose }: ImportExportModalProps): React.JSX.Element {
  const habitData = useHabitStore((state) => state.habitData);
  const setHabitData = useHabitStore((state) => state.setHabitData);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleExport = (): void => {
    if (!habitData) {
      alert('No habit data to export');
      return;
    }

    try {
      const csv = exportToCSV(habitData);
      const timestamp = new Date().toISOString().split('T')[0];
      downloadCSV(csv, `habits-export-${timestamp}.csv`);
    } catch (error) {
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleImportClick = (): void => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setImportError('Please select a CSV file');
      return;
    }

    setIsImporting(true);
    setImportError(null);
    setImportSuccess(false);

    try {
      const csvContent = await readCSVFile(file);
      const importedData = importFromCSV(csvContent);
      
      // Merge with existing data or replace
      if (habitData && habitData.habits.length > 0) {
        const shouldReplace = confirm(
          'You have existing habits. Do you want to replace all data with the imported data?\n\nClick OK to replace, or Cancel to merge.'
        );
        
        if (shouldReplace) {
          setHabitData(importedData);
        } else {
          // Merge: combine habits and completions
          const existingHabitIds = new Set(habitData.habits.map((h) => h.id));
          const newHabits = importedData.habits.filter((h) => !existingHabitIds.has(h.id));
          
          // For existing habits, merge completions
          const mergedHabits = habitData.habits.map((existingHabit) => {
            const importedHabit = importedData.habits.find((h) => h.id === existingHabit.id);
            if (importedHabit) {
              // Merge completions (avoid duplicates)
              const completionMap = new Map<string, string | undefined>();
              
              // Add existing completions
              existingHabit.completedDates.forEach((c) => {
                completionMap.set(c.date, c.comment);
              });
              
              // Add/update with imported completions
              importedHabit.completedDates.forEach((c) => {
                completionMap.set(c.date, c.comment);
              });
              
              const mergedCompletions = Array.from(completionMap.entries()).map(([date, comment]) => ({
                date,
                comment,
              }));
              
              return {
                ...existingHabit,
                completedDates: mergedCompletions.sort((a, b) => a.date.localeCompare(b.date)),
              };
            }
            return existingHabit;
          });
          
          setHabitData({
            habits: [...mergedHabits, ...newHabits],
            lastModified: new Date().toISOString(),
            version: 1,
          });
        }
      } else {
        setHabitData(importedData);
      }
      
      setImportSuccess(true);
      setTimeout(() => {
        setImportSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Failed to import CSV file');
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Close modal on ESC key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const hasHabits = habitData && habitData.habits.length > 0;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div
        ref={dropdownRef}
        className="bg-white dark:bg-black max-h-[calc(100vh-120px)] overflow-y-auto overscroll-contain border border-black dark:border-white rounded w-full max-w-2xl"
      >
      <div ref={modalContentRef} className="w-full">
        <div className="p-4 sm:p-6 border-b border-black dark:border-white sticky top-0 bg-white dark:bg-black z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-black dark:text-white">
              Import / Export
            </h2>
            <button
              onClick={onClose}
              className="p-2 border border-black dark:border-white bg-white dark:bg-black text-black dark:text-white rounded"
              aria-label="Close"
            >
              <span className="text-xl">×</span>
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Export Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-black dark:text-white">Export Data</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Download your habits and completion records as a CSV file.
            </p>
            <Button
              onClick={handleExport}
              variant="primary"
              className="w-full"
              disabled={!hasHabits}
            >
              {hasHabits ? '📥 Export to CSV' : 'No data to export'}
            </Button>
            {!hasHabits && (
              <p className="text-xs text-gray-500 dark:text-gray-500 italic">
                Add some habits first to export them
              </p>
            )}
          </div>

          {/* Import Section */}
          <div className="space-y-3 border-t border-black dark:border-white pt-6">
            <h3 className="text-lg font-semibold text-black dark:text-white">Import Data</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Import habits and completion records from a CSV file. You can merge with existing data or replace it.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              aria-label="Select CSV file"
            />
            <Button
              onClick={handleImportClick}
              variant="secondary"
              className="w-full"
              disabled={isImporting}
            >
              {isImporting ? '⏳ Importing...' : '📤 Import from CSV'}
            </Button>
            
            {importError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                <p className="text-sm text-red-800 dark:text-red-200">
                  <strong>Error:</strong> {importError}
                </p>
              </div>
            )}
            
            {importSuccess && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                <p className="text-sm text-green-800 dark:text-green-200">
                  ✓ Successfully imported data!
                </p>
              </div>
            )}
          </div>

          {/* Format Info */}
          <div className="space-y-2 border-t border-black dark:border-white pt-6">
            <h4 className="text-sm font-semibold text-black dark:text-white">CSV Format</h4>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <p>• Header: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">Habit ID,Habit Name,Description,Color,Created At,Completion Date,Comment</code></p>
              <p>• Each row represents one completion record</p>
              <p>• Habits with no completions are exported with empty Completion Date and Comment</p>
              <p>• Comments are optional</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

