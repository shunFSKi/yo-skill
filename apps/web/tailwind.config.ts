import type { Config } from "tailwindcss";

/**
 * yo-skill web · 纸上墨字 + 一笔翡翠
 * 颜色全部引用 CSS 变量（见 globals.css），深/浅模式靠变量切换自动生效。
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{ts,tsx}",
    "../packages/ui-kit/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: { DEFAULT: "var(--paper)", deep: "var(--paper-2)" },
        card: "var(--card)",
        ink: { DEFAULT: "var(--ink)", soft: "var(--ink-2)", muted: "var(--ink-3)" },
        line: "var(--line)",
        rule: { DEFAULT: "var(--line)", strong: "var(--line-strong)" },
        jade: {
          DEFAULT: "var(--jade)",
          ink: "var(--jade-ink)",
          soft: "var(--jade-soft)",
          softer: "var(--jade-softer)",
        },
        btn: {
          DEFAULT: "var(--btn)",
          hover: "var(--btn-hover)",
          ink: "var(--btn-ink)",
        },
        danger: "var(--danger)",
        block: { DEFAULT: "var(--block)", raised: "var(--block-2)" },
        onblock: { DEFAULT: "var(--on-block)", soft: "var(--on-block-2)" },
      },
      fontFamily: {
        sans: ["var(--font-sans-stack)"],
        mono: ["var(--font-mono-stack)"],
      },
      borderRadius: {
        card: "16px",
        control: "12px",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        pop: "var(--shadow-pop)",
      },
      maxWidth: {
        reading: "65ch",
        content: "1120px",
      },
    },
  },
  plugins: [],
};

export default config;
