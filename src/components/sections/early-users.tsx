"use client";

import { Container, SectionLabel } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { useWaitlist } from "@/components/waitlist/waitlist-provider";

/**
 * Honest early-stage social proof.
 *
 * No counts, no borrowed logos, no invented testimonials. When real ones
 * exist, they belong in the empty slot below this copy — until then, saying
 * less is the credible move.
 */
export function EarlyUsers() {
  const { openWaitlist } = useWaitlist();

  return (
    <section className="relative py-24 md:py-32">
      <Container>
        <div className="rounded-2xl border border-line bg-white/[0.015] px-7 py-14 text-center sm:px-12 md:py-20">
          <Reveal>
            <SectionLabel className="justify-center">Early access</SectionLabel>
          </Reveal>

          <Reveal delay={0.06}>
            <h2 className="mx-auto mt-7 max-w-[20ch] text-[28px] font-semibold leading-[1.12] tracking-[-0.035em] sm:text-[38px]">
              We&rsquo;re building JhyapOS with our earliest users.
            </h2>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="mx-auto mt-6 max-w-[52ch] text-[15px] leading-[1.65] text-ink-muted sm:text-[16px]">
              Researchers, developers, and curious builders are helping shape
              what comes next.
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="mt-9">
              <Button size="lg" withArrow onClick={() => openWaitlist("early-users")}>
                Join the Waitlist
              </Button>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
