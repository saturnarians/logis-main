'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Role } from '@/types/logistics';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
  requiredClearanceLabel?: string;
}

export function AuthGuard({ children, allowedRoles = ['superadmin', 'admin', 'driver'] }: AuthGuardProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const role = session?.user?.role as Role | undefined;

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && (!role || !allowedRoles.includes(role)))) {
      router.replace('/login');
    }
  }, [allowedRoles, role, router, status]);

  if (status !== 'authenticated' || !role || !allowedRoles.includes(role)) return null;
  return <>{children}</>;
}
