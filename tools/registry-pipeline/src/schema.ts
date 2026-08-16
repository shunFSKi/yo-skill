/**
 * 统一条目 schema（调研 §3.1 的 MVP 子集）
 * 纪律：每条必须能回溯到源 URL（可审计）；徽章只说「已扫描」。
 */

export type ItemType = "skill" | "mcp";

/**
 * 场景分类（2026-08-15 扩充 5 → 10，抽样依据见 tag.ts 头注）。
 * 类目只增不改名；吃不准的条目保持 null 不硬塞。
 */
export type Category =
  | "写作"
  | "编程"
  | "设计"
  | "办公"
  | "生活"
  | "金融"
  | "AI"
  | "数据"
  | "运维"
  | "营销";

export interface EnvVar {
  name: string;
  required: boolean;
  secret: boolean;
}

export interface InstallRecipe {
  kind: "skill-dir" | "npm" | "pypi" | "remote";
  command?: string;
  args?: string[];
  remote_url?: string;
  env?: EnvVar[];
}

export interface SecurityCheck {
  name: string;
  pass: boolean;
}

export interface RegistryItem {
  /** type:source/slug，全库唯一；文件名用 safeId() 转换 */
  id: string;
  type: ItemType;
  name: string;
  description: string;
  author: string;
  source: {
    registry: "claudeskills" | "mcp-official" | "github-search";
    /** 权威来源链接（人类可读） */
    url: string;
    /** github owner/repo，可审计 */
    repo: string | null;
    /** github-search 来源：SKILL.md 在仓库内的路径 */
    path?: string | null;
  };
  license: string | null;
  install: InstallRecipe | null;
  quality: {
    /** null = 来源没给，界面不显示（不造假） */
    stars: number | null;
    pushed_at: string | null;
    /** 综合质量分 0-100（score.ts），推荐排序依据；null = 未评分 */
    score: number | null;
    /** 该 repo 的每日 star 快照（github-stars.ts 自采，最多 30 个点）；新收录 repo 为 null/缺省 */
    star_history?: Array<{ d: string; s: number }> | null;
  };
  security: {
    /** 100 制；≥70 且无高危命中才给「已扫描」徽章 */
    score: number;
    scanned: boolean;
    checks: SecurityCheck[];
  };
  tags: {
    category: Category | null;
    featured: boolean;
  };
  /** 源仓库根 README 原文（markdown，管线抓取，截断 200KB；抓不到为 null） */
  readme: string | null;
  status: "curated" | "blocked";
}

/** index.json 里的轻量条目（卡片所需的最小集） */
export interface IndexItem {
  id: string;
  type: ItemType;
  name: string;
  description: string;
  stars: number | null;
  /** 综合质量分 0-100，「推荐优先」排序用 */
  score: number | null;
  scanned: boolean;
  category: Category | null;
  featured: boolean;
  /** MCP 有需要填的 env 时置 true，卡片给「需要 API Key」琥珀 chip */
  needsKey: boolean;
  /** github owner/repo：卡片头像用（github.com/<owner>.png）；无 repo 的条目为 null，卡片用色块兜底 */
  repo: string | null;
  /** 源仓库最近推送时间（自 quality.pushed_at 提升）；null = 来源没给 */
  pushed_at: string | null;
  /** 首次收录日（YYYY-MM-DD）：写盘时继承上一版 index.json，已有 id 保留原值，新 id 记当天；
   *  上一版不存在（或 2026-08-15 字段迁移前的存量条目）为 null */
  added_at: string | null;
  /** install.kind === "remote"（纯远程 MCP，免安装），卡片可给「远程」chip */
  remote: boolean;
  /** 源仓库 SPDX license id（GitGraph licenseInfo，经 stars-cache 流入）；null = 未知 */
  license: string | null;
}

/** id → 文件/路由安全串（: 与 / 全替换） */
export function safeId(id: string): string {
  return id.replace(/[:/]/g, "__");
}

export function toIndexItem(item: RegistryItem): IndexItem {
  return {
    id: item.id,
    type: item.type,
    name: item.name,
    description: item.description,
    stars: item.quality.stars,
    score: item.quality.score,
    scanned: item.security.scanned,
    category: item.tags.category,
    featured: item.tags.featured,
    needsKey:
      item.install?.env?.some((e) => e.required || e.secret) ?? false,
    repo: item.source.repo,
    pushed_at: item.quality.pushed_at,
    // added_at 不在此填：它是"上一版 index.json 里有没有我"的派生量，
    // 由 index.ts 落盘前统一继承（见 applyAddedAt），此处先置 null
    added_at: null,
    remote: item.install?.kind === "remote",
    license: item.license,
  };
}
