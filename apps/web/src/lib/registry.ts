/**
 * 市场数据层（仅服务端组件使用）：构建期从 public/registry/ 读管线产物。
 * 产物由 tools/registry-pipeline 生成（pnpm fetch:registry），
 * 类型与 schema.ts 保持同步（web 侧不跨包引用，小重复换构建简单）。
 */

import { readFile } from "node:fs/promises";
import path from "node:path";

import { safeId } from "./safe-id";

export type ItemType = "skill" | "mcp";
export type Category = "写作" | "编程" | "设计" | "办公" | "生活";

export interface IndexItem {
  id: string;
  type: ItemType;
  name: string;
  description: string;
  stars: number | null;
  scanned: boolean;
  category: Category | null;
  featured: boolean;
  needsKey: boolean;
}

export interface EnvVar {
  name: string;
  required: boolean;
  secret: boolean;
}

export interface RegistryItem {
  id: string;
  type: ItemType;
  name: string;
  description: string;
  author: string;
  source: {
    registry: "claudeskills" | "mcp-official" | "github-search";
    url: string;
    repo: string | null;
    /** github-search 来源：SKILL.md 在仓库内的路径 */
    path?: string | null;
  };
  license: string | null;
  install: {
    kind: "skill-dir" | "npm" | "pypi" | "remote";
    command?: string;
    args?: string[];
    remote_url?: string;
    env?: EnvVar[];
  } | null;
  quality: { stars: number | null; pushed_at: string | null };
  security: {
    score: number;
    scanned: boolean;
    checks: { name: string; pass: boolean }[];
  };
  tags: { category: Category | null; featured: boolean };
  /** 源仓库根 README 原文（markdown；抓不到为 null） */
  readme: string | null;
  status: "curated" | "blocked";
}

export interface RegistryMeta {
  schema_version: number;
  generated_at: string;
  counts: { skill: number; mcp: number; blocked: number };
}

/** id → 路由/文件安全串（与管线 safeId 同一算法） */
export { safeId } from "./safe-id";

const REGISTRY_DIR = path.join(process.cwd(), "public", "registry");

async function readJson<T>(file: string): Promise<T> {
  const raw = await readFile(path.join(REGISTRY_DIR, file), "utf8");
  return JSON.parse(raw) as T;
}

export function getRegistryIndex(): Promise<IndexItem[]> {
  return readJson<IndexItem[]>("index.json");
}

export function getRegistryMeta(): Promise<RegistryMeta> {
  return readJson<RegistryMeta>("meta.json");
}

export async function getRegistryItem(
  id: string,
): Promise<RegistryItem | null> {
  try {
    return await readJson<RegistryItem>(`items/${safeId(id)}.json`);
  } catch {
    return null;
  }
}
