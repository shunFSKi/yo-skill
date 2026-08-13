import type { Metadata } from "next";
import Link from "next/link";
import { WaitlistButton } from "@/components/site/waitlist-button";

export const metadata: Metadata = {
  title: "Skill 市场",
  description: "浏览、搜索、一键安装 Skill 与 MCP。即将上线。",
};

/**
 * Phase 2 占位：Skill 市场发现页（浏览 / 搜索 / 分类 / 详情）。
 * MVP 产品未上线、无真实数据，暂为 ComingSoon。
 */
export default function MarketPage() {
  return (
    <main className="yo-container flex min-h-screen flex-col items-center justify-center py-24 text-center">
      <span className="yo-chip mb-5">即将上线</span>
      <h1 className="max-w-2xl text-balance text-4xl sm:text-5xl">
        Skill 市场，还在备货
      </h1>
      <p className="mt-4 max-w-md text-lg leading-relaxed text-ink-soft">
        分类浏览、搜索、一键安装 Skill 与 MCP，每条都过安全扫描。
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <WaitlistButton>加入等待列表</WaitlistButton>
        <Link href="/" className="yo-btn yo-btn--ghost">
          回首页
        </Link>
      </div>
    </main>
  );
}
