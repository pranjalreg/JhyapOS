"use client";

import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "motion/react";
import { FileDown, GitBranch, Layers, PenLine, ScanLine, Search } from "lucide-react";
import { Container, SectionLabel } from "@/components/ui/section";
import { TextLines } from "@/components/workspace/chrome";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

const STEPS = [
  {
    index: "01",
    title: "Drop a paper.",
    body: "A PDF enters the workspace. Not an upload dialog — just the document, in place.",
    icon: FileDown,
  },
  {
    index: "02",
    title: "JhyapOS reads it.",
    body: "The system works through the document: structure, claims, references, figures.",
    icon: ScanLine,
  },
  {
    index: "03",
    title: "Understand the important parts.",
    body: "Key findings, methodology, and main takeaways — with the original always one click away.",
    icon: Layers,
  },
  {
    index: "04",
    title: "Keep researching.",
    body: "Search outward from what you just learned. Related work arrives in the same workspace.",
    icon: Search,
  },
  {
    index: "05",
    title: "Connect the ideas.",
    body: "Move what matters onto the Canvas and see how the pieces actually relate.",
    icon: GitBranch,
  },
  {
    index: "06",
    title: "Turn research into work.",
    body: "Write, build, and reason on top of everything the workspace already holds.",
    icon: PenLine,
  },
] as const;

export function ResearchWorkflow() {
  const sectionRef = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);
  const reduced = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  /* Reading the motion value directly means only a step change re-renders —
     the scroll itself never triggers React work. */
  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const next = Math.min(STEPS.length - 1, Math.floor(value * STEPS.length));
    setStep((current) => (current === next ? current : next));
  });

  if (reduced) return <WorkflowStatic />;

  return (
    <section
      id="research"
      ref={sectionRef}
      className="relative scroll-mt-20"
      style={{ height: `${STEPS.length * 90}vh` }}
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <Container className="w-full">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
            {/* Left: the narration */}
            <div>
              <SectionLabel index="04">The research workflow</SectionLabel>

              <h2 className="mt-6 text-[30px] font-semibold leading-[1.07] tracking-[-0.04em] sm:text-[40px]">
                From paper to understanding.
              </h2>

              {/* Fixed height so the rail below doesn't jump between steps of
                  different length — sized to the longest of the six. */}
              <div className="mt-8 h-[168px] sm:h-[152px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
                      Step {STEPS[step]!.index}
                    </p>
                    <h3 className="mt-4 max-w-[16ch] text-[26px] font-semibold leading-[1.14] tracking-[-0.03em] sm:text-[32px]">
                      {STEPS[step]!.title}
                    </h3>
                    <p className="mt-3.5 max-w-[42ch] text-[15px] leading-relaxed text-ink-muted">
                      {STEPS[step]!.body}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <StepRail current={step} />
            </div>

            {/* Right: the stage */}
            <div className="relative aspect-[4/3] w-full sm:aspect-[16/11]">
              <div className="panel absolute inset-0 overflow-hidden rounded-xl">
                <div className="flex h-8 items-center gap-2 border-b border-line bg-white/[0.015] px-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.13em] text-ink-dim">
                    Workspace
                  </span>
                  <span className="ml-auto font-mono text-[10px] text-ink-faint tabular">
                    {STEPS[step]!.index} / {STEPS[STEPS.length - 1]!.index}
                  </span>
                </div>

                <div className="relative h-[calc(100%-2rem)] bg-base">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, scale: 0.985 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.99 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute inset-0"
                    >
                      <Stage step={step} />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}

/** Six ticks that fill as you pass them. The only progress indicator on the page. */
function StepRail({ current }: { current: number }) {
  return (
    <ol className="mt-6 flex items-center gap-2" aria-label="Workflow progress">
      {STEPS.map((item, index) => (
        <li key={item.index} className="flex flex-1 items-center gap-2">
          <span
            aria-current={index === current ? "step" : undefined}
            className="relative h-[2px] flex-1 overflow-hidden rounded-full bg-white/8"
          >
            <span
              className="absolute inset-y-0 left-0 rounded-full bg-accent transition-[width] duration-500 ease-out"
              style={{ width: index <= current ? "100%" : "0%" }}
            />
            <span className="sr-only">{item.title}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

/* ------------------------------------------------------------------ *
 * Stages — one per step. Each is deliberately cheap: layout, borders,
 * and opacity. Nothing here paints more than a few dozen boxes.
 * ------------------------------------------------------------------ */

function Stage({ step }: { step: number }) {
  switch (step) {
    case 0:
      return <StageDrop />;
    case 1:
      return <StageRead />;
    case 2:
      return <StageUnderstand />;
    case 3:
      return <StageSearch />;
    case 4:
      return <StageConnect />;
    default:
      return <StageWork />;
  }
}

function DocCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`overflow-hidden rounded-lg border border-line-strong bg-panel shadow-[0_28px_60px_-26px_rgba(0,0,0,0.95)] ${className}`}
    >
      <div className="flex items-center gap-1.5 border-b border-line px-2.5 py-1.5">
        <span className="rounded-[3px] bg-white/10 px-1 py-0.5 font-mono text-[8px] uppercase tracking-wider text-ink-dim">
          pdf
        </span>
        <span className="truncate font-mono text-[9.5px] text-ink-dim">
          okafor_grounding_2024.pdf
        </span>
      </div>
      <div className="space-y-2 p-3">
        <div className="h-[4px] w-[72%] rounded-full bg-white/16" />
        <TextLines count={5} widths={[100, 94, 97, 88, 62]} />
        <div aria-hidden className="h-10 rounded border border-line bg-white/[0.03]" />
        <TextLines count={3} widths={[96, 90, 54]} tone="faint" />
      </div>
    </div>
  );
}

function StageDrop() {
  return (
    <div className="relative grid h-full place-items-center bg-grid-fine p-6">
      <motion.div
        initial={{ y: -60, opacity: 0, rotate: -4 }}
        animate={{ y: 0, opacity: 1, rotate: -1.2 }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        className="w-[58%] max-w-[260px]"
      >
        <DocCard />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55, duration: 0.5 }}
        className="absolute inset-x-0 bottom-5 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint"
      >
        Dropped into workspace
      </motion.div>
    </div>
  );
}

function StageRead() {
  return (
    <div className="relative grid h-full place-items-center overflow-hidden p-6">
      <div className="relative w-[58%] max-w-[260px]">
        <DocCard />
        {/* Scan line travelling the document */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg">
          <div className="sweep h-8 w-full bg-[linear-gradient(to_bottom,transparent,rgba(227,179,65,0.16),transparent)]" />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-5 flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
        <span aria-hidden className="size-1.5 rounded-full bg-accent livedot" />
        Parsing structure · 24 pages
      </div>
    </div>
  );
}

const UNDERSTAND = [
  { title: "3 Key Findings", lines: 3 },
  { title: "Methodology", lines: 2 },
  { title: "Main Takeaways", lines: 2 },
];

function StageUnderstand() {
  return (
    <div className="flex h-full flex-col justify-center gap-2.5 p-5">
      {UNDERSTAND.map((block, index) => (
        <motion.div
          key={block.title}
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 + index * 0.16, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-lg border border-line bg-panel p-3"
        >
          <div className="flex items-center gap-2">
            <span aria-hidden className="size-1.5 rounded-full bg-accent" />
            <p className="text-[12px] font-semibold tracking-[-0.01em] text-ink">
              {block.title}
            </p>
          </div>
          <TextLines
            count={block.lines}
            widths={[96, 84, 66]}
            className="mt-2.5 pl-3.5"
          />
        </motion.div>
      ))}
    </div>
  );
}

const RESULTS = [
  "Contrastive grounding at scale",
  "Ablations for multimodal encoders",
  "Compositionality benchmarks, revisited",
  "On thresholds in emergent behaviour",
];

function StageSearch() {
  return (
    <div className="flex h-full flex-col p-5">
      <div className="flex items-center gap-2 rounded-md border border-line-strong bg-white/[0.03] px-2.5 py-2">
        <Search className="size-3 shrink-0 text-ink-dim" aria-hidden />
        <span className="truncate font-mono text-[10.5px] text-ink-muted">
          related to: contrastive pretraining
        </span>
      </div>

      <ul className="mt-3 space-y-2">
        {RESULTS.map((result, index) => (
          <motion.li
            key={result}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + index * 0.13, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-start gap-2 rounded-md border border-line bg-panel px-2.5 py-2"
          >
            <span className="mt-0.5 font-mono text-[9px] text-ink-faint tabular">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[11px] text-ink">{result}</p>
              <p className="mt-0.5 font-mono text-[9px] text-ink-faint">arxiv · 2024</p>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

const CONNECT_NODES = [
  { label: "Grounding", x: 8, y: 16, w: 34 },
  { label: "Contrastive", x: 56, y: 10, w: 34 },
  { label: "Scale threshold", x: 14, y: 54, w: 40 },
  { label: "Benchmarks", x: 60, y: 60, w: 34 },
];

function StageConnect() {
  return (
    <div className="relative h-full bg-grid-fine p-4">
      <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        {[
          [0, 1],
          [0, 2],
          [2, 3],
          [1, 3],
        ].map(([from, to], index) => {
          const a = CONNECT_NODES[from!]!;
          const b = CONNECT_NODES[to!]!;
          return (
            <motion.line
              key={`${from}-${to}`}
              x1={a.x + a.w / 2}
              y1={a.y + 5}
              x2={b.x + b.w / 2}
              y2={b.y + 5}
              stroke="rgba(227,179,65,0.45)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: 0.35 + index * 0.16, duration: 0.6, ease: "easeOut" }}
            />
          );
        })}
      </svg>

      {CONNECT_NODES.map((node, index) => (
        <motion.div
          key={node.label}
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="absolute rounded-md border border-line-strong bg-raised px-2 py-1.5 text-[10px] leading-none text-ink-muted shadow-[0_8px_20px_-10px_rgba(0,0,0,0.9)]"
          style={{ left: `${node.x}%`, top: `${node.y}%`, width: `${node.w}%` }}
        >
          <span className="block truncate">{node.label}</span>
        </motion.div>
      ))}
    </div>
  );
}

function StageWork() {
  return (
    <div className="flex h-full flex-col p-5">
      <div className="flex items-center gap-2 border-b border-line pb-2">
        <PenLine className="size-3 text-ink-dim" aria-hidden />
        <span className="font-mono text-[10px] uppercase tracking-[0.13em] text-ink-dim">
          Draft · lit-review.md
        </span>
      </div>

      <div className="mt-3 space-y-3">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-[12px] font-semibold tracking-[-0.01em] text-ink"
        >
          Where grounding actually helps
        </motion.p>

        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 + index * 0.15, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <TextLines count={3} widths={[100, 93, index === 2 ? 44 : 86]} />
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75, duration: 0.5 }}
          className="flex items-center gap-2 rounded-md border border-line bg-panel px-2.5 py-2"
        >
          <span aria-hidden className="size-1.5 rounded-full bg-signal" />
          <span className="font-mono text-[9.5px] text-ink-dim">
            4 citations linked from Canvas
          </span>
        </motion.div>
      </div>
    </div>
  );
}

/** Reduced motion: the same six steps as a plain, readable list. */
function WorkflowStatic() {
  return (
    <section id="research" className="scroll-mt-20 py-28">
      <Container>
        <SectionLabel index="04">The research workflow</SectionLabel>
        <h2 className="mt-6 text-[34px] font-semibold leading-[1.07] tracking-[-0.04em] sm:text-[44px]">
          From paper to understanding.
        </h2>

        <ol className="mt-14 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((item) => (
            <li key={item.index} className="bg-void p-6">
              <div className="flex items-center gap-2.5">
                <item.icon className="size-3.5 text-accent" aria-hidden />
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
                  Step {item.index}
                </span>
              </div>
              <h3 className="mt-4 text-[18px] font-semibold tracking-[-0.02em]">
                {item.title}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">{item.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
