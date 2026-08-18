import "server-only";

import type { WaitlistStore } from "./store";
import type { Role, WaitlistEntry, WaitlistInput } from "./schema";

/**
 * Postgres adapter (Neon, Supabase, RDS, or plain Postgres).
 *
 * Deliberately not wired into the default path: it only loads when
 * `WAITLIST_STORE=postgres`, and `pg` is imported dynamically so the package is
 * required only if you actually choose this adapter.
 *
 *   npm install pg @types/pg
 *   WAITLIST_STORE=postgres
 *   DATABASE_URL=postgres://…
 *
 * Uniqueness is enforced by the database rather than by a read-then-write in
 * application code, so two concurrent signups for the same address cannot both
 * insert.
 */
const SCHEMA = `
  CREATE TABLE IF NOT EXISTS waitlist (
    id          uuid PRIMARY KEY,
    name        text NOT NULL,
    email       text NOT NULL UNIQUE,
    role        text,
    message     text,
    source      text,
    created_at  timestamptz NOT NULL DEFAULT now()
  );
`;

interface PgRow {
  id: string;
  name: string;
  email: string;
  role: string | null;
  message: string | null;
  source: string | null;
  created_at: Date;
}

function fromRow(row: PgRow): WaitlistEntry {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: (row.role as Role) ?? undefined,
    message: row.message ?? undefined,
    source: row.source ?? undefined,
    createdAt: row.created_at.toISOString(),
  };
}

interface QueryClient {
  query<T>(text: string, values?: unknown[]): Promise<{ rows: T[] }>;
}

export class PostgresWaitlistStore implements WaitlistStore {
  readonly name = "postgres";

  private constructor(private readonly pool: QueryClient) {}

  /**
   * `client` is an injection point for tests — pass anything with a
   * `query(text, values)` method and the adapter will use it instead of
   * opening a real connection. Production passes nothing.
   */
  static async create(client?: QueryClient): Promise<PostgresWaitlistStore> {
    if (client) {
      await client.query(SCHEMA);
      return new PostgresWaitlistStore(client);
    }

    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        "WAITLIST_STORE=postgres requires DATABASE_URL to be set in the server environment.",
      );
    }

    /* Imported by string literal, not through a variable. Vercel traces the
       serverless bundle statically, so a computed specifier would leave `pg`
       out of the deployment and fail at runtime with "Cannot find module".
       This import still only runs when the adapter is actually selected. */
    const { Pool } = await import("pg");

    const pool = new Pool({
      connectionString,
      max: 4,
      // Managed Postgres (Neon, Supabase, Vercel, RDS) terminates TLS with a
      // cert chain the Node client won't verify by default. Set
      // DATABASE_SSL=false for a local server with no TLS at all.
      ssl:
        process.env.DATABASE_SSL === "false"
          ? false
          : { rejectUnauthorized: false },
    });

    await pool.query(SCHEMA);
    return new PostgresWaitlistStore(pool as unknown as QueryClient);
  }

  async findByEmail(email: string) {
    const { rows } = await this.pool.query<PgRow>(
      "SELECT * FROM waitlist WHERE email = $1 LIMIT 1",
      [email],
    );
    return rows[0] ? fromRow(rows[0]) : null;
  }

  async insert(input: WaitlistInput & { source?: string }) {
    const { randomUUID } = await import("node:crypto");
    const { rows } = await this.pool.query<PgRow>(
      `INSERT INTO waitlist (id, name, email, role, message, source)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
       RETURNING *`,
      [
        randomUUID(),
        input.name,
        input.email,
        input.role ?? null,
        input.message ?? null,
        input.source ?? null,
      ],
    );
    return fromRow(rows[0]);
  }

  async count() {
    const { rows } = await this.pool.query<{ count: string }>(
      "SELECT COUNT(*)::text AS count FROM waitlist",
    );
    return Number(rows[0]?.count ?? 0);
  }
}
