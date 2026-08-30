import type {Metadata} from 'next';
import './globals.css';
import { AppProviders } from '@/components/providers/AppProviders';
import { GlobalCopilotHost } from '@/components/common/GlobalCopilotHost';

export const metadata: Metadata = {
  title: 'DHL Express & Logistics Platform',
  description: 'Real-time logistics tracking, dispatch dashboard, fleet management, and public tracking portal.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <AppProviders>
          {children}
          <GlobalCopilotHost />
        </AppProviders>
      </body>
    </html>
  );
}

