/**
 * 市场数据层（仅服务端组件使用）：构建期从 public/registry/ 读管线产物。
 * 产物由 tools/registry-pipeline 生成（pnpm fetch:registry），
 * 类型与 schema.ts 保持同步（web 侧不跨包引用，小重复换构建简单）。
 */

import { readFile } from "node:fs/promises";
import path from "node:path";

import { safeId } from "./safe-id";

export type ItemType = "skill" | "mcp";
export type Category = "写作" | "编程" | "设计" | "办公" | "生活";

export interface IndexItem {
  id: string;
  type: ItemType;
  name: string;
  description: string;
  stars: number | null;
  /** 综合质量分 0-100（管线 score.ts），「推荐优先」排序依据 */
  score: number | null;
  scanned: boolean;
  category: Category | null;
  featured: boolean;
  needsKey: boolean;
  /** github owner/repo：卡片头像用（github.com/<owner>.png）；null 用色块兜底 */
  repo: string | null;
}

export interface EnvVar {
  name: string;
  required: boolean;
  secret: boolean;
}

export interface RegistryItem {
  id: string;
  type: ItemType;
  name: string;
  description: string;
  author: string;
  source: {
    registry: "claudeskills" | "mcp-official" | "github-search";
    url: string;
    repo: string | null;
    /** github-search 来源：SKILL.md 在仓库内的路径 */
    path?: string | null;
  };
  license: string | null;
  install: {
    kind: "skill-dir" | "npm" | "pypi" | "remote";
    command?: string;
    args?: string[];
    remote_url?: string;
    env?: EnvVar[];
  } | null;
  quality: {
    stars: number | null;
    pushed_at: string | null;
    score: number | null;
    /** 该 repo 的每日 star 快照（管线自采，最多 30 个点）；新收录为 null/缺省 */
    star_history?: Array<{ d: string; s: number }> | null;
  };
  security: {
    score: number;
    scanned: boolean;
    checks: { name: string; pass: boolean }[];
  };
  tags: { category: Category | null; featured: boolean };
  /** 源仓库根 README 原文（markdown；抓不到为 null） */
  readme: string | null;
  status: "curated" | "blocked";
}

export interface RegistryMeta {
  schema_version: number;
  generated_at: string;
  counts: { skill: number; mcp: number; blocked: number };
}

/** id → 路由/文件安全串（与管线 safeId 同一算法） */
export { safeId } from "./safe-id";

const REGISTRY_DIR = path.join(process.cwd(), "public", "registry");

async function readJson<T>(file: string): Promise<T> {
  const raw = await readFile(path.join(REGISTRY_DIR, file), "utf8");
  return JSON.parse(raw) as T;
}

export function getRegistryIndex(): Promise<IndexItem[]> {
  return readJson<IndexItem[]>("index.json");
}

export function getRegistryMeta(): Promise<RegistryMeta> {
  return readJson<RegistryMeta>("meta.json");
}

export async function getRegistryItem(
  id: string,
): Promise<RegistryItem | null> {
  try {
    return await readJson<RegistryItem>(`items/${safeId(id)}.json`);
  } catch {
    return null;
  }
}

/* ── 市场页服务端过滤 ─────────────────────────
 * 全量 4 万+ 条、index.json 13MB：绝不能整包发给客户端。
 * 进程内只解析一次，预计算小写搜索串，每次请求毫秒级过滤出当前页。 */

export type MarketSort = "reco" | "stars";

export interface MarketQuery {
  type: ItemType;
  cat: Category | null;
  /** 搜索词：按空白分词，全部命中（AND）才算匹配 */
  q: string;
  sort: MarketSort;
  page: number;
  pageSize: number;
}

export interface MarketResult {
  /** 当前页条目 */
  items: IndexItem[];
  /** 过滤后总数（未分页） */
  total: number;
  totalPages: number;
  /** 夹紧后的当前页 */
  page: number;
  counts: { skill: number; mcp: number };
  /** 当前类型下的分类计数 */
  catCounts: Partial<Record<Category, number>>;
}

interface CachedIndex {
  items: IndexItem[];
  haystack: string[];
}

let indexCache: Promise<CachedIndex> | null = null;

function loadIndex(): Promise<CachedIndex> {
  indexCache ??= getRegistryIndex().then((items) => ({
    items,
    haystack: items.map((i) => `${i.name}\n${i.description}`.toLowerCase()),
  }));
  return indexCache;
}

export async function queryRegistry(q: MarketQuery): Promise<MarketResult> {
  const { items, haystack } = await loadIndex();

  const counts = { skill: 0, mcp: 0 };
  const catCounts: Partial<Record<Category, number>> = {};
  const tokens = q.q.trim().toLowerCase().split(/\s+/).filter(Boolean);

  const matched: IndexItem[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    counts[item.type] += 1;
    if (item.type !== q.type) continue;
    if (item.category) {
      catCounts[item.category] = (catCounts[item.category] ?? 0) + 1;
    }
    if (q.cat && item.category !== q.cat) continue;
    if (tokens.some((t) => !haystack[i].includes(t))) continue;
    matched.push(item);
  }

  const byStars = (a: IndexItem, b: IndexItem) => (b.stars ?? -1) - (a.stars ?? -1);
  const byName = (a: IndexItem, b: IndexItem) => a.name.localeCompare(b.name);
  const byScore = (a: IndexItem, b: IndexItem) => (b.score ?? -1) - (a.score ?? -1);
  matched.sort((a, b) => {
    if (q.sort === "reco") {
      // 推荐优先 = 综合质量分（featured 是人工加权，优先于分数）
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return byScore(a, b) || byStars(a, b) || byName(a, b);
    }
    return byStars(a, b) || byName(a, b);
  });

  const totalPages = Math.max(1, Math.ceil(matched.length / q.pageSize));
  const page = Math.min(Math.max(1, q.page), totalPages);

  return {
    items: matched.slice((page - 1) * q.pageSize, page * q.pageSize),
    total: matched.length,
    totalPages,
    page,
    counts,
    catCounts,
  };
}
