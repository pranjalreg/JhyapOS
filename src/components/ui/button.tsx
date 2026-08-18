"use client";

import { forwardRef, useRef, useState, type ButtonHTMLAttributes } from "react";
import { ArrowRight } from "lucide-react";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Renders the trailing arrow that slides on hover. */
  withArrow?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-ink text-void hover:bg-white active:bg-white/90 shadow-[0_1px_0_0_rgba(255,255,255,0.5)_inset]",
  secondary:
    "bg-white/[0.045] text-ink border border-line-strong hover:bg-white/[0.085] hover:border-white/25",
  ghost: "text-ink-muted hover:text-ink",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3.5 text-[13px] gap-1.5 rounded-md",
  md: "h-10 px-4.5 text-[14px] gap-2 rounded-lg",
  lg: "h-12 px-6 text-[15px] gap-2 rounded-lg",
};

/**
 * The site's one button.
 *
 * On a fine pointer it leans a couple of degrees toward the cursor — enough to
 * register as responsive, small enough that nobody consciously notices. Falls
 * back to a plain button under reduced motion or on touch.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "primary", size = "md", withArrow, className = "", children, ...props },
    forwardedRef,
  ) {
    const localRef = useRef<HTMLButtonElement | null>(null);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const reduced = usePrefersReducedMotion();

    const setRefs = (node: HTMLButtonElement | null) => {
      localRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
      if (reduced || event.pointerType !== "mouse" || !localRef.current) return;
      const rect = localRef.current.getBoundingClientRect();
      const relX = (event.clientX - rect.left) / rect.width - 0.5;
      const relY = (event.clientY - rect.top) / rect.height - 0.5;
      setTilt({ x: relX * 5, y: relY * 3 });
    };

    return (
      <button
        ref={setRefs}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setTilt({ x: 0, y: 0 })}
        style={{
          transform: `translate3d(${tilt.x}px, ${tilt.y}px, 0)`,
          transition: "transform 380ms var(--ease-out-expo), background-color 180ms, border-color 180ms, color 180ms, opacity 180ms",
        }}
        className={[
          "group relative inline-flex select-none items-center justify-center whitespace-nowrap font-medium",
          "will-change-transform disabled:pointer-events-none disabled:opacity-50",
          SIZES[size],
          VARIANTS[variant],
          className,
        ].join(" ")}
        {...props}
      >
        {children}
        {withArrow ? (
          <ArrowRight
            aria-hidden
            className="size-3.5 shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
          />
        ) : null}
      </button>
    );
  },
);
