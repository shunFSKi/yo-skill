import { cn } from "@/lib/utils";

/**
 * 签名「一笔」：翡翠手绘笔触，垫在标题关键词下。
 * 全站只用两处：hero「一键」、FinalCTA「好用」。
 * 描画动画由外层 .reveal.is-visible 触发（见 globals.css）。
 */
export function Stroke({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 14"
      fill="none"
      aria-hidden
      preserveAspectRatio="none"
      className={cn("pointer-events-none", className)}
    >
      <path
        className="stroke-path"
        d="M4 10 C 34 4, 72 13, 116 6"
        stroke="var(--jade)"
        strokeWidth="5.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
