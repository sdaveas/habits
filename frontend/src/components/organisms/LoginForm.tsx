/**
 * Login form organism component
 */

import { useState, FormEvent } from 'react';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { useAuth } from '../../hooks/useAuth';
import { useWalletAuth } from '../../hooks/useWalletAuth';

export function LoginForm(): JSX.Element {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'password' | 'wallet'>('password');
  const [error, setError] = useState<string | null>(null);
  const { handleLogin, handleRegister, isLoading } = useAuth();
  const { handleWalletLogin, handleWalletRegister, isLoading: isWalletLoading, wallet } = useWalletAuth();

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

  const handleWalletSubmit = async (): Promise<void> => {
    setError(null);
    try {
      if (isRegister) {
        await handleWalletRegister();
      } else {
        await handleWalletLogin();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wallet authentication failed');
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

        {/* Login method toggle */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => {
              setLoginMethod('password');
              setError(null);
            }}
            className={`flex-1 py-2 px-4 border border-black dark:border-white font-medium ${
              loginMethod === 'password'
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'bg-white text-black dark:bg-black dark:text-white'
            }`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMethod('wallet');
              setError(null);
            }}
            className={`flex-1 py-2 px-4 border border-black dark:border-white font-medium ${
              loginMethod === 'wallet'
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'bg-white text-black dark:bg-black dark:text-white'
            }`}
          >
            Wallet
          </button>
        </div>

        {loginMethod === 'password' ? (
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
        ) : (
          <div className="space-y-5">
            <div className="p-4 border border-black dark:border-white">
              <p className="text-sm text-black dark:text-white mb-2">
                {isRegister
                  ? 'Connect your wallet to create an account'
                  : 'Connect your wallet to sign in'}
              </p>
              {wallet.isConnected && (
                <p className="text-xs text-black dark:text-white">
                  Connected: {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                </p>
              )}
            </div>

            {error && (
              <div className="p-4 border border-black dark:border-white text-black dark:text-white">
                <p className="font-semibold text-sm">{error}</p>
              </div>
            )}

            <Button
              onClick={handleWalletSubmit}
              disabled={isWalletLoading}
              variant="primary"
              className="w-full"
            >
              {isWalletLoading ? (
                <span className="flex items-center justify-center gap-2">
                  Connecting...
                </span>
              ) : (
                `${isRegister ? 'Register' : 'Sign In'} with Wallet`
              )}
            </Button>

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
          </div>
        )}
      </div>
    </div>
  );
}

