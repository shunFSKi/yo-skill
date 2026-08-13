"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";

/**
 * Bento 里的交互小岛：重复项合并演示。
 * 点击「合并成一份」→ 变成已完成态，呼应产品的 dedupe 流程。
 */
export function MergeDemo() {
  const [merged, setMerged] = useState(false);

  if (merged) {
    return (
      <div className="mt-5 flex items-center gap-2 rounded-[10px] border border-line bg-jade-softer px-3 py-2.5">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-jade-soft text-jade-ink">
          <Check size={12} />
        </span>
        <span className="text-sm font-medium text-jade-ink">
          已合并成一份，3 个 Agent 同步生效
        </span>
      </div>
    );
  }

  return (
    <div className="mt-5 flex flex-wrap items-center gap-2 rounded-[10px] border border-dashed border-line-strong bg-paper px-3 py-2.5">
      <span className="font-mono text-sm">pdf-tools</span>
      <span className="yo-chip">3 份重复</span>
      <ArrowRight size={14} className="ml-auto text-ink-muted" aria-hidden />
      <button
        type="button"
        onClick={() => setMerged(true)}
        className="rounded-[8px] bg-btn px-3 py-1.5 text-xs font-semibold text-btn-ink transition-colors hover:bg-btn-hover"
      >
        合并成一份
      </button>
    </div>
  );
}
