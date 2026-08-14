import { Nav } from "@/components/site/nav";
import { Hero } from "@/components/site/hero";
import {
  AssistantWall,
  DataBand,
  Faq,
  Features,
  FinalCTA,
  MarketPreview,
  PainPoints,
  SyncFlow,
} from "@/components/site/sections";
import { Footer } from "@/components/site/footer";
import { ScrollReveal } from "@/components/site/scroll-reveal";
import { getRegistryMeta, queryRegistry } from "@/lib/registry";

export default async function HomePage() {
  const [meta, topSkills] = await Promise.all([
    getRegistryMeta(),
    queryRegistry({ type: "skill", cat: null, q: "", sort: "reco", page: 1, pageSize: 6 }),
  ]);
  const marketTotal = meta.counts.skill + meta.counts.mcp;

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <DataBand marketTotal={marketTotal} />
        <PainPoints />
        <Features />
        <SyncFlow />
        <AssistantWall />
        <MarketPreview items={topSkills.items} total={marketTotal} />
        <Faq />
        <FinalCTA />
      </main>
      <Footer />
      <ScrollReveal />
    </>
  );
}
