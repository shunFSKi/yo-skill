"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { nav } from "@/lib/site-data";
import { ThemeToggle } from "./theme-toggle";
import { WaitlistButton } from "./waitlist-button";

export function Nav() {
  const [stuck, setStuck] = useState(false);

  /* 哨兵 + IntersectionObserver：离开顶部即给导航加底色（不监听 scroll） */
  useEffect(() => {
    const sentinel = document.createElement("div");
    sentinel.setAttribute("aria-hidden", "true");
    sentinel.style.cssText =
      "position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none;";
    document.body.prepend(sentinel);
    const io = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      { threshold: 0 }
    );
    io.observe(sentinel);
    return () => {
      io.disconnect();
      sentinel.remove();
    };
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-[background-color,border-color] duration-300 ${
        stuck ? "border-b border-line backdrop-blur-md" : "border-b border-transparent"
      }`}
      style={
        stuck
          ? { backgroundColor: "color-mix(in srgb, var(--paper) 86%, transparent)" }
          : undefined
      }
    >
      <div className="yo-container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5" aria-label="yo-skill 首页">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-[8px] bg-jade text-[0.95rem] font-bold text-white">
            yo
          </span>
          <span className="text-lg font-bold tracking-tight">yo-skill</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {nav.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="text-sm text-ink-soft transition-colors hover:text-jade-ink"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <WaitlistButton className="hidden sm:inline-flex">加入等待列表</WaitlistButton>
          <WaitlistButton className="!px-3 sm:hidden">加入</WaitlistButton>
        </div>
      </div>
    </header>
  );
}
