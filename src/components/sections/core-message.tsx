"use client";

import { Container, SectionLabel } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";

const TOOLS = ["Browser", "PDFs", "AI chat", "Terminal", "Notes", "Sheets"];

/**
 * A deliberately still section.
 *
 * The two sections around it are the most animated on the page; this one holds
 * completely so the argument lands in silence. One sentence, one diagram.
 */
export function CoreMessage() {
  return (
    <section className="relative py-28 md:py-40">
      <Container>
        <Reveal>
          <SectionLabel index="02">The core problem</SectionLabel>
        </Reveal>

        <Reveal delay={0.08}>
          <h2 className="mt-8 max-w-[19ch] text-[34px] font-semibold leading-[1.05] tracking-[-0.04em] sm:text-[50px] md:text-[62px]">
            The researcher shouldn&rsquo;t have to be the integration layer.
          </h2>
        </Reveal>

        <Reveal delay={0.14}>
          <p className="mt-8 max-w-[54ch] text-[16px] leading-[1.65] text-ink-muted sm:text-[17px]">
            JhyapOS brings the tools, information, context, and AI together so
            you can focus on the work instead of constantly switching between it.
          </p>
        </Reveal>

        <Reveal delay={0.2} y={26}>
          <IntegrationDiagram />
        </Reveal>
      </Container>
    </section>
  );
}

/**
 * Six tools, every one of them wired through a single human. Drawn rather than
 * described — the diagram is the sentence.
 */
function IntegrationDiagram() {
  return (
    <figure className="mt-20 md:mt-24">
      <div className="relative mx-auto max-w-[720px]">
        <ul className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-2.5 sm:gap-x-4">
          {TOOLS.map((tool) => (
            <li
              key={tool}
              className="rounded-md border border-line bg-white/[0.02] px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-dim"
            >
              {tool}
            </li>
          ))}
        </ul>

        {/* Converging leaders. Pure SVG, no animation — it just sits there. */}
        <svg
          viewBox="0 0 720 110"
          className="mt-1 w-full"
          fill="none"
          aria-hidden
          preserveAspectRatio="none"
        >
          {[60, 176, 292, 428, 544, 660].map((startX) => (
            <path
              key={startX}
              d={`M ${startX} 2 C ${startX} 56, 360 46, 360 104`}
              stroke="rgba(255,255,255,0.14)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>

        <div className="-mt-1 flex justify-center">
          <div className="rounded-md border border-accent/35 bg-accent/8 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-accent">
            You
          </div>
        </div>
      </div>

      <figcaption className="mt-8 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint">
        Every handoff runs through a person
      </figcaption>
    </figure>
  );
}
