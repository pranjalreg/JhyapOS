import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Container } from "@/components/ui/section";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <Container className="flex h-16 items-center">
          <Link href="/" className="rounded transition-opacity hover:opacity-80">
            <Logo />
          </Link>
        </Container>
      </header>

      <main id="main">
        <Container className="max-w-[720px] py-20">
          <article className="[&_a]:text-ink [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mt-12 [&_h2]:text-[19px] [&_h2]:font-semibold [&_h2]:tracking-[-0.02em] [&_li]:text-[15px] [&_li]:leading-[1.7] [&_li]:text-ink-muted [&_p]:mt-4 [&_p]:text-[15px] [&_p]:leading-[1.7] [&_p]:text-ink-muted [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
            {children}
          </article>

          <p className="mt-16 border-t border-line pt-8">
            <Link
              href="/"
              className="rounded font-mono text-[12px] uppercase tracking-[0.16em] text-ink-dim transition-colors hover:text-ink"
            >
              ← Back to JhyapOS
            </Link>
          </p>
        </Container>
      </main>
    </div>
  );
}
