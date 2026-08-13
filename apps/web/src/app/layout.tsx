import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_SC } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { WaitlistDialog } from "@/components/site/waitlist-dialog";
import "./globals.css";

/**
 * 字体策略（纸上墨字：拉丁 Inter + 中文思源黑体）
 * 拉丁子集体积小；中文经 unicode-range 分片按需加载。
 */
const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fontSC = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["500", "700", "900"],
  variable: "--font-sc",
  display: "swap",
});

const SITE_URL = "https://yo-skill.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "yo-skill · 一键，管好你所有的 Agent",
    template: "%s · yo-skill",
  },
  description:
    "装 Skill、配 MCP、管 API Key，不碰命令行。端到端加密同步，换电脑一键恢复，到哪都好用。",
  keywords: [
    "yo-skill",
    "Agent 管理",
    "Skill 管理",
    "MCP",
    "API Key",
    "Claude Code",
    "Cursor",
    "跨电脑同步",
  ],
  authors: [{ name: "yo-skill" }],
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: SITE_URL,
    siteName: "yo-skill",
    title: "yo-skill · 一键，管好你所有的 Agent",
    description:
      "装 Skill、配 MCP、管 API Key，不碰命令行。端到端加密同步，换电脑一键恢复。",
  },
  twitter: {
    card: "summary_large_image",
    title: "yo-skill · 一键，管好你所有的 Agent",
    description: "装 Skill、配 MCP、管 API Key，不碰命令行，换电脑也随身带。",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f6f2" },
    { media: "(prefers-color-scheme: dark)", color: "#131311" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontSC.variable}`}
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <WaitlistDialog />
        </ThemeProvider>
      </body>
    </html>
  );
}
