import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { Hero } from "@/components/sections/hero";
import { WhatIf } from "@/components/sections/what-if";
import { CoreMessage } from "@/components/sections/core-message";
import { WorkspacePreview } from "@/components/sections/workspace-preview";
import { ResearchWorkflow } from "@/components/sections/research-workflow";
import { CommandCenter } from "@/components/sections/command-center";
import { NotAChat } from "@/components/sections/not-a-chat";
import { AgentVision } from "@/components/sections/agent-vision";
import { WhyJhyapOS } from "@/components/sections/why-jhyapos";
import { EarlyUsers } from "@/components/sections/early-users";
import { FinalCTA } from "@/components/sections/final-cta";
import { HairRule } from "@/components/ui/section";

/**
 * The page is ordered as an argument, not a feature list:
 *
 *   curiosity → problem → recognition → JhyapOS → product → conviction → ask
 *
 * The still sections (core message, why) sit deliberately between the animated
 * ones so the motion has somewhere to land.
 */
export default function Home() {
  return (
    <>
      <Nav />

      <main id="main" className="relative grain">
        <Hero />
        <WhatIf />
        <CoreMessage />
        <HairRule />
        <WorkspacePreview />
        <ResearchWorkflow />
        <HairRule />
        <CommandCenter />
        <NotAChat />
        <AgentVision />
        <HairRule />
        <WhyJhyapOS />
        <EarlyUsers />
        <FinalCTA />
      </main>

      <Footer />
    </>
  );
}
