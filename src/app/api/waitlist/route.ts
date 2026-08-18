import { NextResponse } from "next/server";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { waitlistInputSchema, type WaitlistApiResponse } from "@/lib/waitlist/schema";
import { getWaitlistStore } from "@/lib/waitlist/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(body: WaitlistApiResponse, init?: ResponseInit) {
  return NextResponse.json(body, init);
}

/**
 * POST /api/waitlist
 *
 * Validates, rate-limits, and hands off to whichever store is configured. The
 * response deliberately carries no signup counts or entry data — the endpoint
 * is public and write-only from the browser's point of view.
 */
export async function POST(request: Request) {
  const limit = rateLimit(`waitlist:${clientKey(request)}`, {
    limit: 5,
    windowMs: 60_000,
  });

  if (!limit.allowed) {
    return json(
      { ok: false, error: "Too many attempts. Please try again in a moment." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: "Malformed request." }, { status: 400 });
  }

  const parsed = waitlistInputSchema.safeParse(payload);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && !fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    return json(
      { ok: false, error: "Please check the highlighted fields.", fieldErrors },
      { status: 400 },
    );
  }

  const { company, ...input } = parsed.data;

  // Honeypot tripped: answer exactly like the success path so the bot learns
  // nothing, but store nothing.
  if (company) {
    return json({ ok: true, alreadyJoined: false }, { status: 200 });
  }

  try {
    const store = await getWaitlistStore();

    /* Refuse to accept a signup we know we'd throw away. The in-memory store
       lives inside a serverless function that is destroyed moments later, so
       returning "You're in." would be a lie the visitor can never recover
       from. An honest 503 is worse UX and far better behaviour — and it makes
       a misconfigured deploy obvious instead of silent. */
    if (store.name === "memory" && process.env.NODE_ENV === "production") {
      console.error(
        "[waitlist] Refusing signup: WAITLIST_STORE is unset in production, so " +
          "entries would not persist. Set WAITLIST_STORE=postgres and DATABASE_URL.",
      );
      return json(
        {
          ok: false,
          error: "The waitlist isn't accepting signups right now. Please try again shortly.",
        },
        { status: 503 },
      );
    }

    const existing = await store.findByEmail(input.email);
    if (existing) {
      return json({ ok: true, alreadyJoined: true }, { status: 200 });
    }

    await store.insert(input);

    return json({ ok: true, alreadyJoined: false }, { status: 201 });
  } catch (error) {
    // Log the detail server-side; never leak store or connection internals to
    // the client.
    console.error("[waitlist] submission failed:", error);
    return json(
      {
        ok: false,
        error: "Something went wrong on our side. Please try again.",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return json({ ok: false, error: "Method not allowed." }, { status: 405 });
}
