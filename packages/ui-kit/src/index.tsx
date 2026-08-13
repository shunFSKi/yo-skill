import * as React from "react";

/**
 * @yo-skill/ui-kit —— 共享 UI 原语（与桌面端共享）
 *
 * 首版仅提供最小骨架，证明 pnpm workspace 联动可用。
 * 官网落地页的专属组件仍放在 apps/web/src/components，待桌面端启动后再向此处抽取。
 */

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /** 视觉变体：primary = 赭石橙实心；ghost = 透明描边 */
  variant?: "primary" | "ghost";
};

/**
 * 最基础的可共享按钮。仅挂载语义化 className，具体样式由消费方全局 CSS 提供
 * （.yo-btn / .yo-btn--primary / .yo-btn--ghost），以保证品牌色随项目而定。
 */
export function Button({ variant = "primary", className, type, ...props }: ButtonProps) {
  const cls = ["yo-btn", `yo-btn--${variant}`, className].filter(Boolean).join(" ");
  return <button type={type ?? "button"} className={cls} {...props} />;
}
