import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What JhyapOS collects from the waitlist, and what we do with it.",
};

/**
 * Written to describe exactly what this site actually does — the fields in
 * `waitlistInputSchema` and nothing more. Have counsel review it before launch
 * and before the product itself starts handling user data.
 */
export default function PrivacyPage() {
  return (
    <>
      <h1 className="text-[34px] font-semibold tracking-[-0.035em]">Privacy</h1>
      <p className="!mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint">
        Waitlist stage
      </p>

      <p>
        JhyapOS is pre-release. Right now this site does one thing that touches
        your data: it takes waitlist signups. This page describes that, and
        nothing broader, because nothing broader exists yet.
      </p>

      <h2>What we collect</h2>
      <p>When you join the waitlist, we store what you typed into the form:</p>
      <ul>
        <li>Your first name</li>
        <li>Your email address</li>
        <li>Optionally, the role you selected</li>
        <li>Optionally, what you told us you&rsquo;d want JhyapOS to help you do</li>
        <li>The time you submitted, and which button on the page you used</li>
      </ul>

      <h2>What we do with it</h2>
      <p>
        We use your email to contact you about access to JhyapOS. That&rsquo;s
        the only reason we&rsquo;ll email you. There is no newsletter, and we
        don&rsquo;t sell, rent, or share this list with third parties.
      </p>
      <p>
        What you write in the optional field helps us decide what to build
        first. It is read by the people building the product.
      </p>

      <h2>What we don&rsquo;t do</h2>
      <p>
        This site runs no advertising trackers, no third-party analytics, and no
        cross-site profiling. Submitting the form is the only thing that sends
        data anywhere.
      </p>

      <h2>Removing your data</h2>
      <p>
        Email{" "}
        <a href="mailto:hello@jhyapos.com">hello@jhyapos.com</a> and we&rsquo;ll
        delete your entry. You don&rsquo;t need to give a reason.
      </p>

      <h2>Changes</h2>
      <p>
        When JhyapOS ships, the product will handle documents and workspace
        content, and this page will be replaced with a policy that covers it.
        We&rsquo;ll tell waitlist members before that happens.
      </p>
    </>
  );
}
