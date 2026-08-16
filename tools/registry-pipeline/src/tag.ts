/**
 * 场景分类打标：关键词规则，name + description 匹配计数取最多。
 * 无命中 → category = null（不硬塞，精确率优先）。
 *
 * 类目清单（2026-08-15 扩充 5 → 10，依据：对 16,783 条无分类条目均匀抽样 200 条人工判读）：
 * 保留原有 5 类（写作/编程/设计/办公/生活），新增 5 类——
 * 金融（样本 ~14%：crypto/支付/股票/税务）、AI（~14%：agent memory/prompt/LLM 基建）、
 * 数据（~10%：数据集/分析/开放数据）、运维（~8%：托管/监控/网络/K8s）、营销（~6%：SEO/CRM/广告）。
 * 教育/媒体候选在样本中占比过低（<2%），按「宁缺毋滥」不立类。
 * 同时为原有类补高精确度漏网词（如 办公+helpdesk/resume、生活+game/pet/health、写作+translate）。
 *
 * 关键词纪律：只收高精确度词，吃不准的词不收（宁可 null）。
 * 已知避让：sem 会误伤 semantic、tax 会误伤 taxonomy、invest 会误伤 investigation、
 * growth 会误伤 cycle-growth、token 会误伤 LLM token、server 会命中所有 "MCP server"——均不收；
 * stock（股票）与电商「库存」同形，只收 stocks / stock market。
 * 默认只有 ≤4 字母的词自动加左词边界；更长的词如需防子串误伤，手写 \b
 * （\bmetrics 防 biometrics、\bhosting 防 ghosting、\bsport 防 transport，2026-08-15 全库干跑实测）。
 */

import type { Category, RegistryItem } from "./schema.ts";

const KEYWORDS: Record<Category, string> = {
  写作: "writ|doc|blog|copywrit|note|markdown|journal|translate|translation|translator|summarize|summary|文案|写作|翻译|小红书|公众号",
  编程: "code|dev|api|debug|test|git|database|sql|deploy|docker|github|sdk|program|typescript|javascript|python|golang|rust|compiler|lint|playwright|\\bcli\\b|command-line|开发|代码",
  设计: "image|video|figma|art|design|logo|poster|photo|svg|draw|ui|ux|ui/ux|设计|图片|视频|海报",
  办公: "calendar|email|task|spreadsheet|excel|pdf|meeting|slide|ppt|sheet|notion|jira|slack|ticket|tickets|helpdesk|okr|resume|hiring|workspace|erp|邮件|日程|表格|办公",
  生活: "weather|travel|recipe|fitness|music|movie|map|restaurant|hotel|game|games|gaming|gift|gifts|\\bpet\\b|pets|health|\\bsport|meme|memes|天气|旅行|菜谱|音乐|电影|游戏|礼物|宠物|健康|占卜|星座",
  金融: "stocks|stock market|etf|\\bcrypto\\b|cryptocurrency|bitcoin|ethereum|\\bdefi\\b|trading|payment|payments|bank|banking|finance|financial|investing|investment|investor|portfolio|taxes|taxation|\\bvat\\b|insurance|mortgage|forex|fintech|wallet|wallets|usdc|onchain|on-chain|金融|股票|支付|加密货币|区块链|基金|税务|银行|投资",
  AI: "llm|llms|prompt|prompts|prompting|rag|embedding|embeddings|vector|vectors|fine-tune|fine-tuning|inference|agentic|memory|memories|neural|transformer|diffusion|tokenizer|大模型|提示词|智能体|向量|记忆",
  数据: "dataset|datasets|analytics|statistics|statistical|\\bmetrics|dashboard|dashboards|visualization|etl|data pipeline|data warehouse|open data|geospatial|gis|dataframe|parquet|数据|数据集|数据分析|统计|可视化|指标",
  运维: "kubernetes|k8s|docker|deploy|deployment|\\bhosting|monitor|monitoring|observability|telemetry|devops|sre|incident|ssh|dns|domain|domains|whois|ssl|infra|infrastructure|uptime|nginx|ldap|terraform|ansible|linux|unix|sysadmin|logs|运维|部署|监控|服务器|域名|日志",
  营销: "\\bseo\\b|marketing|ads|advertising|advertisement|campaign|campaigns|brand|branding|sales|crm|conversions|conversion rate|\\bcro\\b|landing page|waitlist|referral|referrals|affiliate|outreach|lead generation|gtm|go-to-market|营销|推广|品牌|销售|广告|获客|运营",
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
