'use client';

import React, { useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';
import { Provider as ReduxProvider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { store } from '@/store';
import { queryClient } from '@/lib/queryClient';
import { LogisticsProvider } from '@/context/LogisticsContext';

let clientStartupLogged = false;

interface AppProvidersProps {
  children: React.ReactNode;
  session?: any;
}

export function AppProviders({ children, session }: AppProvidersProps) {
  useEffect(() => {
    if (!clientStartupLogged) {
      console.log('[client] application initialized');
      clientStartupLogged = true;
    }

    const handleError = (event: ErrorEvent) => {
      console.error('[client] uncaught error', {
        name: event.error instanceof Error ? event.error.name : 'UnknownError',
      });
    };
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('[client] unhandled promise rejection', {
        reasonType:
          event.reason instanceof Error ? event.reason.name : typeof event.reason,
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

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
