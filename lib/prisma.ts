import { createClient } from '@libsql/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { PrismaClient } from '@prisma/client';
import path from 'path';

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = `file:${path.join(process.cwd(), 'prisma', 'dev.db')}`;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;
  const log: ('error' | 'warn')[] =
    process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'];

  if (tursoUrl || tursoAuthToken) {
    if (!tursoUrl || !tursoAuthToken) {
      throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must both be configured.');
    }

    const adapter = new PrismaLibSQL(
      createClient({ url: tursoUrl, authToken: tursoAuthToken }),
    );
    return new PrismaClient({ adapter, log });
  }

  return new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } },
    log,
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;

