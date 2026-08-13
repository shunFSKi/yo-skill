"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, X } from "lucide-react";

type Status = "idle" | "loading" | "ok" | "error";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** 等待列表弹层：监听 yo:waitlist 事件打开，提交到 /api/waitlist */
export function WaitlistDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    const handler = () => {
      setOpen(true);
      setStatus("idle");
      setEmail("");
    };
    window.addEventListener("yo:waitlist", handler);
    return () => window.removeEventListener("yo:waitlist", handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) throw new Error("request failed");
      setStatus("ok");
    } catch {
      setStatus("error");
    }
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="加入等待列表"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="关闭"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={() => setOpen(false)}
      />
      <div className="yo-card relative z-10 w-full max-w-md p-6 hover:transform-none sm:p-8">
        <button
          type="button"
          aria-label="关闭"
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-[8px] text-ink-muted transition-colors hover:bg-paper-deep hover:text-ink"
        >
          <X size={16} />
        </button>

        {status === "ok" ? (
          <div className="py-4 text-center">
            <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-jade-soft text-jade-ink">
              <Check size={22} />
            </div>
            <h3 className="text-2xl">妥了，名单里有你</h3>
            <p className="mt-2 text-ink-soft">
              yo-skill 上线时，第一个告诉你。
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="yo-btn yo-btn--ghost mt-6"
            >
              好的
            </button>
          </div>
        ) : (
          <>
            <span className="yo-chip mb-4">早鸟位开放中</span>
            <h3 className="text-2xl text-balance">上线第一个通知你</h3>
            <p className="mt-2 text-ink-soft">
              留个邮箱就好，首批内测资格也给你留着。
            </p>
            <form onSubmit={submit} className="mt-5 space-y-3" noValidate>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                placeholder="you@example.com"
                aria-label="邮箱"
                className="w-full rounded-[10px] border border-line-strong bg-paper px-3.5 py-2.5 text-ink outline-none transition focus:border-jade"
              />
              {status === "error" && (
                <p className="text-sm text-danger">
                  邮箱格式好像不太对，再看看？
                </p>
              )}
              <button
                type="submit"
                disabled={status === "loading"}
                className="yo-btn yo-btn--primary w-full disabled:opacity-60"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    提交中
                  </>
                ) : (
                  "占个早鸟位"
                )}
              </button>
            </form>
            <p className="mt-4 text-xs text-ink-muted">
              不发垃圾邮件，随时一键退订。
            </p>
          </>
        )}
      </div>
    </div>
  );
}
