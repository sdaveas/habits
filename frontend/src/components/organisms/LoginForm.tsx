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
    <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-black">
      <div className="w-full max-w-md border border-black dark:border-white rounded p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-black dark:text-white mb-2">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-black dark:text-white text-sm">
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

