"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { useWaitlist } from "@/components/waitlist/waitlist-provider";

const LINKS = [
  { label: "Workspace", href: "#workspace" },
  { label: "Research", href: "#research" },
  { label: "Vision", href: "#vision" },
];

export function Nav() {
  const { openWaitlist } = useWaitlist();
  const [scrolled, setScrolled] = useState(false);

  // Passive listener + a boolean flip: no layout reads, no per-frame state.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500",
        scrolled
          ? "border-b border-line bg-void/72 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      ].join(" ")}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 w-full max-w-[1180px] items-center gap-6 px-5 sm:px-8 lg:px-10"
      >
        <a
          href="#main"
          className="rounded-md transition-opacity hover:opacity-80"
          aria-label="JhyapOS — home"
        >
          <Logo />
        </a>

        <ul className="ml-4 hidden items-center gap-7 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="rounded text-[13.5px] text-ink-muted transition-colors hover:text-ink"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            withArrow
            onClick={() => openWaitlist("nav")}
          >
            Join the Waitlist
          </Button>
        </div>
      </nav>
    </header>
  );
}
