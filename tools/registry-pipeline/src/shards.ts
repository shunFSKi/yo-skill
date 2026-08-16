/**
 * index.json 分片产物（shards/）。
 *
 * 为什么存在：镜像源的单文件硬上限——Gitee raw >1MB 匿名 403、jsDelivr 单文件
 * ≤20MB——而 index.json 已 ~17MB 且随每日采集增长（~8000 条/天 ≈ 3MB/天），
 * 整包形态几天内就会撞穿所有镜像。拆成 <800KB 的分片后，GitHub/Gitee/jsDelivr
 * 全镜像可用且无增长天花板；桌面端 skill-index 分片优先、整包兜底。
 *
 * 形态约定：
 * - shards/manifest.json：{ schema_version: 1, count, files }（pretty，人可读）
 * - shards/index-NNN.json：紧凑 JSON 数组（机器产物，体积/流量最小化；
 *   人类可读性由根目录 pretty 版 index.json 承担）
 *
 * 幂等论证：输入 items 按 id 排序（上游保证），贪心打包只依赖字节长度，
 * 同一输入产出逐字节一致；writeShards 逐文件比对，无变化不落盘。
 *
 * [INPUT]   ./schema.ts 的 IndexItem 类型；node:fs/promises（无网络、无外部服务）
 * [OUTPUT]  SHARD_TARGET_BYTES / ShardManifest / buildShards / writeShards
 *           （writeShards 落盘 shards/manifest.json + shards/index-NNN.json，幂等）
 * [POS]     registry-pipeline 的分片产物层——index.json 的确定性派生物，
 *           供镜像源（Gitee/jsDelivr 单文件上限绕开）与桌面端 skill-index 分片读取
 * [PROTOCOL] 分片形态变更时同步 crates/skill-index/src/lib.rs 的 assemble_from_shards
 *            与本目录 README「下游读取地址」节
 */

import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

import type { IndexItem } from "./schema.ts";

/** 单片目标上限：Gitee raw 1MB 墙留 20% 余量 */
export const SHARD_TARGET_BYTES = 800 * 1024;

export interface ShardManifest {
  schema_version: 1;
  count: number;
  files: string[];
}

/**
 * 贪心打包：按紧凑 JSON 字节长度累加，超目标即切新片。
 * 单条超上限的极端条目自占一片（不截断、不丢弃）。
 */
export function buildShards(items: IndexItem[]): {
  manifestText: string;
  shards: Array<[string, string]>;
} {
  const shards: Array<[string, string]> = [];
  let current: string[] = [];
  let size = 2; // "[" + "]"
  const flush = (): void => {
    if (current.length === 0) return;
    const name = `index-${String(shards.length).padStart(3, "0")}.json`;
    shards.push([name, `[${current.join(",")}]\n`]);
    current = [];
    size = 2;
  };
  for (const item of items) {
    const part = JSON.stringify(item);
    const len = Buffer.byteLength(part) + 1; // 逗号
    if (current.length > 0 && size + len > SHARD_TARGET_BYTES) flush();
    current.push(part);
    size += len;
  }
  flush();
  const manifest: ShardManifest = {
    schema_version: 1,
    count: items.length,
    files: shards.map(([name]) => name),
  };
  return { manifestText: JSON.stringify(manifest, null, 2) + "\n", shards };
}

/**
 * 分片落盘：逐文件逐字节比对，无变化不写；多余旧分片删除。
 * 返回是否有实际写入（供调用方记日志）。
 */
export async function writeShards(outDir: string, items: IndexItem[]): Promise<boolean> {
  const { manifestText, shards } = buildShards(items);
  const dir = join(outDir, "shards");
  await mkdir(dir, { recursive: true });

  const wanted = new Map<string, string>(shards);
  wanted.set("manifest.json", manifestText);

  let changed = false;
  for (const [name, text] of wanted) {
    const old = await readFile(join(dir, name), "utf8").catch(() => null);
    if (old !== text) {
      await writeFile(join(dir, name), text);
      changed = true;
    }
  }
  for (const f of (await readdir(dir)).filter((f) => f.endsWith(".json"))) {
    if (!wanted.has(f)) {
      await rm(join(dir, f));
      changed = true;
    }
  }
  return changed;
}
