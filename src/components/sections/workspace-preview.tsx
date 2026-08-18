"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import { Container, SectionLabel } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import {
  AgentPane,
  BrowserPane,
  CanvasPane,
  SummarizerPane,
  TerminalPane,
} from "@/components/workspace/panes";
import { useInView } from "@/lib/use-typewriter";
import { usePrefersReducedMotion, useMediaQuery } from "@/lib/use-reduced-motion";

const PANES = [
  {
    id: "browser",
    name: "Browser",
    note: "Pages stay in the workspace, with their context attached.",
  },
  {
    id: "summarizer",
    name: "Summarizer",
    note: "Documents resolve into findings, methods, and takeaways.",
  },
  { id: "terminal", name: "Terminal", note: "A shell that knows what you're working on." },
  { id: "canvas", name: "Canvas", note: "Ideas placed in space, and the links between them." },
  { id: "agent", name: "Agent", note: "Works in the background, reports back in place." },
] as const;

type PaneId = (typeof PANES)[number]["id"];

export function WorkspacePreview() {
  const [hovered, setHovered] = useState<PaneId | null>(null);
  const { ref, inView } = useInView<HTMLDivElement>({ amount: 0.2 });
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const active = PANES.find((pane) => pane.id === hovered) ?? null;

  return (
    <section id="workspace" className="relative scroll-mt-20 py-24 md:py-32">
      <Container>
        <Reveal>
          <SectionLabel index="03">The workspace</SectionLabel>
        </Reveal>

        <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal delay={0.06}>
            <h2 className="max-w-[17ch] text-[32px] font-semibold leading-[1.07] tracking-[-0.04em] sm:text-[44px] md:text-[52px]">
              A workspace that understands what you&rsquo;re doing.
            </h2>
          </Reveal>

          {/* The caption reacts to whichever pane the cursor is over — the only
              text on the page that responds to the pointer. */}
          <Reveal delay={0.12} className="md:max-w-[280px] md:shrink-0 md:pb-2">
            <div className="min-h-[52px]">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint">
                {active ? active.name : isDesktop ? "Hover or drag a pane" : "The panes"}
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
                {active
                  ? active.note
                  : "Five surfaces, one context. Everything below is live markup, not a screenshot."}
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1} y={30}>
          <div ref={ref} className="mt-12 md:mt-16">
            <div className="panel overflow-hidden rounded-xl md:rounded-2xl">
              <SurfaceBar />
              <div className="bg-base p-2.5 md:p-3">
                {isDesktop ? (
                  <DesktopGrid hovered={hovered} setHovered={setHovered} play={inView} />
                ) : (
                  <StackedGrid play={inView} />
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

function SurfaceBar() {
  return (
    <div className="flex h-10 items-center gap-3 border-b border-line bg-white/[0.015] px-3 md:px-4">
      <div className="flex items-center gap-1.5" aria-hidden>
        <span className="size-2 rounded-full bg-white/12" />
        <span className="size-2 rounded-full bg-white/12" />
        <span className="size-2 rounded-full bg-white/12" />
      </div>
      <span className="font-mono text-[10.5px] tracking-[0.06em] text-ink-dim">
        multimodal-reasoning
      </span>
      <span aria-hidden className="hidden h-3.5 w-px bg-line-strong sm:block" />
      <span className="hidden font-mono text-[10px] uppercase tracking-[0.13em] text-ink-faint sm:block">
        context: 42 docs · 6 sources
      </span>
      <span className="ml-auto flex items-center gap-1.5">
        <span aria-hidden className="size-1.5 rounded-full bg-signal" />
        <span className="font-mono text-[10px] uppercase tracking-[0.13em] text-ink-faint">
          synced
        </span>
      </span>
    </div>
  );
}

function DesktopGrid({
  hovered,
  setHovered,
  play,
}: {
  hovered: PaneId | null;
  setHovered: (value: PaneId | null) => void;
  play: boolean;
}) {
  const boundsRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  const paneProps = (id: PaneId) => ({
    active: hovered === id,
    onPointerEnter: () => setHovered(id),
    onPointerLeave: () => setHovered(null),
    play,
  });

  /**
   * Panes are draggable within the surface. `dragSnapToOrigin` means the
   * layout can't be left broken — let go and it settles back, so the
   * interaction is playful without becoming a puzzle. Disabled outright under
   * reduced motion.
   */
  const drag = reduced
    ? {}
    : ({
        drag: true as const,
        dragConstraints: boundsRef,
        dragElastic: 0.12,
        dragMomentum: false,
        dragSnapToOrigin: true,
        whileDrag: { zIndex: 50, scale: 1.015, cursor: "grabbing" },
        dragTransition: { bounceStiffness: 320, bounceDamping: 34 },
      } as const);

  return (
    <div ref={boundsRef} className="grid h-[520px] grid-cols-12 grid-rows-8 gap-2.5">
      <motion.div {...drag} className="col-span-7 row-span-5 min-h-0">
        <BrowserPane className="h-full" {...paneProps("browser")} />
      </motion.div>

      <motion.div {...drag} className="col-span-5 row-span-5 min-h-0">
        <SummarizerPane className="h-full" {...paneProps("summarizer")} />
      </motion.div>

      <motion.div {...drag} className="col-span-4 row-span-3 min-h-0">
        <TerminalPane className="h-full" {...paneProps("terminal")} />
      </motion.div>

      <motion.div {...drag} className="col-span-5 row-span-3 min-h-0">
        <CanvasPane className="h-full" {...paneProps("canvas")} />
      </motion.div>

      <motion.div {...drag} className="col-span-3 row-span-3 min-h-0">
        <AgentPane className="h-full" {...paneProps("agent")} />
      </motion.div>
    </div>
  );
}

/** Tablet and phone: the same five panes, stacked and unencumbered by drag. */
function StackedGrid({ play }: { play: boolean }) {
  return (
    <div className="flex flex-col gap-2.5 sm:grid sm:grid-cols-2">
      <BrowserPane className="h-[310px] sm:col-span-2 sm:h-[300px]" play={play} />
      <SummarizerPane className="h-[228px]" play={play} />
      <CanvasPane className="h-[228px]" play={play} />
      <TerminalPane className="h-[142px]" play={play} />
      <AgentPane className="h-[142px]" play={play} />
    </div>
  );
}
