import "server-only";

import { randomUUID } from "node:crypto";
import type { WaitlistEntry, WaitlistInput } from "./schema";

/**
 * The one contract every backend has to satisfy.
 *
 * Swapping in Postgres, Supabase, Airtable, or a CRM means writing this
 * interface and nothing else — no route or component changes.
 */
export interface WaitlistStore {
  readonly name: string;
  findByEmail(email: string): Promise<WaitlistEntry | null>;
  insert(input: WaitlistInput & { source?: string }): Promise<WaitlistEntry>;
  count(): Promise<number>;
}

function toEntry(input: WaitlistInput & { source?: string }): WaitlistEntry {
  return {
    id: randomUUID(),
    name: input.name,
    email: input.email,
    role: input.role,
    message: input.message,
    source: input.source,
    createdAt: new Date().toISOString(),
  };
}

/* ------------------------------------------------------------------ *
 * Memory adapter — the safe default when nothing is configured.
 *
 * Entries live for the lifetime of the process, which on serverless means
 * roughly "not at all". It exists so the site never crashes for a visitor
 * because storage is unconfigured; it is not a place to keep signups.
 * ------------------------------------------------------------------ */
class MemoryWaitlistStore implements WaitlistStore {
  readonly name = "memory";
  private entries = new Map<string, WaitlistEntry>();

  async findByEmail(email: string) {
    return this.entries.get(email) ?? null;
  }

  async insert(input: WaitlistInput & { source?: string }) {
    const entry = toEntry(input);
    this.entries.set(entry.email, entry);
    return entry;
  }

  async count() {
    return this.entries.size;
  }
}

/* ------------------------------------------------------------------ *
 * File adapter — the local development default.
 *
 * Appends newline-delimited JSON to `.data/waitlist.jsonl`, which is
 * gitignored. Writes are serialized through a promise chain so two concurrent
 * submissions can't interleave and corrupt a line.
 * ------------------------------------------------------------------ */
class FileWaitlistStore implements WaitlistStore {
  readonly name = "file";
  private queue: Promise<unknown> = Promise.resolve();

  constructor(private readonly filePath: string) {}

  private async readAll(): Promise<WaitlistEntry[]> {
    const { readFile } = await import("node:fs/promises");
    try {
      const raw = await readFile(this.filePath, "utf8");
      return raw
        .split("\n")
        .filter((line) => line.trim().length > 0)
        .flatMap((line) => {
          try {
            return [JSON.parse(line) as WaitlistEntry];
          } catch {
            // A single malformed line shouldn't take down the whole read.
            return [];
          }
        });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw error;
    }
  }

  /** Runs `task` after every previously queued write has settled. */
  private serialize<T>(task: () => Promise<T>): Promise<T> {
    const run = this.queue.then(task, task);
    this.queue = run.catch(() => undefined);
    return run;
  }

  async findByEmail(email: string) {
    const entries = await this.readAll();
    return entries.find((entry) => entry.email === email) ?? null;
  }

  async insert(input: WaitlistInput & { source?: string }) {
    return this.serialize(async () => {
      const { appendFile, mkdir } = await import("node:fs/promises");
      const { dirname } = await import("node:path");
      await mkdir(dirname(this.filePath), { recursive: true });
      const entry = toEntry(input);
      await appendFile(this.filePath, `${JSON.stringify(entry)}\n`, "utf8");
      return entry;
    });
  }

  async count() {
    return (await this.readAll()).length;
  }
}

/* ------------------------------------------------------------------ *
 * Store resolution
 * ------------------------------------------------------------------ */

let cached: WaitlistStore | null = null;

/**
 * Picks the adapter from `WAITLIST_STORE`.
 *
 *   postgres → `./postgres` (requires DATABASE_URL and the `pg` package)
 *   file     → `.data/waitlist.jsonl`, the default in development
 *   memory   → in-process only, the default everywhere else
 *
 * Credentials are read from the environment on the server exclusively. Nothing
 * here is ever imported into a client component — the `server-only` guard at
 * the top of the file turns that mistake into a build error.
 */
export async function getWaitlistStore(): Promise<WaitlistStore> {
  if (cached) return cached;

  const configured = process.env.WAITLIST_STORE?.toLowerCase();
  const mode = configured ?? (process.env.NODE_ENV === "development" ? "file" : "memory");

  switch (mode) {
    case "postgres": {
      const { PostgresWaitlistStore } = await import("./postgres");
      cached = await PostgresWaitlistStore.create();
      break;
    }
    case "file": {
      const path = process.env.WAITLIST_FILE ?? ".data/waitlist.jsonl";
      cached = new FileWaitlistStore(path);
      break;
    }
    case "memory":
      cached = new MemoryWaitlistStore();
      break;
    default:
      throw new Error(
        `Unknown WAITLIST_STORE "${configured}". Expected one of: postgres, file, memory.`,
      );
  }

  if (cached.name === "memory" && process.env.NODE_ENV === "production") {
    console.warn(
      "[waitlist] Running with the in-memory store in production — signups will not persist. " +
        "Set WAITLIST_STORE=postgres and DATABASE_URL, or write an adapter for your backend.",
    );
  }

  return cached;
}
