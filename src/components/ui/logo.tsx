import Image from "next/image";
import logoMark from "@/assets/logo-mark.png";

/**
 * The JhyapOS mark — the real app icon, not a redraw.
 *
 * Source is `apps/web/assets/logo.png` from the product repo. The only change
 * is an alpha channel: the original is an opaque square with the disc sitting
 * on a black field, which would read as a dark box on the page, so everything
 * outside the disc is cleared and the canvas cropped to it. Every pixel of the
 * artwork itself is untouched.
 *
 * Statically imported so Next knows its intrinsic size and serves an optimised,
 * correctly-scaled WebP — the 446px PNG never reaches the browser.
 */
export function LogoMark({
  size = 26,
  className = "",
  priority = false,
}: {
  /** Rendered edge length in px. The mark is square. */
  size?: number;
  className?: string;
  /** Set on the header instance so it isn't lazy-loaded above the fold. */
  priority?: boolean;
}) {
  /* Ask for 3× the display size and scale down in CSS. Sizing the element
     directly makes Next serve a ~1× asset, which goes soft on retina — the
     mark is small and detailed enough that it shows. */
  return (
    <Image
      src={logoMark}
      alt=""
      width={size * 3}
      height={size * 3}
      priority={priority}
      style={{ width: size, height: size }}
      className={`shrink-0 select-none ${className}`}
      draggable={false}
    />
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={26} priority />
      <span className="text-[15px] font-semibold tracking-[-0.02em] text-ink">
        JhyapOS
      </span>
    </span>
  );
}
