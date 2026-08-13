"use client";

import * as React from "react";
import { openWaitlist } from "@/lib/waitlist";
import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
};

/** 触发等待列表弹层的按钮（client） */
export function WaitlistButton({
  variant = "primary",
  className,
  children,
  type,
  ...props
}: Props) {
  return (
    <button
      type={type ?? "button"}
      onClick={() => openWaitlist()}
      className={cn("yo-btn", `yo-btn--${variant}`, className)}
      {...props}
    >
      {children}
    </button>
  );
}
