# 存储架构选型：rusqlite + SQLCipher 单一 Rust crate

> 本报告是 `framework_comparison.md` 的衍生专项，定本地存储方案、加密集成方式、数据层的 crate 划分。

## 元信息

- **调研日期**：2026-08-12
- **目的**：在 Tauri 桌面框架已定的前提下，确定本地存储方案、加密集成方式、数据层的 crate 划分；纠正 AGENTS.md 原"better-sqlite3 + rusqlite 双层"方案中"Tauri 桌面端无 Node 运行时导致 better-sqlite3 不可用"的隐患。
- **立场**：追求单一真相源、最小分发体积、对小白用户零运行时依赖。
- **修订记录**：2026-08-12 用户确认 **MVP 不做 CLI** 后，原"CLI 改 Rust 以共享数据层"整节作废。`vault` crate 只服务 desktop，架构反而更简单。

## 一、结论先行

1. **本地存储：`rusqlite + SQLCipher`**（加密）+ Argon2id 派生密钥。
2. **官方 `tauri-plugin-sql` 排除**——它底层是 sqlx，**不支持 SQLite 加密**（Issue #7 未实现）【1】，对 E2E 加密产品是硬伤。
3. **数据层收敛为单一 Rust crate（`vault`）**，只服务 desktop。
4. **MVP 不做 CLI**：目标用户是小白，CLI 对他们是天书。原 `apps/cli` 是早期"先 CLI 后 GUI"路线残留，该路线已被 2026-08-12 改定推翻。**无 CLI 即无"两端共享数据层"问题**——这是对前一版报告的简化。

## 二、关键发现：官方 SQL 插件不支持加密

`tauri-plugin-sql`（Tauri v2 官方）底层用 **sqlx**【4】。而 sqlx **不支持 SQLite 加密**（SQLCipher）【5】。Tauri 官方在 plugins-workspace Issue #7 跟踪加密支持，至今未落地【1】。

这意味着：任何需要本地数据库加密的 Tauri 应用，**不能走官方 SQL 插件**，必须在 Rust 端直接用 `rusqlite + SQLCipher`。社区有 `tauri-plugin-rusqlite2`【6】封装了 rusqlite + SQLCipher，但其封装层反而阻碍"把业务逻辑收敛进自己 crate"的目标，故不采用，直接用 rusqlite。

## 三、选型对比

| 选项 | 底层 | SQLite 加密 | 迁移 | 裁决 |
|---|---|---|---|---|
| `tauri-plugin-sql`（官方） | sqlx | ❌ | ✅ 内置 | 排除（加密硬伤） |
| sqlx 直用 | sqlx | ❌ | ✅ | 排除 |
| **rusqlite 直用** | rusqlite | ✅ SQLCipher | refinery / 手写 | **✅ 采用** |
| `tauri-plugin-rusqlite2` | rusqlite | ✅ | 需自理 | 备选（封装层多余） |

> rusqlite 选 `bundled` feature（自带 SQLite 编译，避免系统 SQLite 版本漂移）+ `backup`（崩溃恢复，cc-switch 同款）+ `hooks`（审计/变更通知）。SQLCipher 通过 `bundled-sqlcipher` 或 `bundled-sqlcipher-vendored-openssl` feature 开启【7】。

## 四、加密架构

```
用户主密码
   │  argon2 crate (Argon2id, 内存硬化参数)
   ▼
32 字节密钥
   │  连接时 PRAGMA key = '<密钥>'
   ▼
SQLCipher 透明 AES-256 加解密（整库加密，含索引/临时文件）
```

- 密钥**不落盘**（只存于进程内存）；若要"记住我"，派生出的密钥放系统钥匙串（macOS Keychain / Windows Credential Manager，通过 `keyring` crate）。
- 与云端 vault 的关系：本地 SQLite 是**明文工作集的加密缓存**，云端 vault 是**密文同步副本**。两者密钥可同源（同一主密码派生），但用途不同。
- `PRAGMA key` 必须在连接建立后第一条执行。

## 五、为何不做 CLI（原"CLI 语言决策"节，已改写）

yo-skill 目标用户是"AI 重度但不懂 Skill/MCP 术语的小白"，CLI 对他们无价值。AGENTS.md 原 `apps/cli` 来自 `skill_manager_research.md` 的"先 CLI 后 GUI"开发路线建议，但该路线在 2026-08-12 已被推翻（主流 Agent 全支持 + GUI 优先）。**砍掉 CLI 后**：

- 数据层只有 desktop 一个消费者，`vault` crate 无需考虑跨端复用——存储方案大幅简化。
- 工程形态更干净：`apps/desktop` + `crates/*` + `packages/ui-kit`。
- 若日后真要给开发者用户加 CLI，`vault` crate 已是纯 Rust 库，起一个 clap 二进制依赖它即可，随时可加（但 MVP 不做）。

> 前一版报告曾论证"CLI 从 Node 改 Rust 以共享数据层"——该论证随 CLI 一起作废。

## 六、工程形态

```
skill-manager/                      （未来编码后的形态）
├── Cargo.toml                      # Cargo virtual workspace 根
├── crates/                         # Rust crate 集（单一真相源层）
│   ├── vault/                      # rusqlite+SQLCipher+Argon2id+迁移+CRUD
│   ├── sync-engine/                # 云端 E2E vault 同步
│   ├── conflict-detector/          # 6 维度冲突检测
│   ├── skill-index/                # Skill 索引/搜索
│   └── agent-adapter/              # trait AgentAdapter + 各 Agent 子实现
├── apps/
│   └── desktop/                    # Tauri：src-tauri/（Rust，依赖 crates/*）+ 前端
├── packages/                       # pnpm workspace（纯前端）
│   └── ui-kit/                     # React + shadcn/ui 组件
├── pnpm-workspace.yaml
└── package.json                    # 仅管前端依赖（desktop 前端 + ui-kit）
```

- **6 个包**：5 个 `crates/*`（Rust）+ `packages/ui-kit`（TS）+ `apps/desktop`（Tauri 横跨 Rust + TS）。对齐 AGENTS.md"6-7 包"。
- 这不是"pnpm monorepo"，而是 **Cargo workspace（主体）+ pnpm workspace（前端）**。Tauri 项目天然如此。
- Cindy 的 14 包里大部分也是 Rust/TS 混合，yo-skill 砍到 6 个的思路不变，主体在 Rust 侧。

## 七、风险登记

| 风险 | 等级 | 缓解 |
|---|---|---|
| SQLCipher 跨平台编译（bundled）偶发问题 | 低 | 用 `bundled-sqlcipher-vendored-openssl` 自带 OpenSSL，免系统依赖 |
| Argon2id 参数选型（内存/时间/并行度） | 低 | 参照 OWASP 2023 推荐：19 MiB / t=2 / p=1 |
| 主密码丢失=数据不可恢复 | 中 | 设计恢复码（一次性备份密钥，加密后存云端）——V2 项，MVP 可先警告 |

## 参考资料

| # | 来源 | 链接 | 抓取日期 |
|---|---|---|---|
| 【1】 | tauri-apps/plugins-workspace Issue #7：SQLCipher 加密支持跟踪 | https://github.com/tauri-apps/plugins-workspace/issues/7 | 2026-08-12 |
| 【2】 | cc_switch_design_reference.md（本仓库，§1.1 rusqlite 0.31 features） | `mavis-deep-research/20260811_120500_cc_switch_design_reference/` | 2026-08-11 |
| 【3】 | Reddit：Tauri 2 与 Rust workspace 集成 | https://www.reddit.com/r/tauri/comments/1jr611u/ | 2026-08-12 |
| 【4】 | Tauri v2 官方：SQL 插件文档（底层 sqlx） | https://v2.tauri.app/plugin/sql/ | 2026-08-12 |
| 【5】 | dev.to：tauri-plugin-sql 不支持 SQLite 加密 | https://dev.to/huakun/building-a-local-first-tauri-app-with-drizzle-orm-encryption-and-turso-sync-31pn | 2026-08-12 |
| 【6】 | crates.io：tauri-plugin-rusqlite2 | https://crates.io/crates/tauri-plugin-rusqlite2 | 2026-08-12 |
| 【7】 | rusqlite features 文档（bundled-sqlcipher） | https://crates.io/crates/rusqlite | 2026-08-12 |
