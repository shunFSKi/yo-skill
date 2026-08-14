/**
 * 仓库聚合管线入口：拉取 → 归一化 → 扫描 → 打标 → 抓 README → 落盘 JSON。
 * 默认产物写到 apps/web/public/registry/（index.json + items/*.json + meta.json），
 * 官网构建期直接读，无需运行时数据库。
 *
 * 两条纪律：
 * - 输出目录可用 REGISTRY_OUT_DIR 覆盖（CI 里指向数据仓库检出目录）
 * - 幂等：数据无变化时不落盘（generated_at 不动），变了才整体重写并清掉过期条目
 *   ——generated_at 是下游（桌面端 / Actions）判断"要不要同步"的锚点，不能每次跑都变
 *
 * 用法：pnpm fetch:registry（根目录）或 pnpm --filter @yo-skill/registry-pipeline fetch
 */

import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { fetchClaudeSkills } from "./fetchers/claudeskills.ts";
import { fetchMcpRegistry } from "./fetchers/mcp-registry.ts";
import { fetchReadmes } from "./fetchers/readme.ts";
import { setupProxy } from "./http.ts";
import { scanItem } from "./scan.ts";
import { tagCategory } from "./tag.ts";
import { safeId, toIndexItem, type RegistryItem } from "./schema.ts";

const OUT_DIR =
  process.env.REGISTRY_OUT_DIR ??
  fileURLToPath(new URL("../../../apps/web/public/registry/", import.meta.url));

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
  setupProxy();
  console.log("== 拉取源数据 ==");
  const [skills, mcps] = await Promise.all([
    fetchClaudeSkills(),
    fetchMcpRegistry(),
  ]);
  console.log(`拉取完成：skill ${skills.length} 条，mcp ${mcps.length} 条`);

  console.log("== 扫描与打标 ==");
  let blocked = 0;
  for (const item of [...skills, ...mcps]) {
    if (scanItem(item)) blocked++;
    tagCategory(item);
  }
  console.log(`扫描完成：block ${blocked} 条`);

  const curated = [...skills, ...mcps].filter((i) => i.status === "curated");

  console.log("== 抓取源仓库 README ==");
  await fetchReadmes(curated);

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
        skill: skills.filter((i) => i.status === "curated").length,
        mcp: mcps.filter((i) => i.status === "curated").length,
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
