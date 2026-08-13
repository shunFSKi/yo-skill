# cc-switch 设计参考（Rust + Tauri 多 Agent 管理器）

## 元信息

- **调研日期**：2026-08-11
- **调研目的**：把 `farion1231/cc-switch` 纳入 yo-skill 的产品设计参考库，作为"同栈实战对标 + 学/不学清单"
- **立场**：实战对标 —— 凡引用具体结论必锚定到文件路径，不空谈设计模式
- **抓取方式**：`git clone --depth=1` 后离线读源码 + GitHub API 元数据
- **版本基准**：cc-switch v3.19.2（仓库 `package.json` 与 `src-tauri/Cargo.toml` 一致）

## 一句话总结

**cc-switch** 是 Rust + Tauri 2.x 写的开发者向多 Agent 桌面代理（Claude Code / Codex / OpenCode / OpenClaw / Grok Build / Hermes Agent 六家通吃），内嵌 axum HTTP 代理 + WebDAV/S3 多端同步 + 用量统计；与 yo-skill 的 Tauri 技术栈完全同源，但产品定位偏"运维/Provider 切换"，与 yo-skill 的"小白向技能随身带"互补而非竞争。

## 一、技术栈对标

### 1.1 完整栈清单

| 层 | cc-switch 选型 | 版本 | yo-skill 是否可借鉴 |
| --- | --- | --- | --- |
| 桌面框架 | Tauri | 2.8.2 | ✅ 已冻结决策，验证可行 |
| Rust 工具链 | rust-toolchain.toml 锁定 | 1.95 | ✅ **强烈建议沿用** —— CI 上强制版本号 |
| 前端框架 | React + Vite | 18.2 + 7.3 | ✅ 推荐 |
| UI 基础 | shadcn/ui + Radix + Tailwind | neutral + lucide | ✅ 直接抄 |
| 表单 | react-hook-form + zod | 7.65 + 4.1 | ✅ 直接抄 |
| 数据 | @tanstack/react-query + @tanstack/react-virtual | 5.90 + 3.13 | ✅ react-virtual 是 Skills 长列表必备 |
| 拖拽 | @dnd-kit/core + @dnd-kit/sortable | 6.3 / 10.0 | ✅ Skill 排序必备 |
| 编辑器 | CodeMirror 6 | latest | ⚠️ MVP 可用 textarea 简化 |
| 全文搜索 | flexsearch | 0.8 | ⚠️ MVP 不上，V2 引入 |
| i18n | i18next + react-i18next | 25.5 / 16.0 | ❌ MVP 不做（中文优先） |
| Toast | sonner | 2.0 | ✅ 直接抄 |
| 测试 | vitest + testing-library + jsdom + msw | 2.0 / 16 / 25 / 2.11 | ✅ 替代 Jest |
| Rust 数据库 | rusqlite (bundled + backup + hooks) | 0.31 | ✅ 已冻结 better-sqlite3 也可，rusqlite 更纯 |
| Rust HTTP | axum + tower + tower-http | 0.7 / 0.4 / 0.5 | ⚠️ 只在需要内嵌代理时引入 |
| Rust TOML/JSON | toml + toml_edit + json5 + json-five | latest | ✅ 解析 skill 文件必备 |
| Rust 嵌入式 JS | rquickjs | 0.8 | ❌ MVP 不嵌入 JS 运行时 |
| Rust HTTP client | reqwest (rustls-tls + socks) | 0.12 | ✅ 同步走 E2E vault 时需要 |

### 1.2 与 yo-skill 已冻结栈的差距

- **Rust 1.95 + `rust-toolchain.toml`**：cc-switch 强制锁定具体版本。**强烈建议 yo-skill 沿用**——避免 CI 上 Rust 版本漂移带来隐性 bug。
- **Vite 7**：cc-switch 用 Vite 7，yo-skill 可以跟版本（前提是 React 18 兼容）。
- **better-sqlite3 vs rusqlite**：cc-switch 用 `rusqlite` 更纯 Rust 无 Node binding；yo-skill 如果纯 Rust 路径，rusqlite 是更一致的选择。**建议维持原决策**（better-sqlite3 给 Node 端，rusqlite 给 Rust 端，按需切换即可）。
- **CSP 配置**：cc-switch 的 CSP 严格收敛 `script-src 'self'`，yo-skill 沿用相同约束，养成安全肌肉记忆。

## 二、目录结构对标

### 2.1 Rust 后端（`src-tauri/src/`）—— 36 个文件

cc-switch 后端根目录平铺结构（**这是技术债**，不要照搬）：

```
src-tauri/src/
├── lib.rs                # Tauri 入口
├── main.rs
├── commands/             # Tauri IPC 命令（前后端边界）
├── database/             # SQLite DAO 层
│   └── dao/
├── services/             # 核心业务逻辑（与 UI 解耦）
│   ├── provider/         # 每个 provider 一份
│   ├── webdav_sync/      # 同步适配
│   └── ...
├── proxy/                # 内嵌 HTTP 代理（核心！cc-switch 标志性能力）
│   ├── providers/
│   └── usage/
├── session_manager/      # 会话管理（按 provider 拆分）
│   ├── providers/        # claude.rs / codex.rs / gemini.rs / grokbuild.rs / hermes.rs / openclaw.rs / opencode.rs
│   └── terminal/
├── deeplink/
├── claude_config.rs      # ⚠️ 每个 Agent 一个平铺文件（技术债）
├── codex_config.rs
├── gemini_config.rs
├── grok_config.rs
├── hermes_config.rs
├── opencode_config.rs
├── openclaw_config.rs
├── claude_mcp.rs / claude_plugin.rs / claude_desktop_config.rs
├── gemini_mcp.rs
├── prompt.rs / prompt_files.rs
├── codex_state_db.rs / codex_history_migration.rs
├── app_config.rs / app_store.rs / config.rs / error.rs
├── auto_launch.rs / lightweight.rs / linux_fix.rs / panic_hook.rs
├── model_capabilities.rs / init_status.rs
└── services/{model_fetch, model_pricing, omo, speedtest, stream_check,
              subscription, subscription_grok, usage_cache, usage_stats,
              sync_protocol, s3, s3_sync, s3_auto_sync, webdav, webdav_sync,
              webdav_auto_sync, env_checker, env_manager, sql_helpers}
```

### 2.2 前端（`src/components/`）—— 18 个子模块

```
src/components/
├── agents/        providers/       skills/        prompts/
├── mcp/           profiles/        sessions/      workspace/
├── settings/      proxy/           usage/         env/
├── deeplink/      hermes/          openclaw/
├── common/        universal/       ui/   ← shadcn 原生
```

### 2.3 关键文件映射（cc-switch → yo-skill MVP）

| cc-switch 文件 | yo-skill 对应 | 备注 |
| --- | --- | --- |
| `commands/*` | `apps/desktop/src-tauri/src/commands/*` | Tauri IPC 层薄薄一层 |
| `services/provider/{live,usage,endpoints}.rs` | `packages/agent-adapter/src/<agent>/` | 业务核心 |
| `services/skill.rs` | `packages/skill-index/src/` | Skill 解析与索引 |
| `services/mcp.rs` + `claude_mcp.rs` + `gemini_mcp.rs` | `packages/skill-index/src/mcp/` | MCP 适配 |
| `services/webdav_sync/*` + `webdav.rs` + `webdav_auto_sync.rs` | `packages/sync-engine/src/{vault,conflict,transport}/` | **架构不同**：yo-skill 不走 WebDAV，走 E2E 加密 vault |
| `services/s3*.rs` | ❌ 不实现 | S3 同步是 cc-switch 多端备份，不是 yo-skill MVP 范围 |
| `services/prompt.rs` + `prompt_files.rs` | `packages/skill-index/src/prompt/` | Skill 文件解析 |
| `services/usage_*.rs` | ❌ 不实现 | 用量统计是 cc-switch 的核心，但 yo-skill 小白用户不关心 token 成本 |
| `services/speedtest.rs` + `services/stream_check.rs` | ❌ 不实现 | 运维工具 |
| `services/env_*.rs` | ❌ 不实现 | yo-skill 改 `~/.zshrc` 不在 MVP 范围 |
| `services/omo.rs` | ❓ 未知 | O-MO 是 cc-switch 的某个产品能力，需进一步调研 |
| `proxy/*` | ❌ 不实现 | **核心差异**：cc-switch 内嵌 HTTP 代理，yo-skill 不做 |
| `database/dao/*` | `packages/vault/src/db/` | SQLite DAO 层 |
| `session_manager/providers/<agent>.rs` | `packages/agent-adapter/src/<agent>/session.rs` | 按 Agent 拆分的会话抽象 |
| `session_manager/terminal/*` | ❌ 不实现 | 内嵌终端不是 yo-skill MVP 范围 |
| `deeplink/*` | `apps/desktop/src-tauri/src/deeplink/` | **建议抄**：`yoskill://import?url=...` 用于网页一键导入 Skill |
| `claude_desktop_config.rs` | ❌ 不实现 | Claude Desktop App 不是 yo-skill 目标 |
| `codex_state_db.rs` + `codex_history_migration.rs` | `packages/agent-adapter/src/codex/` | Codex 的会话历史数据迁移 |
| `claude_plugin.rs` | ❌ 不实现 | 插件管理不是 MVP |
| `model_capabilities.rs` + `services/model_pricing.rs` | ❌ 不实现 | 模型元数据不是 yo-skill 关心的事 |
| `lightweight.rs` | ❌ 不实现 | 轻量模式是优化方向，不是 MVP |
| `linux_fix.rs` | ❌ 不实现 | 平台兼容应该是结构化处理，不是单文件补丁 |
| `panic_hook.rs` | `apps/desktop/src-tauri/src/panic_hook.rs` | **必须抄**：崩溃日志对桌面 App 是基本功 |
| `init_status.rs` | `packages/agent-adapter/src/init.rs` | **建议抄**：Agent 初始化状态机 |
| `auto_launch.rs` | ❌ 不实现 | 开机自启是工具类习惯，yo-skill 是按需打开 |

## 三、值得抄的具体设计模式

### 3.1 每个 Agent 一个独立子模块（高优先级）

**做法**：在 `packages/agent-adapter/src/` 下，每个 Agent 一个子目录：

```
agent-adapter/
├── src/
│   ├── claude_code/
│   │   ├── mod.rs
│   │   ├── config.rs        # 读写 ~/.claude/skills/...
│   │   ├── mcp.rs           # MCP 适配
│   │   ├── session.rs
│   │   └── init.rs          # 初始化状态机
│   ├── codex/
│   │   └── ... (同样结构)
│   └── lib.rs               # 统一 trait：AgentAdapter
```

**为什么**：cc-switch 实际做法是 `claude_*.rs`、`codex_*.rs`、`gemini_*.rs` 平铺在根目录（30+ 文件）。这是**历史包袱**，每加一个 Agent 就随手新建文件。yo-skill 应该按 Agent 子目录组织，定义 `trait AgentAdapter`，让上层通过 trait 调用。

### 3.2 Tauri commands 薄、业务逻辑厚（高优先级）

**做法**：
- `commands/` 目录只做 IPC 参数转换和错误映射
- 业务逻辑放在 `services/` 或 `packages/<pkg>/src/`
- commands 调用 services，services 不依赖 Tauri

**为什么**：cc-switch 的 `commands/` 大量存在直接读写数据库/文件系统的代码，导致无法单元测试。yo-skill 应该一开始就把 IPC 与业务逻辑分离。

### 3.3 CodeMirror 6 作为 Skill/Prompt 编辑器（中优先级）

**做法**：用 `@codemirror/lang-markdown` + 自定义 YAML frontmatter 语法高亮作为 Skill 编辑器。

**为什么**：cc-switch v3.x 已经把这套用熟了。yo-skill 的 Skill 都是 Markdown + YAML frontmatter，CodeMirror 比 textarea 强很多。

**建议**：MVP 用 `<textarea>` + Markdown 预览，V2 引入 CodeMirror。

### 3.4 全文搜索用 flexsearch（中优先级）

**做法**：用 `flexsearch` 给本地 Skill 库建索引。

**为什么**：cc-switch 用这个。Skill 库达到几十条后，靠 `LIKE %...%` 已经不行了。

**建议**：MVP 不上（默认全列表展示），用户量超 50 条时引入。

### 3.5 Deep Link 唤起导入（高优先级）

**做法**：注册 `yoskill://` scheme，从网页跳转到桌面 App 完成 Skill 导入。

**为什么**：cc-switch 用 `ccswitch://` scheme 做这件事，体验流畅。yo-skill 可以做"在 yo-skill 官网分享 Skill → 点击导入 → 桌面 App 自动打开并确认"。

**实施**：复用 Tauri `tauri-plugin-deep-link`，参考 cc-switch `src-tauri/src/deeplink/` 模块。

### 3.6 单实例 + 自动更新 + 窗口状态（中优先级）

**做法**：开箱即用 `tauri-plugin-single-instance`、`tauri-plugin-updater`、`tauri-plugin-window-state`。

**为什么**：cc-switch 这三件套全开了。yo-skill 桌面 App 也是基本要求。

**实施细节**：updater 的 `pubkey` 提前生成 + `latest.json` 走 GitHub Releases（参考 cc-switch `tauri.conf.json` 中 `dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXk6...` 的 RSA pubkey 模板）。

### 3.7 SQLite 带 backup 和 hooks（高优先级）

**做法**：`rusqlite` 启用 `bundled + backup + hooks` features。

**为什么**：cc-switch 的 `Cargo.toml` 启用了 `backup`（备份能力）和 `hooks`（事件钩子）两个 feature，前者用于本地数据库崩溃恢复，后者用于审计日志。

**建议**：yo-skill vault 包直接抄。

### 3.8 测试栈：vitest + jsdom + msw（中优先级）

**做法**：前端用 `vitest` + `@testing-library/react` 测组件；用 `msw` 拦截 fetch 模拟 Tauri IPC。

**为什么**：cc-switch 的测试栈比 Jest+msw 更现代。msw 是模拟 HTTP 请求的事实标准。

**注意**：Tauri IPC 走的是自定义协议，msw 默认不能拦截，需要写一个 msw handler 把 `tauri.invoke()` 转成 HTTP 拦截。

## 四、明确"不要抄"的清单

### 4.1 不要内嵌 HTTP 代理（axum）

**原因**：cc-switch 的核心能力是"在本地启一个 axum HTTP 服务器，把所有 Agent 请求接管"。yo-skill 的核心是"Skill 同步管理 + 对比推荐"，不需要抢 Agent 的请求流。MVP 不引入 `axum`。

### 4.2 不要走 WebDAV/S3 同步

**原因**：cc-switch 用 WebDAV/S3 做"多端同步"。yo-skill 的差异化是 **E2E 加密 vault + 零知识云同步**（已在 AGENTS.md 冻结）。抄 WebDAV 就是放弃差异化。

### 4.3 不要做用量统计 / Speedtest / Stream Check

**原因**：cc-switch 的 `services/usage_*.rs` + `speedtest.rs` + `stream_check.rs` 是给开发者用的运维工具。yo-skill 的用户是小白，关心"我装了哪些 Skill"，不关心"今天烧了多少 token"。

**例外**：可以做一个"Skill 调用频次"统计（最近 7 天用了几次），但要克制，作为"健康度仪表"而非"成本仪表"。

### 4.4 不要做内嵌终端

**原因**：cc-switch 的 `session_manager/terminal/` 是"在桌面 App 里直接和 Agent 交互的终端"。这与 yo-skill "Skill 管理器"定位冲突——yo-skill 应该回到 Claude Code/Codex 自己的 CLI 去做交互。

### 4.5 不要做开机自启

**原因**：yo-skill 是按需打开（"装个 Skill" → "用" → "关"），不是常驻工具。`auto_launch.rs` 是工具类 App 习惯，不适合 yo-skill。

### 4.6 不要做 Lightweight Mode（先不做）

**原因**：cc-switch 的 `lightweight.rs` 是"只装 Claude Code 不装 Codex"的轻量模式。MVP 不需要——先把两个 Agent 都支持好，再考虑减法。

### 4.7 不要平铺 30+ `*_config.rs`

**原因**：cc-switch 根目录 30+ 个 `claude_config.rs`/`codex_config.rs`/`gemini_config.rs` 是历史包袱。yo-skill 按 Agent 子目录组织（见 3.1）。

### 4.8 不要做 i18n（MVP 阶段）

**原因**：cc-switch 4 语言（en/zh/de/ja）。yo-skill MVP 先做中文单语，国际化是 V2 再说。引入 i18next 增加心智负担。

## 五、对 yo-skill MVP 的具体建议

### 5.1 包结构调整（基于 cc-switch 实战）

cc-switch 实际是**单包结构**（虽然 `pnpm-workspace.yaml` 存在但 `packages` 为空），把所有模块塞到 `src-tauri/src/` 根。yo-skill 是 monorepo，结构应该更清晰：

```
yo-skill/
├── apps/
│   ├── desktop/                  # Tauri 桌面 App（src-tauri + src/）
│   │   ├── src/                  # 前端（Vite + React + shadcn/ui）
│   │   └── src-tauri/            # Rust 后端
│   └── cli/                      # 命令行版（可选）
└── packages/
    ├── vault/                    # E2E 加密 + SQLite（rusqlite）
    ├── sync-engine/              # 同步状态机 + 冲突检测
    ├── conflict-detector/        # 6 维度冲突检测算法
    ├── skill-index/              # Skill 解析、索引、搜索
    ├── agent-adapter/            # 每个 Agent 一个子模块
    │   ├── src/
    │   │   ├── claude_code/
    │   │   │   ├── config.rs     # 读写 ~/.claude/skills/...
    │   │   │   ├── mcp.rs
    │   │   │   └── session.rs
    │   │   ├── codex/
    │   │   └── lib.rs            # trait AgentAdapter
    │   └── Cargo.toml
    └── ui-kit/                   # 通用 UI 组件（shadcn/ui 风格的 yo-skill 主题）
```

### 5.2 必装的 Tauri 插件清单

| 插件 | 用途 | cc-switch 已用 | yo-skill 是否必装 |
| --- | --- | --- | --- |
| `tauri-plugin-deep-link` | `yoskill://` scheme 唤起导入 | ✅ | ✅ MVP 必装 |
| `tauri-plugin-updater` | 自动更新 | ✅ | ✅ V1 必装（V0 可以手装） |
| `tauri-plugin-window-state` | 记住窗口位置 | ✅ | ✅ MVP 必装 |
| `tauri-plugin-single-instance` | 单实例 | ✅ | ✅ MVP 必装 |
| `tauri-plugin-dialog` | 文件选择对话框 | ✅ | ✅ MVP 必装 |
| `tauri-plugin-log` | 日志 | ✅ | ✅ MVP 必装 |
| `tauri-plugin-store` | key-value 存储 | ✅ | ⚠️ 可以不用，vault 包已经覆盖 |
| `tauri-plugin-process` | 进程管理 | ✅ | ❌ MVP 不需要 |
| `tauri-plugin-opener` | 打开 URL/文件 | ✅ | ⚠️ 可选 |

### 5.3 必抄的 Rust crate

| crate | 用途 | 优先级 |
| --- | --- | --- |
| `rusqlite` (bundled + backup + hooks) | 本地 SQLite | 必 |
| `serde` + `serde_json` + `serde_yaml` | 序列化 + YAML frontmatter 解析 | 必 |
| `toml` + `toml_edit` | 读写 TOML（Codex 的 `config.toml`） | 必 |
| `tokio` (rt-multi-thread + sync + macros) | 异步运行时 | 必 |
| `reqwest` (rustls-tls + json) | vault 同步 | 必 |
| `argon2` | Argon2id 派生密钥 | 必（vault 加密） |
| `chacha20poly1305` 或 `aes-gcm` | AEAD 对称加密 | 必（vault 加密） |
| `dirs` | 跨平台用户目录 | 必 |
| `thiserror` + `anyhow` | 错误处理 | 必 |
| `flexsearch`（前端） | 全文搜索 | V2 |
| `axum` | 本地代理 | ❌ MVP 不引入 |
| `rquickjs` | 嵌入式 JS | ❌ MVP 不引入 |

## 六、产品差异化的最终判定

### 6.1 cc-switch vs yo-skill：用户是谁？

| 维度 | cc-switch | yo-skill |
| --- | --- | --- |
| 用户 | AI 重度开发者 | AI 入门用户 |
| 核心 | Provider 切换 + 用量优化 | Skill 随身带 + 对比推荐 |
| 同步 | WebDAV / S3 多端备份 | E2E 加密 vault + 跨电脑 |
| UI | 功能密度高、配置项多 | 极简向导 + 智能推荐 |
| 商业 | 开源免费（MIT） | 闭源 $5-12/月订阅 |
| 技术深度 | 内嵌 HTTP 代理 | Skill 索引 + 冲突检测 |
| 跨平台 | 桌面三端（mac/Win/Linux） | macOS 优先 / Windows 第二 / Linux 后置 |

### 6.2 互补而非竞争

- cc-switch 用户是"我有 5 个 API key 想切换"，yo-skill 用户是"我想让我妈也能用上 AI 帮我整理照片"
- cc-switch 占据"开发者向 AI 网关"心智，yo-skill 占据"小白向 AI 技能市场"心智
- **不应该做的事**：不要学 cc-switch 做 provider 切换（Claude Code/Codex 已经原生支持 profile，重复造轮子）

### 6.3 一句话定位

> **cc-switch 是给"懂 Agent 的人"的工具，yo-skill 是给"想用 AI 但不懂 Agent 的人"的桥梁。**

## 参考资料

【1】 GitHub 仓库：farion1231/cc-switch  
    URL：https://github.com/farion1231/cc-switch  
    抓取日期：2026-08-11  
    方式：`git clone --depth=1` + 离线读源码

【2】 GitHub API 仓库元数据  
    URL：https://api.github.com/repos/farion1231/cc-switch  
    抓取日期：2026-08-11  
    关键字段：stars 126,321 / forks 8,604 / license MIT / language Rust / topics `tauri, typescript, claude-code, codex, opencode, openclaw, grok, hermes, mcp, skills-management, wsl-support`

【3】 cc-switch 官方主页（仅做防伪参考）  
    URL：https://ccswitch.io  
    抓取日期：2026-08-11  
    备注：cc-switch 在 README 中明确"Only official website: ccswitch.io"，提醒行业里有仿冒站

【4】 cc-switch 包配置文件（用于 §1.1 技术栈对标）  
    路径：`package.json`（v3.19.2）+ `src-tauri/Cargo.toml` + `src-tauri/rust-toolchain.toml`  
    抓取日期：2026-08-11