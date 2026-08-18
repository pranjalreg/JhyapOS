"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/section";
import { HeroWorkspace } from "@/components/workspace/hero-workspace";
import { useWaitlist } from "@/components/waitlist/waitlist-provider";

const RISE = {
  hidden: { opacity: 0, y: 22 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export function Hero() {
  const { openWaitlist } = useWaitlist();

  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 md:pb-28 lg:pt-44">
      {/* Substrate: a hairline grid that fades out well before the content, so
          it reads as material rather than decoration. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[620px] bg-grid opacity-70 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]"
      />

      <Container className="relative">
        <motion.div
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-[820px] text-center"
        >
          <motion.h1
            variants={RISE}
            custom={0}
            className="text-[40px] font-semibold leading-[1.02] tracking-[-0.04em] sm:text-[58px] md:text-[68px] lg:text-[76px]"
          >
            AI shouldn&rsquo;t just answer you.
            <span className="mt-1.5 block text-ink-dim">It should work with you.</span>
          </motion.h1>

          <motion.p
            variants={RISE}
            custom={0.09}
            className="mx-auto mt-7 max-w-[560px] text-[16px] leading-[1.6] text-ink-muted sm:text-[17px]"
          >
            JhyapOS is an AI-native workspace built for research, creation, and
            the work that happens between the tools.
          </motion.p>

          <motion.div
            variants={RISE}
            custom={0.18}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button
              size="lg"
              withArrow
              onClick={() => openWaitlist("hero")}
              className="w-full sm:w-auto"
            >
              Join the Waitlist
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                document
                  .getElementById("workspace")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="w-full sm:w-auto"
            >
              Explore JhyapOS
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 42 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.33, duration: 1.15, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-16 max-w-[1000px] sm:mt-20"
        >
          <HeroWorkspace />
        </motion.div>
      </Container>
    </section>
  );
}
