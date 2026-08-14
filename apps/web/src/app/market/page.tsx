import type { Metadata } from "next";

import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { MarketExplorer } from "@/components/site/market-explorer";
import { ItemCard } from "@/components/site/item-card";
import {
  PAGE_SIZE,
  parseMarketState,
  type MarketSearchParams,
} from "@/lib/market-query";
import { getRegistryMeta, queryRegistry } from "@/lib/registry";

export const metadata: Metadata = {
  title: "Skill 与 MCP 市场",
  description:
    "来自公开目录的真实 Skill 与 MCP 条目，每条都过静态扫描。浏览、搜索，桌面端上线后一键安装。",
};

/**
 * 市场发现页：数据来自 registry 管线产物（构建期读 JSON）。
 * 过滤/搜索/分页全部在服务端（URL 即状态，可分享、SEO 可索引），
 * 客户端岛 MarketExplorer 只渲染当前页并回写 URL。
 * 无搜索词时顶部出「高分精选」横条（参考 agentskillshub 的 trending 区，
 * 但按我们自己的综合质量分排序）；有搜索词时收起，不干扰目标明确的查找。
 */
export default async function MarketPage({
  searchParams,
}: {
  searchParams: Promise<MarketSearchParams>;
}) {
  const state = parseMarketState(await searchParams);
  const [result, meta, topPicks] = await Promise.all([
    queryRegistry({ ...state, pageSize: PAGE_SIZE }),
    getRegistryMeta(),
    state.q
      ? Promise.resolve(null)
      : queryRegistry({ ...state, page: 1, pageSize: 12, sort: "reco" }),
  ]);
  const updated = meta.generated_at.slice(0, 10);

  return (
    <>
      <Nav />
      <main className="yo-container yo-container--wide pb-24 pt-28">
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

        {topPicks && topPicks.items.length > 0 && (
          <section aria-label="高分精选" className="mt-10">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-lg font-bold">高分精选</h2>
              <span className="text-sm text-ink-muted">
                按综合质量分排序 · 每日更新
              </span>
            </div>
            <ul className="-mx-1 mt-4 flex gap-4 overflow-x-auto px-1 pb-2">
              {topPicks.items.map((item) => (
                <li key={item.id} className="w-72 shrink-0">
                  <ItemCard item={item} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-10">
          <MarketExplorer state={state} result={result} />
        </div>
      </main>
      <Footer />
    </>
  );
}
