/**
 * Star 变化曲线（详情页右栏，服务端组件）。
 * 数据来自管线自采的每日快照（github-stars.ts，随每日同步累积，最多 30 个点）。
 * 首日收录的 repo 只有 1 个点：画不出曲线，给一句「明天见」的实话。
 * 曾考虑 star-history.com 外链兜底，实测其 SVG 大量返回
 * 「GitHub restricted access to star data」（GitHub 限制了它的 API），弃用。
 */

interface StarPoint {
  d: string;
  s: number;
}

export function StarCurve({ history }: { history: StarPoint[] }) {
  if (history.length === 1) {
    return (
      <p className="text-sm leading-relaxed text-ink-muted">
        已从 {history[0]!.d} 开始记录（★ {history[0]!.s}），
        明天同步后这里就有曲线了。
      </p>
    );
  }

  const W = 300;
  const H = 72;
  const PAD = 6;
  const vals = history.map((p) => p.s);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = max - min || 1; // 全平线时居中画直线，不除零
  const step = (W - PAD * 2) / Math.max(1, history.length - 1);
  const points = history
    .map(
      (p, i) =>
        `${(PAD + i * step).toFixed(1)},${(
          H -
          PAD -
          ((p.s - min) / span) * (H - PAD * 2)
        ).toFixed(1)}`,
    )
    .join(" ");
  const delta = history[history.length - 1]!.s - history[0]!.s;

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-[72px] w-full text-jade-ink"
        role="img"
        aria-label="近段时间 star 变化曲线"
        preserveAspectRatio="none"
      >
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <p className="mt-2 flex items-center justify-between text-xs text-ink-muted">
        <span>{history[0]!.d}</span>
        {delta > 0 && (
          <span className="font-semibold text-jade-ink">+{delta}</span>
        )}
        <span>{history[history.length - 1]!.d}</span>
      </p>
    </div>
  );
}
