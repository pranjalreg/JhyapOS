"use client";

import { Container, SectionLabel } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";

const PARTS = ["AI", "Browser", "Files", "Terminal", "Research", "Canvas"];

export function WhyJhyapOS() {
  return (
    <section className="relative py-28 md:py-36">
      <Container>
        <Reveal>
          <SectionLabel index="07">Why JhyapOS</SectionLabel>
        </Reveal>

        {/* Comparison, stated flatly. No competitor is being attacked — the
            difference is a difference in kind, and saying it plainly is
            stronger than a checklist. */}
        <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-2">
          <Reveal className="bg-void">
            <div className="p-8 md:p-10">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
                AI assistants
              </p>
              <p className="mt-6 text-[26px] font-semibold leading-[1.15] tracking-[-0.03em] text-ink-dim sm:text-[32px]">
                Answer questions.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.08} className="bg-panel">
            <div className="p-8 md:p-10">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
                JhyapOS
              </p>
              <p className="mt-6 text-[26px] font-semibold leading-[1.15] tracking-[-0.03em] sm:text-[32px]">
                Creates an environment where humans and AI can work together.
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.12} y={26}>
          <Equation />
        </Reveal>
      </Container>
    </section>
  );
}

/**
 * The sum. Rendered as a real equation rather than a feature grid — six things
 * that currently live apart, on one line, resolving to one result.
 */
function Equation() {
  return (
    <div className="mt-20 md:mt-24">
      <ul className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-3 sm:gap-x-2.5">
        {PARTS.map((part, index) => (
          <li key={part} className="flex items-center gap-1.5 sm:gap-2.5">
            <span className="rounded-md border border-line bg-white/[0.025] px-3 py-2 text-[13px] font-medium text-ink-muted sm:px-4 sm:text-[14px]">
              {part}
            </span>
            {index < PARTS.length - 1 ? (
              <span aria-hidden className="text-[15px] text-ink-faint">
                +
              </span>
            ) : null}
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-col items-center gap-6">
        <span aria-hidden className="text-[20px] leading-none text-ink-faint">
          =
        </span>
        <p className="text-[30px] font-semibold tracking-[-0.035em] sm:text-[40px]">
          One workspace
        </p>
      </div>
    </div>
  );
}
