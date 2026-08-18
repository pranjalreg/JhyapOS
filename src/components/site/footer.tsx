"use client";

import { Container } from "@/components/ui/section";
import { Logo } from "@/components/ui/logo";

/**
 * Social destinations.
 *
 * These are intentionally left as `null` rather than guessed — pointing at a
 * handle that might belong to someone else is worse than showing nothing. Fill
 * in the real URLs here and the links light up automatically.
 */
const SOCIAL: { label: string; href: string | null }[] = [
  { label: "X", href: null },
  { label: "Discord", href: null },
  { label: "GitHub", href: null },
];

const PRODUCT: { label: string; href: string }[] = [
  { label: "Product", href: "#workspace" },
  { label: "About", href: "#vision" },
  { label: "Contact", href: "mailto:hello@jhyapos.com" },
];

const LEGAL: { label: string; href: string }[] = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line py-14">
      <Container>
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Logo />
            <p className="mt-4 max-w-[30ch] text-[13.5px] leading-relaxed text-ink-dim">
              An AI-native workspace for research and knowledge work.
            </p>
          </div>

          <nav aria-label="Footer" className="flex gap-12 sm:gap-16">
            <FooterColumn title="Product" links={PRODUCT} />
            <FooterColumn title="Legal" links={LEGAL} />
            <FooterColumn
              title="Elsewhere"
              links={SOCIAL.filter(
                (link): link is { label: string; href: string } => link.href !== null,
              )}
              emptyNote={SOCIAL.every((link) => link.href === null) ? "Soon" : undefined}
            />
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-line pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[11px] text-ink-faint">
            © {year} JhyapOS
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint">
            Private beta
          </p>
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
  emptyNote,
}: {
  title: string;
  links: { label: string; href: string }[];
  emptyNote?: string;
}) {
  return (
    <div>
      <h2 className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-faint">
        {title}
      </h2>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="rounded text-[13.5px] text-ink-muted transition-colors hover:text-ink"
              {...(link.href.startsWith("http")
                ? { target: "_blank", rel: "noreferrer noopener" }
                : {})}
            >
              {link.label}
            </a>
          </li>
        ))}
        {links.length === 0 && emptyNote ? (
          <li className="text-[13.5px] text-ink-faint">{emptyNote}</li>
        ) : null}
      </ul>
    </div>
  );
}
