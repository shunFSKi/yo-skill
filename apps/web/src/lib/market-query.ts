/**
 * 市场页查询状态：URL 即状态。
 * 服务端（page.tsx 解析 searchParams）与客户端（explorer 控件回写 URL）
 * 共用同一份解析/构造逻辑，保证口径一致。
 */

import type { Category, ItemType } from "./registry";

export const PAGE_SIZE = 48;

export const CATEGORIES: Category[] = ["写作", "编程", "设计", "办公", "生活"];

export type MarketSort = "reco" | "stars";

export interface MarketState {
  type: ItemType;
  cat: Category | null;
  q: string;
  sort: MarketSort;
  page: number;
}

export type MarketSearchParams = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

/** searchParams → 查询状态（非法值全部回落默认） */
export function parseMarketState(sp: MarketSearchParams): MarketState {
  const catRaw = first(sp.cat);
  const pageNum = Number(first(sp.page));
  return {
    type: first(sp.type) === "mcp" ? "mcp" : "skill",
    cat: CATEGORIES.includes(catRaw as Category) ? (catRaw as Category) : null,
    q: first(sp.q) ?? "",
    sort: first(sp.sort) === "stars" ? "stars" : "reco",
    page: Number.isInteger(pageNum) && pageNum > 0 ? pageNum : 1,
  };
}

/** 查询状态 → URL（默认值不出现在 URL 里，保持干净可分享） */
export function buildMarketHref(s: MarketState): string {
  const sp = new URLSearchParams();
  if (s.type !== "skill") sp.set("type", s.type);
  if (s.cat) sp.set("cat", s.cat);
  if (s.q.trim()) sp.set("q", s.q.trim());
  if (s.sort !== "reco") sp.set("sort", s.sort);
  if (s.page > 1) sp.set("page", String(s.page));
  const qs = sp.toString();
  return qs ? `/market?${qs}` : "/market";
}
