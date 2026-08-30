'use client';

import React from 'react';
import { PublicHeader } from '@/components/public/PublicHeader';
import { useLogistics } from '@/context/LogisticsContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { TerminalLogsModal } from '@/components/common/TerminalLogsModal';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { toggleCopilot } = useLogistics();

  return (
    <div className="min-h-screen bg-slate-100/70 text-gray-900 selection:bg-red-100 selection:text-[#D40511]">
      <PublicHeader onOpenCopilot={toggleCopilot} />
      <AuthGuard allowedRoles={['superadmin', 'admin', 'driver']} requiredClearanceLabel="DHL Operations Dashboards">
        {children}
      </AuthGuard>
      <TerminalLogsModal />
    </div>
  );
}
