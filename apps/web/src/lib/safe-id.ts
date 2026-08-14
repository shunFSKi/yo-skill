/** 条目 id → 路由/文件安全串（与管线 safeId 同一算法：: 与 / 全替换） */
export function safeId(id: string): string {
  return id.replace(/[:/]/g, "__");
}
