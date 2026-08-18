"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Globe,
  Layers,
  Lock,
  Search,
  Sparkles,
  SquareTerminal,
} from "lucide-react";
import { PaneChrome, StatusDot, TextLines } from "./chrome";
import { useTypewriter } from "@/lib/use-typewriter";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

interface PaneProps {
  active?: boolean;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
  className?: string;
  /** Gates animation so nothing runs off-screen. */
  play?: boolean;
}

/* ------------------------------------------------------------------ *
 * Browser
 * ------------------------------------------------------------------ */

export function BrowserPane({ active, play = true, className, ...handlers }: PaneProps) {
  return (
    <PaneChrome
      icon={Globe}
      label="Browser"
      active={active}
      className={className}
      trailing={<StatusDot tone={active ? "live" : "idle"} />}
      {...handlers}
    >
      <div className="flex h-full flex-col">
        {/* URL bar */}
        <div className="flex shrink-0 items-center gap-1.5 border-b border-line px-2.5 py-2">
          <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-md border border-line bg-white/[0.03] px-2 py-1">
            <Lock className="size-2.5 shrink-0 text-ink-faint" aria-hidden />
            <span className="truncate font-mono text-[10px] text-ink-dim">
              arxiv.org/abs/2411.04952
            </span>
          </div>
          <div className="hidden shrink-0 items-center gap-1 sm:flex">
            <span className="rounded border border-line bg-white/[0.03] px-1.5 py-1 font-mono text-[9px] text-ink-faint">
              +4
            </span>
          </div>
        </div>

        {/* Page */}
        <div className="min-h-0 flex-1 overflow-hidden px-3 py-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
            cs.CL · submitted 7 Nov
          </p>
          {/* Presentational: this is chrome inside a mock browser, not a
              heading in the document outline. */}
          <p className="mt-1.5 text-[12.5px] font-semibold leading-snug tracking-[-0.01em] text-ink">
            Compositional Grounding in Multimodal Reasoning Systems
          </p>
          <p className="mt-1 font-mono text-[9.5px] text-ink-faint">
            Okafor, Lindqvist, Rao — 24 pages
          </p>

          <div className="mt-3 space-y-2.5">
            <TextLines count={3} widths={[100, 94, 71]} />
            <div className="flex gap-2">
              <div
                aria-hidden
                className="h-9 w-14 shrink-0 rounded border border-line bg-white/[0.035]"
              />
              <TextLines count={3} widths={[96, 88, 60]} className="flex-1 pt-0.5" tone="faint" />
            </div>
            <TextLines count={2} widths={[92, 55]} tone="faint" />
          </div>
        </div>

        {/* Selection → the moment the workspace notices something */}
        <div
          className={`shrink-0 border-t border-line px-3 py-2 transition-opacity duration-500 ${
            active && play ? "opacity-100" : "opacity-45"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Search className="size-2.5 text-accent" aria-hidden />
            <span className="truncate font-mono text-[9.5px] text-ink-dim">
              selection captured → workspace context
            </span>
          </div>
        </div>
      </div>
    </PaneChrome>
  );
}

/* ------------------------------------------------------------------ *
 * Terminal
 * ------------------------------------------------------------------ */

const TERMINAL_SCRIPT = [
  { prompt: "~/research", command: "jh index papers/ --embed", output: "indexed 42 documents · 1.2s" },
  { prompt: "~/research", command: "jh ask \"which use contrastive pretraining?\"", output: "6 matches across 4 papers" },
];

export function TerminalPane({ active, play = true, className, ...handlers }: PaneProps) {
  const reduced = usePrefersReducedMotion();
  const [step, setStep] = useState(0);

  const currentCommand = TERMINAL_SCRIPT[Math.min(step, TERMINAL_SCRIPT.length - 1)]!.command;
  const { output: typed, done } = useTypewriter(currentCommand, {
    play: play && step < TERMINAL_SCRIPT.length,
    speed: 28,
    startDelay: 240,
  });

  // Advance to the next command a beat after the current one finishes.
  useEffect(() => {
    if (reduced || !play || !done || step >= TERMINAL_SCRIPT.length - 1) return;
    const timer = setTimeout(() => setStep((value) => value + 1), 1900);
    return () => clearTimeout(timer);
  }, [done, play, step, reduced]);

  return (
    <PaneChrome
      icon={SquareTerminal}
      label="Terminal"
      active={active}
      className={className}
      trailing={<StatusDot tone={active ? "live" : "idle"} />}
      {...handlers}
    >
      <div className="h-full overflow-hidden px-3 py-2.5 font-mono text-[10.5px] leading-[1.7]">
        {TERMINAL_SCRIPT.slice(0, step).map((line) => (
          <div key={line.command}>
            <div className="flex gap-1.5">
              <span className="shrink-0 text-accent-dim">{line.prompt}</span>
              <span className="shrink-0 text-ink-faint">$</span>
              <span className="truncate text-ink-muted">{line.command}</span>
            </div>
            <div className="pl-2 text-ink-faint">{line.output}</div>
          </div>
        ))}

        <div className="flex gap-1.5">
          <span className="shrink-0 text-accent-dim">
            {TERMINAL_SCRIPT[Math.min(step, TERMINAL_SCRIPT.length - 1)]!.prompt}
          </span>
          <span className="shrink-0 text-ink-faint">$</span>
          <span className="min-w-0 break-words text-ink">
            {typed}
            {done ? null : (
              <span aria-hidden className="caret ml-px inline-block h-[10px] w-[5px] translate-y-px bg-accent align-middle" />
            )}
          </span>
        </div>

        {done ? (
          <div className="pl-2 text-ink-faint">
            {TERMINAL_SCRIPT[Math.min(step, TERMINAL_SCRIPT.length - 1)]!.output}
          </div>
        ) : null}
      </div>
    </PaneChrome>
  );
}

/* ------------------------------------------------------------------ *
 * Summarizer
 * ------------------------------------------------------------------ */

const SUMMARY_SECTIONS = [
  {
    title: "3 Key Findings",
    items: [
      "Grounding improves compositional accuracy by 18.4%",
      "Gains hold under distribution shift",
      "Effect disappears below 2B parameters",
    ],
  },
  { title: "Methodology", items: ["Contrastive pretraining, 3-stage ablation, n=12 benchmarks"] },
  { title: "Main Takeaways", items: ["Scale is a precondition, not the mechanism"] },
];

export function SummarizerPane({
  active,
  play = true,
  className,
  ...handlers
}: PaneProps) {
  const reduced = usePrefersReducedMotion();
  const [revealed, setRevealed] = useState(reduced ? 3 : 0);

  // Sections resolve one at a time — the point is that understanding arrives
  // progressively, not that a card animates.
  useEffect(() => {
    if (reduced) {
      setRevealed(SUMMARY_SECTIONS.length);
      return;
    }
    if (!play) {
      setRevealed(0);
      return;
    }
    const timers = SUMMARY_SECTIONS.map((_, index) =>
      setTimeout(() => setRevealed(index + 1), 420 + index * 560),
    );
    return () => timers.forEach(clearTimeout);
  }, [play, reduced]);

  return (
    <PaneChrome
      icon={FileText}
      label="Summarizer"
      active={active}
      className={className}
      trailing={
        <StatusDot
          tone={revealed >= SUMMARY_SECTIONS.length ? "done" : "live"}
          label={revealed >= SUMMARY_SECTIONS.length ? "done" : "reading"}
        />
      }
      {...handlers}
    >
      <div className="mask-clip-b h-full overflow-hidden px-3 py-2.5">
        <div className="flex items-center gap-1.5 border-b border-line pb-2">
          <span className="rounded-[3px] bg-white/8 px-1 py-0.5 font-mono text-[8.5px] uppercase tracking-wider text-ink-dim">
            pdf
          </span>
          <span className="truncate font-mono text-[9.5px] text-ink-dim">
            okafor_grounding_2024.pdf
          </span>
        </div>

        <div className="mt-2.5 space-y-2.5">
          {SUMMARY_SECTIONS.map((section, index) => (
            <div
              key={section.title}
              className="transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
              style={{
                opacity: index < revealed ? 1 : 0,
                transform: index < revealed ? "translateY(0)" : "translateY(6px)",
              }}
            >
              <p className="text-[10.5px] font-semibold tracking-[-0.005em] text-ink">
                {section.title}
              </p>
              <ul className="mt-1 space-y-[3px]">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-1.5 text-[10px] leading-snug text-ink-dim">
                    <span aria-hidden className="mt-[5px] size-[3px] shrink-0 rounded-full bg-accent/70" />
                    <span className="min-w-0">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </PaneChrome>
  );
}

/* ------------------------------------------------------------------ *
 * Canvas
 * ------------------------------------------------------------------ */

const CANVAS_NODES = [
  { id: "a", label: "Grounding", x: 14, y: 20, w: 30 },
  { id: "b", label: "Ablation n=12", x: 58, y: 14, w: 34 },
  { id: "c", label: "Scale threshold", x: 20, y: 56, w: 38 },
  { id: "d", label: "Open question", x: 64, y: 62, w: 32 },
];

const CANVAS_EDGES = [
  ["a", "b"],
  ["a", "c"],
  ["c", "d"],
  ["b", "d"],
] as const;

export function CanvasPane({ active, play = true, className, ...handlers }: PaneProps) {
  const reduced = usePrefersReducedMotion();
  const [drawn, setDrawn] = useState(reduced);

  useEffect(() => {
    if (reduced) {
      setDrawn(true);
      return;
    }
    if (!play) {
      setDrawn(false);
      return;
    }
    const timer = setTimeout(() => setDrawn(true), 300);
    return () => clearTimeout(timer);
  }, [play, reduced]);

  const center = (id: string) => {
    const node = CANVAS_NODES.find((candidate) => candidate.id === id)!;
    return { x: node.x + node.w / 2, y: node.y + 7 };
  };

  return (
    <PaneChrome
      icon={Layers}
      label="Canvas"
      active={active}
      className={className}
      trailing={<StatusDot tone={active ? "live" : "idle"} />}
      {...handlers}
    >
      <div className="relative h-full bg-grid-fine">
        <svg
          className="absolute inset-0 size-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          {CANVAS_EDGES.map(([from, to], index) => {
            const start = center(from);
            const end = center(to);
            return (
              <line
                key={`${from}-${to}`}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke="rgba(227,179,65,0.42)"
                strokeWidth="0.4"
                vectorEffect="non-scaling-stroke"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={drawn ? 0 : 1}
                style={{
                  transition: `stroke-dashoffset 900ms cubic-bezier(0.16,1,0.3,1) ${240 + index * 170}ms`,
                }}
              />
            );
          })}
        </svg>

        {CANVAS_NODES.map((node, index) => (
          <div
            key={node.id}
            className="absolute rounded-[5px] border border-line-strong bg-raised px-1.5 py-1 text-[9px] leading-none text-ink-muted shadow-[0_6px_16px_-8px_rgba(0,0,0,0.9)] transition-all duration-[700ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              width: `${node.w}%`,
              opacity: drawn ? 1 : 0,
              transform: drawn ? "scale(1)" : "scale(0.9)",
              transitionDelay: `${index * 110}ms`,
            }}
          >
            <span className="block truncate">{node.label}</span>
          </div>
        ))}
      </div>
    </PaneChrome>
  );
}

/* ------------------------------------------------------------------ *
 * Agent
 * ------------------------------------------------------------------ */

const AGENT_STATES = [
  { status: "Scanning references", tone: "live" as const },
  { status: "Cross-checking methods", tone: "live" as const },
  { status: "Ready", tone: "done" as const },
];

export function AgentPane({ active, play = true, className, ...handlers }: PaneProps) {
  const reduced = usePrefersReducedMotion();
  const [stateIndex, setStateIndex] = useState(reduced ? AGENT_STATES.length - 1 : 0);

  useEffect(() => {
    if (reduced || !play) return;
    if (stateIndex >= AGENT_STATES.length - 1) return;
    const timer = setTimeout(() => setStateIndex((value) => value + 1), 1500);
    return () => clearTimeout(timer);
  }, [stateIndex, play, reduced]);

  const state = AGENT_STATES[stateIndex]!;
  const finished = stateIndex >= AGENT_STATES.length - 1;

  return (
    <PaneChrome
      icon={Sparkles}
      label="Agent"
      active={active}
      className={className}
      trailing={<StatusDot tone={state.tone} />}
      {...handlers}
    >
      <div className="flex h-full flex-col justify-between px-3 py-2.5">
        <div>
          <p
            key={state.status}
            className="font-mono text-[9.5px] uppercase tracking-[0.13em] text-ink-faint"
          >
            {state.status}
          </p>

          <p
            className="mt-2 text-[11px] leading-snug text-ink transition-opacity duration-500"
            style={{ opacity: finished ? 1 : 0.35 }}
          >
            I found 4 papers related to this methodology.
          </p>
        </div>

        <div
          className="flex gap-1.5 transition-opacity duration-500"
          style={{ opacity: finished ? 1 : 0 }}
        >
          <span className="rounded border border-line-strong bg-white/[0.04] px-1.5 py-1 font-mono text-[9px] text-ink-dim">
            Add to Canvas
          </span>
          <span className="rounded border border-line bg-transparent px-1.5 py-1 font-mono text-[9px] text-ink-faint">
            Dismiss
          </span>
        </div>
      </div>
    </PaneChrome>
  );
}
