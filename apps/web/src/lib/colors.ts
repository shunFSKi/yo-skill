/**
 * 条目图标哈希着色（与桌面端原型同一思路：名字决定颜色，稳定不乱跳）。
 * product-preview 与市场卡片共用。
 */

const DOT_COLORS = [
  "#d97757",
  "#8e75b2",
  "#6950ef",
  "#f26207",
  "#2f9e7e",
  "#c2850c",
  "#5b82d0",
];

export function dotColor(name: string): string {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return DOT_COLORS[sum % DOT_COLORS.length];
}
