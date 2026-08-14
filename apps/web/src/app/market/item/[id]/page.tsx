import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  Star,
} from "lucide-react";

import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { WaitlistButton } from "@/components/site/waitlist-button";
import { ReadmePanel } from "@/components/site/readme-panel";
import {
  getRegistryIndex,
  getRegistryItem,
  type RegistryItem,
} from "@/lib/registry";
import { safeId } from "@/lib/safe-id";
import { dotColor } from "@/lib/colors";

interface Props {
  params: Promise<{ id: string }>;
}

/** 头部条目预渲染 + 长尾按需 ISR：全量上万条，全量 SSG 构建会爆 */
export const revalidate = 86400;
export const dynamicParams = true;

/** 路由参数即 safeId（不编码 : /，避开段路由转义坑）；只预渲染头部 200 条 */
export async function generateStaticParams() {
  const items = await getRegistryIndex();
  return [...items]
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return (b.stars ?? -1) - (a.stars ?? -1);
    })
    .slice(0, 200)
    .map((i) => ({ id: safeId(i.id) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const item = await getRegistryItem(id);
  if (!item) return { title: "条目不存在" };
  return {
    title: `${item.name} · ${item.type === "skill" ? "Skill" : "MCP"} 市场`,
    description: item.description,
  };
}

function formatStars(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

function formatDate(iso: string | null): string | null {
  return iso ? iso.slice(0, 10) : null;
}

const REGISTRY_LABEL: Record<RegistryItem["source"]["registry"], string> = {
  claudeskills: "claudeskills.info",
  "mcp-official": "MCP 官方 Registry",
  "github-search": "GitHub 公开仓库",
};

export default async function MarketItemPage({ params }: Props) {
  const { id } = await params;
  const item = await getRegistryItem(id);
  if (!item) notFound();

  const updated = formatDate(item.quality.pushed_at);
  const install = item.install;

  return (
    <>
      <Nav />
      <main className="yo-container max-w-3xl pb-24 pt-28">
        <Link
          href="/market"
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-jade-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          回市场
        </Link>

        {/* 头部：色块 + 名称 + 徽章 */}
        <header className="mt-6 flex items-start gap-4">
          <span
            aria-hidden
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px] text-xl font-bold text-white"
            style={{ backgroundColor: dotColor(item.name) }}
          >
            {item.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <h1 className="text-3xl sm:text-4xl">{item.name}</h1>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <span className="yo-chip yo-chip--neutral">
                {item.type === "skill" ? "Skill" : "MCP"}
              </span>
              {item.security.scanned && (
                <span className="yo-chip">
                  <ShieldCheck className="h-3 w-3" />
                  已扫描
                </span>
              )}
              {install?.env?.some((e) => e.required || e.secret) && (
                <span className="yo-chip yo-chip--warn">
                  <KeyRound className="h-3 w-3" />
                  需要 API Key
                </span>
              )}
              {item.tags.featured && (
                <span className="yo-chip yo-chip--neutral">精选</span>
              )}
              {item.tags.category && (
                <span className="yo-chip yo-chip--neutral">
                  {item.tags.category}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* 完整描述 */}
        <p className="mt-6 text-lg leading-relaxed text-ink-soft">
          {item.description}
        </p>

        {/* 信息格 */}
        <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-4">
          <InfoCell label="作者" value={item.author} />
          <InfoCell
            label="来源"
            value={REGISTRY_LABEL[item.source.registry]}
          />
          <InfoCell
            label="Stars"
            value={
              item.quality.stars !== null ? (
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  {formatStars(item.quality.stars)}
                </span>
              ) : (
                "暂无"
              )
            }
          />
          <InfoCell label="更新" value={updated ?? "暂无"} />
        </dl>

        {/* 安装方式 */}
        {install && (
          <section className="mt-8">
            <h2 className="text-xl font-bold">安装方式</h2>
            <div className="yo-card mt-3 p-5">
              {install.kind === "skill-dir" ? (
                <p className="text-sm leading-relaxed text-ink-soft">
                  这是一个 Skill 目录，从源仓库获取后放入 Agent 的 Skill
                  目录即可。用 yo-skill 安装会自动放到正确位置，
                  所有 Agent 共用一份。
                </p>
              ) : install.kind === "remote" ? (
                <div>
                  <p className="text-sm text-ink-soft">
                    远程 MCP，填入这个地址即可连接：
                  </p>
                  <code className="mt-3 block overflow-x-auto rounded-control bg-paper-deep px-4 py-3 font-mono text-sm">
                    {install.remote_url}
                  </code>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-ink-soft">
                    用命令行启动这个 MCP：
                  </p>
                  <code className="mt-3 block overflow-x-auto rounded-control bg-paper-deep px-4 py-3 font-mono text-sm">
                    {[install.command, ...(install.args ?? [])].join(" ")}
                  </code>
                </div>
              )}

              {install.env && install.env.length > 0 && (
                <div className="mt-4 border-t border-line pt-4">
                  <p className="text-sm font-semibold">需要配置</p>
                  <ul className="mt-2 space-y-1.5">
                    {install.env.map((e) => (
                      <li
                        key={e.name}
                        className="flex items-center gap-2 text-sm"
                      >
                        <code className="rounded bg-paper-deep px-1.5 py-0.5 font-mono text-xs">
                          {e.name}
                        </code>
                        {e.required && (
                          <span className="yo-chip yo-chip--warn">必填</span>
                        )}
                        {e.secret && (
                          <span className="yo-chip yo-chip--neutral">
                            保密
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 源仓库 README */}
        {item.readme && item.source.repo && (
          <section className="mt-8">
            <h2 className="text-xl font-bold">源仓库 README</h2>
            <div className="yo-card mt-3 p-5 sm:p-6">
              <ReadmePanel markdown={item.readme} repo={item.source.repo} />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-ink-muted">
              原文来自{" "}
              <a
                href={item.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="yo-link"
              >
                {item.source.repo}
              </a>
              ，仅作参考，以源仓库为准。
            </p>
          </section>
        )}

        {/* 安全扫描明细 */}
        <section className="mt-8">
          <h2 className="text-xl font-bold">静态扫描</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {item.security.checks.map((c) => (
              <li
                key={c.name}
                className="flex items-center gap-2 rounded-control border border-line bg-card px-4 py-2.5 text-sm"
              >
                <ShieldCheck
                  className={
                    c.pass ? "h-4 w-4 text-jade-ink" : "h-4 w-4 text-danger"
                  }
                />
                {c.name}
                <span className="ml-auto text-xs text-ink-muted">
                  {c.pass ? "通过" : "未通过"}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs leading-relaxed text-ink-muted">
            扫描基于公开元数据的静态规则，能降低风险，不等于绝对安全。
          </p>
        </section>

        {/* CTA */}
        <section className="mt-10 rounded-card border border-line bg-card p-6 text-center shadow-card">
          <h2 className="text-xl font-bold">想用这条？</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
            yo-skill 桌面端上线后，这条可以一键安装到你的所有 Agent。
            先加入等待列表。
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <WaitlistButton>用 yo-skill 安装</WaitlistButton>
            <a
              href={item.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="yo-btn yo-btn--ghost"
            >
              去源仓库看看
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function InfoCell({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="bg-card px-4 py-3.5">
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className="mt-1 truncate text-sm font-semibold">{value}</dd>
    </div>
  );
}
