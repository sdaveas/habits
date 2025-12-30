/**
 * Auth guard component to protect routes
 */

import { ReactNode } from 'react';
import { useAuthStore } from '../../store/authStore';
import { LoginForm } from './LoginForm';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps): JSX.Element {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return <>{children}</>;
}

