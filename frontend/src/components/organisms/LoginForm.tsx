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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-soft">
      <div className="w-full max-w-md glass-strong rounded-3xl shadow-strong p-8 animate-scale-in">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {isRegister ? 'Start tracking your habits today' : 'Sign in to continue'}
          </p>
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
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl animate-slide-down">
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
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
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
              }}
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium transition-colors"
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

