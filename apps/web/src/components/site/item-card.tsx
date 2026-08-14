/**
 * 市场条目卡片：市场列表 / 高分精选横条 / 首页速览共用。
 * 纯展示组件（无客户端交互），服务端与客户端组件里都能用。
 */

import Link from "next/link";
import { KeyRound, ShieldCheck, Star } from "lucide-react";
import type { IndexItem } from "@/lib/registry";
import { safeId } from "@/lib/safe-id";
import { dotColor } from "@/lib/colors";
import { cn } from "@/lib/utils";

export function formatStars(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

/** 综合质量分 ≥70 才亮「高分」徽章：低分不贴标签，界面不制造焦虑 */
const HIGH_SCORE = 70;

export function ItemCard({
  item,
  className,
}: {
  item: IndexItem;
  className?: string;
}) {
  return (
    <Link
      href={`/market/item/${safeId(item.id)}`}
      className={cn("yo-card flex h-full flex-col p-5", className)}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-sm font-bold text-white"
          style={{ backgroundColor: dotColor(item.name) }}
        >
          {item.name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold leading-snug">
            {item.name}
          </h3>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {item.scanned && (
              <span className="yo-chip">
                <ShieldCheck className="h-3 w-3" />
                已扫描
              </span>
            )}
            {item.score !== null && item.score >= HIGH_SCORE && (
              <span className="yo-chip">高分 {item.score}</span>
            )}
            {item.needsKey && (
              <span className="yo-chip yo-chip--warn">
                <KeyRound className="h-3 w-3" />
                需要 API Key
              </span>
            )}
            {item.featured && (
              <span className="yo-chip yo-chip--neutral">精选</span>
            )}
          </div>
        </div>
      </div>
      <p className="mt-3 line-clamp-2 flex-1 text-sm leading-relaxed text-ink-soft">
        {item.description}
      </p>
      <div className="mt-4 flex items-center gap-3 text-xs text-ink-muted">
        {item.stars !== null && (
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-current" />
            {formatStars(item.stars)}
          </span>
        )}
        {item.category && <span>{item.category}</span>}
      </div>
    </Link>
  );
}
