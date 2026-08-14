/**
 * 统一条目 schema（调研 §3.1 的 MVP 子集）
 * 纪律：每条必须能回溯到源 URL（可审计）；徽章只说「已扫描」。
 */

export type ItemType = "skill" | "mcp";

export type Category = "写作" | "编程" | "设计" | "办公" | "生活";

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
    registry: "claudeskills" | "mcp-official";
    /** 权威来源链接（人类可读） */
    url: string;
    /** github owner/repo，可审计 */
    repo: string | null;
  };
  license: string | null;
  install: InstallRecipe | null;
  quality: {
    /** null = 来源没给，界面不显示（不造假） */
    stars: number | null;
    pushed_at: string | null;
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
  /** 源仓库根 README 原文（markdown，管线抓取，截断 40KB；抓不到为 null） */
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
  scanned: boolean;
  category: Category | null;
  featured: boolean;
  /** MCP 有需要填的 env 时置 true，卡片给「需要 API Key」琥珀 chip */
  needsKey: boolean;
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
    scanned: item.security.scanned,
    category: item.tags.category,
    featured: item.tags.featured,
    needsKey:
      item.install?.env?.some((e) => e.required || e.secret) ?? false,
  };
}
