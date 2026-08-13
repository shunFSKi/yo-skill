# cc-switch 设计参考 · README

**调研周期**：2026 年 8 月 11 日
**调研目的**：把 `farion1231/cc-switch`（开源跨 Agent 桌面管理器）纳入 yo-skill 的产品设计参考库 —— 同栈实战对标，提取"学/不学"清单
**调研立场**：实战对标 + 敢下判断。所有结论锚定到 cc-switch 的具体文件路径，不空谈设计模式

---

## 阅读顺序

本目录只产出一份报告，建议直接通读：

| 文件 | 解决的问题 | 字数 |
|---|---|---|
| `cc_switch_design_reference.md` | cc-switch 真实架构是什么？哪些能抄进 yo-skill？哪些是技术债不能抄？ | ~7,500 字 |

---

## 一句话总结

**cc-switch** 是 Rust + Tauri 2.x 写的开发者向多 Agent 桌面代理，**内嵌 axum HTTP 代理 + WebDAV/S3 多端同步 + 用量统计**，与 yo-skill 的"小白向技能随身带"定位互补而非竞争；技术栈完全同源（Tauri + Vite + React + shadcn/ui + rusqlite），可以直接抄的"按 Agent 子目录组织 + commands/services/dao 三层架构 + Deep Link 唤起导入"模式。

---

## 关键数据卡片

| 维度 | 数据 |
|---|---|
| 仓库 | farion1231/cc-switch |
| 协议 | MIT |
| 主语言 | Rust |
| 桌面框架 | Tauri 2.8.2 |
| 前端 | React 18.2 + Vite 7.3 + Tailwind 3.4 + shadcn/ui (neutral) |
| Rust crate 关键 | `axum 0.7`（内嵌代理）、`rusqlite 0.31`（bundled+backup+hooks）、`rquickjs 0.8`（嵌入式 JS）、`reqwest 0.12`（含 socks） |
| Tauri 插件 | log / opener / process / **updater** / dialog / **store** / **deep-link** / **window-state** / **single-instance** |
| Rust 工具链 | rust-toolchain.toml 锁定 **1.95** |
| 包管理 | pnpm 10.12.3 |
| 国际化 | i18next 4 语言（en / zh / de / ja） |
| 支持的 Agent | Claude Code / Codex / OpenCode / OpenClaw / Grok Build / Hermes Agent（6 家） |
| 后端 Rust 文件数 | **36 个**（根目录平铺 30+ 个 `*_config.rs`，是技术债） |
| 前端组件子模块 | 18 个 |
| Star 数 | 126,321 |
| Fork 数 | 8,604 |
| 版本号 | 3.19.2 |
| 深度链接 scheme | `ccswitch://` |

---

## 与 colaos 三件套的引用关系

| 关联点 | colaos 调研里的对应位置 |
|---|---|
| Deep Link 网页一键导入 Skill | colaos 报告 1 里 ColaOS 分享机制的对偶设计（ColaOS 从 X/微信分享 → yo-skill 从 yo-skill 官网 + deep link 唤起） |
| 多端同步策略 | colaos 报告 2 里 §"云同步" + Cindy 报告 3 里 §"E2E 加密 vault" —— cc-switch 走 WebDAV/S3，yo-skill 走 E2E 加密 vault（差异化） |
| 桌面框架选型验证 | colaos 报告 1 + 报告 3 已确定 Tauri；cc-switch 126k stars 验证这是赛道标准答案 |
| Skill 索引与全文搜索 | colaos 报告 2 里 §"Skill 对比推荐" —— cc-switch 用 `flexsearch`，V2 可借鉴 |

---

## 三条核心结论（先看这三条就够）

1. **技术栈完全同源**：cc-switch 用 Rust 1.95 + Tauri 2.8.2 + Vite 7 + React 18 + shadcn/ui（neutral）+ Tailwind + pnpm 10 —— 这就是 yo-skill MVP 应该抄的标准答案，连版本号都不用换。

2. **必须抄的三件事**：
   - **按 Agent 子目录组织 `agent-adapter` 包**（不要像 cc-switch 根目录平铺 30+ 个 `*_config.rs`）
   - **Tauri commands 薄、业务逻辑厚**（cc-switch 把业务塞 commands 里导致难测试，yo-skill 应该一开始分开）
   - **`yoskill://` deep link 唤起导入**（cc-switch 用 `ccswitch://` 做同样的事）

3. **明确不抄的四件事**：
   - **不内嵌 axum HTTP 代理**（cc-switch 抢 Agent 请求流，yo-skill 不需要）
   - **不走 WebDAV/S3 同步**（cc-switch 的多端备份策略；yo-skill 的差异化是 E2E 加密 vault）
   - **不做用量统计 / speedtest / stream check**（运维工具，不是小白用户关心的）
   - **不做内嵌终端 + 开机自启**（与 yo-skill "按需打开"的产品调性冲突）

---

## 一份 actionable 清单（按优先级）

### 立即可执行（V0 准备期）
- [ ] 在 `apps/desktop/src-tauri/Cargo.toml` 引入：`tauri-plugin-deep-link` / `tauri-plugin-updater` / `tauri-plugin-window-state` / `tauri-plugin-single-instance` / `tauri-plugin-dialog` / `tauri-plugin-log`
- [ ] 写 `rust-toolchain.toml` 锁定 `channel = "1.95"`
- [ ] 在 `pnpm-workspace.yaml` 用 `packageManager: pnpm@10.12.3`

### MVP 阶段必做
- [ ] `packages/agent-adapter/src/{claude_code, codex}/` 子目录组织 + `trait AgentAdapter`
- [ ] Tauri `commands/` 与业务逻辑 `services/` 严格分层
- [ ] `panic_hook.rs` 落地（崩溃日志对桌面 App 是基本功）
- [ ] `rusqlite` 启用 `bundled + backup + hooks` features

### V2 阶段再做
- [ ] CodeMirror 6 替代 `<textarea>` 编辑 Skill
- [ ] flexsearch 给 Skill 库建索引
- [ ] i18next 国际化（先中文单语）
- [ ] `@tauri-apps/plugin-updater` 走 GitHub Releases

### ❌ 永远不做
- [ ] 内嵌 axum HTTP 代理
- [ ] WebDAV / S3 同步
- [ ] speedtest / stream check / usage 统计
- [ ] 内嵌终端
- [ ] 开机自启
- [ ] Lightweight Mode（先不做）

---

## 引用规范

所有报告统一采用：
- 行内引用：`【1】`
- 末尾参考资料：链接 + 来源 + 抓取日期

**原始来源可追溯**：
- cc-switch GitHub：https://github.com/farion1231/cc-switch
- 抓取方式：`git clone --depth=1` 后离线读源码（≈19000 字符全文）
- 元数据来源：GitHub API `https://api.github.com/repos/farion1231/cc-switch`
- 版本基准：v3.19.2（package.json 与 Cargo.toml 一致）

---

**报告交付完成**：2026/8/11 12:30
**总调研时长**：约 30 分钟（git clone + 离线读源码 + 报告撰写）
**总字数**：~7,500 字（不含本 README）