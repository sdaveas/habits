/**
 * Main layout template component
 */

import type { ReactNode } from 'react';
import { Header } from '../organisms/Header';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps): JSX.Element {
  return (
    <div className="min-h-screen bg-gradient-soft dark:bg-gradient-soft-dark">
      <Header />
      <main className="p-3 sm:p-4 lg:p-8 animate-fade-in w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}

