'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { Provider as ReduxProvider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { store } from '@/store';
import { queryClient } from '@/lib/queryClient';
import { LogisticsProvider } from '@/context/LogisticsContext';

interface AppProvidersProps {
  children: React.ReactNode;
  session?: any;
}

export function AppProviders({ children, session }: AppProvidersProps) {
  return (
    <SessionProvider session={session}>
      <ReduxProvider store={store}>
        <QueryClientProvider client={queryClient}>
          <LogisticsProvider>
            {children}
          </LogisticsProvider>
        </QueryClientProvider>
      </ReduxProvider>
    </SessionProvider>
  );
}
