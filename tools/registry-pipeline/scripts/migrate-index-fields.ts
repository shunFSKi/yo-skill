/**
 * 一次性迁移脚本（2026-08-15）：给存量 index.json 补四个新字段，不联网。
 * - pushed_at / remote：从 items/<safeId>.json 读（quality.pushed_at / install.kind === "remote"）
 * - added_at：null（存量条目首次收录日不可考，等管线 added_at 继承逻辑给真·新条目打日期）
 * - license：null（等 stars 富化下次补抓 licenseInfo 后流入）
 *
 * 字段顺序与 schema.ts toIndexItem 保持一致，保证下次管线跑批 diff 干净。
 * 已有非 null 的 added_at/license 会保留（脚本重跑无副作用）。
 *
 * 用法：pnpm --filter @yo-skill/registry-pipeline migrate:index-fields
 *   或 node scripts/migrate-index-fields.ts（输出目录可用 REGISTRY_OUT_DIR 覆盖）
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { safeId, type IndexItem, type RegistryItem } from "../src/schema.ts";

const OUT_DIR =
  process.env.REGISTRY_OUT_DIR ??
  fileURLToPath(new URL("../../../apps/web/public/registry/", import.meta.url));

async function main(): Promise<void> {
  const index = JSON.parse(
    await readFile(join(OUT_DIR, "index.json"), "utf8"),
  ) as Array<Partial<IndexItem> & { id: string }>;

  let missingItem = 0;
  let pushedFilled = 0;
  let remoteCount = 0;
  const out: IndexItem[] = [];
  for (const e of index) {
    const file = join(OUT_DIR, "items", `${safeId(e.id)}.json`);
    const item = JSON.parse(await readFile(file, "utf8").catch(() => "null")) as RegistryItem | null;
    if (!item) {
      missingItem++;
      console.warn(`  缺 items 档案：${e.id}（pushed_at/remote 落 null/false）`);
    }
    const pushedAt = item?.quality.pushed_at ?? null;
    const remote = item?.install?.kind === "remote";
    if (pushedAt) pushedFilled++;
    if (remote) remoteCount++;
    out.push({
      id: e.id,
      type: e.type!,
      name: e.name!,
      description: e.description!,
      stars: e.stars ?? null,
      score: e.score ?? null,
      scanned: e.scanned ?? false,
      category: (e.category ?? null) as IndexItem["category"],
      featured: e.featured ?? false,
      needsKey: e.needsKey ?? false,
      repo: e.repo ?? null,
      pushed_at: pushedAt,
      added_at: e.added_at ?? null,
      remote,
      license: e.license ?? item?.license ?? null,
    });
  }

  // 落盘前按 id 排序（与管线一致），写后回读验证
  out.sort((a, b) => (a.id < b.id ? -1 : 1));
  const serialized = JSON.stringify(out, null, 2) + "\n";
  await writeFile(join(OUT_DIR, "index.json"), serialized);

  const back = JSON.parse(await readFile(join(OUT_DIR, "index.json"), "utf8")) as IndexItem[];
  const itemFiles = (await readdir(join(OUT_DIR, "items"))).filter((f) => f.endsWith(".json"));
  const ok =
    back.length === index.length &&
    back.every(
      (e) =>
        typeof e.id === "string" &&
        "pushed_at" in e &&
        "added_at" in e &&
        typeof e.remote === "boolean" &&
        "license" in e,
    );
  console.log(`迁移完成：${back.length} 条（迁移前 ${index.length} 条，${back.length === index.length ? "条数不变 ✓" : "条数变了 ✗"}）`);
  console.log(`  pushed_at 有值 ${pushedFilled} 条，remote=true ${remoteCount} 条，items 档案 ${itemFiles.length} 个`);
  console.log(`  缺档案 ${missingItem} 条；回读校验（JSON 合法 + 四字段齐全）：${ok ? "通过 ✓" : "失败 ✗"}`);
  if (!ok || back.length !== index.length) process.exit(1);
}

main().catch((err) => {
  console.error("迁移失败：", err);
  process.exit(1);
});
