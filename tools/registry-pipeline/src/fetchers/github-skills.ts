/**
 * GitHub SKILL.md 采集器：真·全量 Skill 源，每日定额增量采集。
 *
 * 机制：代码搜索 API `filename:SKILL.md` 按 size 范围分片（该 API 的 total_count
 * 是坏的——新后端返回虚高估值，但 size 过滤本身有效，已实测 blob 尺寸符合分片），
 * 单分片命中 1000 上限就二分细分；抓原文解析 frontmatter（name/description）。
 *
 * 增量设计（2026-08-14 用户拍板：每天固定采一批，官网随每日提交实时增长）：
 * - 状态持久化在 OUT_DIR/harvest-cache.json：待采分片队列 + 全部采集记录
 *   （记录含墓碑——抓过但不可用的也留痕，避免每天重复烧配额在垃圾上）
 * - 每次运行最多新抓 GITHUB_HARVEST_DAILY 个文件（默认 8000，十几分钟跑完），
 *   与缓存合并后整体重建条目。分片队列采完一轮自动重置回初始阶梯，专扫新出现的文件
 * - 一次性全量会顶到 CI 6 小时上限且配额风险大（2026-08-14 实测：仅 101-224B
 *   分片就 25k 个文件）；每日定额十几天爬完全量（参照 agentskillshub 标称 13 万+）
 *
 * 收录口径（2026-08-14 拍板，对齐 skills.sh 的质量门槛思路）：
 * - 文件 ≥ 500B（frontmatter 之外要有正文；更小的分片全是占位垃圾）
 * - description ≥ 20 字符
 * - 路径黑名单：test/fixture/example/template/node_modules/docs 等目录下的不算
 * fork/复制洪水去重在 index.ts 做（需 stars 决定留谁，在富化之后）。
 *
 * 纪律：
 * - 需要 GITHUB_TOKEN（fine-grained PAT 即可搜公开代码）；没 token 直接返回空数组并告警
 * - 搜索 API 限速 30 次/分钟，每次调用间隔 2.2s；限流与 5xx 都退避重试
 * - 已采文件的内容变化不回溯（上游改名/改描述不刷新）——换 CI 时长与配额的确定性
 */

import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import yaml from "js-yaml";

import type { RegistryItem } from "../schema.ts";

const SEARCH_API = "https://api.github.com/search/code";
const PER_PAGE = 100;
const MAX_PAGES_PER_SHARD = 10; // GitHub 代码搜索单查询只放前 1000 条
const SEARCH_INTERVAL_MS = 2200;
const CONTENT_CONCURRENCY = 16;
const DAILY_BUDGET = Number(process.env.GITHUB_HARVEST_DAILY ?? 8_000);

/** 收录口径：description 最短 20 字符 */
const MIN_DESC_LEN = 20;
/** 路径黑名单：这些目录下的 SKILL.md 是测试/示例/模板，不算正经 skill */
const PATH_BLACKLIST =
  /(^|\/)(tests?|__tests__|fixtures?|examples?|templates?|node_modules|docs?|dist)\//i;

/** 粗粒度文件尺寸阶梯（字节），命中上限的区间再二分。
 *  从 500 起步：收录口径要求正文有实质内容（≥500B），更小的分片没有采集价值
 *  （实测 101-224B 区间就 25k 个文件，全是占位垃圾，曾把 25k 上限整个吃掉，
 *  导致 >300B 的正经 skill——包括 superpowers——一个都没采到，2026-08-14）。 */
const SIZE_LADDER: Array<[number, number]> = [
  [500, 700],
  [701, 1500],
  [1501, 3000],
  [3001, 6000],
  [6001, 12000],
  [12001, 24000],
  [24001, 48000],
  [48001, 999_999],
];

interface SearchItem {
  path: string;
  repository: { full_name: string };
}

interface SearchResponse {
  items?: SearchItem[];
  message?: string;
}

/** 采集记录。n/d 为空串 = 墓碑（抓过但解析失败或不合口径，不重抓） */
interface HarvestRecord {
  r: string; // repo owner/name
  p: string; // SKILL.md 路径
  n: string; // frontmatter name
  d: string; // frontmatter description
}

interface HarvestCache {
  version: 1;
  /** 待采 size 分片队列；空了重置回 SIZE_LADDER 扫新文件 */
  queue: Array<[number, number]>;
  records: HarvestRecord[];
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function loadCache(outDir: string): Promise<HarvestCache> {
  try {
    const raw = JSON.parse(
      await readFile(join(outDir, "harvest-cache.json"), "utf8"),
    ) as HarvestCache;
    if (raw.version === 1 && Array.isArray(raw.queue) && Array.isArray(raw.records)) {
      return raw;
    }
  } catch {
    // 无缓存（首跑）或损坏：从头开始
  }
  return { version: 1, queue: [...SIZE_LADDER], records: [] };
}

async function saveCache(outDir: string, cache: HarvestCache): Promise<void> {
  // 落盘前排序：源站返回顺序会漂，不排序每日 diff 全是噪声
  const records = [...cache.records].sort((a, b) =>
    `${a.r}#${a.p}` < `${b.r}#${b.p}` ? -1 : 1,
  );
  await writeFile(
    join(outDir, "harvest-cache.json"),
    JSON.stringify({ ...cache, records }) + "\n",
  );
}

/** 拉一个 size 分片的全部页；返回 null 表示该分片打满 1000 上限需细分 */
async function fetchShard(
  token: string,
  lo: number,
  hi: number,
): Promise<SearchItem[] | null> {
  const out: SearchItem[] = [];
  let rateRetries = 0;
  let serverRetries = 0;
  for (let page = 1; page <= MAX_PAGES_PER_SHARD; page++) {
    const q = encodeURIComponent(`filename:SKILL.md size:${lo}..${hi}`);
    const res = await fetch(
      `${SEARCH_API}?q=${q}&per_page=${PER_PAGE}&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
      },
    );
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      // 限流（403 rate limit 或 429 try again in Ns）：等窗口重试同一页，
      // 连续 8 次仍限流则放弃（防 CI 死循环）
      const retryAfter = Number(res.headers.get("retry-after")) || 0;
      const waitMatch = body.match(/try again in ([\d.]+)s/);
      const waitSec = retryAfter || (waitMatch ? Number(waitMatch[1]) : 0);
      if (
        (res.status === 403 && body.includes("rate limit")) ||
        res.status === 429
      ) {
        if (++rateRetries > 8) {
          throw new Error("github-search 持续限流，中止采集");
        }
        const wait = Math.max(60, Math.ceil(waitSec) + 5);
        console.warn(`  github-search: 触发限流，等 ${wait}s 重试`);
        await sleep(wait * 1000);
        page--;
        continue;
      }
      // 搜索后端临时错误（503 too many shards failed 等）：退避重试
      if (res.status >= 500) {
        if (++serverRetries > 5) {
          throw new Error(`github-search 持续 5xx（最后 HTTP ${res.status}），中止采集`);
        }
        console.warn(`  github-search: HTTP ${res.status}，等 30s 重试`);
        await sleep(30_000);
        page--;
        continue;
      }
      throw new Error(`github-search HTTP ${res.status}: ${body.slice(0, 120)}`);
    }
    const data = (await res.json()) as SearchResponse;
    out.push(...(data.items ?? []));
    if ((data.items ?? []).length < PER_PAGE) return out; // 分片拉完
    if (page < MAX_PAGES_PER_SHARD) await sleep(SEARCH_INTERVAL_MS);
  }
  return null; // 10 页全满 = 撞 1000 上限
}

/** 抓 SKILL.md 原文（raw 走 HEAD ref，无需知道默认分支） */
async function fetchContent(repo: string, path: string): Promise<string | null> {
  const encodedPath = path
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
  try {
    const res = await fetch(
      `https://raw.githubusercontent.com/${repo}/HEAD/${encodedPath}`,
    );
    if (!res.ok) return null;
    const text = await res.text();
    return text.length > 64_000 ? null : text; // 超大文件按畸形处理
  } catch {
    return null;
  }
}

interface Frontmatter {
  name?: unknown;
  description?: unknown;
}

function parseFrontmatter(md: string): { name: string; description: string } | null {
  const m = md.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m?.[1]) return null;
  try {
    const fm = yaml.load(m[1]) as Frontmatter | undefined;
    const name = typeof fm?.name === "string" ? fm.name.trim() : "";
    const description =
      typeof fm?.description === "string" ? fm.description.trim() : "";
    if (!name && !description) return null; // 无元数据的纯文档，不算 skill
    return { name, description };
  } catch {
    return null;
  }
}

function slugify(text: string): string {
  const s = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s.slice(0, 64);
}

function buildId(
  repo: string,
  path: string,
  name: string,
  used: Set<string>,
): string {
  const base =
    slugify(name) || slugify(path.replace(/\/SKILL\.md$/i, "")) || "unnamed";
  let id = `skill:github/${repo}/${base}`;
  if (used.has(id)) {
    const hash = createHash("sha1")
      .update(`${repo}#${path}`)
      .digest("hex")
      .slice(0, 8);
    id = `${id}-${hash}`;
  }
  used.add(id);
  return id;
}

/** 按分片队列顺序采新文件，花完每日预算即止；队列随缓存持久化 */
async function harvestBatch(
  token: string,
  cache: HarvestCache,
): Promise<number> {
  const seen = new Set(cache.records.map((r) => `${r.r}#${r.p}`));
  let fetched = 0;

  while (cache.queue.length > 0 && fetched < DAILY_BUDGET) {
    const [lo, hi] = cache.queue.shift()!;
    const items = await fetchShard(token, lo, hi);
    if (items === null) {
      // 打满上限：二分细分；不能再分就打日志放弃该区间余量
      const mid = Math.floor((lo + hi) / 2);
      if (mid <= lo) {
        console.warn(`  github-search: size ${lo}..${hi} 超上限且不可再分，舍弃余量`);
        continue;
      }
      cache.queue.unshift([lo, mid], [mid + 1, hi]);
      continue;
    }

    // 路径黑名单在抓原文前过滤，省内容抓取；已见过的（含墓碑）跳过
    const fresh = items.filter(
      (it) =>
        !PATH_BLACKLIST.test(it.path) &&
        !seen.has(`${it.repository.full_name}#${it.path}`),
    );

    for (let i = 0; i < fresh.length; i += CONTENT_CONCURRENCY) {
      if (fetched >= DAILY_BUDGET) break;
      const chunk = fresh.slice(i, i + CONTENT_CONCURRENCY);
      await Promise.all(
        chunk.map(async (it) => {
          const repo = it.repository.full_name;
          const key = `${repo}#${it.path}`;
          if (seen.has(key)) return;
          seen.add(key); // 先占座：抓失败的也留墓碑，不重复烧配额
          fetched++;
          const md = await fetchContent(repo, it.path);
          const fm = md ? parseFrontmatter(md) : null;
          if (!fm || fm.description.length < MIN_DESC_LEN) {
            cache.records.push({ r: repo, p: it.path, n: "", d: "" }); // 墓碑
            return;
          }
          cache.records.push({ r: repo, p: it.path, n: fm.name, d: fm.description });
        }),
      );
    }
    console.log(
      `  github-search: size ${lo}..${hi} → 新采 ${fresh.length}（今日已抓 ${fetched}/${DAILY_BUDGET}，队列剩 ${cache.queue.length} 片）`,
    );

    // 预算在分片中间花完：把该分片塞回队首，明天续扫（seen 跳过已采的）
    if (fetched >= DAILY_BUDGET && fresh.length > 0) {
      const doneInShard = fresh.every((it) =>
        seen.has(`${it.repository.full_name}#${it.path}`),
      );
      if (!doneInShard) cache.queue.unshift([lo, hi]);
    }
    await sleep(SEARCH_INTERVAL_MS);
  }
  return fetched;
}

/**
 * 采集入口：读缓存 → 今日批次 → 写缓存 → 用全部记录重建条目。
 * knownRepos/knownSlugs 用于与 claudeskills 去重：
 * 同 repo 且同名（slug 相同）视为重复，跳过采集条目（claudeskills 元数据更全）。
 */
export async function fetchGitHubSkills(
  known: Map<string, Set<string>>,
  outDir: string,
): Promise<RegistryItem[]> {
  const token = process.env.GITHUB_TOKEN ?? process.env.REGISTRY_TOKEN;
  if (!token) {
    console.warn("  github-search: 未配 GITHUB_TOKEN/REGISTRY_TOKEN，跳过全量采集");
    return [];
  }

  console.log("== GitHub 增量采集 SKILL.md ==");
  const cache = await loadCache(outDir);
  // 队列空了 = 全量扫完一轮：重置回初始阶梯，专扫新出现的文件
  if (cache.queue.length === 0) {
    cache.queue = [...SIZE_LADDER];
    console.log("  github-search: 全量已扫完一轮，重置分片队列扫新增");
  }

  const fetched = await harvestBatch(token, cache);
  await saveCache(outDir, cache);
  console.log(
    `  github-search: 今日新抓 ${fetched} 个，缓存累计 ${cache.records.length} 条（含墓碑）`,
  );

  // 重建条目：跳过墓碑与 claudeskills 重复；按 repo#path 排序保证 id 分配确定性
  const used = new Set<string>();
  const out: RegistryItem[] = [];
  let skippedDup = 0;
  const records = [...cache.records].sort((a, b) =>
    `${a.r}#${a.p}` < `${b.r}#${b.p}` ? -1 : 1,
  );
  for (const rec of records) {
    if (!rec.n && !rec.d) continue; // 墓碑
    const slug = slugify(rec.n || rec.p);
    if (known.get(rec.r)?.has(slug)) {
      skippedDup++;
      continue;
    }
    const owner = rec.r.split("/")[0] ?? "unknown";
    out.push({
      id: buildId(rec.r, rec.p, rec.n || rec.p, used),
      type: "skill",
      name: rec.n || slug || rec.p,
      description: rec.d,
      author: owner,
      source: {
        registry: "github-search",
        url: `https://github.com/${rec.r}/blob/HEAD/${rec.p}`,
        repo: rec.r,
        path: rec.p,
      },
      license: null,
      install: { kind: "skill-dir" },
      quality: { stars: null, pushed_at: null, score: null },
      security: { score: 0, scanned: false, checks: [] },
      tags: { category: null, featured: false },
      readme: null,
      status: "curated",
    });
  }
  if (skippedDup > 0) console.log(`  github-search: 与 claudeskills 去重 ${skippedDup} 条`);
  return out;
}
