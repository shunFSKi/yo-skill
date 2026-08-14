/**
 * GitHub SKILL.md 采集器：真·全量 Skill 源。
 *
 * 机制：代码搜索 API `filename:SKILL.md` 按 size 范围分片（该 API 的 total_count
 * 是坏的——新后端返回虚高估值，但 size 过滤本身有效，已实测 blob 尺寸符合分片），
 * 单分片命中 1000 上限就二分细分；然后逐个抓 SKILL.md 原文解析 frontmatter
 * （name/description）生成条目。只索引不缓存正文——安装永远回源。
 *
 * 纪律：
 * - 需要 GITHUB_TOKEN（fine-grained PAT 即可搜公开代码）；没 token 直接返回空数组并告警
 * - 搜索 API 限速 30 次/分钟，每次调用间隔 2.2s
 * - 上限 MAX_HARVEST（env GITHUB_HARVEST_MAX 可调），防止 CI 时长失控
 */

import { createHash } from "node:crypto";

import yaml from "js-yaml";

import type { RegistryItem } from "../schema.ts";

const SEARCH_API = "https://api.github.com/search/code";
const PER_PAGE = 100;
const MAX_PAGES_PER_SHARD = 10; // GitHub 代码搜索单查询只放前 1000 条
const SEARCH_INTERVAL_MS = 2200;
const CONTENT_CONCURRENCY = 8;
const MAX_HARVEST = Number(process.env.GITHUB_HARVEST_MAX ?? 25_000);

/** 粗粒度文件尺寸阶梯（字节），命中上限的区间再二分。
 *  从 33 起步：合法的 frontmatter 至少 ~30B，更小的全是空文件/占位垃圾
 *  （实测 0..12B 分片一片 521 个文件无一能解析，纯浪费搜索配额）。
 *  再从 33 提到 101：合法 frontmatter（name+description）实测最小 ~100B，
 *  33..35B 一个分片就 842 个占位垃圾（搜索配额 30 次/分钟是硬约束）。 */
const SIZE_LADDER: Array<[number, number]> = [
  [101, 300],
  [301, 700],
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

export interface HarvestHit {
  repo: string;
  path: string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** 拉一个 size 分片的全部页；返回 null 表示该分片打满 1000 上限需细分 */
async function fetchShard(
  token: string,
  lo: number,
  hi: number,
): Promise<SearchItem[] | null> {
  const out: SearchItem[] = [];
  let rateRetries = 0;
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
      // 限流：等一个窗口再重试同一页，连续 5 次仍限流则放弃（防 CI 死循环）
      if (res.status === 403 && body.includes("rate limit")) {
        if (++rateRetries > 5) {
          throw new Error("github-search 持续限流，中止采集");
        }
        console.warn("  github-search: 触发限流，等 60s 重试");
        await sleep(60_000);
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

async function harvestHits(token: string): Promise<HarvestHit[]> {
  const hits = new Map<string, HarvestHit>();
  const queue: Array<[number, number]> = [...SIZE_LADDER];

  while (queue.length > 0 && hits.size < MAX_HARVEST) {
    const [lo, hi] = queue.shift()!;
    const items = await fetchShard(token, lo, hi);
    if (items === null) {
      // 打满上限：二分细分；不能再分就打日志放弃该区间余量
      const mid = Math.floor((lo + hi) / 2);
      if (mid <= lo) {
        console.warn(`  github-search: size ${lo}..${hi} 超上限且不可再分，舍弃余量`);
        continue;
      }
      queue.unshift([lo, mid], [mid + 1, hi]);
      continue;
    }
    for (const it of items) {
      hits.set(`${it.repository.full_name}#${it.path}`, {
        repo: it.repository.full_name,
        path: it.path,
      });
    }
    console.log(
      `  github-search: size ${lo}..${hi} → ${items.length} 条（累计 ${hits.size}）`,
    );
    await sleep(SEARCH_INTERVAL_MS);
  }
  return [...hits.values()].slice(0, MAX_HARVEST);
}

/** 抓 SKILL.md 原文（raw 走 HEAD ref，无需知道默认分支） */
async function fetchContent(hit: HarvestHit): Promise<string | null> {
  const encodedPath = hit.path
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
  try {
    const res = await fetch(
      `https://raw.githubusercontent.com/${hit.repo}/HEAD/${encodedPath}`,
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
  hit: HarvestHit,
  name: string,
  used: Set<string>,
): string {
  const base = slugify(name) || slugify(hit.path.replace(/\/SKILL\.md$/i, "")) || "unnamed";
  let id = `skill:github/${hit.repo}/${base}`;
  if (used.has(id)) {
    const hash = createHash("sha1")
      .update(`${hit.repo}#${hit.path}`)
      .digest("hex")
      .slice(0, 8);
    id = `${id}-${hash}`;
  }
  used.add(id);
  return id;
}

/**
 * 采集全量 skill。knownRepos/knownSlugs 用于与 claudeskills 去重：
 * 同 repo 且同名（slug 相同）视为重复，跳过采集条目（claudeskills 元数据更全）。
 */
export async function fetchGitHubSkills(
  known: Map<string, Set<string>>,
): Promise<RegistryItem[]> {
  const token = process.env.GITHUB_TOKEN ?? process.env.REGISTRY_TOKEN;
  if (!token) {
    console.warn("  github-search: 未配 GITHUB_TOKEN/REGISTRY_TOKEN，跳过全量采集");
    return [];
  }

  console.log("== GitHub 全量采集 SKILL.md ==");
  const hits = await harvestHits(token);
  console.log(`  github-search: 命中文件 ${hits.length} 个，开始抓原文`);

  const used = new Set<string>();
  const out: RegistryItem[] = [];
  let done = 0;
  let skippedDup = 0;
  let skippedJunk = 0;

  for (let i = 0; i < hits.length; i += CONTENT_CONCURRENCY) {
    await Promise.all(
      hits.slice(i, i + CONTENT_CONCURRENCY).map(async (hit) => {
        const md = await fetchContent(hit);
        done++;
        if (!md) {
          skippedJunk++;
          return;
        }
        const fm = parseFrontmatter(md);
        if (!fm) {
          skippedJunk++;
          return;
        }
        const slug = slugify(fm.name || hit.path);
        if (known.get(hit.repo)?.has(slug)) {
          skippedDup++;
          return;
        }
        const owner = hit.repo.split("/")[0] ?? "unknown";
        out.push({
          id: buildId(hit, fm.name || hit.path, used),
          type: "skill",
          name: fm.name || slug || hit.path,
          description: fm.description,
          author: owner,
          source: {
            registry: "github-search",
            url: `https://github.com/${hit.repo}/blob/HEAD/${hit.path}`,
            repo: hit.repo,
            path: hit.path,
          },
          license: null,
          install: { kind: "skill-dir" },
          quality: { stars: null, pushed_at: null },
          security: { score: 0, scanned: false, checks: [] },
          tags: { category: null, featured: false },
          readme: null,
          status: "curated",
        });
      }),
    );
    if (done % 800 === 0 || done >= hits.length) {
      console.log(
        `  github-search: 原文 ${Math.min(done, hits.length)}/${hits.length}，入库 ${out.length}，重复 ${skippedDup}，无效 ${skippedJunk}`,
      );
    }
  }
  return out;
}
