"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode, ElementType } from "react";

interface RevealProps {
  children: ReactNode;
  /** Seconds of stagger before this element starts. */
  delay?: number;
  /** Travel distance in px. 0 gives a pure fade. */
  y?: number;
  className?: string;
  as?: ElementType;
  once?: boolean;
}

/**
 * The site's baseline entrance: a short rise and fade on first view.
 *
 * `motion` disables transforms itself when the user prefers reduced motion, so
 * this collapses to a plain static element with no extra branching.
 */
export function Reveal({
  children,
  delay = 0,
  y = 18,
  className,
  as = "div",
  once = true,
}: RevealProps) {
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;

  const variants: Variants = {
    hidden: { opacity: 0, y },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.72, delay, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.35, margin: "0px 0px -8% 0px" }}
      variants={variants}
    >
      {children}
    </MotionTag>
  );
}

/**
 * Splits a headline into words that rise independently. Used sparingly — only
 * on the three or four lines that carry the argument.
 */
export function RevealWords({
  text,
  className = "",
  delay = 0,
  stagger = 0.045,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const words = text.split(" ");

  return (
    <motion.span
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
      aria-label={text}
    >
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className="inline-block overflow-hidden align-bottom"
          aria-hidden
        >
          <motion.span
            className="inline-block"
            variants={{
              hidden: { y: "108%" },
              visible: {
                y: 0,
                transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
              },
            }}
          >
            {word}
            {index < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}
