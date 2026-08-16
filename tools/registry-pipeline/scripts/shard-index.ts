/**
 * 分片补产脚本（2026-08-16）：从存量 index.json 生成 shards/ 分片产物，不联网。
 * 背景：index.json 已超镜像源单文件上限（Gitee raw >1MB 403 / jsDelivr ≤20MB），
 * 分片是唯一全镜像可用形态。管线此后每次跑批自动产出（见 src/index.ts 落盘段），
 * 本脚本只用于不等下次跑批、立即给存量数据补齐分片。
 *
 * 幂等：writeShards 逐文件逐字节比对，无变化不落盘，可反复跑。
 *
 * 用法：pnpm shard:index（根目录）
 *   或 node scripts/shard-index.ts（输出目录可用 REGISTRY_OUT_DIR 覆盖）
 *
 * [INPUT]   ../src/schema.ts（IndexItem）、../src/shards.ts（buildShards/writeShards）；
 *           读取 OUT_DIR/index.json（默认 apps/web/public/registry/，REGISTRY_OUT_DIR 可覆盖）
 * [OUTPUT]  无导出（CLI 脚本）；副作用 = OUT_DIR/shards/ 分片落盘 + 控制台汇报，失败 exit 1
 * [POS]     一次性/手动补产入口——不等下次跑批即给存量 index.json 补齐分片
 * [PROTOCOL] 分片逻辑只在 src/shards.ts 维护，本脚本不得复制其实现
 */

import { readFile } from "node:fs/promises";
import { stat } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import type { IndexItem } from "../src/schema.ts";
import { buildShards, writeShards } from "../src/shards.ts";

const OUT_DIR =
  process.env.REGISTRY_OUT_DIR ??
  fileURLToPath(new URL("../../../apps/web/public/registry/", import.meta.url));

async function main(): Promise<void> {
  const items = JSON.parse(
    await readFile(join(OUT_DIR, "index.json"), "utf8"),
  ) as IndexItem[];

  const { shards } = buildShards(items);
  const changed = await writeShards(OUT_DIR, items);

  // 回读校验：最大分片必须低于 Gitee 1MB 墙
  let maxSize = 0;
  for (const [name] of shards) {
    const s = await stat(join(OUT_DIR, "shards", name));
    if (s.size > maxSize) maxSize = s.size;
  }
  const ok = maxSize < 1024 * 1024;
  console.log(
    `分片完成：${items.length} 条 → ${shards.length} 片，最大分片 ${(maxSize / 1024).toFixed(0)}KB` +
      `（${changed ? "已写入新产物" : "产物已是最新，未落盘"}；1MB 墙校验 ${ok ? "通过 ✓" : "失败 ✗"}）`,
  );
  if (!ok) process.exit(1);
}

main().catch((err) => {
  console.error("分片失败：", err);
  process.exit(1);
});
