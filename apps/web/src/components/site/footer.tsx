export function Footer() {
  return (
    <footer className="border-t border-line bg-paper-deep">
      <div className="yo-container py-14">
        <div className="flex flex-col items-start justify-between gap-10 md:flex-row">
          <div className="max-w-xs">
            <a href="#top" className="flex items-center gap-2.5">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-[8px] bg-jade text-[0.95rem] font-bold text-white">
                yo
              </span>
              <span className="text-lg font-bold tracking-tight">yo-skill</span>
            </a>
            <p className="mt-3 text-sm text-ink-muted">
              一键，管好你所有的 Agent。
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <FooterCol
              title="产品"
              links={[
                { href: "#features", label: "能力" },
                { href: "#sync", label: "同步" },
                { href: "#agents", label: "Agent" },
                { href: "/market", label: "Skill 市场" },
              ]}
            />
            <FooterCol
              title="账号"
              links={[
                { href: "/account", label: "我的账户" },
                { href: "#faq", label: "常见问题" },
              ]}
            />
            <FooterCol
              title="法律"
              links={[
                { href: "#", label: "隐私政策" },
                { href: "#", label: "服务条款" },
              ]}
            />
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-sm text-ink-muted sm:flex-row">
          <p>© 2026 yo-skill</p>
          <p>配一次，到哪都好用。</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <div className="text-sm font-semibold text-ink">{title}</div>
      <ul className="mt-3 space-y-2 text-sm">
        {links.map((l) => (
          <li key={l.label}>
            <a
              href={l.href}
              className="text-ink-soft transition-colors hover:text-jade-ink"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
