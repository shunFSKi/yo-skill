# server/auth —— 认证（Phase 3 预留）

本目录为 **会员系统认证** 预留位置，Phase 1 官网落地页不使用。

## 计划（Phase 3）
- **框架**：Auth.js（NextAuth v5）
- **登录方式**：邮箱魔法链接 / OAuth（GitHub、Google），按上线时定
- **会话**：JWT + 数据库 session（配合 Postgres）
- **环境变量**：见 `.env.example` 的 `AUTH_SECRET`

## 接入步骤（届时）
1. `pnpm --filter @yo-skill/web add next-auth@beta @auth/prisma-adapter`
2. 在此目录编写 `auth.config.ts`（providers、callbacks）
3. 根 layout 或中间件挂载会话
4. `app/account/*` 接入受保护路由

## 安全
- 与桌面端的「主密码」是两套独立机制：
  - 桌面端主密码 → 本地解锁 vault（Argon2id 派生密钥，绝不外传）。
  - Web 账户 → 用于订阅、同步设备管理、市场账户；不接触 vault 明文。
