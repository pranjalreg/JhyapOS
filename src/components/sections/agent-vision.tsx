"use client";

import { useEffect, useState } from "react";
import { FileText, Globe, Layers, SquareTerminal } from "lucide-react";
import { Container, SectionLabel } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { useInView } from "@/lib/use-typewriter";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

const STOPS = [
  { label: "Browser", icon: Globe },
  { label: "Terminal", icon: SquareTerminal },
  { label: "Documents", icon: FileText },
  { label: "Canvas", icon: Layers },
] as const;

export function AgentVision() {
  return (
    <section id="vision" className="relative scroll-mt-20 py-28 md:py-36">
      <Container>
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <Reveal>
              <SectionLabel index="06">Where this is going</SectionLabel>
            </Reveal>

            <Reveal delay={0.06}>
              <h2 className="mt-8 max-w-[15ch] text-[32px] font-semibold leading-[1.06] tracking-[-0.04em] sm:text-[44px]">
                AI that works inside your workflow.
              </h2>
            </Reveal>

            <Reveal delay={0.12}>
              <p className="mt-7 max-w-[48ch] text-[16px] leading-[1.65] text-ink-muted">
                JhyapOS is being built toward a future where AI agents can work
                across the tools and context you already use — moving between a
                page, a shell, a document, and a canvas the way you do.
              </p>
            </Reveal>

            {/* Being explicit about what exists today is the whole reason this
                section earns trust. */}
            <Reveal delay={0.18}>
              <div className="mt-8 rounded-lg border border-line bg-white/[0.018] p-5">
                <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-faint">
                  Status
                </p>
                <p className="mt-3 text-[14px] leading-relaxed text-ink-muted">
                  The workspace, browser, terminal, summarizer, and canvas are
                  what we&rsquo;re building now. Agents that act across all of
                  them are the direction — not a shipped feature. We&rsquo;ll
                  say so plainly as each part lands.
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.1} y={26} className="lg:pt-16">
            <AgentPath />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

/**
 * An agent moving between four surfaces, on a loop.
 *
 * Conceptual on purpose — no fake output, no invented capabilities. It shows
 * movement across context, which is the actual claim.
 */
function AgentPath() {
  const { ref, inView } = useInView<HTMLDivElement>({ amount: 0.4, once: false });
  const reduced = usePrefersReducedMotion();
  const [at, setAt] = useState(0);

  useEffect(() => {
    if (!inView || reduced) return;
    const timer = setInterval(() => setAt((value) => (value + 1) % STOPS.length), 1800);
    return () => clearInterval(timer);
  }, [inView, reduced]);

  const step = 100 / STOPS.length;

  return (
    <div ref={ref} className="panel rounded-xl p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-dim">
          Agent
        </span>
        <span className="flex items-center gap-1.5">
          <span
            aria-hidden
            className={`size-1.5 rounded-full bg-accent ${reduced ? "" : "livedot"}`}
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.13em] text-ink-faint">
            Concept
          </span>
        </span>
      </div>

      <div className="relative mt-8">
        {/* Rail, running behind the stops. The accent fill is how far the agent
            has travelled — a dot riding the same line would just sit on top of
            whichever icon it had reached. */}
        <div aria-hidden className="absolute inset-x-0 top-[22px] h-px overflow-hidden bg-line-strong">
          <div
            className="h-full bg-accent transition-[width] duration-[900ms] ease-[cubic-bezier(0.65,0,0.35,1)]"
            style={{ width: reduced ? "100%" : `${step * at + step / 2}%` }}
          />
        </div>

        <ul className="relative grid grid-cols-4">
          {STOPS.map((stop, index) => {
            const active = !reduced && index === at;
            const passed = !reduced && index < at;
            return (
              <li key={stop.label} className="flex flex-col items-center gap-3">
                <span className="relative grid place-items-center">
                  {/* Pulse marks where the agent currently is. */}
                  {active ? (
                    <span
                      aria-hidden
                      className="absolute size-11 rounded-lg bg-accent/12 livedot"
                    />
                  ) : null}
                  <span
                    className={`relative grid size-11 place-items-center rounded-lg border transition-colors duration-500 ${
                      active
                        ? "border-accent/50 bg-raised text-accent"
                        : passed
                          ? "border-line-strong bg-panel text-ink-dim"
                          : "border-line bg-panel text-ink-faint"
                    }`}
                  >
                    <stop.icon className="size-4" aria-hidden strokeWidth={1.75} />
                  </span>
                </span>
                <span
                  className={`text-center font-mono text-[10px] uppercase tracking-[0.1em] transition-colors duration-500 ${
                    active ? "text-ink" : "text-ink-faint"
                  }`}
                >
                  {stop.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="mt-8 border-t border-line pt-5 text-[13px] leading-relaxed text-ink-dim">
        One agent, one context, moving across surfaces instead of asking you to
        carry the state between them.
      </p>
    </div>
  );
}
