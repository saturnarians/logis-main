
import { createClient } from '@libsql/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { PrismaClient } from '@prisma/client';
import path from 'path';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const isProduction = process.env.NODE_ENV === 'production';

function createPrismaClient() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

  // Log configuration status without exposing credentials.
console.info('[Database Configuration]', {
  environment: process.env.NODE_ENV,
  tursoUrlConfigured: Boolean(tursoUrl),
  tursoTokenConfigured: Boolean(tursoAuthToken),
  selectedDatabase:
    tursoUrl && tursoAuthToken
      ? 'Turso'
      : 'Local SQLite',
});

  const log: ('error' | 'warn')[] =
    isProduction ? ['error'] : ['error', 'warn'];

  // Production must never silently fall back to local SQLite.
  if (isProduction && (!tursoUrl || !tursoAuthToken)) {
    throw new Error(
      'Production database configuration missing: Turso credentials are required.',
    );
  }

  // Reject partially configured Turso credentials.
  if (Boolean(tursoUrl) !== Boolean(tursoAuthToken)) {
    throw new Error(
      'TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must both be configured.',
    );
  }

  // Use Turso whenever both credentials are available.
  if (tursoUrl && tursoAuthToken) {
    const client = createClient({
      url: tursoUrl,
      authToken: tursoAuthToken,
    });

    const adapter = new PrismaLibSQL(client);

    return new PrismaClient({ adapter, log });
  }

  // Local SQLite is exclusively for development.
  const databaseUrl =
    process.env.DATABASE_URL ??
    `file:${path.join(process.cwd(), 'prisma', 'dev.db')}`;

  return new PrismaClient({
    datasources: {
      db: { url: databaseUrl },
    },
    log,
  });
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
