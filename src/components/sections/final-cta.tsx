"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/section";
import { useWaitlist } from "@/components/waitlist/waitlist-provider";

/**
 * The closing frame. Nearly black, almost nothing on it, one thing to do.
 * The restraint is the point — everything loud already happened.
 */
export function FinalCTA() {
  const { openWaitlist } = useWaitlist();

  return (
    <section className="relative overflow-hidden bg-void py-32 md:py-48">
      {/* A single pool of light on the horizon. The only glow on the page. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[420px] bg-[radial-gradient(ellipse_60%_100%_at_50%_100%,rgba(227,179,65,0.07),transparent_70%)]"
      />

      <Container className="relative text-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.8 }}
          className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-faint"
        >
          The next workspace is being built
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-8 max-w-[13ch] text-[44px] font-semibold leading-[1.02] tracking-[-0.045em] sm:text-[68px] md:text-[86px]"
        >
          Welcome to JhyapOS.
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.9, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12"
        >
          <Button size="lg" withArrow onClick={() => openWaitlist("final")}>
            Join the Waitlist
          </Button>

          <p className="mt-6 text-[14px] text-ink-dim">
            Be one of the first to experience it.
          </p>
        </motion.div>
      </Container>
    </section>
  );
}
