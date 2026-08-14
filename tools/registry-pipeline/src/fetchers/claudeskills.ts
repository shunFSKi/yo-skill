/**
 * claudeskills.info 拉取器：全量 Skill（按源仓库去重后的 repo 级条目）
 * 公开免 key JSON API，CORS *，limit 上限 100，offset 分页。
 * 只拉元数据；安装回源（配方纪律）。featured 标记仍随条目保留。
 */

import type { RegistryItem } from "../schema.ts";

const API = "https://claudeskills.info/api/v1/search";

interface CsItem {
  slug: string;
  name: string;
  description: string;
  category: string;
  type: string;
  stars: number;
  confidence: string;
  origin: string;
  featured: number;
  source: { repo: string; url: string };
}

interface CsSearchResponse {
  total: number;
  limit: number;
  offset: number;
  results: CsItem[];
}

function normalize(raw: CsItem): RegistryItem {
  const owner = raw.source.repo.split("/")[0] ?? "unknown";
  return {
    id: `skill:claudeskills/${raw.slug}`,
    type: "skill",
    name: raw.name,
    description: raw.description ?? "",
    author: owner,
    source: {
      registry: "claudeskills",
      url: raw.source.url,
      repo: raw.source.repo ?? null,
    },
    license: null,
    install: { kind: "skill-dir" },
    quality: { stars: raw.stars ?? null, pushed_at: null, score: null },
    security: { score: 0, scanned: false, checks: [] },
    tags: { category: null, featured: raw.featured === 1 },
    readme: null,
    status: "curated",
  };
}

export async function fetchClaudeSkills(): Promise<RegistryItem[]> {
  const all: RegistryItem[] = [];
  let offset = 0;
  for (;;) {
    const url = `${API}?type=skill&limit=100&offset=${offset}&sort=stars`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`claudeskills HTTP ${res.status}`);
    const data = (await res.json()) as CsSearchResponse;
    all.push(...data.results.map(normalize));
    console.log(`  claudeskills: ${all.length}/${data.total}`);
    if (all.length >= data.total || data.results.length === 0) break;
    offset += 100;
  }
  return all;
}
