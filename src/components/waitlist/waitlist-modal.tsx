"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/ui/logo";
import { ROLES, waitlistInputSchema, type WaitlistApiResponse } from "@/lib/waitlist/schema";
import { useWaitlist } from "./waitlist-provider";

type Status = "idle" | "submitting" | "success" | "error";

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function WaitlistModal() {
  const { open, closeWaitlist, source } = useWaitlist();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? <ModalShell onClose={closeWaitlist} source={source} /> : null}
    </AnimatePresence>,
    document.body,
  );
}

function ModalShell({
  onClose,
  source,
}: {
  onClose: () => void;
  source: string | null;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  const [status, setStatus] = useState<Status>("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [alreadyJoined, setAlreadyJoined] = useState(false);
  const [role, setRole] = useState<string>("");

  /* Lock the page behind the modal without the layout jumping as the
   * scrollbar disappears. */
  useEffect(() => {
    const { body, documentElement } = document;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;

    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
    };
  }, []);

  /* Move focus in on open, and put it back where it came from on close. */
  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const first = dialogRef.current?.querySelector<HTMLElement>("input, button");
    // Wait a frame so the entrance transform doesn't fight the scroll-into-view.
    const raf = requestAnimationFrame(() => first?.focus());
    return () => {
      cancelAnimationFrame(raf);
      previouslyFocused.current?.focus?.();
    };
  }, []);

  /* Escape closes; Tab cycles inside the dialog.
   *
   * Bound to the document rather than the dialog element: when the form is
   * replaced by the success panel the focused submit button is unmounted and
   * focus falls back to <body>, so a handler scoped to the dialog subtree
   * would stop receiving keys exactly when someone wants to dismiss it. */
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((element) => element.offsetParent !== null);

      if (focusable.length === 0) return;

      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      const active = document.activeElement;

      // Focus outside the dialog (or lost to <body>) gets pulled back in.
      if (!dialogRef.current.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
        return;
      }

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    const data = new FormData(event.currentTarget);
    const raw = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      role: (data.get("role") as string) || undefined,
      message: String(data.get("message") ?? ""),
      company: String(data.get("company") ?? ""),
    };

    // Validate with the same schema the server uses, so errors are identical.
    const parsed = waitlistInputSchema.safeParse(raw);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string" && !errors[field]) errors[field] = issue.message;
      }
      setFieldErrors(errors);
      setFormError(null);
      setStatus("error");
      return;
    }

    setStatus("submitting");
    setFieldErrors({});
    setFormError(null);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...parsed.data, source }),
      });

      const result = (await response.json()) as WaitlistApiResponse;

      if (!result.ok) {
        setFieldErrors(result.fieldErrors ?? {});
        setFormError(result.error);
        setStatus("error");
        return;
      }

      setAlreadyJoined(result.alreadyJoined);
      setStatus("success");
    } catch {
      setFormError("We couldn't reach the server. Check your connection and try again.");
      setStatus("error");
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-90 flex items-end justify-center p-0 sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <div
        className="absolute inset-0 bg-void/80 backdrop-blur-[6px]"
        onClick={onClose}
        aria-hidden
      />

      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        initial={{ opacity: 0, y: 24, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.99 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="panel relative max-h-[92vh] w-full max-w-[480px] overflow-y-auto rounded-t-2xl sm:rounded-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3.5 top-3.5 z-10 grid size-8 place-items-center rounded-md text-ink-dim transition-colors hover:bg-white/5 hover:text-ink"
        >
          <X className="size-4" aria-hidden />
        </button>

        <AnimatePresence mode="wait" initial={false}>
          {status === "success" ? (
            <SuccessPanel
              key="success"
              alreadyJoined={alreadyJoined}
              onClose={onClose}
              titleId={titleId}
              descriptionId={descriptionId}
            />
          ) : (
            <motion.div
              key="form"
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="p-6 sm:p-8"
            >
              <div className="flex items-center gap-2.5">
                <LogoMark size={20} />
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-dim">
                  Early access
                </span>
              </div>

              <h2
                id={titleId}
                className="mt-4 text-[26px] font-semibold leading-[1.15] tracking-[-0.03em]"
              >
                Join the JhyapOS waitlist
              </h2>
              <p id={descriptionId} className="mt-2 text-[14px] leading-relaxed text-ink-muted">
                We're onboarding in small groups. Tell us a little about you and
                we'll be in touch when there's a seat.
              </p>

              <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-5">
                <Field
                  label="First name"
                  name="name"
                  type="text"
                  autoComplete="given-name"
                  placeholder="Pranjal"
                  required
                  error={fieldErrors.name}
                />

                <Field
                  label="Email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="you@domain.com"
                  required
                  error={fieldErrors.email}
                />

                <RoleField value={role} onChange={setRole} />

                <div>
                  <label
                    htmlFor="waitlist-message"
                    className="block text-[13px] font-medium text-ink-muted"
                  >
                    What would you want JhyapOS to help you do?{" "}
                    <span className="font-normal text-ink-faint">Optional</span>
                  </label>
                  <textarea
                    id="waitlist-message"
                    name="message"
                    rows={3}
                    maxLength={600}
                    placeholder="Reading papers, keeping notes connected, running analysis…"
                    className="mt-2 w-full resize-none rounded-lg border border-line-strong bg-white/[0.025] px-3.5 py-2.5 text-[14px] text-ink placeholder:text-ink-faint transition-colors focus:border-white/25 focus:bg-white/[0.045] focus:outline-none focus-visible:outline-none"
                  />
                  {fieldErrors.message ? (
                    <p className="mt-1.5 text-[12.5px] text-red-400">{fieldErrors.message}</p>
                  ) : null}
                </div>

                {/* Honeypot — hidden from humans and assistive tech alike. */}
                <div aria-hidden className="pointer-events-none absolute -left-[9999px] opacity-0">
                  <label htmlFor="waitlist-company">Company</label>
                  <input id="waitlist-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
                </div>

                {formError ? (
                  <p role="alert" className="rounded-lg border border-red-500/25 bg-red-500/8 px-3.5 py-2.5 text-[13px] text-red-300">
                    {formError}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={status === "submitting"}
                  withArrow={status !== "submitting"}
                >
                  {status === "submitting" ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                      Joining…
                    </>
                  ) : (
                    "Join the Waitlist"
                  )}
                </Button>

                <p className="text-center text-[12px] leading-relaxed text-ink-faint">
                  No newsletter. We'll only email you about access.
                </p>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

function Field({
  label,
  name,
  error,
  ...props
}: {
  label: string;
  name: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = `waitlist-${name}`;
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="block text-[13px] font-medium text-ink-muted">
        {label}
      </label>
      <input
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={[
          "mt-2 h-11 w-full rounded-lg border bg-white/[0.025] px-3.5 text-[14px] text-ink",
          "placeholder:text-ink-faint transition-colors focus:bg-white/[0.045] focus:outline-none focus-visible:outline-none",
          error ? "border-red-500/50 focus:border-red-500/70" : "border-line-strong focus:border-white/25",
        ].join(" ")}
        {...props}
      />
      {error ? (
        <p id={errorId} className="mt-1.5 text-[12.5px] text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Radio group rather than a `<select>` — six options is few enough to show at
 * once, and it keeps the modal's visual language consistent.
 */
function RoleField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset>
      <legend className="text-[13px] font-medium text-ink-muted">
        What best describes you?{" "}
        <span className="font-normal text-ink-faint">Optional</span>
      </legend>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {ROLES.map((option) => {
          const selected = value === option;
          return (
            <label
              key={option}
              className={[
                "cursor-pointer rounded-full border px-3.5 py-1.5 text-[13px] transition-colors",
                "focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent",
                selected
                  ? "border-white/30 bg-white/10 text-ink"
                  : "border-line-strong bg-white/[0.02] text-ink-muted hover:border-white/20 hover:text-ink",
              ].join(" ")}
            >
              <input
                type="radio"
                name="role"
                value={option}
                checked={selected}
                onChange={() => onChange(option)}
                className="sr-only"
              />
              {option}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function SuccessPanel({
  alreadyJoined,
  onClose,
  titleId,
  descriptionId,
}: {
  alreadyJoined: boolean;
  onClose: () => void;
  titleId: string;
  descriptionId: string;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  /* The submit button that had focus is gone now, so focus would otherwise
     land on <body> — outside the dialog. Move it to the one remaining action
     and let the live region announce the result. */
  useEffect(() => {
    const raf = requestAnimationFrame(() => closeRef.current?.focus());
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="px-6 py-14 text-center sm:px-8"
    >
      {/* The check draws itself once — the single flourish in the whole flow. */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto grid size-12 place-items-center rounded-full border border-accent/30 bg-accent/10"
      >
        <Check className="size-5 text-accent" aria-hidden strokeWidth={2.5} />
      </motion.div>

      <h2
        id={titleId}
        className="mt-6 text-[32px] font-semibold leading-none tracking-[-0.035em]"
      >
        {alreadyJoined ? "You're already in." : "You're in."}
      </h2>

      <p id={descriptionId} className="mx-auto mt-3.5 max-w-[300px] text-[14px] leading-relaxed text-ink-muted">
        {alreadyJoined
          ? "That email is already on the list. We'll let you know when JhyapOS is ready."
          : "We'll let you know when JhyapOS is ready."}
      </p>

      <div className="mx-auto mt-8 h-px w-16 bg-line-strong" />

      <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
        The next workspace is being built
      </p>

      <Button ref={closeRef} variant="secondary" size="md" onClick={onClose} className="mt-7">
        Keep exploring
      </Button>
    </motion.div>
  );
}
