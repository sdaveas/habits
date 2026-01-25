/**
 * About modal component - explains how to use the app and its benefits
 */

import { Button } from '../atoms/Button';

interface AboutModalProps {
  onClose: () => void;
}

export function AboutModal({ onClose }: AboutModalProps): React.JSX.Element {
  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-black border border-black dark:border-white rounded-lg p-6 max-w-2xl w-full my-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-black dark:text-white">
            About Habit Calendar
          </h2>
          <button
            onClick={onClose}
            className="p-2 border border-black dark:border-white bg-white dark:bg-black text-black dark:text-white rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Close"
          >
            <span className="text-xl">×</span>
          </button>
        </div>

        <div className="space-y-6 text-black dark:text-white">
          {/* What is this? */}
          <section>
            <h3 className="text-xl font-bold mb-3">What is Habit Calendar?</h3>
            <p className="text-sm leading-relaxed">
              A zero-knowledge habit tracker that helps you build and maintain positive habits. 
              Visualize your progress with a GitHub-style heat map calendar and track your consistency over time.
            </p>
          </section>

          {/* How to use */}
          <section>
            <h3 className="text-xl font-bold mb-3">How to Use</h3>
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-semibold mb-1">1. Create Habits</h4>
                <p className="text-gray-700 dark:text-gray-300">
                  Click <span className="font-medium">Menu → New Habit</span> to add habits you want to track. 
                  Give each habit a name and optional description.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-1">2. Track Daily</h4>
                <p className="text-gray-700 dark:text-gray-300">
                  Use the quick toggle buttons next to each habit name (yesterday/today) or click any day 
                  in the calendar to mark habits as complete. Add optional notes to remember what you did.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-1">3. Build Streaks</h4>
                <p className="text-gray-700 dark:text-gray-300">
                  Watch your calendar fill up with completed habits. The more consistent you are, 
                  the more filled squares you'll see. Hover over any day to see details.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-1">4. Manage & Review</h4>
                <p className="text-gray-700 dark:text-gray-300">
                  Use <span className="font-medium">Menu → Manage Habits</span> to reorder, edit, or archive habits. 
                  Export your data anytime via <span className="font-medium">Import/Export</span>.
                </p>
              </div>
            </div>
          </section>

          {/* Benefits */}
          <section>
            <h3 className="text-xl font-bold mb-3">Why Use Habit Calendar?</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                <span><span className="font-semibold">Visual Progress:</span> See your consistency at a glance with the heat map calendar</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                <span><span className="font-semibold">Zero-Knowledge Privacy:</span> All your data is encrypted on your device before syncing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                <span><span className="font-semibold">Add Context:</span> Include notes with each completion to track details and reflect</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                <span><span className="font-semibold">Offline Support:</span> Works without internet, syncs when you're back online</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                <span><span className="font-semibold">Edit History:</span> Forgot to log a habit? Click any past day to update it</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                <span><span className="font-semibold">Data Portability:</span> Export/import your data as CSV anytime</span>
              </li>
            </ul>
          </section>

          {/* Tips */}
          <section>
            <h3 className="text-xl font-bold mb-3">Tips for Success</h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>• Start with 2-3 habits you can realistically do every day</li>
              <li>• Check in daily, ideally at the same time each day</li>
              <li>• Use notes to celebrate wins and learn from challenges</li>
              <li>• Don't break the chain - aim for consistency over perfection</li>
              <li>• Review your calendar weekly to spot patterns and adjust</li>
            </ul>
          </section>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-300 dark:border-gray-700 space-y-4">
          <div className="text-center">
            <a
              href="https://github.com/sdaveas/habits"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              View on GitHub
            </a>
          </div>
          <Button
            onClick={onClose}
            variant="primary"
            className="w-full"
          >
            Got it!
          </Button>
        </div>
      </div>
    </div>
  );
}
