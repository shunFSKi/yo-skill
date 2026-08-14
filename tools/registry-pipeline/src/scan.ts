/**
 * 描述层静态扫描（调研 §5 的 MVP 子集：5 条规则）
 * 只扫元数据（name + description + env 名 + remote_url），不拉代码本体。
 * 100 制：高危命中 → status "blocked"（不出库）；扣分项各 -15；
 * scanned = score >= 70 且未被 block。徽章只说「已扫描」，不说「安全」。
 */

import type { RegistryItem, SecurityCheck } from "./schema.ts";

interface Rule {
  name: string;
  /** true = 命中即 block；false = 命中扣 15 分 */
  blocking: boolean;
  test: (item: RegistryItem, haystack: string) => boolean;
}

const RULES: Rule[] = [
  {
    // 描述层注入：覆盖指令、隐瞒意图、零宽字符、长 Base64 载荷
    name: "描述层注入",
    blocking: true,
    test: (_item, hay) =>
      /ignore (all )?previous/i.test(hay) ||
      /do not tell/i.test(hay) ||
      /<IMPORTANT>/i.test(hay) ||
      /忽略(之前|以上|所有)(的)?(指令|指示|提示)/.test(hay) ||
      /[​-‏‪-‮﻿]/.test(hay) ||
      /[A-Za-z0-9+/]{120,}={0,2}/.test(hay),
  },
  {
    // 敏感路径：诱导读取凭据文件。不扫 cookie（误伤浏览器自动化 MCP）
    name: "敏感路径",
    blocking: true,
    test: (_item, hay) =>
      /\.ssh|\.aws|\.env\b|etc\/passwd|keychain/i.test(hay),
  },
  {
    name: "外部渗出",
    blocking: false,
    test: (_item, hay) => /exfiltrat|webhook|upload.{0,20}conversation/i.test(hay),
  },
  {
    name: "危险执行",
    blocking: false,
    test: (_item, hay) =>
      /\beval\b|child_process|os\.system|shell=True/i.test(hay),
  },
  {
    name: "配置风险",
    blocking: false,
    test: (item) =>
      !!item.install?.remote_url && item.install.remote_url.startsWith("http://"),
  },
];

/** 原地写入 security 与 status，返回是否被 block */
export function scanItem(item: RegistryItem): boolean {
  const haystack = [
    item.name,
    item.description,
    ...(item.install?.env?.map((e) => e.name) ?? []),
  ].join("\n");

  const checks: SecurityCheck[] = [];
  let score = 100;
  let blocked = false;

  for (const rule of RULES) {
    const hit = rule.test(item, haystack);
    checks.push({ name: rule.name, pass: !hit });
    if (hit && rule.blocking) blocked = true;
    else if (hit) score -= 15;
  }

  item.security = { score, scanned: score >= 70 && !blocked, checks };
  if (blocked) item.status = "blocked";
  return blocked;
}
