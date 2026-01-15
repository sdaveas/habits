/**
 * Login form organism component
 */

import { useState, FormEvent } from 'react';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { useAuth } from '../../hooks/useAuth';

export function LoginForm(): JSX.Element {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAbout, setShowAbout] = useState(false);
  const { handleLogin, handleRegister, isLoading } = useAuth();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);

    // Clear password from form state after use (security best practice)
    const passwordValue = password;
    setPassword('');

    try {
      if (isRegister) {
        await handleRegister(username, passwordValue);
      } else {
        await handleLogin(username, passwordValue);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-black">
      {/* About Modal - Floating overlay */}
      {isRegister && showAbout && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-black border border-black dark:border-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-black dark:text-white">
                Why Habit Calendar?
              </h3>
              <button
                onClick={() => setShowAbout(false)}
                className="p-2 border border-black dark:border-white bg-white dark:bg-black text-black dark:text-white rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Close"
              >
                <span className="text-xl">×</span>
              </button>
            </div>
            <div className="space-y-4 text-sm text-black dark:text-white">
              <div>
                <h4 className="font-semibold mb-1">📊 Visual Progress Tracking</h4>
                <p className="text-gray-700 dark:text-gray-300">
                  See your consistency at a glance with a GitHub-style heat map calendar. Watch your habits grow day by day.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-1">🔒 Zero-Knowledge Privacy</h4>
                <p className="text-gray-700 dark:text-gray-300">
                  Your data is encrypted on your device before syncing. We never see your habits or notes.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-1">📝 Add Context with Notes</h4>
                <p className="text-gray-700 dark:text-gray-300">
                  Include optional notes with each completion to track details and reflect on your progress.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-1">⚡ Works Offline</h4>
                <p className="text-gray-700 dark:text-gray-300">
                  Track habits without internet. Your data syncs automatically when you're back online.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-1">✏️ Edit Any Day</h4>
                <p className="text-gray-700 dark:text-gray-300">
                  Forgot to log a habit? Click any past day in the calendar to update it.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-1">💾 Export Your Data</h4>
                <p className="text-gray-700 dark:text-gray-300">
                  Import and export your habit data as CSV anytime. Your data is always yours.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Login/Signup Form */}
      <div className="w-full max-w-md border border-black dark:border-white rounded p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-black dark:text-white mb-2">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-black dark:text-white text-sm">
            {isRegister ? 'Start tracking your habits today' : 'Sign in to continue'}
          </p>
          {isRegister && (
            <button
              type="button"
              onClick={() => setShowAbout(!showAbout)}
              className="mt-4 text-black dark:text-white text-sm font-medium underline hover:no-underline"
            >
              {showAbout ? 'Hide features' : 'Why use Habit Calendar?'}
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Input
              type="text"
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
          <div>
            <Input
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />
          </div>
          {error && (
            <div className="p-4 border border-black dark:border-white text-black dark:text-white">
              <p className="font-semibold text-sm">{error}</p>
            </div>
          )}
          <div>
            <Button 
              type="submit" 
              disabled={isLoading} 
              variant="primary"
              className="w-full"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  Loading...
                </span>
              ) : (
                isRegister ? 'Create Account' : 'Sign In'
              )}
            </Button>
          </div>
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
                setShowAbout(false);
              }}
              className="text-black dark:text-white text-sm font-medium underline"
            >
              {isRegister
                ? 'Already have an account? Sign in'
                : "Don't have an account? Create one"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

