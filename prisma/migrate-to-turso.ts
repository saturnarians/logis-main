import { createClient } from '@libsql/client';
import { PrismaClient } from '@prisma/client';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const tableNames = [
  'Shipment',
  'TimelineEntry',
  'Driver',
  'Vehicle',
  'WarehouseHub',
  'LogisticsAlert',
  'InvoiceRecord',
  'RateTariff',
  'InventoryItem',
  'ExpenseRecord',
  'SystemPermission',
  'AuthUser',
  'AIGovernanceConfig',
  'PendingAIAction',
  'AIAuditLog',
] as const;

type SqlRow = Record<string, unknown>;
type SqliteValue = string | number | bigint | Uint8Array | ArrayBuffer | null;

function toSqliteValue(value: unknown): SqliteValue {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'bigint' ||
    value instanceof Uint8Array ||
    value instanceof ArrayBuffer
  ) {
    return value;
  }
  throw new TypeError(`Unsupported SQLite value type: ${typeof value}`);
}

async function getTableNames(client: ReturnType<typeof createClient>) {
  const result = await client.execute(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'",
  );
  return result.rows.map((row) => String(row.name));
}

async function main() {
  const localDatabaseUrl = process.env.DATABASE_URL;
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

  if (!localDatabaseUrl?.startsWith('file:')) {
    throw new Error('DATABASE_URL must point to the local SQLite database to migrate.');
  }
  if (!tursoUrl || !tursoAuthToken) {
    throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must both be configured.');
  }

  const source = new PrismaClient({ datasources: { db: { url: localDatabaseUrl } } });

  try {
    const localTables = await source.$queryRawUnsafe<Array<{ name: string }>>(
      "SELECT name FROM sqlite_master WHERE type = 'table'",
    );
    const localTableNames = new Set(localTables.map(({ name }) => name));
    const missingLocalTables = tableNames.filter((name) => !localTableNames.has(name));
    if (missingLocalTables.length > 0) {
      throw new Error(
        `Local SQLite database is missing expected tables: ${missingLocalTables.join(', ')}`,
      );
    }

    const target = createClient({ url: tursoUrl, authToken: tursoAuthToken });
    try {
      let existingTables = await getTableNames(target);
      if (existingTables.length === 0) {
        const migrationsDirectory = path.join(process.cwd(), 'prisma', 'migrations');
        const migrations = (await readdir(migrationsDirectory, { withFileTypes: true }))
          .filter((entry) => entry.isDirectory())
          .map((entry) => entry.name)
          .sort();

        if (migrations.length === 0) {
          throw new Error('No Prisma SQL migrations were found.');
        }

        for (const migration of migrations) {
          const sql = await readFile(
            path.join(migrationsDirectory, migration, 'migration.sql'),
            'utf8',
          );
          await target.executeMultiple(sql);
        }
        existingTables = await getTableNames(target);
      } else {
        const expected = new Set<string>(tableNames);
        const hasExpectedSchema =
          existingTables.length === expected.size &&
          existingTables.every((name) => expected.has(name));
        if (!hasExpectedSchema) {
          throw new Error(
            'Turso database is not empty and does not match this app schema; no changes were made.',
          );
        }

        for (const table of tableNames) {
          const result = await target.execute(
            `SELECT COUNT(*) AS count FROM "${table}"`,
          );
          if (Number(result.rows[0]?.count ?? 0) > 0) {
            throw new Error(
              'Turso database already contains app data; no data was copied.',
            );
          }
        }
      }

      const expected = new Set<string>(tableNames);
      if (
        existingTables.length !== expected.size ||
        existingTables.some((name) => !expected.has(name))
      ) {
        throw new Error(
          'Turso schema does not match the app migrations; no data was copied.',
        );
      }

      const transaction = await target.transaction('write');
      let importedRows = 0;
      try {
        for (const table of tableNames) {
          const rows = await source.$queryRawUnsafe<SqlRow[]>(
            `SELECT * FROM "${table}"`,
          );
          for (const row of rows) {
            const columns = Object.keys(row);
            if (columns.length === 0) continue;

            const quotedColumns = columns.map((column) => `"${column}"`).join(', ');
            const placeholders = columns.map(() => '?').join(', ');
            const args = columns.map((column) => toSqliteValue(row[column]));
            await transaction.execute({
              sql: `INSERT INTO "${table}" (${quotedColumns}) VALUES (${placeholders})`,
              args,
            });
            importedRows++;
          }
        }
        await transaction.commit();
      } catch (error) {
        await transaction.rollback();
        throw error;
      }

      console.log(`Imported ${importedRows} rows into Turso.`);
    } finally {
      target.close();
    }
  } finally {
    await source.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error('Turso migration failed:', error);
  process.exitCode = 1;
});
