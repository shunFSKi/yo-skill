/**
 * 仓库聚合管线入口：拉取 → 归一化 → 扫描 → 打标 → 抓 README → 落盘 JSON。
 * 默认产物写到 apps/web/public/registry/（index.json + items/*.json + meta.json），
 * 官网构建期直接读，无需运行时数据库。
 *
 * 三条纪律：
 * - 输出目录可用 REGISTRY_OUT_DIR 覆盖（CI 里指向数据仓库检出目录）
 * - 幂等：数据无变化时不落盘（generated_at 不动），变了才整体重写并清掉过期条目
 *   ——generated_at 是下游（桌面端 / Actions）判断"要不要同步"的锚点，不能每次跑都变
 * - 落盘前按 id 排序：源站返回顺序会漂，不排序幂等比对永远失效
 *
 * 全量口径（2026-08-14 用户拍板）：MCP 官方 Registry 全分页；Skill 双源——
 * claudeskills 全量（repo 级去重）+ GitHub 代码搜索全量采集 SKILL.md（需 GITHUB_TOKEN，
 * 本地从本包 .env 读，CI 由 workflow 注入；上限 GITHUB_HARVEST_MAX，默认 25000）。
 * README 分层：只给 featured + stars 前 500 抓，其余 readme=null（体积与 CI 时长纪律）。
 *
 * 用法：pnpm fetch:registry（根目录）或 pnpm --filter @yo-skill/registry-pipeline fetch
 */

import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { fetchClaudeSkills } from "./fetchers/claudeskills.ts";
import { fetchGitHubSkills } from "./fetchers/github-skills.ts";
import { fetchMcpRegistry } from "./fetchers/mcp-registry.ts";
import { fetchReadmes } from "./fetchers/readme.ts";
import { setupProxy } from "./http.ts";
import { scanItem } from "./scan.ts";
import { tagCategory } from "./tag.ts";
import { safeId, toIndexItem, type RegistryItem } from "./schema.ts";

const OUT_DIR =
  process.env.REGISTRY_OUT_DIR ??
  fileURLToPath(new URL("../../../apps/web/public/registry/", import.meta.url));

/** README 抓取上限：featured 全抓 + stars 前 500 + MCP 按更新近的前 300（MCP 无 stars） */
const README_TOP_N = 500;
const README_MCP_RECENT_N = 300;

/** 本地开发从本包 .env 读 GITHUB_TOKEN（CI 由 workflow 注入，无文件不报错） */
function loadLocalEnv(): void {
  try {
    process.loadEnvFile(fileURLToPath(new URL("../.env", import.meta.url)));
  } catch {
    // .env 不存在是常态（CI / 未配置本机），静默跳过
  }
}

function serialize(data: unknown): string {
  return JSON.stringify(data, null, 2) + "\n";
}

/** 与既有产物逐字节比对：index 或任一条目不同、条目数不同，都视为有变化 */
async function isUnchanged(
  outDir: string,
  index: string,
  items: RegistryItem[],
): Promise<boolean> {
  try {
    if ((await readFile(join(outDir, "index.json"), "utf8")) !== index) {
      return false;
    }
    const existing = (await readdir(join(outDir, "items"))).filter((f) =>
      f.endsWith(".json"),
    );
    if (existing.length !== items.length) return false;
    for (const item of items) {
      const old = await readFile(
        join(outDir, "items", `${safeId(item.id)}.json`),
        "utf8",
      ).catch(() => null);
      if (old !== serialize(item)) return false;
    }
    return true;
  } catch {
    return false;
  }
}

async function main(): Promise<void> {
  loadLocalEnv();
  setupProxy();
  console.log("== 拉取源数据 ==");
  const [skills, mcps] = await Promise.all([
    fetchClaudeSkills(),
    fetchMcpRegistry(),
  ]);
  console.log(`拉取完成：skill ${skills.length} 条，mcp ${mcps.length} 条`);

  // GitHub 全量采集：与 claudeskills 按「同 repo 且同 slug」去重
  const known = new Map<string, Set<string>>();
  for (const s of skills) {
    if (!s.source.repo) continue;
    const slug = s.id.replace(/^skill:claudeskills\//, "");
    const set = known.get(s.source.repo) ?? new Set<string>();
    set.add(slug.toLowerCase());
    known.set(s.source.repo, set);
  }
  const harvested = await fetchGitHubSkills(known);
  console.log(`github 采集完成：${harvested.length} 条`);

  const all = [...skills, ...mcps, ...harvested];

  console.log("== 扫描与打标 ==");
  let blocked = 0;
  for (const item of all) {
    if (scanItem(item)) blocked++;
    tagCategory(item);
  }
  console.log(`扫描完成：block ${blocked} 条`);

  const curated = all
    .filter((i) => i.status === "curated")
    .sort((a, b) => (a.id < b.id ? -1 : 1)); // 确定性排序，保幂等

  console.log("== 抓取源仓库 README（featured + stars 前 500 + MCP 新近 300） ==");
  const readmeTargets = new Set<RegistryItem>(
    curated.filter((i) => i.tags.featured),
  );
  for (const item of [...curated]
    .filter((i) => i.quality.stars !== null)
    .sort((a, b) => (b.quality.stars ?? 0) - (a.quality.stars ?? 0))
    .slice(0, README_TOP_N)) {
    readmeTargets.add(item);
  }
  for (const item of [...curated]
    .filter((i) => i.type === "mcp" && i.quality.pushed_at !== null)
    .sort((a, b) =>
      (b.quality.pushed_at ?? "").localeCompare(a.quality.pushed_at ?? ""),
    )
    .slice(0, README_MCP_RECENT_N)) {
    readmeTargets.add(item);
  }
  await fetchReadmes([...readmeTargets]);

  const indexJson = serialize(curated.map(toIndexItem));

  console.log("== 落盘 ==");
  if (await isUnchanged(OUT_DIR, indexJson, curated)) {
    console.log(`数据无变化，跳过落盘（${OUT_DIR}）`);
    return;
  }

  // 有变化：清空 items（清掉过期/被拦条目）后整体重写，meta 打新时间戳
  await rm(join(OUT_DIR, "items"), { recursive: true, force: true });
  await mkdir(join(OUT_DIR, "items"), { recursive: true });
  await writeFile(join(OUT_DIR, "index.json"), indexJson);
  for (const item of curated) {
    await writeFile(
      join(OUT_DIR, "items", `${safeId(item.id)}.json`),
      serialize(item),
    );
  }
  await writeFile(
    join(OUT_DIR, "meta.json"),
    serialize({
      schema_version: 1,
      generated_at: new Date().toISOString(),
      counts: {
        skill: curated.filter((i) => i.type === "skill").length,
        mcp: curated.filter((i) => i.type === "mcp").length,
        blocked,
      },
    }),
  );

  console.log(
    `完成：${curated.length} 条入库（skill ${curated.filter((i) => i.type === "skill").length} / mcp ${curated.filter((i) => i.type === "mcp").length}），blocked ${blocked} → ${OUT_DIR}`,
  );
}

main().catch((err) => {
  console.error("管线失败：", err);
  process.exit(1);
});
