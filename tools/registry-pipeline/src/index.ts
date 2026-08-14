/**
 * 仓库聚合管线入口：拉取 → 归一化 → 扫描 → 打标 → 落盘 JSON。
 * 产物写到 apps/web/public/registry/（index.json + items/*.json + meta.json），
 * 官网构建期直接读，无需运行时数据库。
 *
 * 用法：pnpm fetch:registry（根目录）或 pnpm --filter @yo-skill/registry-pipeline fetch
 */

import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { fetchClaudeSkills } from "./fetchers/claudeskills.ts";
import { fetchMcpRegistry } from "./fetchers/mcp-registry.ts";
import { fetchReadmes } from "./fetchers/readme.ts";
import { setupProxy } from "./http.ts";
import { scanItem } from "./scan.ts";
import { tagCategory } from "./tag.ts";
import { safeId, toIndexItem } from "./schema.ts";

const OUT_DIR = fileURLToPath(
  new URL("../../../apps/web/public/registry/", import.meta.url),
);

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

  const index = curated.map(toIndexItem);

  console.log("== 落盘 ==");
  await mkdir(`${OUT_DIR}items`, { recursive: true });
  await writeFile(
    `${OUT_DIR}index.json`,
    JSON.stringify(index, null, 2) + "\n",
  );
  for (const item of curated) {
    await writeFile(
      `${OUT_DIR}items/${safeId(item.id)}.json`,
      JSON.stringify(item, null, 2) + "\n",
    );
  }
  await writeFile(
    `${OUT_DIR}meta.json`,
    JSON.stringify(
      {
        schema_version: 1,
        generated_at: new Date().toISOString(),
        counts: {
          skill: skills.filter((i) => i.status === "curated").length,
          mcp: mcps.filter((i) => i.status === "curated").length,
          blocked,
        },
      },
      null,
      2,
    ) + "\n",
  );

  console.log(
    `完成：${index.length} 条入库（skill ${index.filter((i) => i.type === "skill").length} / mcp ${index.filter((i) => i.type === "mcp").length}），blocked ${blocked} → ${OUT_DIR}`,
  );
}

main().catch((err) => {
  console.error("管线失败：", err);
  process.exit(1);
});
