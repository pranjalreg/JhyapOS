"use client";

import { useEffect, useState } from "react";

/**
 * Tracks `prefers-reduced-motion` live.
 *
 * Returns `false` during SSR and the first client paint so markup matches, then
 * flips on mount. Scroll-linked components use this to render their resolved
 * end state instead of animating.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);

    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

/**
 * True once the viewport is at least `query` wide. Used to swap heavy desktop
 * workspace choreography for the simplified mobile arrangement.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const list = window.matchMedia(query);
    setMatches(list.matches);

    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    list.addEventListener("change", onChange);
    return () => list.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
