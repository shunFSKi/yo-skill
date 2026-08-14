"use client";

/**
 * 市场探索岛（受控版）：过滤/搜索/分页都在服务端（URL 即状态），
 * 本组件只渲染当前页 + 把控件操作回写成 URL（router.replace 触发服务端重渲染）。
 * 体验纪律：搜索框本地即时回显、300ms debounce 后才请求；
 * useTransition pending 期间结果区半透明，避免闪烁。
 */

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import type { MarketResult } from "@/lib/registry";
import {
  buildMarketHref,
  CATEGORIES,
  type MarketState,
} from "@/lib/market-query";
import { ItemCard } from "./item-card";
import { cn } from "@/lib/utils";

export function MarketExplorer({
  state,
  result,
}: {
  state: MarketState;
  result: MarketResult;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  /* 搜索框本地值：即时回显；debounce 后才改 URL 请求服务端 */
  const [input, setInput] = useState(state.q);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* 外部状态变化（粘贴分享的 URL / 浏览器前进后退）→ 同步输入框 */
  useEffect(() => {
    setInput(state.q);
  }, [state.q]);

  useEffect(
    () => () => {
      if (debounce.current) clearTimeout(debounce.current);
    },
    [],
  );

  function navigate(next: MarketState) {
    startTransition(() => {
      router.replace(buildMarketHref(next), { scroll: false });
    });
  }

  /* 除翻页外的任何过滤变化都回第一页 */
  function changeFilter(patch: Partial<MarketState>) {
    navigate({ ...state, ...patch, page: 1 });
  }

  function onSearch(value: string) {
    setInput(value);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      changeFilter({ q: value });
    }, 300);
  }

  const { counts, catCounts, total, totalPages, page } = result;
  const totalOfType = state.type === "skill" ? counts.skill : counts.mcp;
  const prevHref =
    page > 1 ? buildMarketHref({ ...state, page: page - 1 }) : null;
  const nextHref =
    page < totalPages ? buildMarketHref({ ...state, page: page + 1 }) : null;

  return (
    <div>
      {/* 工具行：分段 + 搜索 + 排序 */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div
          className="inline-flex w-fit rounded-full bg-paper-deep p-1"
          role="tablist"
          aria-label="类型切换"
        >
          {(
            [
              ["skill", `Skill ${counts.skill}`],
              ["mcp", `MCP ${counts.mcp}`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={state.type === key}
              onClick={() => changeFilter({ type: key })}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                state.type === key
                  ? "bg-card text-ink shadow-sm"
                  : "text-ink-muted hover:text-ink",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-1 items-center gap-3 lg:max-w-md">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <span className="sr-only">搜索名称或描述</span>
            <input
              value={input}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="搜索名称或描述"
              className="w-full rounded-control border border-line bg-card py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink-muted focus:border-jade focus:outline-none"
            />
          </label>
          <div className="flex shrink-0 items-center gap-1 text-sm">
            {(
              [
                ["reco", "推荐优先"],
                ["stars", "Stars 高到低"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => changeFilter({ sort: key })}
                className={cn(
                  "rounded-full px-3 py-1.5 transition-colors",
                  state.sort === key
                    ? "bg-jade-soft font-semibold text-jade-ink"
                    : "text-ink-muted hover:text-ink",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 分类 chips */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <FilterChip
          active={state.cat === null}
          onClick={() => changeFilter({ cat: null })}
        >
          全部
        </FilterChip>
        {CATEGORIES.map((c) => {
          const n = catCounts[c] ?? 0;
          if (n === 0) return null;
          return (
            <FilterChip
              key={c}
              active={state.cat === c}
              onClick={() =>
                changeFilter({ cat: state.cat === c ? null : c })
              }
            >
              {c} {n}
            </FilterChip>
          );
        })}
      </div>

      {/* 计数 */}
      <p className="mt-6 text-sm text-ink-muted" aria-live="polite">
        {isPending
          ? "筛选中…"
          : total === totalOfType
            ? `共 ${totalOfType} 条`
            : `${total} / ${totalOfType} 条`}
      </p>

      {/* 卡片墙 */}
      {result.items.length > 0 ? (
        <>
          <ul
            className={cn(
              "mt-4 grid gap-4 transition-opacity sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
              isPending && "opacity-50",
            )}
          >
            {result.items.map((item) => (
              <li key={item.id}>
                <ItemCard item={item} />
              </li>
            ))}
          </ul>
          {totalPages > 1 && (
            <nav
              className="mt-8 flex items-center justify-center gap-4"
              aria-label="分页"
            >
              {prevHref ? (
                <Link href={prevHref} className="yo-btn yo-btn--ghost">
                  上一页
                </Link>
              ) : (
                <span className="yo-btn yo-btn--ghost cursor-not-allowed opacity-40">
                  上一页
                </span>
              )}
              <span className="text-sm text-ink-muted">
                第 {page} / {totalPages} 页
              </span>
              {nextHref ? (
                <Link href={nextHref} className="yo-btn yo-btn--ghost">
                  下一页
                </Link>
              ) : (
                <span className="yo-btn yo-btn--ghost cursor-not-allowed opacity-40">
                  下一页
                </span>
              )}
            </nav>
          )}
        </>
      ) : (
        <div className="mt-4 rounded-card border border-dashed border-rule-strong py-20 text-center">
          <p className="text-lg font-semibold">没有找到</p>
          <p className="mt-1 text-sm text-ink-muted">换个词试试。</p>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
        active
          ? "border-jade bg-jade-soft font-semibold text-jade-ink"
          : "border-line bg-card text-ink-soft hover:border-rule-strong hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
