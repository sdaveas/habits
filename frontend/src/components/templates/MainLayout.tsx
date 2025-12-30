/**
 * Main layout template component
 */

import { ReactNode } from 'react';
import { Header } from '../organisms/Header';
import { Sidebar } from '../organisms/Sidebar';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps): JSX.Element {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

