"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Command, Globe, Layers, Layout, Sparkles, FileText } from "lucide-react";
import { Container, SectionLabel } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { useInView, useTypewriter } from "@/lib/use-typewriter";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

const PROMPT = "I need to research the latest approaches to multimodal reasoning.";

const TASKS = [
  { label: "Browser opens", icon: Globe },
  { label: "Research workspace appears", icon: Layout },
  { label: "Summarizer appears", icon: FileText },
  { label: "Canvas appears", icon: Layers },
  { label: "AI agent activates", icon: Sparkles },
] as const;

export function CommandCenter() {
  const { ref, inView } = useInView<HTMLDivElement>({ amount: 0.4 });
  const reduced = usePrefersReducedMotion();

  const { output, done } = useTypewriter(PROMPT, {
    play: inView,
    speed: 26,
    startDelay: 420,
  });

  // Tasks resolve one after another once the prompt lands.
  const [resolved, setResolved] = useState(0);

  useEffect(() => {
    if (!done) {
      setResolved(0);
      return;
    }
    if (reduced) {
      setResolved(TASKS.length);
      return;
    }
    const timers = TASKS.map((_, index) =>
      setTimeout(() => setResolved(index + 1), 380 + index * 460),
    );
    return () => timers.forEach(clearTimeout);
  }, [done, reduced]);

  const prepared = resolved >= TASKS.length;

  return (
    <section className="relative py-28 md:py-36">
      <Container>
        <Reveal>
          <SectionLabel index="05">The command center</SectionLabel>
        </Reveal>

        <Reveal delay={0.06}>
          <h2 className="mt-8 max-w-[14ch] text-[34px] font-semibold leading-[1.05] tracking-[-0.04em] sm:text-[48px] md:text-[58px]">
            Tell JhyapOS what you need.
          </h2>
        </Reveal>

        <div ref={ref} className="mx-auto mt-16 max-w-[680px]">
          {/* The command surface */}
          <Reveal delay={0.1} y={24}>
            <div className="panel overflow-hidden rounded-xl">
              <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
                <Command className="size-4 shrink-0 text-ink-dim" aria-hidden />
                <p className="min-w-0 flex-1 text-[14px] leading-snug text-ink sm:text-[15px]">
                  {output}
                  {!done ? (
                    <span
                      aria-hidden
                      className="caret ml-0.5 inline-block h-[15px] w-[6px] translate-y-[2px] bg-accent align-middle"
                    />
                  ) : null}
                </p>
                <kbd className="hidden shrink-0 rounded border border-line bg-white/[0.05] px-1.5 py-1 font-mono text-[10px] text-ink-faint sm:block">
                  ⏎
                </kbd>
              </div>

              {/* Preparation log */}
              <div className="divide-y divide-[color:var(--color-line)]">
                {TASKS.map((task, index) => {
                  const state =
                    index < resolved ? "done" : index === resolved && done ? "active" : "idle";
                  return (
                    <div
                      key={task.label}
                      className="flex items-center gap-3 px-4 py-2.5 transition-opacity duration-500"
                      style={{ opacity: state === "idle" ? 0.28 : 1 }}
                    >
                      <task.icon
                        aria-hidden
                        className={`size-3.5 shrink-0 transition-colors duration-300 ${
                          state === "done" ? "text-ink-dim" : "text-accent"
                        }`}
                      />
                      <span className="min-w-0 flex-1 truncate font-mono text-[11.5px] text-ink-muted">
                        {task.label}
                      </span>
                      {state === "done" ? (
                        <Check className="size-3 shrink-0 text-signal" aria-hidden />
                      ) : state === "active" ? (
                        <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-accent livedot" />
                      ) : null}
                    </div>
                  );
                })}
              </div>

              {/* Result */}
              <div className="h-[52px] border-t border-line bg-white/[0.015]">
                <AnimatePresence>
                  {prepared ? (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="flex h-full items-center gap-2.5 px-4"
                    >
                      <span aria-hidden className="size-1.5 rounded-full bg-signal" />
                      <span className="text-[13.5px] font-medium text-ink">
                        Workspace prepared.
                      </span>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mt-8 text-center text-[14px] text-ink-dim">
              The interface is only the beginning.
            </p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
