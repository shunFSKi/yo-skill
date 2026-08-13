import { WaitlistButton } from "./waitlist-button";
import { ProductPreview } from "./product-preview";
import { Stroke } from "./stroke";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-28 md:pt-36">
      {/* 顶部翡翠微光 */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px]"
        style={{
          background:
            "radial-gradient(55% 65% at 50% 0%, var(--jade-softer), transparent 70%)",
        }}
        aria-hidden
      />
      <div className="yo-container relative grid items-center gap-12 pb-16 md:grid-cols-[1.05fr_0.95fr] md:pb-24">
        <div className="reveal">
          <h1 className="text-balance text-[2.6rem] leading-[1.12] sm:text-6xl sm:leading-[1.08]">
            <span className="relative inline-block">
              一键
              <Stroke className="absolute -bottom-1 left-0 h-[0.28em] w-full" />
            </span>
            ，管好你
            <br className="hidden sm:block" />
            所有的 Agent
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
            自动认出你电脑里的 Agent，挑 Skill、配 MCP、收好 API
            Key，全程不碰命令行。换台电脑，也随身带。
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <WaitlistButton>加入等待列表</WaitlistButton>
            <a href="#features" className="yo-btn yo-btn--ghost">
              看看能做什么
            </a>
          </div>
          <p className="mt-5 text-sm text-ink-muted">
            免费加入，上线第一时间通知你
          </p>
        </div>

        <div className="reveal" style={{ transitionDelay: "120ms" }}>
          <ProductPreview />
        </div>
      </div>
    </section>
  );
}
