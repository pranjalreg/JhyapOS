import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms for using the JhyapOS website and waitlist.",
};

/**
 * Scoped to what the site currently is: a marketing page and a signup form.
 * Product terms are a separate document, written when there's a product to
 * write them about. Have counsel review before launch.
 */
export default function TermsPage() {
  return (
    <>
      <h1 className="text-[34px] font-semibold tracking-[-0.035em]">Terms</h1>
      <p className="!mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint">
        Website and waitlist
      </p>

      <p>
        These terms cover this website and the JhyapOS waitlist. They do not
        cover the JhyapOS product, which has not been released. Separate terms
        will apply to it.
      </p>

      <h2>The waitlist</h2>
      <p>
        Joining the waitlist is not a purchase, a subscription, or a guarantee
        of access. We onboard in small groups and may not be able to reach
        everyone. Please give us an email address you actually control.
      </p>

      <h2>What&rsquo;s on this site</h2>
      <p>
        The workspace shown on this site is a representation of a product under
        active development. Some of what it depicts is built; some describes the
        direction we&rsquo;re building toward, and is labelled as such. Nothing
        here is a commitment to a specific feature or ship date.
      </p>

      <h2>Acceptable use</h2>
      <p>
        Don&rsquo;t attempt to disrupt this site, submit the form
        programmatically at volume, or use it to send content to other people.
        We rate-limit submissions and may block abuse.
      </p>

      <h2>Content</h2>
      <p>
        The JhyapOS name, mark, and the design of this site belong to us. The
        text you submit in the waitlist form remains yours; you&rsquo;re giving
        us permission to read it and use it to inform what we build.
      </p>

      <h2>No warranty</h2>
      <p>
        This site is provided as-is. We may change or take down any part of it
        at any time.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms:{" "}
        <a href="mailto:hello@jhyapos.com">hello@jhyapos.com</a>.
      </p>
    </>
  );
}
