"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

/**
 * Hero 右侧：活的产品预览窗（非截图）。
 * Skill / MCP 分段可切，每行开关可点——统一视图「跨 Agent 按名合并」。
 */

type Row = { name: string; agents: number };

const SKILLS: Row[] = [
  { name: "pdf-tools", agents: 3 },
  { name: "web-scraper", agents: 2 },
  { name: "code-review", agents: 5 },
  { name: "commit-helper", agents: 4 },
];

const MCPS: Row[] = [
  { name: "filesystem", agents: 2 },
  { name: "postgres", agents: 1 },
  { name: "github", agents: 3 },
];

/** 条目图标哈希着色（与桌面端原型同一思路：名字决定颜色，稳定不乱跳） */
const DOT_COLORS = [
  "#d97757",
  "#8e75b2",
  "#6950ef",
  "#f26207",
  "#2f9e7e",
  "#c2850c",
  "#5b82d0",
];

function dotColor(name: string) {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return DOT_COLORS[sum % DOT_COLORS.length];
}

export function ProductPreview() {
  const [tab, setTab] = useState<"skill" | "mcp">("skill");
  const [off, setOff] = useState<Record<string, boolean>>({});
  const rows = tab === "skill" ? SKILLS : MCPS;

  return (
    <div
      className="overflow-hidden rounded-[16px] border border-line bg-card shadow-pop"
      role="img"
      aria-label="yo-skill 产品预览：跨 Agent 统一管理的 Skill 列表"
    >
      {/* 窗框 */}
      <div className="flex items-center gap-2 border-b border-line bg-paper-deep px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
        <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
        <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
        <span className="ml-2 text-xs font-medium text-ink-muted">
          yo-skill · 已安装
        </span>
      </div>

      <div className="p-4 sm:p-5">
        {/* 分段切换 */}
        <div
          className="inline-flex rounded-full bg-paper-deep p-1"
          role="tablist"
          aria-label="类型切换"
        >
          {(
            [
              ["skill", "Skill"],
              ["mcp", "MCP"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                tab === key
                  ? "bg-card text-ink shadow-card"
                  : "text-ink-muted hover:text-ink-soft"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 统一列表：同名跨 Agent 合并成一条 */}
        <ul className="mt-4 space-y-2">
          {rows.map((r) => {
            const enabled = !off[`${tab}:${r.name}`];
            return (
              <li
                key={r.name}
                className="flex items-center gap-3 rounded-[10px] border border-line bg-paper px-3 py-2.5"
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-[4px]"
                  style={{ background: dotColor(r.name) }}
                  aria-hidden
                />
                <span className="truncate font-mono text-sm">{r.name}</span>
                <span className="yo-chip ml-auto">{r.agents} 个 Agent</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={enabled}
                  aria-label={`${enabled ? "停用" : "启用"} ${r.name}`}
                  onClick={() =>
                    setOff((s) => ({ ...s, [`${tab}:${r.name}`]: enabled }))
                  }
                  className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                    enabled ? "bg-jade" : "bg-line-strong"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
                      enabled ? "left-[18px]" : "left-0.5"
                    }`}
                  />
                </button>
              </li>
            );
          })}
        </ul>

        <p className="mt-4 flex items-center gap-1.5 text-xs text-ink-muted">
          <RefreshCw size={12} className="text-jade-ink" aria-hidden />
          一处更新，{tab === "skill" ? "5" : "3"} 个 Agent 同时生效
        </p>
      </div>
    </div>
  );
}
