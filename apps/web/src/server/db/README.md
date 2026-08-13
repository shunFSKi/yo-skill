# server/db —— 数据层（Phase 2 预留）

本目录为 **Skill 市场 + 会员系统** 的数据访问层预留位置，Phase 1 官网落地页不使用。

## 计划（Phase 2/3）
- **ORM**：Prisma
- **数据库**：Postgres（托管：Supabase / Neon，按上线时定）
- **环境变量**：见 `apps/web/.env.example` 的 `DATABASE_URL`

## 接入步骤（届时）
1. `pnpm --filter @yo-skill/web add prisma @prisma/client`
2. `pnpm --filter @yo-skill/web exec prisma init`
3. 在此目录编写 `schema.prisma`（Waitlist / User / Subscription / Skill / Mcp / Device ...）
4. 迁移：`prisma migrate dev`
5. 把 `app/api/waitlist/route.ts` 的 `TODO: persist to DB` 接到 Prisma

## 约束
- 遵循产品安全底线：**云端只存密文**。用户同步的 vault 数据由桌面端 E2E 加密后上传，
  本服务只存密文 blob，不解密、不读取明文。会员账户与订阅数据按常规方式存储。
