import Link from "next/link";

import {
  AlertTriangle,
  Check,
  Copy,
  KeyRound,
  Laptop,
  Plus,
  Search,
  ShieldCheck,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  assistants,
  faqs,
  pains,
  restorePoints,
  type Pain,
} from "@/lib/site-data";
import type { IndexItem } from "@/lib/registry";
import { ItemCard } from "./item-card";
import { WaitlistButton } from "./waitlist-button";
import { MergeDemo } from "./live-demos";
import { Stroke } from "./stroke";

/* ── 数据条（全部真实事实，市场条目数由首页读 meta 注入） ── */
export function DataBand({ marketTotal }: { marketTotal: number }) {
  const cells: { value: string; label: string; href?: string }[] = [
    { value: "15", label: "主流 Agent，首版全支持" },
    {
      value: marketTotal.toLocaleString("zh-CN"),
      label: "Skill 与 MCP，每日同步",
      href: "/market",
    },
    { value: "5 项", label: "静态扫描，条条都过" },
    { value: "6 类", label: "冲突检测，提前打招呼" },
  ];
  return (
    <section className="border-y border-line bg-paper-deep">
      <div className="yo-container grid grid-cols-2 gap-y-6 py-8 sm:grid-cols-4">
        {cells.map((s) => {
          const inner = (
            <>
              <div className="yo-num text-3xl text-jade-ink sm:text-[2rem]">
                {s.value}
              </div>
              <div className="mt-1 text-sm text-ink-muted">{s.label}</div>
            </>
          );
          return (
            <div key={s.label} className="reveal text-center">
              {s.href ? (
                <Link
                  href={s.href}
                  className="block transition-opacity hover:opacity-70"
                >
                  {inner}
                </Link>
              ) : (
                inner
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ── 便签类比 + 痛点 ───────────────────────── */
const painIcons: Record<Pain["icon"], LucideIcon> = {
  laptop: Laptop,
  copy: Copy,
  search: Search,
};

export function PainPoints() {
  return (
    <section className="py-20 md:py-28">
      <div className="yo-container">
        <p className="reveal text-sm font-medium text-ink-muted">
          这些，眼熟吗
        </p>
        <blockquote className="reveal mt-4 max-w-4xl text-balance text-[1.7rem] font-bold leading-[1.4] sm:text-4xl">
          「你的 Skill 散落在 5 个 Agent 里，
          <br className="hidden sm:block" />
          就像密码记在 5 张便签上。」
        </blockquote>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {pains.map((p, i) => {
            const Icon = painIcons[p.icon];
            return (
              <div
                key={p.title}
                className="yo-card reveal p-6"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-[10px] bg-jade-softer text-jade-ink">
                  <Icon size={18} />
                </div>
                <h3 className="text-lg">{p.title}</h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-soft">
                  {p.detail}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── 能力 bento（6 格，两格嵌活片段） ─────────── */
function CellHead({
  icon: Icon,
  title,
}: {
  icon?: LucideIcon;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3">
      {Icon && (
        <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-jade-softer text-jade-ink">
          <Icon size={18} />
        </div>
      )}
      <h3 className="text-lg">{title}</h3>
    </div>
  );
}

const UNIFIED_ROWS = [
  { name: "pdf-tools", type: "Skill", agents: 3, color: "#d97757" },
  { name: "web-search", type: "MCP", agents: 2, color: "#6950ef" },
  { name: "code-review", type: "Skill", agents: 5, color: "#2f9e7e" },
];

const KEY_CHIPS = [
  "claude · sk-ant-•••3b8f",
  "openai · sk-•••c21e",
  "gemini · AIza•••9x2w",
];

export function Features() {
  return (
    <section
      id="features"
      className="border-y border-line bg-paper-deep py-20 md:py-28"
    >
      <div className="yo-container">
        <div className="reveal max-w-2xl">
          <h2 className="text-balance text-4xl sm:text-5xl">
            装、挑、管、带，一站搞定
          </h2>
          <p className="mt-4 text-lg text-ink-soft">
            从找到装，从装好到带走，一个地方全办完。
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-12">
          {/* A：自动扫描，一处收拢 */}
          <div className="yo-card reveal p-6 sm:col-span-2 lg:col-span-7">
            <CellHead title="启动就认出你电脑上的 Agent" />
            <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">
              打开就扫出你装的所有 Agent，连同里面的 Skill、MCP 和 API
              Key，一次收拢成一份清单。
            </p>
            <div className="mt-5 space-y-2">
              {UNIFIED_ROWS.map((r) => (
                <div
                  key={r.name}
                  className="flex items-center gap-3 rounded-[10px] border border-line bg-paper px-3 py-2.5"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-[4px]"
                    style={{ background: r.color }}
                    aria-hidden
                  />
                  <span className="truncate font-mono text-sm">{r.name}</span>
                  <span className="text-xs text-ink-muted">{r.type}</span>
                  <span className="yo-chip ml-auto">{r.agents} 个 Agent</span>
                </div>
              ))}
            </div>
          </div>

          {/* B：重复项合并（活） */}
          <div className="yo-card reveal p-6 sm:col-span-2 lg:col-span-5">
            <CellHead title="同一个 Skill，只显示一条" />
            <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">
              同一个 Skill 在几个 Agent 里各装了一份？自动合并，改一处，处处生效。
            </p>
            <MergeDemo />
          </div>

          {/* C：一键闭环 */}
          <div className="yo-card reveal p-6 lg:col-span-4">
            <CellHead icon={Zap} title="一键闭环，不碰命令行" />
            <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">
              装、更新、启停都是一次点击。要碰命令行，算我们没做好。
            </p>
          </div>

          {/* D：冲突检测 */}
          <div
            className="yo-card reveal p-6 lg:col-span-4"
            style={{ transitionDelay: "60ms" }}
          >
            <CellHead icon={AlertTriangle} title="冲突提前打招呼" />
            <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">
              六类冲突，装之前先打招呼：同名、描述相似、调用链、优先级、端口、语义。
            </p>
          </div>

          {/* E：安全扫描 */}
          <div
            className="yo-card reveal p-6 lg:col-span-4"
            style={{ transitionDelay: "120ms" }}
          >
            <CellHead icon={ShieldCheck} title="每条都过安全扫描" />
            <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">
              五项静态扫描：注入、敏感路径、外部渗出、危险执行、配置风险。
              有猫腻的，拦在门外。
            </p>
          </div>

          {/* F：API Key */}
          <div className="yo-card reveal p-6 sm:col-span-2 lg:col-span-12">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="max-w-xl">
                <CellHead icon={KeyRound} title="API Key，填一次就好" />
                <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">
                  加密存在你的设备上，云端也只有密文。换电脑，不用再翻聊天记录找
                  key。
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {KEY_CHIPS.map((k) => (
                  <span
                    key={k}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 font-mono text-xs text-ink-soft"
                  >
                    <Check size={12} className="text-jade-ink" aria-hidden />
                    {k}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 墨块段：换机恢复 + 安全底线 ─────────────── */
const RESTORE_ROWS = ["12 个 Skill", "5 个 MCP", "3 个 API Key"];
const RESTORE_CHIPS = ["Claude Code 已生效", "Codex 已生效", "Cursor 已生效"];

export function SyncFlow() {
  return (
    <section id="sync" className="bg-block py-20 text-onblock md:py-28">
      <div className="yo-container grid items-center gap-12 lg:grid-cols-2">
        <div className="reveal">
          <h2 className="text-balance text-4xl sm:text-5xl">
            换台新电脑，一键回到老样子
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-onblock-soft">
            新设备上输一次主密码，你的 Skill、MCP 和 API Key
            原样回来。安全是底线，不是卖点。
          </p>
          <ul className="mt-8 space-y-4">
            {restorePoints.map((p) => (
              <li key={p} className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-jade-soft text-jade">
                  <Check size={12} aria-hidden />
                </span>
                <span className="leading-relaxed text-onblock-soft">{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="reveal" style={{ transitionDelay: "120ms" }}>
          <div className="rounded-[16px] border border-white/10 bg-block-raised p-6 shadow-pop sm:p-7">
            <p className="text-sm text-onblock-soft">欢迎回来，你的配置已解锁</p>
            <div className="mt-4 space-y-3">
              {RESTORE_ROWS.map((r) => (
                <div key={r} className="flex items-center gap-3">
                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-jade-soft text-jade">
                    <Check size={12} aria-hidden />
                  </span>
                  <span className="font-medium">{r}</span>
                  <span className="ml-auto text-sm text-jade">已恢复</span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-5">
              {RESTORE_CHIPS.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center rounded-full bg-jade-soft px-3 py-1 text-xs font-medium text-jade"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Agent 墙：15 款主流 Agent ─────────────── */
export function AssistantWall() {
  return (
    <section id="agents" className="py-20 md:py-28">
      <div className="yo-container">
        <div className="reveal max-w-2xl">
          <h2 className="text-balance text-4xl sm:text-5xl">
            你在用的 Agent，都认得
          </h2>
          <p className="mt-4 text-lg text-ink-soft">
            首版支持 15 款主流 Agent；没认出你在用的，告诉我们，优先排上。
          </p>
        </div>
        <div className="mt-12 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {assistants.map((a, i) => (
            <div
              key={a.name}
              className="yo-card reveal flex flex-col items-center gap-2.5 px-3 py-5 text-center"
              style={{ transitionDelay: `${(i % 5) * 40}ms` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={a.logo}
                alt={a.name}
                width={32}
                height={32}
                className={`h-8 w-8 ${a.darkInvert ? "dark:invert" : ""}`}
                loading="lazy"
              />
              <span className="text-xs font-medium text-ink-soft">{a.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 市场速览：真实高分条目 + 去市场 CTA（参考 agentskillshub 首页 trending） ── */
export function MarketPreview({
  items,
  total,
}: {
  items: IndexItem[];
  total: number;
}) {
  return (
    <section className="border-y border-line bg-paper-deep py-20 md:py-28">
      <div className="yo-container">
        <div className="reveal flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="text-balance text-4xl sm:text-5xl">
              市场里的货，先验再装
            </h2>
            <p className="mt-4 text-lg text-ink-soft">
              {total.toLocaleString("zh-CN")} 条 Skill 与 MCP，每条都过了静态扫描、
              打了综合质量分。这几条是目前分最高的。
            </p>
          </div>
          <Link
            href="/market"
            className="yo-btn yo-btn--ghost"
          >
            去市场逛逛 →
          </Link>
        </div>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <li
              key={item.id}
              className="reveal"
              style={{ transitionDelay: `${(i % 3) * 60}ms` }}
            >
              <ItemCard item={item} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── 常见问题（纯 details，免 JS） ────────── */
export function Faq() {
  return (
    <section
      id="faq"
      className="border-y border-line bg-paper-deep py-20 md:py-28"
    >
      <div className="yo-container max-w-3xl">
        <div className="reveal">
          <h2 className="text-4xl sm:text-5xl">你可能想问的</h2>
        </div>
        <div className="mt-10 divide-y divide-line">
          {faqs.map((f) => (
            <details key={f.q} className="reveal group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-bold marker:hidden">
                {f.q}
                <Plus
                  size={18}
                  className="shrink-0 text-jade-ink transition-transform duration-200 group-open:rotate-45"
                  aria-hidden
                />
              </summary>
              <p className="mt-3 leading-relaxed text-ink-soft">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 终极 CTA ─────────────────────────────── */
export function FinalCTA() {
  return (
    <section className="py-20 md:py-28">
      <div className="yo-container">
        <div className="reveal overflow-hidden rounded-[24px] border border-line bg-jade-softer px-6 py-14 text-center sm:px-12 md:py-20">
          <h2 className="mx-auto max-w-2xl text-balance text-4xl sm:text-5xl">
            配一次，到哪都
            <span className="relative inline-block">
              好用
              <Stroke className="absolute -bottom-1 left-0 h-[0.28em] w-full" />
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-ink-soft">
            macOS 先行，Windows
            在路上。留个邮箱，上线第一时间通知你，首批内测资格也给你留着。
          </p>
          <div className="mt-8 flex justify-center">
            <WaitlistButton>加入等待列表</WaitlistButton>
          </div>
        </div>
      </div>
    </section>
  );
}
