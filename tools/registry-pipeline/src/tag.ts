/**
 * 场景分类打标：关键词规则，name + description 匹配计数取最多。
 * 无命中 → category = null（不硬塞）。
 */

import type { Category, RegistryItem } from "./schema.ts";

const KEYWORDS: Record<Category, string> = {
  写作: "writ|doc|blog|copywrit|note|markdown|journal|文案|写作|小红书|公众号",
  编程: "code|dev|api|debug|test|git|database|sql|deploy|docker|github|sdk|program|开发|代码",
  设计: "image|video|figma|art|design|logo|poster|photo|svg|draw|设计|图片|视频|海报",
  办公: "calendar|email|task|spreadsheet|excel|pdf|meeting|slide|ppt|sheet|notion|jira|slack|邮件|日程|表格|办公",
  生活: "weather|travel|recipe|fitness|music|movie|map|restaurant|hotel|天气|旅行|菜谱|音乐|电影",
};

// 短英文关键词（≤4 字母）加左词边界，防止 art 命中 start/partner、
// git 命中 digital、test 命中 latest；中文词保持子串匹配。
const PATTERNS = (Object.entries(KEYWORDS) as [Category, string][]).map(
  ([cat, words]) => ({
    cat,
    re: new RegExp(
      words
        .split("|")
        .map((w) => (/^[a-z]{1,4}$/.test(w) ? `\\b${w}` : w))
        .join("|"),
      "i",
    ),
  }),
);

export function tagCategory(item: RegistryItem): void {
  const hay = `${item.name}\n${item.description}`;
  let best: Category | null = null;
  let bestCount = 0;
  for (const { cat, re } of PATTERNS) {
    const count = (hay.match(new RegExp(re.source, "gi")) ?? []).length;
    if (count > bestCount) {
      bestCount = count;
      best = cat;
    }
  }
  item.tags.category = best;
}
