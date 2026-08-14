"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * next-themes 包装：SSR 安全的深/浅模式切换。
 * 暖夜深色靠 .dark 类触发 globals.css 的变量覆盖。
 *
 * 注意：next-themes 的 ThemeProviderProps 经 React.PropsWithChildren 派生，
 * 在 pnpm 布局下其内部 react 类型可能解析失败导致 children 丢失，
 * 这里用本包 @types/react 显式补回，不依赖对方的解析环境。
 */
type Props = React.PropsWithChildren<
  Omit<React.ComponentProps<typeof NextThemesProvider>, "children">
>;

export function ThemeProvider({ children, ...props }: Props) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
