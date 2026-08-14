/**
 * GitHub repo stars / pushedAt 富化：给 github-search 来源的条目补流行度信号。
 *
 * 为什么需要：github-search 采集器拿不到 repo 元数据，stars 全 null 会让
 * 「Stars 高到低」排序形同虚设，好内容和占位垃圾混在一起沉底（2026-08-14 实测：
 * 全库 40,862 条里 40,669 条无 stars）。skills.sh 排得准靠的是 CLI 安装遥测，
 * 我们拿不到那个，repo stars 是最接近的代理信号。
 *
 * 机制：GraphQL 一次查 100 个 repo（每个 repo 节点计 1 点，单 token 5000 点/小时）。
 * 结果缓存进 OUT_DIR/stars-cache.json，随数据一起提交并同步到数据仓，天然持久。
 * 每次运行只补「未缓存或缓存超过 7 天」的 repo，上限 STARS_MAX_REPOS（默认 4500，
 * 卡在小时配额内）；优先级按库内条目数降序——合集型 repo（如 superpowers）影响面最大，先补。
 * 首次全量补完要跑十几天，但头部 repo 第一轮就有 stars，排序立刻见效。
 */

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import type { RegistryItem } from "../schema.ts";

const GRAPHQL_API = "https://api.github.com/graphql";
const BATCH = 100;
const STALE_MS = 7 * 24 * 3600 * 1000; // 7 天算过期
const MAX_REPOS = Number(process.env.STARS_MAX_REPOS ?? 4_500);
/** 剩余配额低于这个数就提前收工，给搜索/内容抓取留余地 */
const QUOTA_FLOOR = 300;

interface RepoMeta {
  stars: number;
  pushed_at: string;
  fetched_at: string;
}

type StarsCache = Record<string, RepoMeta>;

async function loadCache(outDir: string): Promise<StarsCache> {
  try {
    return JSON.parse(
      await readFile(join(outDir, "stars-cache.json"), "utf8"),
    ) as StarsCache;
  } catch {
    return {};
  }
}

interface GraphqlResponse {
  data?: Record<string, { nameWithOwner: string; stargazerCount: number; pushedAt: string } | null> & {
    rateLimit?: { remaining: number };
  };
}

export async function enrichGitHubStars(
  items: RegistryItem[],
  outDir: string,
): Promise<void> {
  const token = process.env.GITHUB_TOKEN ?? process.env.REGISTRY_TOKEN;
  if (!token) {
    console.warn("  stars: 未配 GITHUB_TOKEN/REGISTRY_TOKEN，跳过富化");
    return;
  }

  const cache = await loadCache(outDir);

  // 每个 repo 在库里的条目数：合集 repo 条目多，优先补
  const repoCounts = new Map<string, number>();
  for (const it of items) {
    if (!it.source.repo) continue;
    repoCounts.set(it.source.repo, (repoCounts.get(it.source.repo) ?? 0) + 1);
  }

  const now = Date.now();
  const stale = [...repoCounts.entries()]
    .filter(([repo]) => {
      const c = cache[repo];
      return !c || now - Date.parse(c.fetched_at) > STALE_MS;
    })
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)) // 条目数降序，平手字典序（确定性）
    .slice(0, MAX_REPOS)
    .map(([repo]) => repo);

  console.log(
    `  stars: 库内 repo 共 ${repoCounts.size} 个，缓存 ${Object.keys(cache).length} 个，本次补 ${stale.length} 个`,
  );

  outer: for (let i = 0; i < stale.length; i += BATCH) {
    const chunk = stale.slice(i, i + BATCH);
    const fields = chunk
      .map((repo, j) => {
        const [owner, name] = repo.split("/");
        return `r${j}: repository(owner: ${JSON.stringify(owner)}, name: ${JSON.stringify(name)}) { nameWithOwner stargazerCount pushedAt }`;
      })
      .join("\n");
    const res = await fetch(GRAPHQL_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `query {\n${fields}\nrateLimit { remaining }\n}`,
      }),
    }).catch(() => null);
    if (!res?.ok) {
      console.warn(
        `  stars: GraphQL ${res ? `HTTP ${res.status}` : "网络错误"}，停止本次富化（已抓 ${i} 个）`,
      );
      break;
    }
    const json = (await res.json()) as GraphqlResponse;
    const data = json.data ?? {};
    for (let j = 0; j < chunk.length; j++) {
      const node = data[`r${j}`];
      // NOT_FOUND（改名/删库/转私有）：保留旧缓存，没有就跳过，不清零
      if (node) {
        cache[chunk[j]!] = {
          stars: node.stargazerCount,
          pushed_at: node.pushedAt,
          fetched_at: new Date().toISOString(),
        };
      }
    }
    const remaining = data.rateLimit?.remaining;
    if (typeof remaining === "number" && remaining < QUOTA_FLOOR) {
      console.warn(`  stars: GraphQL 配额剩 ${remaining}，提前收工`);
      break outer;
    }
  }

  // 回填条目（只动 github-search 源；claudeskills / MCP 官方自带元数据，不覆盖）
  let filled = 0;
  for (const it of items) {
    if (it.source.registry !== "github-search" || !it.source.repo) continue;
    const c = cache[it.source.repo];
    if (c) {
      it.quality.stars = c.stars;
      it.quality.pushed_at = c.pushed_at;
      filled++;
    }
  }
  console.log(`  stars: 回填 ${filled} 条`);

  // 只有真补过才写缓存（内容不变不重写，保持 git diff 干净）
  if (stale.length > 0) {
    const sorted: StarsCache = {};
    for (const k of Object.keys(cache).sort()) sorted[k] = cache[k]!;
    await writeFile(
      join(outDir, "stars-cache.json"),
      JSON.stringify(sorted) + "\n",
    );
  }
}
