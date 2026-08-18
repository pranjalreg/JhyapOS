"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { Container } from "@/components/ui/section";
import { TextLines } from "@/components/workspace/chrome";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

/**
 * Panels that grow outward from behind the sentence. Positions are in
 * percentages of the stage and deliberately asymmetric — a symmetrical ring
 * would read as a diagram rather than a workspace.
 */
const PANELS = [
  { x: 2, y: 12, w: 21, h: 30, label: "Browser", delay: 0 },
  { x: 77, y: 8, w: 21, h: 26, label: "Summarizer", delay: 0.05 },
  { x: 6, y: 58, w: 24, h: 24, label: "Terminal", delay: 0.1 },
  { x: 72, y: 56, w: 25, h: 28, label: "Canvas", delay: 0.03 },
  { x: 30, y: 4, w: 18, h: 16, label: "Agent", delay: 0.13 },
  { x: 46, y: 80, w: 22, h: 15, label: "Notes", delay: 0.08 },
];

export function NotAChat() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  /* Keyframe lists span the full 0→1 range so the end states hold instead of
     extrapolating past the last point. */

  // Line one holds, then hands off.
  const firstOpacity = useTransform(scrollYProgress, [0, 0.24, 0.36, 1], [1, 1, 0, 0]);
  const firstY = useTransform(scrollYProgress, [0, 0.24, 0.36, 1], [0, 0, -28, -28]);

  // Line two arrives after a real beat of nothing.
  const secondOpacity = useTransform(scrollYProgress, [0, 0.4, 0.5, 1], [0, 0, 1, 1]);
  const secondY = useTransform(scrollYProgress, [0, 0.4, 0.52, 1], [26, 26, 0, 0]);

  if (reduced) return <NotAChatStatic />;

  return (
    <section ref={sectionRef} className="relative h-[300vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {/* The workspace assembling itself around the sentence */}
        <div className="pointer-events-none absolute inset-0 mx-auto max-w-[1180px] px-5 sm:px-8">
          <div className="relative h-full w-full">
            {PANELS.map((panel) => (
              <ExpandingPanel key={panel.label} panel={panel} progress={scrollYProgress} />
            ))}
          </div>
        </div>

        <Container className="relative z-20 text-center">
          <motion.h2
            style={{ opacity: firstOpacity, y: firstY }}
            className="mx-auto max-w-[13ch] text-[36px] font-semibold leading-[1.04] tracking-[-0.045em] will-change-transform sm:text-[56px] md:text-[70px]"
          >
            You don&rsquo;t need another AI chat.
          </motion.h2>

          <motion.p
            style={{ opacity: secondOpacity, y: secondY }}
            className="absolute inset-x-0 top-1/2 mx-auto max-w-[13ch] -translate-y-1/2 px-5 text-[36px] font-semibold leading-[1.04] tracking-[-0.045em] text-ink will-change-transform sm:text-[56px] md:text-[70px]"
          >
            You need a place for AI to work.
          </motion.p>
        </Container>
      </div>
    </section>
  );
}

function ExpandingPanel({
  panel,
  progress,
}: {
  panel: (typeof PANELS)[number];
  progress: MotionValue<number>;
}) {
  const start = 0.52 + panel.delay;
  const end = start + 0.3;

  const opacity = useTransform(progress, [0, start, start + 0.1, 1], [0, 0, 1, 1]);
  const scale = useTransform(progress, [0, start, end, 1], [0.42, 0.42, 1, 1]);
  // Growing from the corner nearest the centre is what makes them read as
  // expanding *outward* from behind the sentence.
  const originX = panel.x < 50 ? "100%" : "0%";
  const originY = panel.y < 50 ? "100%" : "0%";

  return (
    <motion.div
      aria-hidden
      style={{
        opacity,
        scale,
        left: `${panel.x}%`,
        top: `${panel.y}%`,
        width: `${panel.w}%`,
        height: `${panel.h}%`,
        transformOrigin: `${originX} ${originY}`,
      }}
      className="absolute will-change-transform"
    >
      <div className="flex h-full flex-col overflow-hidden rounded-lg border border-line bg-panel/85 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.95)] backdrop-blur-sm">
        <div className="flex h-6 shrink-0 items-center gap-1.5 border-b border-line px-2">
          <span className="size-1.5 rounded-full bg-white/14" />
          <span className="truncate font-mono text-[9px] uppercase tracking-[0.12em] text-ink-faint">
            {panel.label}
          </span>
        </div>
        <div className="min-h-0 flex-1 p-2.5">
          <TextLines count={4} widths={[92, 74, 84, 48]} tone="faint" />
        </div>
      </div>
    </motion.div>
  );
}

function NotAChatStatic() {
  return (
    <section className="py-32 text-center">
      <Container>
        <h2 className="mx-auto max-w-[14ch] text-[38px] font-semibold leading-[1.05] tracking-[-0.045em] sm:text-[56px]">
          You don&rsquo;t need another AI chat.
        </h2>
        <p className="mx-auto mt-8 max-w-[14ch] text-[38px] font-semibold leading-[1.05] tracking-[-0.045em] text-ink-dim sm:text-[56px]">
          You need a place for AI to work.
        </p>
      </Container>
    </section>
  );
}
