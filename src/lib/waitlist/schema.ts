import { z } from "zod";

export const ROLES = [
  "Researcher",
  "Student",
  "Developer",
  "Founder",
  "Engineer",
  "Other",
] as const;

export type Role = (typeof ROLES)[number];

/**
 * Wire format for `POST /api/waitlist`.
 *
 * Shared by the client form and the route handler so validation can never drift
 * between the two. The client runs it for instant feedback; the server runs it
 * again as the actual gate — client-side validation is a convenience, never a
 * trust boundary.
 */
export const waitlistInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Please add your first name.")
    .max(80, "That name is a little too long."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Please add your email.")
    .max(254, "That email is too long.")
    .email("That doesn't look like a valid email."),
  role: z.enum(ROLES).optional(),
  message: z
    .string()
    .trim()
    .max(600, "Please keep this under 600 characters.")
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
  /** Which CTA opened the modal. Analytics only — never shown back to anyone. */
  source: z.string().trim().max(120).optional(),
  /**
   * Honeypot. Real people never see this field, so any value means a bot. We
   * accept the request and return success without storing anything.
   */
  company: z.string().max(0).optional().or(z.string().optional()),
});

export type WaitlistInput = z.infer<typeof waitlistInputSchema>;

export interface WaitlistEntry {
  id: string;
  name: string;
  email: string;
  role?: Role;
  message?: string;
  createdAt: string;
  source?: string;
}

export type WaitlistApiResponse =
  | { ok: true; alreadyJoined: boolean }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };
