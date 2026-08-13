# 桌面实现框架选型对比 —— 索引

> 调研日期：2026-08-12
> 归档目录：`20260812_013131_framework_comparison/`
> 上游依赖：AGENTS.md §3"已冻结的技术决策"、cc_switch_design_reference.md、cindy_tech_reference.md
> 落地状态：**结论已写回 AGENTS.md §3**（2026-08-12）

## 三句话总结

1. **桌面框架裁决：Tauri 维持，Wails / Flutter Desktop / .NET MAUI 全部否决**——首次填补"非 Electron 即 Tauri"之外的第三方案空白，否决理由各异（Wails 自动更新未落地、Flutter 无官方 updater 且原型迁移成本高、MAUI 最不成熟）。
2. **但 Tauri 必须打 4 条补丁**：Linux 砍掉不做（用户改定）、Windows 带 WebView2 引导、updater RSA 签名走 GitHub Releases、single-instance 必须第一个注册。
3. **前端层定 React 18 + shadcn/ui + Tailwind + Vite + react-query**（抄 cc-switch 生产验证）；**存储专项（`storage_architecture.md`）定单一 Rust `vault` crate（rusqlite + SQLCipher + Argon2id），排除官方 `tauri-plugin-sql`（不支持加密）**；**MVP 不做 CLI**（小白用户用不到，原 `apps/cli` 是早期"先 CLI 后 GUI"残留）。

## 关键数据卡片

**包体积 / 内存 / 启动（空应用，Windows x64 Release，Elanis 实测【1】）**

| 框架 | 安装包 | 内存（Release） | 启动 |
|---|---|---|---|
| Tauri | ~3-5MB | ~313MB | ~732ms |
| Wails | ~8-11MB | ~317MB | ~573ms |
| Flutter | ~27MB | ~65MB | ~107ms |
| Electron | ~306-364MB | ~260MB | ~202ms |

> ⚠️ 注意：空应用下 Tauri 的内存/启动**并不优于** Electron；Tauri 的确定性优势是**包体积**与**复杂应用下无固定 Chromium+V8 开销**。网上"Tauri 省 58% 内存"指真实复杂应用场景，不是空应用基线。

**能力矩阵**

| 能力 | Tauri | Electron | Wails | Flutter | MAUI |
|---|---|---|---|---|---|
| 官方自动更新 | ✅ | ✅ | ❌ Planned | ❌ 社区方案 | ❌ |
| 移动端 | ✅（唯一） | ❌ | ❌ | ✅ | 部分 |
| 语言 | Rust+TS | JS/TS | Go | Dart | C# |
| 渲染一致性 | ⚠️ 三 WebView | ✅ Chromium | ⚠️ 三 WebView | ✅ 自渲染 | ✅ |

**存储选型（`storage_architecture.md`）**

| 选项 | 底层 | SQLite 加密 | 裁决 |
|---|---|---|---|
| `tauri-plugin-sql`（官方） | sqlx | ❌ | 排除（加密硬伤） |
| rusqlite 直用 | rusqlite | ✅ SQLCipher | **✅ 采用** |

## 文件清单

- `README.md` —— 本索引
- `framework_comparison.md` —— 主报告：5 框架横向对比 + Tauri 4 条补丁 + 前端选型 + 推荐 MVP 技术栈速查表
- `storage_architecture.md` —— 存储专项：rusqlite+SQLCipher 排除官方 SQL 插件 + vault 单一 Rust crate + 为何不做 CLI

## 已落地到 AGENTS.md 的变更（2026-08-12）

- §二目录树：新增本归档目录条目
- §三桌面框架：补 Wails/Flutter/MAUI 否决理由 + Tauri 4 条补丁
- §三工程形态：`pnpm monorepo` → **Cargo workspace（主体）+ pnpm workspace（前端）**
- §三建议骨架：标注各包语言（`crates/*` 为 Rust、`packages/ui-kit` 为 TS），**移除 `apps/cli`**（MVP 不做 CLI）
- §三前端框架：**新增冻结**（React 18 + shadcn/ui + Tailwind + Vite + react-query）
- §三存储：`better-sqlite3` 双层 → **单一 Rust `vault` crate（rusqlite+SQLCipher+Argon2id）**，排除官方 `tauri-plugin-sql`
- §三平台优先级：`Linux 后` → **MVP 不做 Linux**
- §五编码方向：拆分为前端层（Node/TS）与后端+数据层（Rust）

## 下一步建议

1. 起骨架时直接以 cc-switch v3.19.2 的 `tauri.conf.json` + updater + single-instance 配置为模板（注意 single-instance 第一个注册）。
2. 先做**最小渲染验证**：用 React + Tailwind 按设计稿（`DESIGN.md` / `prototype/` 视觉）搭一个最小页（如主屏瓷砖墙），塞进 Tauri webview，实测 macOS WKWebView 下 E 墨极配色 + 思源黑体 + 翡翠交互色的表现。注：`prototype/` 是设计稿，代码不直接复用，前端从设计稿用 React 重画。
3. `crates/vault` 起步先验证 rusqlite `bundled-sqlcipher-vendored-openssl` 在 macOS/Windows 双平台的编译链，避免后期被原生依赖卡住。
