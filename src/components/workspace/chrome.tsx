"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

/**
 * Shared chrome for every JhyapOS pane on the site.
 *
 * Deliberately not macOS traffic lights — a thin labelled bar reads as real
 * software rather than a mockup of someone else's OS.
 */
export function PaneChrome({
  icon: Icon,
  label,
  trailing,
  children,
  className = "",
  active = false,
  onPointerEnter,
  onPointerLeave,
}: {
  icon?: LucideIcon;
  label: string;
  trailing?: ReactNode;
  children: ReactNode;
  className?: string;
  active?: boolean;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
}) {
  return (
    <div
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      className={[
        "flex min-h-0 flex-col overflow-hidden rounded-lg border bg-panel transition-[border-color,box-shadow,background-color] duration-300",
        active
          ? "border-white/20 bg-raised shadow-[0_0_0_1px_rgba(227,179,65,0.12),0_18px_50px_-24px_rgba(0,0,0,0.95)]"
          : "border-line shadow-[0_16px_44px_-28px_rgba(0,0,0,0.9)]",
        className,
      ].join(" ")}
    >
      <div className="flex h-8 shrink-0 items-center gap-2 border-b border-line bg-white/[0.018] px-2.5">
        {Icon ? (
          <Icon
            aria-hidden
            className={`size-3 shrink-0 transition-colors duration-300 ${active ? "text-accent" : "text-ink-faint"}`}
            strokeWidth={2}
          />
        ) : null}
        <span className="truncate font-mono text-[10.5px] uppercase tracking-[0.13em] text-ink-dim">
          {label}
        </span>
        <div className="ml-auto flex shrink-0 items-center gap-1.5">{trailing}</div>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
    </div>
  );
}

/** Small status pill used in pane title bars. */
export function StatusDot({
  tone = "idle",
  label,
}: {
  tone?: "idle" | "live" | "done";
  label?: string;
}) {
  const color =
    tone === "live" ? "bg-accent" : tone === "done" ? "bg-signal" : "bg-ink-faint";

  return (
    <span className="flex items-center gap-1.5">
      <span
        aria-hidden
        className={`size-1.5 rounded-full ${color} ${tone === "live" ? "livedot" : ""}`}
      />
      {label ? (
        <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-faint">
          {label}
        </span>
      ) : null}
    </span>
  );
}

/**
 * Placeholder text lines. Real UI is mostly text you can't read at a glance —
 * these stand in for it without pretending to be lorem ipsum.
 */
export function TextLines({
  count = 4,
  widths = [100, 92, 96, 68],
  className = "",
  tone = "dim",
}: {
  count?: number;
  widths?: number[];
  className?: string;
  tone?: "dim" | "faint";
}) {
  return (
    <div className={`space-y-[6px] ${className}`} aria-hidden>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`h-[3px] rounded-full ${tone === "dim" ? "bg-white/12" : "bg-white/7"}`}
          style={{ width: `${widths[index % widths.length]}%` }}
        />
      ))}
    </div>
  );
}
