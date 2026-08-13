import { NextResponse } from "next/server";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * 等待列表提交
 * Phase 1：仅校验并打日志返回成功。
 * TODO(Phase 2/3)：接入 Postgres + Prisma 持久化（见 src/server/db）。
 */
export async function POST(req: Request) {
  let email = "";
  try {
    const body = await req.json();
    email = String(body?.email ?? "").trim();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "email" }, { status: 400 });
  }

  // TODO: persist to DB (Phase 2)
  console.log("[waitlist] new signup:", email);

  return NextResponse.json({ ok: true });
}
