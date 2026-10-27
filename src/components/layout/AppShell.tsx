import type { ReactNode } from 'react';
import { theme } from '@/constants/theme';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div
      style={{
        backgroundColor: theme.bg,
        minHeight: '100vh',
        color: theme.text,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {children}
    </div>
  );
}
