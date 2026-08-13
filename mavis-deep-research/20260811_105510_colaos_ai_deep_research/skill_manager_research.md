# 「跨 Agent 工具的 Skill/Prompt/MCP 同步管理」深度调研报告

> 调研对象：你的"skill-manager"产品构想
> 调研时间：2026 年 8 月 11 日
> 受众：独立开发者（你自己）

## 核心判断（先把结论摆出来）

**这是一个值得做的赛道，但你正面对 3 个直接竞品、1 个新兴安全巨头、和 1 个潜在的平台级碾压风险。** 你的核心机会不在"同步"这个层（已经被抢光了），而在"**冲突检测 + 对比推荐 + GUI + 云同步**"这四件**OpenSkills / Skillport / agent-skills-hub 都没做的事**。

**6-9 个月的窗口期**。2026 年 8 月这个赛道已经被市场验证（8700 万用户、132% 年增速、CertiK 入场、ColaOS CEO 冯雷也开始做 Skill 精选站），但竞品都还在 CLI 重度用户层，没出 GUI + 云同步的"1Password for AI Skills"。这是你 6-9 个月内的非对称窗口。

**强烈不建议的方向**：
- ❌ 跟 OpenSkills 在 CLI 上硬拼（打不过，10.6k stars 加上作者 numman-ali 本身就是英国 FinTech CTO + 同名 2.2k stars 项目作者）
- ❌ 做"通用 AI 工具"或"通用 Agent 工具"（你定义痛点时已经说了，太卷）
- ❌ 纯本地不联网（dotfiles 工具的死亡陷阱：1Password 起来了，chezmoi 永远小众）
- ❌ 赌 Anthropic / Cursor 不会做官方 Skill Hub（他们大概率会做，但你得在他们做之前拿到 1 万付费用户）

---

## 一、竞品全景图

按你的痛点（Skill + Prompt + MCP 一站式同步管理）梳理的 9 个直接竞品/参照物：

| 产品 | 定位 | 形态 | 用户量 | 解决什么 | 缺什么 |
|------|------|------|--------|----------|--------|
| **OpenSkills** | 跨 Agent Skill 同步 | CLI（npm） | 10.6k stars | 把 Claude Code 的 Skill 装到 Cursor/Windsurf/Aider | 无 GUI、无云同步、无冲突检测、无对比推荐 |
| **Skillport** | SkillOps 工具包 | CLI + MCP server | 183 commits | Skill 校验、安装、按需加载 | 同上，CLI 形态 |
| **agent-skills-hub** | 中央仓库 | Python CLI（`skill` 命令）| v1.6.10 | 一处安装，多 Agent 同步 | 无 GUI、无云同步 |
| **CertiK Skill Scanner** | Skill 安全扫描 | Web SaaS | 2026/5 刚发布 | 扫描恶意 Skill、数据泄露 | 90.5% 精度，覆盖面窄 |
| **PromptLayer** | Prompt 团队管理 | Web SaaS | YC 投资 | Prompt 版本/评估/可观测 | 不管 Skill/MCP，C 端不友好 |
| **AIPRM** | Prompt 模板市场 | Chrome 扩展 | 大量 C 端 | ChatGPT 用户的 prompt 模板 | 不管 Skill/MCP |
| **Prompt-Tools** | 本地 Prompt 管理 | Tauri 桌面（macOS）| 个人项目 | 本地优先的 prompt 整理 | 不管 Skill/MCP、不跨平台 |
| **ComposioHQ/awesome-claude-skills** | 策展导航 | GitHub 列表 | 23.9k stars | Skill 发现入口 | 纯人工策展，无对比无评分 |
| **chezmoi** | dotfiles 同步 | CLI | 几万用户 | 跨设备配置文件同步 | 通用工具，无 AI 上下文 |

**关键观察**：

1. **Skill 同步层已经被三家占满**（OpenSkills、Skillport、agent-skills-hub），全是 CLI、全是开源、全是 git-based。你的产品如果也做"同步"——直接死亡。

2. **GUI + 云同步是真正的空白**。OpenSkills 作者的卖点是"装 Claude Code 的 Skill 到 Cursor"，不是"管理我的 Skill 库"。这两件事不一样：前者是开发者用一次就走的 CLI 工具，后者是每天都打开的个人/团队 Hub。

3. **Prompt 团队管理（PromptLayer）和 Skill 管理是分开的**。但用户痛点是一起的——你调教好 10 个 Skill + 30 个 prompt + 5 个 MCP，分散在 3 个工具里管。这是你的整合价值。

4. **CertiK Skill Scanner 验证了"Scan 类工具"是真实需求**。但 CertiK 走的是"安全扫描"（恶意代码、数据泄露），不解决"功能冲突"（同名 Skill 覆盖、description 重复 trigger）。你的"冲突检测"是 CertiK 不做的方向。

5. **OpenSkills 跟 Claude Code 100% 兼容** —— 这是 2026 年 Skill 生态最重要的技术事实。意味着你做的产品**必须支持**这套事实标准（SKILL.md + `<available_skills>` XML + 渐进披露），否则会被开源生态甩开。

---

## 二、技术可行性：跨 Agent 同步不是幻想

调研中最关键的好消息是：**Skill 跨平台标准已经稳定了**。

**目录约定统一化**（2026 年现状）：
- Claude Code：`~/.claude/skills/` 或项目 `.claude/skills/`
- Codex：`~/.codex/skills/` 或 `.codex/skills/`（需开 `features.skills = true`）
- Cursor：`~/.cursor/skills/` 或 `.cursor/skills/`
- Windsurf：`~/.windsurf/skills/`
- Aider：读 `AGENTS.md`
- Trae：基本兼容 Claude Code 格式
- **OpenSkills 的"Universal Mode"**：`.agent/skills/` 跨所有工具共享一份

**SKILL.md 格式已经被所有主流 Agent 接受**（YAML frontmatter + Markdown 正文 + 可选 `references/` `scripts/` `assets/`）。

**MCP 配置差异是真正的不统一**：
- Claude Code：`~/.claude/mcp.json`
- Codex：`~/.codex/config.toml`
- Cursor：`~/.cursor/mcp.json`
- 不同 Agent 的 MCP server 配置语法略有差异
- **这是你的"MCP 同步"功能的真实痛点**——也是 OpenSkills/Skillport 都没碰的

**Prompt 配置更碎片化**：
- Claude Code：`CLAUDE.md`（项目级）+ `~/.claude/CLAUDE.md`（个人级）
- Cursor：`.cursorrules` 或 `AGENTS.md`
- Codex：`AGENTS.md`
- 各 Agent 互相不读对方文件

**结论**：Skill 同步是现成的（90% 复用 OpenSkills 的方案），**真正的工程挑战是 MCP 同步和 Prompt 同步**——这两个没有标准，你得自己做。

---

## 三、你的真实机会：四块空白

把竞品都列出来后，你的差异化空间很清楚：

### 机会 1：GUI + 云同步（1Password for AI Skills）

- **现状**：所有 Skill 同步工具都是 CLI + 本地 + git
- **痛点**：开发者换电脑时 git pull 要重装 CLI、配置 SSH key、处理跨平台路径
- **你的解法**：Tauri 桌面 App + 本地 SQLite + 加密云同步（跟 1Password 范式）
- **护城河**：CLI 工具很难做 GUI，GUI 工具也很难做 CLI——这是不同技术栈
- **参考定价**：Raycast Pro $8/月 + Advanced AI $10/月 = 用户愿意为"省时间"付 $10/月

### 机会 2：冲突检测（最难，护城河最深）

冯雷 8 月 5 日那条推文说"装了一万个 Skill，Agent 效果变差"——这就是冲突检测要解决的问题。具体可做的检测维度：

| 检测类型 | 实现难度 | 商业价值 | 竞品是否做 |
|----------|----------|----------|------------|
| 同名 Skill 覆盖 | 简单（字符串比较） | 中（基础卫生） | ❌ |
| description 相似（重复 trigger） | 中（embedding + 相似度） | 高（核心痛点） | ❌ |
| Skill 间调用链冲突 | 难（需要执行跟踪） | 高 | ❌ |
| 优先级冲突（多个 Skill 都自动 trigger） | 中（基于 description 关键词） | 中 | ❌ |
| MCP server 端口/资源冲突 | 简单（配置 diff） | 中 | ❌ |
| Skill vs 用户 prompt 语义冲突 | 难（需要 LLM） | 高 | ❌ |

**实现路径**：
- **MVP** 做前 3 个（同名、描述相似、port 冲突）
- **进阶** 加 LLM 辅助的语义分析（用本地 LLM 比如 Ollama qwen2.5:7b）
- **数据飞轮**：用户报告冲突 → 标记 → 其他人装同样 Skill 时预警

### 机会 3：Skill 对比推荐（数据飞轮）

冯雷找"藏师傅"做的 Skill 精选站就是这个方向的早期尝试。人工策展不持久，你做的是数据驱动的版本：

- **输入维度**：GitHub stars/forks/issue 活跃度 + 用户评分（自己收）+ 实际调用频率（用户授权统计后）+ description 相似度聚类
- **输出**：同场景下选 Skill A 还是 Skill B 的可视化对比
- **数据飞轮**：用的人越多 → 调用数据越准 → 推荐越好 → 用的人更多

**关键洞察**：ComposioHQ/awesome-claude-skills 23.9k stars 但只做"发现"，不做"对比"。这块是空的。

### 机会 4：MCP 一站式管理（没人做）

MCP 是 2025 年 11 月由 Anthropic 开源的协议，2026 年开始爆发。配置管理的痛点：

- 每个 Agent 工具配置文件路径不同（`~/.claude/mcp.json` vs `~/.codex/config.toml` vs `~/.cursor/mcp.json`）
- 跨设备换机要手动复制 3 个文件
- MCP server 装多了会端口冲突
- 没有"哪些 MCP server 我装了"的统一视图

**你的解法**：类似 Skill 同步的逻辑，做 MCP 配置同步。技术上不复杂（都是 JSON/TOML），但**生态上还几乎没人做**。

---

## 四、MVP 建议（独立开发者 4-8 周可上线）

**第 1 周：定义范围 + 技术选型**
- **不要什么都做**。MVP 只做：
  1. 跨 Agent Skill 同步（复用 OpenSkills 的 SKILL.md 格式 + .agent/skills/ universal 模式）
  2. 冲突检测 MVP（同名 + 描述相似 + port 冲突）
  3. 本地优先（先不上云同步）

**第 2-3 周：核心 CLI 工具**
- 用 Node.js + TypeScript（跟 OpenSkills 一致，方便互操作）
- 实现：`skillhub install/sync/list/validate/conflict-check`
- **必须兼容 OpenSkills 格式**，让用户能无缝迁移
- 发布到 npm：`npx skillhub ...`

**第 4-6 周：Tauri 桌面 App v0.1**
- 跨平台：macOS + Windows（Linux 优先级低）
- 本地 SQLite 存 skill 库 + 配置
- GUI 功能：浏览、搜索、安装、冲突检测可视化
- **关键设计**：界面要像 1Password 那种"Vault"感，不是文件管理器

**第 7-8 周：内测 + 反馈**
- 在 X / 即刻 / V2EX 发内测
- 目标：100 个种子用户 + 50 个付费试用

**关键决策**：
- **先 CLI 后 GUI**（跟 OpenSkills 一样，先让开发者能跑起来，再做 GUI）
- **不要做自己的 SKILL.md 格式**（直接 100% 兼容 OpenSkills + Anthropic 官方）
- **不要做 Plugin 市场**（你的核心是管理，不是分发）

---

## 五、商业模式与定价

参考标的：

| 产品 | 个人版 | 团队版 | 备注 |
|------|--------|--------|------|
| Raycast Pro | $8/月 | $15/人/月 | Advanced AI 插件 $10/月 |
| 1Password | $2.99/月 | $7.99/人/月 | 个人免费版有限制 |
| PromptLayer | 免费试用 | $49-499/人/月 | 团队按量 |
| chezmoi | 免费 | 免费 | 靠捐赠 |

**建议定价**：
- **免费版**：本地使用、基础同步、3 个 Agent 工具限制
- **个人 Pro**：$5/月 或 $48/年 — 云同步、冲突检测、对比推荐
- **团队版**：$12/人/月 — 团队 Skill 库、共享库、权限管理

**关键问题**：你个人做，免费版用户能不能成为付费用户？

**判断**：**可以**。1Password 的成功证明"个人/小团队愿意为'跨设备同步'付 $5/月"——AI Skill 是"个人知识资产"，付费意愿类似。

**变现预期**：
- 6 个月内：100 付费用户 × $5/月 = $500 MRR
- 12 个月内：1000 付费用户 × $5/月 = $5K MRR
- 24 个月内：5000 付费用户 × $7/月 = $35K MRR
- **这个 ARR 远低于 PromptLayer 那种企业级**，但对独立开发者已经够活 + 持续投入

---

## 六、风险与坑

按严重程度排序：

### 🔴 高风险

**1. OpenSkills / Skillport 已经做了 60% 的事**
- 他们是 CLI + 开源 + 强作者（numman-ali 10.6k stars + 同名项目 2.2k stars）
- 你的 GUI 是差异化，但他们 1-2 个月内可以加 Tauri 版
- **应对**：你必须抢在他们加 GUI 之前拿到 1 万付费用户做护城河
- **判断**：6-9 个月窗口期

**2. Anthropic / Cursor 官方可能做 Skills Cloud**
- 概率 70%
- 一旦做了，你的核心价值"跨工具同步"会被官方用"先发优势"碾压
- **应对**：把"冲突检测"和"对比推荐"做深，官方做基础同步但不会做深功能（参考 1Password 跟 Apple Passwords 的关系）

**3. 你是一个人，但 OpenSkills 作者有 FinTech 主业 + 多项目协同**
- 你的资源是 1，他的资源是 1 + N
- **应对**：保持小而精，避免跟他拼功能广度

### 🟡 中风险

**4. MCP 生态还在快速变化**
- 各 Agent 工具的 MCP 配置格式可能还在变
- 你做了同步功能但 Agent 改了格式 → 你的产品就坏
- **应对**：先小范围支持（Claude Code + Codex + Cursor），不追新

**5. C 端付费意愿是命门**
- 5 美元/月听起来不多，但要持续付费
- 如果用户换了 Agent 工具、不调教 Skill、不写 prompt → 你没有价值
- **应对**：种子用户必须重度 Skill 用户，目标画像"重度 Cursor/Claude Code 用户 + 写技术博客/做副业的人"

**6. 独立开发者的"功能蔓延"陷阱**
- 你可能想"再做点 prompt 优化"、"再加个 MCP store"...
- **应对**：MVP 砍到只剩 3 个核心功能，做透

### 🟢 低风险（但要小心）

**7. Skill 生态可能再次剧变**
- 比如 Anthropic 把 SKILL.md 改了
- 但 OpenSkills 已经在做这件事，标准化趋势明显
- **应对**：跟 OpenSkills 保持"友好的非竞争关系"，他改格式你跟着改

**8. 用户隐私和数据合规**
- Skill 包含 API key、prompt 可能含商业机密
- 云同步必须有端到端加密
- **应对**：参考 1Password 的 zero-knowledge 架构（连你都看不到用户数据）

---

## 七、给你看的下一步（具体到这周就能做的事）

**这一周**：
1. 在 X 搜"OpenSkills"、"Skillport"看用户吐槽，挖痛点
2. 跑 OpenSkills CLI 实测一遍，记录哪里不顺手
3. 写一个 `skillhub --help` 草案，看你想要的 CLI 长什么样
4. 在你的目标用户群（Cursor 中文用户/Claude Code 中文用户）发个调研问题："你管理 Skill/Prompt/MCP 现在的痛点是什么？"

**第二周**：
1. 选技术栈：Node.js + TypeScript CLI + Tauri 桌面
2. 起 GitHub repo，命名想清楚（建议带"hub"字，跟 OpenSkills 区分）
3. 写 README + Roadmap

**第四周**：
1. CLI MVP 上 npm
2. 找 5 个种子用户内测
3. 收集冲突检测的真实样例

**第六周**：
1. Tauri v0.1 上线
2. ProductHunt 准备
3. 即刻发一条"为什么做这个"长文

---

## 八、参考资料

【1】 OpenSkills GitHub 仓库与 README，https://github.com/numman-ali/openskills
【2】 Skillport GitHub 仓库与 README，https://github.com/gotalab/skillport
【3】 agent-skills-hub 介绍与使用，https://www.cnblogs.com/dqtx33/p/19704969
【4】 Anthropic 官方 Skills 仓库与 Agent Skills 文档，https://github.com/anthropics/skills
【5】 ComposioHQ/awesome-claude-skills 策展列表，https://github.com/ComposioHQ/awesome-claude-skills
【6】 冯雷 8 月 5 日 Skill 精选站推文，https://x.com/oran_ge/status/2084933132416176201
【7】 CertiK Skill Scanner 发布，https://so.html5.qq.com/page/real_search_news?docid=70000021_4616a16f41a28952
【8】 PromptLayer 官网与产品介绍，https://www.promptlayer.com/
【9】 AIPRM vs PromptHub 对比，https://sourceforge.net/software/compare/AIPRM-vs-PromptHub/
【10】 jwangkun/Prompt-Tools 桌面 prompt 管理，https://github.com/jwangkun/Prompt-Tools
【11】 chezmoi dotfiles 管理工具官网，https://chezmoi.io/
【12】 Raycast AI 官网与定价参考，https://www.raycast.com/ai
【13】 Claude Code Skills 实战指南（目录约定 + 跨平台迁移），https://cloud.tencent.com/developer/article/2698677
【14】 Skill 精简治理指南（含 OpenSkills 定位 + 噪音 Skill 概念），https://blog.csdn.net/bojinyuan00/article/details/157904855
【15】 MCP 协议与服务端配置实例，https://cloud.tencent.com/developer/article/2701411
