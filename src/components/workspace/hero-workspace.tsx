"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { Command } from "lucide-react";
import {
  AgentPane,
  BrowserPane,
  CanvasPane,
  SummarizerPane,
  TerminalPane,
} from "./panes";
import { usePrefersReducedMotion, useMediaQuery } from "@/lib/use-reduced-motion";

/**
 * The hero's miniature JhyapOS.
 *
 * Every pane is real markup rather than a screenshot, so it stays crisp at any
 * density and costs nothing to download. Scroll drives a shallow parallax:
 * panes drift at slightly different rates and the surface tips back a degree,
 * which reads as depth without anything visibly "animating".
 */
export function HeroWorkspace() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [hovered, setHovered] = useState<string | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // One spring feeding every derived transform keeps the whole surface
  // coherent — panes move together, not as five independent animations.
  const progress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    restDelta: 0.0008,
  });

  const enabled = !reduced && isDesktop;

  const surfaceRotate = useTransform(progress, [0, 0.5, 1], [7.5, 0.6, -3.5]);
  const surfaceScale = useTransform(progress, [0, 0.5, 1], [0.955, 1, 0.985]);
  const surfaceY = useTransform(progress, [0, 1], [36, -46]);

  return (
    <div ref={containerRef} className="relative">
      {/* Ambient floor light — a soft pool under the surface, not a glowing
          blob floating in space. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[8%] -bottom-10 -top-6 -z-10 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(227,179,65,0.055),transparent_68%)] blur-2xl"
      />

      <motion.div
        style={
          enabled
            ? {
                rotateX: surfaceRotate,
                scale: surfaceScale,
                y: surfaceY,
                transformPerspective: 1600,
              }
            : undefined
        }
        className="origin-[50%_20%] will-change-transform"
      >
        <WorkspaceSurface>
          {isDesktop ? (
            <DesktopLayout progress={progress} enabled={enabled} hovered={hovered} setHovered={setHovered} />
          ) : (
            <MobileLayout />
          )}
        </WorkspaceSurface>
      </motion.div>
    </div>
  );
}

/** The outer JhyapOS window: title bar, workspace name, live context readout. */
function WorkspaceSurface({ children }: { children: React.ReactNode }) {
  return (
    <div className="panel overflow-hidden rounded-xl md:rounded-2xl">
      <div className="flex h-9 items-center gap-3 border-b border-line bg-white/[0.015] px-3 md:h-10 md:px-4">
        <div className="flex items-center gap-1.5" aria-hidden>
          <span className="size-2 rounded-full bg-white/12" />
          <span className="size-2 rounded-full bg-white/12" />
          <span className="size-2 rounded-full bg-white/12" />
        </div>

        <div className="mx-auto flex items-center gap-2 rounded-md border border-line bg-white/[0.03] px-2.5 py-1">
          <span className="font-mono text-[10px] tracking-[0.06em] text-ink-dim">
            multimodal-reasoning
          </span>
          <span aria-hidden className="size-1 rounded-full bg-accent livedot" />
        </div>

        <div className="hidden items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.13em] text-ink-faint sm:flex">
          <span>42 docs</span>
          <span aria-hidden className="text-ink-faint/50">·</span>
          <span>local + cloud</span>
        </div>
      </div>

      <div className="relative bg-base p-2 md:p-2.5">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Desktop: the full five-pane arrangement with per-pane parallax.
 * ------------------------------------------------------------------ */

function DesktopLayout({
  progress,
  enabled,
  hovered,
  setHovered,
}: {
  progress: MotionValue<number>;
  enabled: boolean;
  hovered: string | null;
  setHovered: (value: string | null) => void;
}) {
  // Small, differing drifts. The spread is the whole effect — if they all moved
  // the same amount you'd see nothing.
  const browserY = useTransform(progress, [0, 1], [0, -26]);
  const summaryY = useTransform(progress, [0, 1], [0, -13]);
  const terminalY = useTransform(progress, [0, 1], [0, -32]);
  const canvasY = useTransform(progress, [0, 1], [0, -19]);
  const agentY = useTransform(progress, [0, 1], [0, -8]);

  const paneProps = (id: string) => ({
    active: hovered === id,
    onPointerEnter: () => setHovered(id),
    onPointerLeave: () => setHovered(null),
  });

  return (
    /* Taller between 768px and 1024px: the columns are narrow there, so pane
       content wraps to more lines and needs the extra room. */
    <div className="grid h-[478px] grid-cols-12 grid-rows-7 gap-2 lg:h-[500px] lg:gap-2.5">
      <motion.div
        style={enabled ? { y: browserY } : undefined}
        className="col-span-7 row-span-4 min-h-0 will-change-transform"
      >
        <BrowserPane className="h-full" {...paneProps("browser")} />
      </motion.div>

      <motion.div
        style={enabled ? { y: summaryY } : undefined}
        className="col-span-5 row-span-4 min-h-0 will-change-transform"
      >
        <SummarizerPane className="h-full" {...paneProps("summarizer")} />
      </motion.div>

      <motion.div
        style={enabled ? { y: terminalY } : undefined}
        className="col-span-5 row-span-3 min-h-0 will-change-transform"
      >
        <TerminalPane className="h-full" {...paneProps("terminal")} />
      </motion.div>

      <motion.div
        style={enabled ? { y: canvasY } : undefined}
        className="col-span-4 row-span-3 min-h-0 will-change-transform"
      >
        <CanvasPane className="h-full" {...paneProps("canvas")} />
      </motion.div>

      <motion.div
        style={enabled ? { y: agentY } : undefined}
        className="col-span-3 row-span-3 min-h-0 will-change-transform"
      >
        <AgentPane className="h-full" {...paneProps("agent")} />
      </motion.div>

      <FloatingCommandBar />
    </div>
  );
}

/** The command interface, floating over the surface it controls. */
function FloatingCommandBar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.15, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="pointer-events-none absolute bottom-5 left-1/2 z-20 w-[300px] -translate-x-1/2 lg:w-[360px]"
    >
      <div className="flex items-center gap-2.5 rounded-lg border border-line-strong bg-elevated/92 px-3 py-2.5 shadow-[0_20px_50px_-18px_rgba(0,0,0,0.95)] backdrop-blur-md">
        <Command className="size-3.5 shrink-0 text-ink-dim" aria-hidden />
        <span className="min-w-0 flex-1 truncate text-[12px] text-ink-dim">
          Ask, search, or build&hellip;
        </span>
        <kbd className="shrink-0 rounded border border-line bg-white/[0.05] px-1.5 py-0.5 font-mono text-[9.5px] text-ink-faint">
          ⌘K
        </kbd>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ *
 * Mobile: three panes, stacked, no parallax.
 *
 * Squeezing a five-pane desktop workspace into 375px would just make it
 * illegible — so the mobile build shows the three panes that carry the idea.
 * ------------------------------------------------------------------ */

function MobileLayout() {
  return (
    <div className="flex flex-col gap-2">
      <BrowserPane className="h-[290px]" active />
      <SummarizerPane className="h-[196px]" />
      <TerminalPane className="h-[118px]" />
    </div>
  );
}
