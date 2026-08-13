# Cindy 技术架构调研报告

**调研日期**：2026 年 8 月 11 日
**调研目的**：参考心动公司开源 AI Agent 客户端 Cindy 的工程实现，辅助 Skill Manager 产品的 monorepo 选型与关键技术决策
**立场**：仅做技术架构与工程纪律的客观调研，不做功能对标、不做产品模仿

---

## 一、核心判断

**一句话**：Cindy 解决"**单机多 Agent**"，你要做"**多机多 Agent**"。前者是 single-machine orchestration，后者是 cross-device state sync。

两者**不在同一赛道**，但 Cindy 的工程纪律（monorepo 拆分、device-link 设备握手、按平台分发二进制、隐私默认 no-op）值得直接抄；它的技术选型（Electron 桌面、本地优先哲学、不上云的存储模型）则需要避开。

| 维度 | Cindy | Skill Manager（你） | 关系 |
|---|---|---|---|
| 产品形态 | AI Agent 客户端 | Skill/Prompt/MCP 同步管理 | 同赛道上下游，非竞争 |
| 桌面框架 | Electron | Tauri（建议） | 该避开 |
| 存储 | local SQLite only | local SQLite + 云 vault | 该超越 |
| 同步 | 无 | E2E 加密云同步 | 你的核心壁垒 |
| 跨端 | 手机接管会话 | 多端配置无缝流转 | 借鉴 device-link UX |
| 隐私哲学 | 永不上云 | 端到端加密可上云 | 哲学相通，工程相反 |

**Cindy 给你的不是"技术参考"，是"工程纪律参考"**。它的 monorepo 复杂度、单包 2k+ stars 的成熟度、内部 3 个月试运行后开源的节奏，恰好示范了一个 AI 工具从"内部玩具"到"开源产品"该有的工程水位。

---

## 二、项目背景

**Cindy**（GitHub: `makecindy/cindy`）是心动公司（XD Inc.，TapTap 母公司）CEO 黄一孟于 2026 年 7 月 26 日在 TapTap 开发者沙龙（TDW 2026）正式发布的开源 AI Agent 客户端，Apache-2.0 协议，开源当月 2.0k stars。

**名字来源**：黄一孟在 OpenClaw 内部用了半年的"小龙虾"角色名 Cindy。

**诞生路径**：
- 2026 年 4-5 月：心动内部两个多月孵化
- 5-7 月：跨部门同事共同贡献代码（TapTap、技术中台、HR 都写过）
- 7 月 16 日：内部决策对外开源
- 7 月 26 日：TDW 2026 上正式发布
- 7 月 26 日当天：cindy.cn 域名上线，GitHub `makecindy` 组织公开

**核心定位**（官网原文）："**兼容 Claude Code、Codex 与 Pi 三套 Agent Harness，支持更多模型选择与切换。开箱即用，也能通过记忆、Skill、MCP 与源码持续塑造**"。

**主要交付物**：
- `apps/desktop` — 桌面客户端（macOS / Windows / Linux）
- `apps/mobile` — 移动客户端（iOS / iPadOS / Android）
- `cindy-protocol` — 客户端-服务端协议（TypeScript，独立 git submodule）
- `cindy-official-plugins` — 官方插件市场
- 5 个核心共享 packages（device-link / auth / project-context / model-providers / agent-orchestration 等）

**团队**：公开 GitHub 成员 1 人（`dashhuang`），但 README 强调"代码由公司各个项目的同事共同贡献"，实际是心动内部的分布式协作。

---

## 三、技术栈全景

从仓库根目录 `package.json`、`pnpm-workspace.yaml`、README 及 `apps/desktop/src/renderer/index.tsx` 公开信息综合得出：

### 3.1 客户端栈

| 端 | 框架 | 语言 | 关键依赖 |
|---|---|---|---|
| 桌面 | **Electron** | TypeScript | React（推断）、better-sqlite3、node-pty、sharp、@parcel/watcher、esbuild |
| 移动 | **Expo / React Native** | TypeScript | RN 0.85.3（含自定义 patch）、react-native-webview 13.16.1、expo-paste-input |
| 协议 | — | TypeScript | protobufjs 7.6.5、@anthropic-ai/sdk 0.91.1、zod 4.3.6 |

### 3.2 运行时与构建

- **Node.js**：22.12+
- **pnpm**：10.33.2（v11 暂不支持）
- **Git LFS**：强制（用于二进制资产）
- **DCO sign-off**：每个 commit 强制 `git commit -s`
- **构建**：esbuild + electron-winstaller + Sharp 图像流水线
- **支持架构**：`win32/darwin/linux × x64/arm64`，`glibc`（musl 不支持）

### 3.3 关键原生模块（pnpm `onlyBuiltDependencies`）

```
@parcel/watcher   # 文件系统监听（核心）
better-sqlite3    # 本地存储（同步 API、嵌入式、单文件）
electron          # 桌面运行时
electron-winstaller  # Windows 安装包
esbuild           # 打包
node-pty          # 终端模拟（PTY）
sharp             # 图像处理
```

### 3.4 关键覆盖依赖（pnpm `overrides`）

Cindy 在 14 个包之间维护了一套**全局依赖锁定**，包括 Anthropic SDK、protobufjs、tar、esbuild、sharp、zod、js-yaml 等，**避免 monorepo 内部版本冲突**。这条对独立开发者是个**警示**——Cindy 团队花了工程时间才稳住的多包版本一致性，你 MVP 阶段**用 6-7 个包就够了，别一上来就学 14 个**。

### 3.5 自定义 patch（pnpm `patchedDependencies`）

```
react-native@0.85.3
react-native-uitextview@2.2.0
react-native-webview@13.16.1
expo-paste-input@0.2.2
harmonyos-sans-sc-webfont-splitted
```

**含义**：Cindy 团队**主动维护了 5 个 RN 相关包的自定义 patch**。这暗示 React Native 生态在生产级 AI 客户端上仍需"踩坑 + 修补"。**对你 Skill Manager 的启示**：MVP 阶段先**只做桌面**，等桌面稳了再考虑移动端，避免一开始就被 RN 生态拖住。

---

## 四、Monorepo 架构

### 4.1 顶层结构

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
  - "cindy-protocol/packages/*"   # git submodule，独立仓库
```

工程纪律：
- **apps 是消费者**：每个 app 自给自足、可独立打包发布
- **packages 是被消费者**：纯 TypeScript、无 UI、可在所有 apps 复用
- **protocol 独立**：客户端-服务端协议放子模块，未来服务端可独立仓库演化

### 4.2 完整 packages 清单（14 个）

| 包名 | 职责 | 对 Skill Manager 的价值 |
|---|---|---|
| `agent-orchestration` | 编排 Claude Code / Codex / Pi 三套 Agent | 不抄（你做配置管理，不做 Agent 编排） |
| `auth` | 账号体系（OAuth + 本地 token） | **抄**（账号 + 端到端加密的基础） |
| `device-link` | 跨设备握手（配对 + 心跳 + token 旋转） | **必抄**（设备配对 UX 的参考） |
| `maker-scheduler` | 定时任务（cron + 队列） | 抄实现（同步引擎的"定时轮询"模块） |
| `maker-shared` | maker 模块共享类型 | 不抄 |
| `model-access-protocol` | 模型协议抽象层 | **抄思路**（不绑死特定 Agent 协议） |
| `model-providers` | 多模型实现（OpenAI / Anthropic / 国产） | 不直接抄（你要做的是 Agent 配置同步，不是模型调用） |
| `orca-workflow` | 多 Agent 协作编排 | 不抄 |
| `project-context` | **项目级 vs 全局配置分层** | **必抄**（你产品的核心抽象） |
| `remote-file-service` | 移动端访问桌面端文件 | 抄思路（不抄代码） |
| `responses-anthropic-bridge` | Claude 协议桥接 | 不抄 |
| `responses-chat-bridge` | OpenAI Chat 协议桥接 | 不抄 |
| `voice-input-core` | 语音输入核心 | 不抄 |
| `wechat-ilink` | 微信互联 | 不抄 |

**结论**：14 个包中**有 4 个值得借鉴**（auth、device-link、maker-scheduler、project-context），**1 个值得抄思路**（model-access-protocol），其余 9 个跟你的产品无关。

### 4.3 工具二进制分发（`apps/*-bin`）

README 原文：
> "`apps/*-bin` — Tool binaries shipped with the desktop app; **none are committed** — claude-code, codex, and ripgrep are downloaded per platform by `pnpm install`, and the Android platform-tools binaries are fetched (pinned version, **sha256-verified**) before Windows packaging"

具体 4 类外部工具：
- `claude-code` — Anthropic 官方 CLI
- `codex` — OpenAI 官方 CLI
- `ripgrep` — 文件搜索
- `pi` — Cindy 接入的第三个 harness

**实现方式**：
- 每个工具独立 update 脚本（`tools/{claude,codex,ripgrep,pi}/update.mjs`）
- 统一入口（`tools/update-vendors` = 上面 4 个 update 串行执行）
- postinstall 钩子（`scripts/ensure-agent-binaries.mjs --best-effort`）
- sha256 校验测试（`scripts/verify-sha256.test.mjs`）
- 二进制 CDN fallback（`scripts/ensure-binary-fallback.mjs`）

**这套模式对你 Skill Manager 有两层价值**：
1. **工程纪律**：每个外部依赖独立脚本，未来加新 Agent（Cursor / Aider / Continue）只改一个文件
2. **跨平台打包**：Cindy 借这套扛住了 win32/darwin/linux 三平台 + x64/arm64 6 种架构

---

## 五、三个必抄的设计

### 5.1 工具二进制按平台分发（`apps/*-bin` 模式）

**核心思想**：外部 CLI（Claude Code / Codex / ripgrep）**不 commit 到仓库**，`pnpm install` 时按平台下载，pinned version + sha256 校验。

**为什么重要**：
- Claude Code 每周发版，commit 二进制会迅速过期
- macOS arm64 / Windows x64 / Linux glibc 等架构差异大
- sha256 校验是供应链安全的最低门槛

**Cindy 的具体做法**：
- 每个工具独立 `tools/{name}/update.mjs` 脚本
- 统一通过 `scripts/ensure-agent-binaries.mjs` 调用，支持 `--best-effort` 容错
- `postinstall` 钩子自动跑：先下载二进制 → 修 node-pty 权限 → build 协议子模块
- 测试覆盖：`verify-sha256.test.mjs`、`agent-binary-cdn-fallback.test.mjs`、`ensure-binary-fallback.test.mjs`

**对 Skill Manager 的直接价值**：
你的"Agent 检测器"（读 `~/.claude/skills/` `~/.codex/skills/` 等）**需要按平台分发**。Claude Code / Codex 都是 npm 包，但**配置路径、文件格式、版本兼容性**各不相同。**别让用户自己去 `npm install -g`，你替他做**。照搬 Cindy 的"独立 update 脚本 + sha256 + 平台分发"模式，未来加新 Agent 改一行脚本就行。

### 5.2 设备握手（`packages/device-link`）

**Cindy 的"Anywhere"（多端协同）由三件事构成**：
1. **手机遥控** — 手机接管电脑上的 Cindy 会话
2. **IM 派活** — 飞书/Slack @Cindy，任务在电脑跑，结果回 IM
3. **定时任务** — 周期任务自己跑，结果推 IM

**背后工程基础**就是 `device-link` 包，实现思路（从 README + monorepo 结构推断）：
- **配对码**（6 位数字或 QR code）— 移动端扫码/输入
- **长连接**（WebSocket / mDNS 局域网发现）— 设备间会话同步
- **token 旋转**（每次连接刷新临时凭证）— 安全性
- **心跳 + 状态广播** — Cindy README 提到"online heartbeat to Cindy services (account ID, platform, version only)"

**对你的价值（不抄实现，抄 UX 流程）**：

你做 1Password 范式云同步，**device-link 不需要**（云端做权威 source of truth）。但 device-pair + device-trust 的**配对 UX 值得抄**：

1. 用户在新设备登录
2. 触发 device-pair 流程：显示 6 位配对码 / QR code
3. 已登录设备扫码确认（或在桌面端输入配对码）
4. 新设备获得"已配对设备"标签，列入 device trust list
5. 后续免二次验证（除非新增重要操作）

Cindy 走本地 P2P（无云中转），你要走云（云端做信任中转）。**UX 一致，工程相反**。

### 5.3 项目级 vs 全局配置（`packages/project-context`）

Cindy 把 Skill / Memory / MCP 分成两层：
- **全局层**：`~/.claude/skills/` `~/.codex/skills/` `~/.agent/skills/`（用户在 Cindy 里"教她"的规矩）
- **项目层**：每个 repo 里的 `.claude/` `.codex/` `.agent/`（项目特有的踩坑教训）

`packages/project-context` 就是这两层的抽象。

**对 Skill Manager 的核心价值**：

**这正是你产品的核心抽象**。你必须支持：
- **全局 Skill**（用户的"个人习惯"）— 在 macOS 装着用，Windows 也能用
- **项目级 Skill**（项目特有的"踩坑教训"）— 团队共享
- **跨设备同步** — 两层都要同步
- **冲突策略** — 两层不同（全局 LWW，项目级需要 review）

Cindy 这一层**没做冲突检测和云同步**。**这正是你要超越的地方**。Cindy 完成了"分层抽象"，你要在分层之上做"跨端同步 + 冲突检测"。

---

## 六、三个不该抄的选择

### 6.1 Electron → 你应该用 Tauri

**Cindy 选 Electron 的合理理由**（推断）：
- 心动团队 JS/TS 栈熟练
- macOS / Windows / Linux 一次开发
- WebView 调试生态成熟
- 团队规模够大，能扛 Electron 的性能问题

**Electron 的代价**：
- 包体积 200MB+
- 内存占用 500MB+
- 启动慢（冷启动 1-3 秒）
- macOS 质感靠"伪原生"，跟真正的 SwiftUI 有差距

**你应该用 Tauri 的理由**：
- 包体积 ~10MB（Rust 内核 + 系统 WebView）
- 内存 -70%
- 启动快 3-5 倍
- macOS 质感更接近原生（系统 WebView = 跟 Safari 一样的渲染引擎）

**唯一代价**：Rust 学习曲线 + WebView 平台差异（macOS WKWebView / Windows WebView2 / Linux WebKitGTK）。但 6-9 个月窗口期里，独立开发者用 Tauri 比 Electron 多赚的是"**精致**"和"**口碑**"——恰好是你对自己产品的高要求。

**判断**：如果你要"精致 GUI + 1Password 质感 + Raycast/Things 3 做工对标"，**Tauri 是唯一选择**。

### 6.2 本地优先 + 心跳 only → 你应该做端到端加密云同步

Cindy 官网原文：
> "**文件、代码和对话记录默认保存在你的电脑上**"
> "AI 推理请求经过你配置的 Gateway，但工作区文件**不会被上传或存储在云端**"

Cindy 只发心跳（`account ID, platform, version only`），**工作区永远不上云**。这是 Cindy 的产品哲学——让用户安心用本地 AI。

**你的商业模式是 1Password 范式订阅，必须云同步**。

但 Cindy 哲学**对**，你的做法可以**更聪明**：
- **端到端加密**（1Password / Bitwarden 范式）
- 用户密码派生密钥（Argon2id）
- 云端只存密文（Zero-knowledge）
- 设备间通过公钥交换对称密钥
- 团队共享用公钥加密给收件人

这样你既有云同步便利，又有 Cindy 那种"用户能删一行就彻底关"的安全感。

**判断**：Cindy 的"不上云"是它的护城河，**你的"上云但零知识"是你的护城河**。两条路线不冲突，是互补。

### 6.3 local SQLite only → 你需要 SQLite + 云 vault

Cindy 用 `better-sqlite3` 做本地存储。**这一层你抄**——SQLite 同步 API、单文件、嵌入式，是 2026 年本地存储的事实标准。

但 Cindy 没有云 vault。**你必须做双层**：

| 层 | 职责 | 技术 |
|---|---|---|
| 本地缓存 | 离线工作 + 秒开 | better-sqlite3（学 Cindy） |
| 云端 vault | 跨端同步 + 团队共享 | 自建后端 + 端到端加密 |
| 同步层 | 冲突解决 + 数据合并 | CRDT 或 LWW + 6 维冲突检测 |

**判断**：SQLite 是基石，**但要在它上面叠一层 sync engine**。Cindy 没做，正是你超越它的入口。

---

## 七、超越 Cindy 的具体建议

### 7.1 Monorepo 骨架（建议结构）

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
```

```
apps/
  desktop/           # Tauri 桌面（MVP 核心）
  mobile/            # Expo 移动（v2.0 再加）
  cli/               # 命令行（MVP 必出，OpenSkills 互操作）

packages/
  vault/             # 端到端加密 vault（SQLite 本地 + 云同步）
  sync-engine/       # CRDT 同步层
  conflict-detector/ # 6 维度冲突检测
  skill-index/       # SKILL.md 解析 + 索引
  agent-adapter/     # Claude Code / Codex / Cursor 适配器
  device-link/       # 设备配对（参考 Cindy）
  ui-kit/            # 跨端共享组件
```

**对比 Cindy**：
- 砍掉：所有 Agent 编排、模型桥、定时任务、语音输入、微信互联
- 保留：auth、device-link、project-context 思路
- 新增：vault、sync-engine、conflict-detector、skill-index、agent-adapter（这是 Cindy 没有的护城河）

**工程纪律建议**：
- **MVP 阶段砍到 6-7 个包**，v1.0 再加 mobile
- **不要学 Cindy 维护 5 个 RN patch**——MVP 阶段只做桌面
- **DCO sign-off 必上**（你也是 Apache-2.0 的话）
- **Git LFS 必上**（你也要管二进制资产的话）

### 7.2 借鉴 Cindy 但不照搬的 4 个工程决策

| 决策 | Cindy 做法 | 你的做法 |
|---|---|---|
| 工具二进制分发 | pnpm install 下载 + sha256 | 同样抄（用来分发"Agent 检测器"小工具） |
| 区域 endpoint | `config/endpoint.json` + `endpoint.global.json` | MVP 不需要；v2.0 出海时抄 |
| DCO sign-off | 强制 `git commit -s` | 你也强制（开 Apache-2.0 仓库时） |
| 默认 telemetry no-op | `initTapdb()` 一行删掉 | 你抄——让用户**一行删掉就 100% 离线** |

### 7.3 三个真正值得深挖的 Cindy 细节

**① `tools/*/update.mjs` 的"独立 update 脚本"模式**

每个外部工具一个 update 脚本，统一调用入口。你做 Skill Manager，未来支持新 Agent（Cursor、Aider、Continue）时，每个 Agent 一个检测器，统一 register。**不要把所有 Agent 写在一个文件里**——Cindy 团队用 monorepo 工程纪律解决了这个，你也要。

**② `scripts/fix-node-pty-perms.mjs` 的"权限修复"模式**

Cindy 的 node-pty 在 Windows 上需要特殊权限，`postinstall` 钩子里跑一次 `fix-node-pty-perms` 解决。

**对你的价值**：你读 `~/.claude/skills/` `~/.codex/skills/` 时：
- **macOS 第一次启动要申请 Full Disk Access**（TCC 授权）
- **Windows 要走 UAC** 或 manifest 声明
- **Linux 要处理 `$HOME` 权限 + AppArmor/SELinux**

Cindy 给你示范了"**postinstall 修权限**"这个工程模式。你不需要 fix 什么，但**这个模式本身**值得学——尤其在 macOS 上，第一次启动的 TCC 弹窗体验做不好，**会丢掉一半用户**。

**③ `apps/desktop/src/renderer/analytics/` 的"分析模块独立"模式**

Cindy 把所有 telemetry 收在一个 `analytics/` 目录里，每个文件一行 no-op。用户审查代码时，**先看 `analytics/` 目录就一目了然哪些数据会被收集**。

```
apps/desktop/src/renderer/analytics/
  initTapdb()
  events/
  ...
```

**对你的价值**：你的"用户行为分析"也这么做。**一个 `analytics/` 目录，全部 telemetry 集中**。这是赢得技术用户信任的关键——技术用户最痛恨"你不知道收集了什么"。

---

## 八、风险与提醒

**1. Cindy 是大厂背书 + Apache-2.0 + 内部 3 个月试运行后才开源。**

你做 Skill Manager，**至少内部 2 个月**才能对外发版——Cindy 给你的不是"技术参考"，是"工程纪律参考"。它示范了一个 AI 工具从"内部玩具"到"开源产品"该有的工程水位：monorepo、patched deps、postinstall hooks、CN/Global endpoint 分离、DCO、Git LFS、telemetry no-op。

**2. Cindy 的 monorepo 复杂度高，对单人独立开发者不友好。**

14 个包 + 独立 update 脚本 + 5 个 RN patch + postinstall 钩子 + sha256 校验测试——这是**10+ 人团队**的工程量。MVP 阶段**砍到 6-7 个包**，v1.0 再加 mobile。别一上来就学 Cindy 全套。

**3. Cindy 没做云同步，这是你超越它的核心机会。**

但要小心——Cindy 不上云是**哲学**（保护用户隐私），不是**技术限制**。你做云同步**不能公开说"Cindy 不做云所以我们做"**——这会被解读为攻击 Cindy。你应该说"我们用端到端加密，**跟 Cindy 的本地优先哲学殊途同归**"。

**4. Cindy 的"心跳 + 设备握手"是为了"会话接管"，你的"心跳 + 设备握手"是为了"配置同步"。**

**同一套工程，UX 完全不同**。Cindy 移动端是"控制平面"（看进度 + 批操作），你的移动端是"消费平面"（只读 + 触发同步）。**别照搬 Cindy 的 mobile UX**——你的 mobile 应该是 1Password 那种"简洁清爽的 vault 浏览"，不是 Cindy 那种"实时进度仪表盘"。

**5. Cindy 的市场窗口已经被它占了。**

Cindy 7 月 26 日发布、2k stars、Apache-2.0、绑定心动 TapTap 生态——**它定义了"AI Agent 客户端"这个品类的工程标准**。你做 Skill Manager 是在**它的下层**做"配置管理"，不跟它抢用户。**潜在合作大于潜在竞争**——未来你跟 Cindy 互操作（你的 Skill 仓库能让 Cindy 读出来）会是一篇好 PR。

---

## 九、参考

| 资源 | 链接 |
|---|---|
| Cindy 官网 | https://cindy.cn / https://cindy.app |
| 主仓库 | https://github.com/makecindy/cindy（2.0k stars，Apache-2.0） |
| 协议仓库 | https://github.com/makecindy/cindy-protocol（TypeScript） |
| 官方插件 | https://github.com/makecindy/cindy-official-plugins（Apache-2.0） |
| 黄一孟 7/26 TDW 2026 演讲 | https://new.qq.com/rain/a/20260726A08SJG00 |
| 心动开发者沙龙完整报道 | https://new.qq.com/rain/a/20260727A001F100 |
| Cindy 中文 README | https://github.com/makecindy/cindy/blob/main/README.zh-CN.md |
| Cindy Desktop 渲染层 | https://github.com/makecindy/cindy/tree/main/apps/desktop/src/renderer |
| Cindy 共享包目录 | https://github.com/makecindy/cindy/tree/main/packages |

---

**报告交付日期**：2026 年 8 月 11 日
**适用版本**：Cindy `@main` 分支（commit 截至 2026/8/11）
**调研立场**：仅做技术架构客观调研，不做产品功能对标
