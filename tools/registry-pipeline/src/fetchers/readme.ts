/**
 * 源仓库 README 抓取：按 repo 去重（多个条目共享同一仓库时只抓一次），
 * raw.githubusercontent.com + HEAD ref，依次尝试常见文件名，限长 200KB。
 * （2026-08-14 用户要求详情页完整展示 README，从 12KB 提到 200KB——
 * 绝大多数 README 在 50KB 内，200KB 只防个别超大文件拖垮详情页 JSON）
 * 抓不到 → readme = null（界面不显示该区块，不造假）。
 */

import type { RegistryItem } from "../schema.ts";

const MAX_BYTES = 200_000;
const CONCURRENCY = 8;
const CANDIDATES = ["README.md", "readme.md", "README.markdown", "README"];

async function fetchOne(repo: string): Promise<string | null> {
  for (const name of CANDIDATES) {
    try {
      const res = await fetch(
        `https://raw.githubusercontent.com/${repo}/HEAD/${name}`,
      );
      if (res.ok) {
        const text = await res.text();
        return text.length > MAX_BYTES ? `${text.slice(0, MAX_BYTES)}\n\n…` : text;
      }
    } catch {
      // 网络错误直接试下一个候选名
    }
  }
  return null;
}

export async function fetchReadmes(items: RegistryItem[]): Promise<void> {
  const byRepo = new Map<string, RegistryItem[]>();
  for (const item of items) {
    if (!item.source.repo) continue;
    const list = byRepo.get(item.source.repo) ?? [];
    list.push(item);
    byRepo.set(item.source.repo, list);
  }

  const repos = [...byRepo.keys()];
  let done = 0;
  let hit = 0;
  for (let i = 0; i < repos.length; i += CONCURRENCY) {
    await Promise.all(
      repos.slice(i, i + CONCURRENCY).map(async (repo) => {
        const md = await fetchOne(repo);
        if (md) hit++;
        for (const item of byRepo.get(repo) ?? []) item.readme = md;
        done++;
      }),
    );
    if (done % 40 === 0 || done >= repos.length) {
      console.log(`  readme: ${done}/${repos.length} 仓库，命中 ${hit}`);
    }
  }
}
