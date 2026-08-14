"use client";

/**
 * 市场探索岛：分段（Skill/MCP）+ 分类 + 搜索 + 排序，全部本地过滤。
 * URL 可分享：状态变化同步到 query（router.replace, 不滚动、不刷新数据）。
 */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, Search, ShieldCheck, Star } from "lucide-react";
import type { Category, IndexItem, ItemType } from "@/lib/registry";
import { safeId } from "@/lib/safe-id";
import { dotColor } from "@/lib/colors";
import { cn } from "@/lib/utils";

const CATEGORIES: Category[] = ["写作", "编程", "设计", "办公", "生活"];

/** 每页卡片数：全量上万条，整墙渲染会卡，分页切片 */
const PAGE_SIZE = 48;

type Sort = "reco" | "stars";

function formatStars(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

function sortItems(items: IndexItem[], sort: Sort): IndexItem[] {
  const byStars = (a: IndexItem, b: IndexItem) =>
    (b.stars ?? -1) - (a.stars ?? -1);
  const byName = (a: IndexItem, b: IndexItem) => a.name.localeCompare(b.name);
  return [...items].sort((a, b) => {
    if (sort === "reco") {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return byStars(a, b) || byName(a, b);
    }
    return byStars(a, b) || byName(a, b);
  });
}

export function MarketExplorer({ items }: { items: IndexItem[] }) {
  const router = useRouter();
  const params = useSearchParams();

  const [type, setType] = useState<ItemType>(
    params.get("type") === "mcp" ? "mcp" : "skill",
  );
  const [cat, setCat] = useState<Category | null>(
    CATEGORIES.includes(params.get("cat") as Category)
      ? (params.get("cat") as Category)
      : null,
  );
  const [q, setQ] = useState(params.get("q") ?? "");
  const [sort, setSort] = useState<Sort>(
    params.get("sort") === "stars" ? "stars" : "reco",
  );
  const [page, setPage] = useState(1);

  /* 过滤/排序一变回第一页 */
  useEffect(() => {
    setPage(1);
  }, [type, cat, q, sort]);

  /* 状态 → URL（可分享）。首次挂载不 replace，避免无谓历史记录。 */
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const sp = new URLSearchParams();
    if (type !== "skill") sp.set("type", type);
    if (cat) sp.set("cat", cat);
    if (q.trim()) sp.set("q", q.trim());
    if (sort !== "reco") sp.set("sort", sort);
    const qs = sp.toString();
    router.replace(qs ? `/market?${qs}` : "/market", { scroll: false });
  }, [type, cat, q, sort, router]);

  const counts = useMemo(() => {
    let skill = 0;
    let mcp = 0;
    for (const i of items) {
      if (i.type === "skill") skill++;
      else mcp++;
    }
    return { skill, mcp };
  }, [items]);

  /* 分类计数跟随当前类型分段 */
  const catCounts = useMemo(() => {
    const map = new Map<Category, number>();
    for (const i of items) {
      if (i.type !== type || !i.category) continue;
      map.set(i.category, (map.get(i.category) ?? 0) + 1);
    }
    return map;
  }, [items, type]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = items.filter((i) => {
      if (i.type !== type) return false;
      if (cat && i.category !== cat) return false;
      if (
        needle &&
        !`${i.name}\n${i.description}`.toLowerCase().includes(needle)
      )
        return false;
      return true;
    });
    return sortItems(list, sort);
  }, [items, type, cat, q, sort]);

  const totalOfType = type === "skill" ? counts.skill : counts.mcp;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

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
              aria-selected={type === key}
              onClick={() => setType(key)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                type === key
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
              value={q}
              onChange={(e) => setQ(e.target.value)}
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
                onClick={() => setSort(key)}
                className={cn(
                  "rounded-full px-3 py-1.5 transition-colors",
                  sort === key
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
        <FilterChip active={cat === null} onClick={() => setCat(null)}>
          全部
        </FilterChip>
        {CATEGORIES.map((c) => {
          const n = catCounts.get(c) ?? 0;
          if (n === 0) return null;
          return (
            <FilterChip
              key={c}
              active={cat === c}
              onClick={() => setCat(cat === c ? null : c)}
            >
              {c} {n}
            </FilterChip>
          );
        })}
      </div>

      {/* 计数 */}
      <p className="mt-6 text-sm text-ink-muted" aria-live="polite">
        {filtered.length === totalOfType
          ? `共 ${totalOfType} 条`
          : `${filtered.length} / ${totalOfType} 条`}
      </p>

      {/* 卡片墙 */}
      {paged.length > 0 ? (
        <>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paged.map((item) => (
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
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage(safePage - 1)}
                className="yo-btn yo-btn--ghost disabled:cursor-not-allowed disabled:opacity-40"
              >
                上一页
              </button>
              <span className="text-sm text-ink-muted">
                第 {safePage} / {totalPages} 页
              </span>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setPage(safePage + 1)}
                className="yo-btn yo-btn--ghost disabled:cursor-not-allowed disabled:opacity-40"
              >
                下一页
              </button>
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

function ItemCard({ item }: { item: IndexItem }) {
  return (
    <Link
      href={`/market/item/${safeId(item.id)}`}
      className="yo-card flex h-full flex-col p-5"
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
