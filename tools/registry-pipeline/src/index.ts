/**
 * 仓库聚合管线入口：拉取 → 归一化 → 扫描 → 打标 → 抓 README → 落盘 JSON。
 * 默认产物写到 apps/web/public/registry/（index.json + items/*.json + meta.json
 * + shards/ 分片〔镜像源单文件上限兜底：Gitee >1MB 403 / jsDelivr ≤20MB，见 shards.ts〕），
 * 官网构建期直接读，无需运行时数据库。
 *
 * 三条纪律：
 * - 输出目录可用 REGISTRY_OUT_DIR 覆盖（CI 里指向数据仓库检出目录）
 * - 幂等：数据无变化时不落盘（generated_at 不动），变了才整体重写并清掉过期条目
 *   ——generated_at 是下游（桌面端 / Actions）判断"要不要同步"的锚点，不能每次跑都变
 * - 落盘前按 id 排序：源站返回顺序会漂，不排序幂等比对永远失效
 *
 * 全量口径（2026-08-14 用户拍板）：MCP 官方 Registry 全分页；Skill 双源——
 * claudeskills 全量（repo 级去重）+ GitHub 代码搜索增量采集 SKILL.md（需 GITHUB_TOKEN，
 * 本地从本包 .env 读，CI 由 workflow 注入）。增量设计（同日拍板）：每天定额新采一批
 * （GITHUB_HARVEST_DAILY 默认 8000），状态持久化在 harvest-cache.json（分片队列 +
 * 全部记录含墓碑），官网随每日提交实时增长，十几天爬完全量（参照 agentskillshub 13 万+）。
 * 收录口径（同日拍板，对齐 skills.sh 质量门槛思路）：文件 ≥500B 才采、
 * description ≥20 字符、test/example/template 等路径黑名单、同名同描述 fork 洪水去重
 * （留 stars 最高的）；github-search 源的 stars/pushedAt 由 github-stars.ts 富化
 * （GraphQL 批量 + stars-cache.json 缓存，每日增量，STARS_MAX_REPOS 默认 4500；
 * 每个 repo 记每日 star 快照〔最多 30 个点〕，官网详情页画「近段时间」曲线）。
 * 综合质量分（score.ts，0-100）：stars 对数 45 + 维护新鲜度 20 + 扫描 15 + README 10 + 描述 10。
 * README 分层：只给 featured + stars 前 1500 + MCP 新近 300 抓，全文截断 200KB，
 * 其余 readme=null（体积与 CI 时长纪律）。
 *
 * 用法：pnpm fetch:registry（根目录）或 pnpm --filter @yo-skill/registry-pipeline fetch
 */

import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { fetchClaudeSkills } from "./fetchers/claudeskills.ts";
import { fetchGitHubSkills } from "./fetchers/github-skills.ts";
import { enrichGitHubStars } from "./fetchers/github-stars.ts";
import { fetchMcpRegistry } from "./fetchers/mcp-registry.ts";
import { fetchReadmes } from "./fetchers/readme.ts";
import { setupProxy } from "./http.ts";
import { scanItem } from "./scan.ts";
import { scoreItem } from "./score.ts";
import { writeShards } from "./shards.ts";
import { tagCategory } from "./tag.ts";
import { safeId, toIndexItem, type IndexItem, type RegistryItem } from "./schema.ts";

const OUT_DIR =
  process.env.REGISTRY_OUT_DIR ??
  fileURLToPath(new URL("../../../apps/web/public/registry/", import.meta.url));

/** README 抓取上限：featured 全抓 + stars 前 1500 + MCP 按更新近的前 300（MCP 无 stars） */
const README_TOP_N = 1_500;
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

/**
 * added_at 幂等继承：读上一版 index.json，已有 id 保留原 added_at（含 null——
 * 2026-08-15 字段迁移前的存量条目收录日不可考，永久为 null，不造假）；
 * 新出现的 id 记今天（YYYY-MM-DD）。上一版不存在/不可读 → 全 null。
 *
 * 幂等论证：同一天重跑，上一版已含今天写入的日期，全部按 id 保留 → 逐字节一致；
 * 隔天重跑，已有条目的 added_at 一律来自上一版不再漂移，只有真·新收录条目拿新日期。
 * 必须在 isUnchanged 比对之前执行，比对内容才包含 added_at。
 */
async function applyAddedAt(items: IndexItem[], outDir: string): Promise<void> {
  let prev: Map<string, string | null> | null = null;
  try {
    const raw = JSON.parse(
      await readFile(join(outDir, "index.json"), "utf8"),
    ) as Array<{ id: string; added_at?: string | null }>;
    prev = new Map(raw.map((e) => [e.id, e.added_at ?? null]));
  } catch {
    prev = null; // 首跑或文件损坏：全 null
  }
  const today = new Date().toISOString().slice(0, 10);
  for (const item of items) {
    item.added_at =
      prev === null ? null : (prev.has(item.id) ? (prev.get(item.id) ?? null) : today);
  }
}

async function main(): Promise<void> {
  loadLocalEnv();
  setupProxy();
  // 输出目录先建好：stars/harvest 缓存在管线中段就会写，等不到落盘阶段
  await mkdir(OUT_DIR, { recursive: true });
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
  const harvested = await fetchGitHubSkills(known, OUT_DIR);
  console.log(`github 采集完成：${harvested.length} 条`);

  // stars 富化要在 fork 去重之前：留哪份由 stars 决定。
  // 连 claudeskills 条目一起传：它的 repo 也要记 star 快照，只是不回填 stars（自带元数据不覆盖）
  console.log("== GitHub repo stars 富化 ==");
  await enrichGitHubStars([...skills, ...harvested], OUT_DIR);

  // 复制/fork 洪水去重（仅 github-search 源）：同名同描述只留一份。
  // 留 stars 最高的（null 视为 -1）；平手留 id 字典序靠前的（确定性，保幂等）
  const bySig = new Map<string, RegistryItem>();
  let dupDropped = 0;
  for (const item of harvested) {
    const sig = `${item.name.toLowerCase().trim()}::${item.description
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim()}`;
    const prev = bySig.get(sig);
    const s = item.quality.stars ?? -1;
    const ps = prev?.quality.stars ?? -1;
    if (!prev || s > ps || (s === ps && item.id < prev.id)) {
      bySig.set(sig, item);
      if (prev) dupDropped++;
    } else {
      dupDropped++;
    }
  }
  if (dupDropped > 0) console.log(`复制/fork 去重：丢弃 ${dupDropped} 条`);

  const all = [...skills, ...mcps, ...bySig.values()];

  console.log("== 扫描与打标 ==");
  let blocked = 0;
  for (const item of all) {
    if (scanItem(item)) blocked++;
    tagCategory(item);
  }
  console.log(`扫描完成：block ${blocked} 条`);

  // 大小写不敏感去重：上游改名会留下仅大小写不同的双条目（MCP 官方 Registry 实测 4 对，
  // 如 io.github.Zuga-luga/Zugabot → zugabot），safeId 文件名只差大小写，
  // Windows/macOS 大小写不敏感文件系统放不下两份。留 pushed_at 新的，平手留 id 排序靠前的
  const byLowerId = new Map<string, RegistryItem>();
  for (const item of all) {
    const key = item.id.toLowerCase();
    const prev = byLowerId.get(key);
    const t = item.quality.pushed_at ?? "";
    const p = prev?.quality.pushed_at ?? "";
    if (!prev || t > p || (t === p && item.id < prev.id)) {
      byLowerId.set(key, item);
    }
  }
  const dropped = all.length - byLowerId.size;
  if (dropped > 0) console.log(`大小写重复去重：丢弃 ${dropped} 条`);

  const curated = [...byLowerId.values()]
    .filter((i) => i.status === "curated")
    .sort((a, b) => (a.id < b.id ? -1 : 1)); // 确定性排序，保幂等

  console.log("== 抓取源仓库 README（featured + stars 前 1500 + MCP 新近 300） ==");
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

  // 综合质量分：依赖扫描结果与 README，必须在两者之后算
  for (const item of curated) item.quality.score = scoreItem(item);

  const indexItems = curated.map(toIndexItem);
  await applyAddedAt(indexItems, OUT_DIR);
  const indexJson = serialize(indexItems);

  console.log("== 落盘 ==");
  if (await isUnchanged(OUT_DIR, indexJson, curated)) {
    // 整包无变化也要补产分片：分片是 index 的确定性派生物，
    // 升级此版本后的首跑靠这一步把 shards/ 补齐（幂等，已有则不写）
    if (await writeShards(OUT_DIR, indexItems)) {
      console.log("整包无变化，分片产物有补齐/更新");
    } else {
      console.log(`数据无变化，跳过落盘（${OUT_DIR}）`);
    }
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
  await writeShards(OUT_DIR, indexItems);
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
