import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { UserRole } from '@/types/dto';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      staffId: string;
      avatarUrl?: string | null;
      hub?: string | null;
      vehicleId?: string | null;
      department?: string | null;
      phone?: string | null;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    id: string;
    role: UserRole;
    staffId: string;
    avatarUrl?: string | null;
    hub?: string | null;
    vehicleId?: string | null;
    department?: string | null;
    phone?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    staffId: string;
    avatarUrl?: string | null;
    hub?: string | null;
    vehicleId?: string | null;
    department?: string | null;
    phone?: string | null;
  }
}
