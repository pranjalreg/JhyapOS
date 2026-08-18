import type { ReactNode } from "react";

/**
 * The small mono index that anchors each section, e.g. `02 / THE PROBLEM`.
 * Gives the page a system-like spine without adding chrome.
 */
export function SectionLabel({
  index,
  children,
  className = "",
}: {
  index?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-dim ${className}`}
    >
      {index ? (
        <>
          <span className="text-ink-faint tabular">{index}</span>
          <span aria-hidden className="h-px w-6 bg-line-strong" />
        </>
      ) : null}
      <span>{children}</span>
    </div>
  );
}

/** Consistent page gutters. Every section uses this — nothing bleeds. */
export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1180px] px-5 sm:px-8 lg:px-10 ${className}`}>
      {children}
    </div>
  );
}

/** A full-bleed hairline used to separate acts of the story. */
export function HairRule({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`h-px w-full bg-gradient-to-r from-transparent via-line-strong to-transparent ${className}`}
    />
  );
}
