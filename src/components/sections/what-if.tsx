"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { Container, SectionLabel } from "@/components/ui/section";
import { LogoMark } from "@/components/ui/logo";
import { usePrefersReducedMotion, useMediaQuery } from "@/lib/use-reduced-motion";

/**
 * Each window in the sprawl, with where it drifts to and roughly when it shows
 * up. Coordinates are percentages of the stage so the whole thing scales with
 * the viewport instead of needing breakpoints.
 */
interface Win {
  label: string;
  kind: "browser" | "pdf" | "chat" | "notes" | "terminal";
  x: number;
  y: number;
  w: number;
  rotate: number;
  /** Scroll progress at which this window appears. */
  at: number;
  /**
   * Position on small screens. A phone stage is tall and narrow, so the
   * desktop scatter would pile everything into the top third — these windows
   * get their own coordinates instead of being squeezed or dropped.
   */
  mobile?: { x: number; y: number; w: number };
  /** Dropped on small screens, where nine windows becomes mush. */
  desktopOnly?: boolean;
}

const WINDOWS: Win[] = [
  { label: "Browser", kind: "browser", x: 3, y: 9, w: 23, rotate: -3.2, at: 0.1, mobile: { x: 2, y: 5, w: 52 } },
  { label: "paper.pdf", kind: "pdf", x: 31, y: 3, w: 21, rotate: 2.4, at: 0.16, mobile: { x: 46, y: 22, w: 48 } },
  { label: "AI Chat", kind: "chat", x: 58, y: 10, w: 23, rotate: -2, at: 0.22, mobile: { x: 5, y: 40, w: 50 } },
  { label: "Notes", kind: "notes", x: 79, y: 34, w: 19, rotate: 3.4, at: 0.28, desktopOnly: true },
  { label: "Terminal", kind: "terminal", x: 6, y: 42, w: 25, rotate: -1.6, at: 0.34, mobile: { x: 42, y: 57, w: 52 } },
  { label: "Browser", kind: "browser", x: 36, y: 37, w: 23, rotate: 2.8, at: 0.4, desktopOnly: true },
  { label: "AI Chat", kind: "chat", x: 62, y: 62, w: 23, rotate: -4.2, at: 0.45, desktopOnly: true },
  { label: "paper.pdf", kind: "pdf", x: 12, y: 71, w: 21, rotate: 3.6, at: 0.49, desktopOnly: true },
  { label: "Notes", kind: "notes", x: 38, y: 74, w: 22, rotate: -2.4, at: 0.53, mobile: { x: 4, y: 74, w: 48 } },
];

const COLLAPSE_START = 0.62;
const COLLAPSE_END = 0.8;

/**
 * Measures the stage so window motion can be expressed in pixels.
 *
 * Motion resolves a percentage `x`/`y` against the *element's* own box, not its
 * parent — so anything that has to travel across the stage (the collapse into
 * the centre) has to be computed from real dimensions.
 */
function useStageSize(ref: React.RefObject<HTMLDivElement | null>) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setSize((current) =>
        current.width === width && current.height === height
          ? current
          : { width, height },
      );
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return size;
}

export function WhatIf() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const stage = useStageSize(stageRef);
  const reduced = usePrefersReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const windows = isDesktop ? WINDOWS : WINDOWS.filter((win) => !win.desktopOnly);

  /* Every keyframe list below runs all the way to 1. Motion extrapolates past
     the final input point rather than holding it, so a list that stops early
     (say at 0.2) drifts back the other way for the rest of the scroll — which
     is exactly how the headline ended up fading back in over the resolution.
     Terminating at 1 pins the end state. */

  // The headline fades as the mess takes over.
  const headlineOpacity = useTransform(scrollYProgress, [0, 0.06, 0.2, 1], [1, 1, 0, 0]);
  const headlineY = useTransform(scrollYProgress, [0, 0.2, 1], [0, -40, -40]);

  // JhyapOS resolves out of the collapse.
  const resolveOpacity = useTransform(
    scrollYProgress,
    [COLLAPSE_END - 0.06, COLLAPSE_END + 0.04, 1],
    [0, 1, 1],
  );
  const resolveScale = useTransform(
    scrollYProgress,
    [COLLAPSE_END - 0.06, COLLAPSE_END + 0.08, 1],
    [0.94, 1, 1],
  );

  /* Reduced motion gets the argument as a static before/after rather than a
     scroll performance it can't watch. */
  if (reduced) {
    return <WhatIfStatic />;
  }

  return (
    <section ref={sectionRef} className="relative h-[320vh]">
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden">
        {/* The mess */}
        <div className="pointer-events-none absolute inset-0 mx-auto max-w-[1180px] px-5 sm:px-8">
          <div ref={stageRef} className="relative h-full w-full">
            {windows.map((win, index) => (
              <ChaosWindow
                key={`${win.label}-${index}`}
                win={win}
                progress={scrollYProgress}
                index={index}
                stage={stage}
                compact={!isDesktop}
              />
            ))}
          </div>
        </div>

        {/* The question */}
        <motion.div
          style={{ opacity: headlineOpacity, y: headlineY }}
          className="relative z-30 px-5 text-center will-change-transform"
        >
          <SectionLabel index="01" className="justify-center">
            The problem
          </SectionLabel>
          <h2 className="mx-auto mt-6 max-w-[15ch] text-[34px] font-semibold leading-[1.06] tracking-[-0.04em] sm:text-[52px] md:text-[62px]">
            What if your AI didn&rsquo;t live in a chat box?
          </h2>
        </motion.div>

        {/* The resolution */}
        <motion.div
          style={{ opacity: resolveOpacity, scale: resolveScale }}
          className="pointer-events-none absolute inset-0 z-40 flex flex-col items-center justify-center px-5 text-center will-change-transform"
        >
          <LogoMark size={40} />
          <p className="mt-6 text-[38px] font-semibold leading-none tracking-[-0.04em] sm:text-[56px] md:text-[68px]">
            JhyapOS
          </p>
          <p className="mt-4 text-[15px] text-ink-muted sm:text-[17px]">
            One organized workspace.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/**
 * A single window in the pile.
 *
 * All five tracks — opacity, x, y, rotate, scale — are driven off the same
 * scroll value, so the appearance, the drift, and the collapse are one
 * continuous motion rather than three chained animations.
 */
function ChaosWindow({
  win,
  progress,
  index,
  stage,
  compact,
}: {
  win: Win;
  progress: MotionValue<number>;
  index: number;
  stage: { width: number; height: number };
  compact: boolean;
}) {
  const place = compact && win.mobile ? win.mobile : win;
  const appearEnd = win.at + 0.05;
  // Leading 0 and trailing 1 pin the start and end states — see the note on
  // extrapolation above.
  const keyframes = [0, win.at, appearEnd, COLLAPSE_START, COLLAPSE_END, 1];

  // The window sits at its scattered spot via `left`/`top`; every transform
  // below is a pixel delta from there, so nothing depends on the element's own
  // size.
  const enterX = ((place.x < 50 ? -8 : 8) / 100) * stage.width;
  const enterY = (6 / 100) * stage.height;
  const collapseX = ((50 - place.w / 2 - place.x) / 100) * stage.width;
  const collapseY = ((38 - place.y) / 100) * stage.height;

  const opacity = useTransform(progress, keyframes, [0, 0, 1, 1, 0, 0]);
  const x = useTransform(progress, keyframes, [enterX, enterX, 0, 0, collapseX, collapseX]);
  const y = useTransform(progress, keyframes, [enterY, enterY, 0, 0, collapseY, collapseY]);
  const rotate = useTransform(progress, keyframes, [
    win.rotate * 2.2,
    win.rotate * 2.2,
    win.rotate,
    win.rotate,
    0,
    0,
  ]);
  const scale = useTransform(progress, keyframes, [0.9, 0.9, 1, 1, 0.34, 0.34]);

  return (
    <motion.div
      aria-hidden
      style={{
        opacity,
        x,
        y,
        rotate,
        scale,
        left: `${place.x}%`,
        top: `${place.y}%`,
        width: `${place.w}%`,
        zIndex: 10 + index,
      }}
      className="absolute origin-center will-change-transform"
    >
      <MiniWindow kind={win.kind} label={win.label} />
    </motion.div>
  );
}

const KIND_STYLES: Record<Win["kind"], string> = {
  browser: "text-ink-muted",
  pdf: "text-ink-muted",
  chat: "text-ink-muted",
  notes: "text-ink-muted",
  terminal: "text-accent",
};

/** A window reduced to its silhouette — enough to recognize, not to read. */
function MiniWindow({ kind, label }: { kind: Win["kind"]; label: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line-strong bg-raised shadow-[0_28px_64px_-20px_rgba(0,0,0,1)]">
      <div className="flex h-6 items-center gap-1.5 border-b border-line bg-white/[0.04] px-2">
        <span aria-hidden className="size-1.5 rounded-full bg-white/25" />
        <span
          className={`truncate font-mono text-[9px] uppercase tracking-[0.12em] ${KIND_STYLES[kind]}`}
        >
          {label}
        </span>
      </div>

      <div className="space-y-[7px] p-3">
        {kind === "terminal" ? (
          <>
            <div className="h-[3px] w-[62%] rounded-full bg-accent/70" />
            <div className="h-[3px] w-[40%] rounded-full bg-white/22" />
            <div className="h-[3px] w-[74%] rounded-full bg-accent/45" />
            <div className="h-[3px] w-[52%] rounded-full bg-white/22" />
            <div className="h-[3px] w-[66%] rounded-full bg-accent/45" />
            <div className="h-[3px] w-[34%] rounded-full bg-white/22" />
          </>
        ) : kind === "chat" ? (
          <>
            <div className="ml-auto h-[3px] w-[52%] rounded-full bg-white/32" />
            <div className="h-[3px] w-[80%] rounded-full bg-white/18" />
            <div className="h-[3px] w-[66%] rounded-full bg-white/18" />
            <div className="ml-auto h-[3px] w-[40%] rounded-full bg-white/32" />
            <div className="h-[3px] w-[74%] rounded-full bg-white/18" />
            <div className="h-[3px] w-[58%] rounded-full bg-white/18" />
          </>
        ) : (
          <>
            <div className="h-[3px] w-[88%] rounded-full bg-white/28" />
            <div className="h-[3px] w-[70%] rounded-full bg-white/18" />
            <div className="h-[3px] w-[80%] rounded-full bg-white/18" />
            <div className="h-[3px] w-[46%] rounded-full bg-white/18" />
            <div className="h-[3px] w-[76%] rounded-full bg-white/18" />
            <div className="h-[3px] w-[62%] rounded-full bg-white/18" />
          </>
        )}
      </div>
    </div>
  );
}

/** Reduced-motion fallback: the same point, made in one screen, no scrolling. */
function WhatIfStatic() {
  return (
    <section className="py-32">
      <Container>
        <SectionLabel index="01">The problem</SectionLabel>
        <h2 className="mt-6 max-w-[16ch] text-[36px] font-semibold leading-[1.06] tracking-[-0.04em] sm:text-[52px]">
          What if your AI didn&rsquo;t live in a chat box?
        </h2>

        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-line p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-dim">
              Today
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
              Browser, PDF, AI chat, notes, terminal, browser again, another AI
              chat. Every answer arrives somewhere other than where the work is.
            </p>
          </div>
          <div className="rounded-xl border border-line-strong bg-panel p-6">
            <div className="flex items-center gap-2">
              <LogoMark size={16} />
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-dim">
                JhyapOS
              </p>
            </div>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
              One organized workspace, where the tools, the context, and the AI
              are already in the same place.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
