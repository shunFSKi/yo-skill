/**
 * 落地页内容数据（集中管理，组件引用）
 * 文案口径：产品术语一律用源名称（Agent / Skill / MCP / API Key），不用中文翻译词。
 */

export type Assistant = {
  name: string;
  logo: string;
  /** 纯黑系 logo，深色模式下反色显示 */
  darkInvert?: boolean;
};

/** 首版支持的 15 款主流 Agent */
export const assistants: Assistant[] = [
  { name: "Claude Code", logo: "/logos/claude.svg" },
  { name: "Codex", logo: "/logos/openai.svg", darkInvert: true },
  { name: "Gemini CLI", logo: "/logos/googlegemini.svg" },
  { name: "Cursor", logo: "/logos/cursor.svg", darkInvert: true },
  { name: "Windsurf", logo: "/logos/windsurf.svg", darkInvert: true },
  { name: "GitHub Copilot", logo: "/logos/githubcopilot.svg", darkInvert: true },
  { name: "Kimi Code", logo: "/logos/kimi.svg", darkInvert: true },
  { name: "Cline", logo: "/logos/cline.svg", darkInvert: true },
  { name: "Roo Code", logo: "/logos/roocode.svg", darkInvert: true },
  { name: "Continue", logo: "/logos/continue.svg" },
  { name: "Aider", logo: "/logos/aider.svg", darkInvert: true },
  { name: "Trae", logo: "/logos/trae.svg" },
  { name: "Qwen Code", logo: "/logos/qwen.svg" },
  { name: "OpenCode", logo: "/logos/opencode.svg", darkInvert: true },
  { name: "Replit", logo: "/logos/replit.svg" },
];

export type Pain = {
  title: string;
  detail: string;
  icon: "laptop" | "copy" | "search";
};

export const pains: Pain[] = [
  {
    title: "换台电脑，配置全没",
    detail: "新机从头调起：Skill 重装、MCP 重配、API Key 重填，半天又没了。",
    icon: "laptop",
  },
  {
    title: "同一个 Skill，喂了好几遍",
    detail: "Claude 装一份、Cursor 装一份、Codex 再装一份，更新时哪个都不敢漏。",
    icon: "copy",
  },
  {
    title: "好 Skill 难找，也难判断能不能信",
    detail: "散落在 GitHub 各个角落：哪个真好用？哪个敢装？",
    icon: "search",
  },
];

/** 墨块段：换机恢复 + 安全底线（合并一区，安全不是卖点是底线） */
export const restorePoints: string[] = [
  "端到端加密，云端只存密文，连我们都解不开",
  "主密码加恢复码，只有你能打开",
  "本地优先：不想同步，就只用本地",
  "还没装的 Agent，恢复时顺便一键装好",
];

export const nav = [
  { href: "/#features", label: "能力" },
  { href: "/#sync", label: "同步" },
  { href: "/#agents", label: "Agent" },
  { href: "/market", label: "市场" },
  { href: "/#faq", label: "常见问题" },
] as const;

export const faqs = [
  {
    q: "yo-skill 和直接在每个 Agent 里手动配 Skill 有什么不一样？",
    a: "手动配，是同一件事做 N 遍：换电脑重来、换 Agent 重来、改一处要同步 N 处。yo-skill 收拢成一份，配一次，到哪都好用。",
  },
  {
    q: "我的 API Key 和配置会上传到云端吗？",
    a: "会，但云端只有密文：主密码只存在你的设备上，连我们也解不开。不想同步？那就只用本地，一样好用。",
  },
  {
    q: "支持我用的 Agent 吗？",
    a: "首版支持 15 款主流 Agent：Claude Code、Codex、Gemini CLI、Cursor、Windsurf、GitHub Copilot、Kimi Code、Cline、Roo Code、Continue、Aider、Trae、Qwen Code、OpenCode、Replit。后续按社区需求继续加。",
  },
  {
    q: "什么时候能用？",
    a: "打磨中，macOS 先行、Windows 随后。先加入等待列表，上线第一时间通知你。",
  },
];
