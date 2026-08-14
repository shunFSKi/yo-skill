/**
 * 综合质量分（0-100）：市场「推荐优先」排序的依据。
 *
 * 为什么不用裸 stars 排序：stars 容易被 fork/合集体量带偏，且反映不了维护状态
 * （参考 agentskillshub 的 10 维评分思路，取其可用子集——我们的原料是管线已有的
 * stars / pushed_at / 描述 / README / 静态扫描结果，零额外抓取成本）。
 *
 * 权重（满分 100）：
 * - stars 对数分 45：log10(stars+1)/5 归一，10 万星封顶；null 记 0
 * - 维护新鲜度 20：30 天内推过 20 / 90 天 15 / 半年 10 / 一年 5 / 更老或未知 0
 * - 静态扫描通过 15：scanned=true 即五项全过
 * - README 已抓到 10
 * - 描述丰富度 10：≥100 字符 10 / ≥40 给 7 / ≥20 给 4（入库口径保证至少 20）
 */

import type { RegistryItem } from "./schema.ts";

function recencyPoints(pushedAt: string | null): number {
  if (!pushedAt) return 0;
  const ageDays = (Date.now() - Date.parse(pushedAt)) / 86_400_000;
  if (ageDays <= 30) return 20;
  if (ageDays <= 90) return 15;
  if (ageDays <= 180) return 10;
  if (ageDays <= 365) return 5;
  return 0;
}

function descPoints(desc: string): number {
  if (desc.length >= 100) return 10;
  if (desc.length >= 40) return 7;
  if (desc.length >= 20) return 4;
  return 0;
}

export function scoreItem(item: RegistryItem): number {
  const stars = item.quality.stars ?? 0;
  const starPoints = Math.min(45, (Math.log10(stars + 1) / 5) * 45);
  const scanPoints = item.security.scanned ? 15 : 0;
  const readmePoints = item.readme ? 10 : 0;
  return Math.round(
    starPoints +
      recencyPoints(item.quality.pushed_at) +
      scanPoints +
      readmePoints +
      descPoints(item.description),
  );
}
