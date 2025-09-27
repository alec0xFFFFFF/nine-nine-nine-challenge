'use client';

import { ThemeProvider } from '@/contexts/ThemeContext';
import ThemeToggle from './ui/ThemeToggle';

interface LayoutProps {
  children: React.ReactNode;
  showThemeToggle?: boolean;
}

export default function Layout({ children, showThemeToggle = true }: LayoutProps) {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground">
        {showThemeToggle && (
          <div className="fixed top-4 right-4 z-50">
            <ThemeToggle />
          </div>
        )}
        {children}
      </div>
    </ThemeProvider>
  );
}