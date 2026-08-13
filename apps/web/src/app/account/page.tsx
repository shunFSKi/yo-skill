import type { Metadata } from "next";
import Link from "next/link";
import { WaitlistButton } from "@/components/site/waitlist-button";

export const metadata: Metadata = {
  title: "我的账户",
  description: "登录、管理你的订阅与同步设备。即将上线。",
};

/**
 * Phase 3 占位：会员账户中心（认证 + 订阅 + 设备管理）。
 * 认证（Auth.js）与支付（Stripe）尚未接入，暂为 ComingSoon。
 */
export default function AccountPage() {
  return (
    <main className="yo-container flex min-h-screen flex-col items-center justify-center py-24 text-center">
      <span className="yo-chip mb-5">即将上线</span>
      <h1 className="max-w-2xl text-balance text-4xl sm:text-5xl">
        账户中心，还在路上
      </h1>
      <p className="mt-4 max-w-md text-lg leading-relaxed text-ink-soft">
        登录、管理订阅、查看与移除同步设备，都在这里。
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
