'use client';

import { AdminPortal } from '@/components/roles/admin/AdminPortal';
import { DriverPortal } from '@/components/roles/driver/DriverPortal';
import { useLogistics } from '@/context/LogisticsContext';

export default function DashboardPage() {
  const { role } = useLogistics();

  if (role === 'driver') return 
  <main className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
    <DriverPortal />
  </main>;
  return <AdminPortal />;
}
