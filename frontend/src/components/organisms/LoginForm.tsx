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
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {isRegister ? 'Register' : 'Login'}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <Input
            type="text"
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
          />
        </div>
        <div className="mb-4">
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
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <div className="mb-4">
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Loading...' : isRegister ? 'Register' : 'Login'}
          </Button>
        </div>
        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            {isRegister
              ? 'Already have an account? Login'
              : "Don't have an account? Register"}
          </button>
        </div>
      </form>
    </div>
  );
}

