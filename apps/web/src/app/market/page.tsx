import type { Metadata } from "next";
import { Suspense } from "react";

import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { MarketExplorer } from "@/components/site/market-explorer";
import { getRegistryIndex, getRegistryMeta } from "@/lib/registry";

export const metadata: Metadata = {
  title: "Skill 与 MCP 市场",
  description:
    "来自公开目录的真实 Skill 与 MCP 条目，每条都过静态扫描。浏览、搜索，桌面端上线后一键安装。",
};

/**
 * 市场发现页：数据来自 registry 管线产物（构建期读 JSON，SSG）。
 * 过滤交互全在客户端岛 MarketExplorer（useSearchParams 需 Suspense 包裹）。
 */
export default async function MarketPage() {
  const [items, meta] = await Promise.all([
    getRegistryIndex(),
    getRegistryMeta(),
  ]);
  const updated = meta.generated_at.slice(0, 10);

  return (
    <>
      <Nav />
      <main className="yo-container pb-24 pt-28">
        <header className="max-w-2xl">
          <h1 className="text-4xl sm:text-5xl">Skill 与 MCP 市场</h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">
            来自公开目录的真实条目，每一条都过了我们的静态扫描。看中的，
            桌面端上线后一键安装。
          </p>
          <p className="mt-3 text-sm text-ink-muted">
            {meta.counts.skill} 个 Skill · {meta.counts.mcp} 个 MCP ·
            更新于 {updated}
          </p>
        </header>

        <div className="mt-10">
          <Suspense>
            <MarketExplorer items={items} />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
