"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "./use-reduced-motion";

/**
 * Types `text` out one character at a time while `play` is true.
 *
 * Driven by a single rAF loop rather than a per-character `setInterval`, so it
 * stays on the compositor's clock and pauses automatically when the tab is
 * backgrounded. Under reduced motion it returns the finished string
 * immediately.
 */
export function useTypewriter(
  text: string,
  { play = true, speed = 34, startDelay = 0 }: {
    play?: boolean;
    speed?: number;
    startDelay?: number;
  } = {},
) {
  const reduced = usePrefersReducedMotion();
  const [output, setOutput] = useState("");
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (reduced) {
      setOutput(text);
      return;
    }

    if (!play) {
      setOutput("");
      return;
    }

    let start: number | null = null;

    const step = (timestamp: number) => {
      if (start === null) start = timestamp;
      const elapsed = timestamp - start - startDelay;

      if (elapsed >= 0) {
        const characters = Math.min(text.length, Math.floor(elapsed / speed));
        setOutput(text.slice(0, characters));
        if (characters >= text.length) return;
      }

      frameRef.current = requestAnimationFrame(step);
    };

    frameRef.current = requestAnimationFrame(step);

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [text, play, speed, startDelay, reduced]);

  return { output, done: output.length >= text.length };
}

/**
 * True once the element has scrolled into view. Everything expensive on this
 * page is gated behind it so nothing animates off-screen.
 */
export function useInView<T extends Element>(
  { once = true, amount = 0.3 }: { once?: boolean; amount?: number } = {},
) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold: amount },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [once, amount]);

  return { ref, inView };
}
