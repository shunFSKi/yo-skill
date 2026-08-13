import { Nav } from "@/components/site/nav";
import { Hero } from "@/components/site/hero";
import {
  AssistantWall,
  DataBand,
  Faq,
  Features,
  FinalCTA,
  PainPoints,
  SyncFlow,
} from "@/components/site/sections";
import { Footer } from "@/components/site/footer";
import { ScrollReveal } from "@/components/site/scroll-reveal";

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <DataBand />
        <PainPoints />
        <Features />
        <SyncFlow />
        <AssistantWall />
        <Faq />
        <FinalCTA />
      </main>
      <Footer />
      <ScrollReveal />
    </>
  );
}
