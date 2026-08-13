# Skill Manager · 调研报告三件套

**调研周期**：2026 年 8 月 11 日
**调研目的**：从独立开发者视角，为"跨 Agent 工具的 Skill/Prompt/MCP 同步管理"产品做完整市场 + 技术 + 竞品调研
**调研立场**：敢下判断、不写空话、所有结论可追溯到原始来源

---

## 阅读顺序

| 顺序 | 报告 | 解决的问题 | 字数 |
|---|---|---|---|
| 1️⃣ | **`final_turn_001.md`** | 行业现状：2026 年的 AI Skill 平台长什么样？标杆玩家怎么打？ | ~5,000 字 |
| 2️⃣ | **`skill_manager_research.md`** | 产品机会：你的赛道值不值得做？4 块差异化机会在哪？ | ~4,500 字 |
| 3️⃣ | **`cindy_tech_reference.md`** | 工程参考：心动 Cindy 的 monorepo 哪些能直接抄、哪些必须避？ | ~5,500 字 |
| 4️⃣ | **`../20260811_134500_xiaobai_desktop_ux_paradigms/xiaobai_desktop_ux_paradigms.md`** | 设计范式：小白化桌面工具的 onboarding、隐喻、冲突呈现、设置分层怎么抄？ | ~3,000 字 |

**建议路径**：先 1 看市场大盘 → 再 2 锁定你的产品定位 → 再 3 落地工程实现 → 最后 4 打磨桌面端 UX。

---

## 三句话总结

**行业**：AI Skill 平台大战已经开打，2026 年 8 月赛道窗口期 6-9 个月；标杆玩家（ColaOS、CertiK Skill Scanner）用"持续上下文 + 长期关系"建立护城河；美团 Meyo、腾讯元宝派等巨头入场，但 GUI + 跨端同步层仍是空缺。

**产品**：值得做。3 个直接竞品（OpenSkills 10.6k stars / Skillport / agent-skills-hub）全部是 CLI + 本地 + git-based；GUI + 云同步（1Password 范式）+ 6 维度冲突检测是你的 4 块差异化机会；Tauri 桌面 + macOS 优先 + $8-12/月订阅是商业模型正解。

**工程**：心动 Cindy 7/26 刚开源，14 个 packages 中**只有 4 个值得抄**（auth / device-link / maker-scheduler / project-context）；它的 Electron + 本地优先哲学**必须避开**；你该用 Tauri + E2E 加密云同步 + local SQLite + 云 vault 双层架构；MVP 阶段 monorepo 砍到 6-7 个包。

---

## 关键数据卡片

### 报告 1：ColaOS 调研

| 维度 | 数据 |
|---|---|
| 融资 | 天使+ 200 万美元（天际资本 + 王川） |
| ListenHub ARR | 300 万美元、月度盈亏平衡、付费率 5% |
| ColaOS 累计用户 | 1 万+（截至 2026/6） |
| 2026 ARR 目标 | 1000 万美元 |
| 2027 ARR 目标 | 1 亿美元 |
| 8 月 5 日新动作 | 冯雷宣布"Skill 精选站"上线，找"藏师傅"当 KOL 顾问 |
| 关键认知 | "装 1 万个 Skill 反而让 Agent 效果变差" |

### 报告 2：Skill Manager 调研

| 维度 | 数据 |
|---|---|
| 中国 AI 技能服务用户 | 8,700 万 |
| Agent 技能市场年增速 | 132% |
| 窗口期 | 6-9 个月 |
| 4 块差异化机会 | GUI+云同步 / 冲突检测 / Skill 对比推荐 / MCP 一站式管理 |
| 6 维度冲突检测 | 同名 / 描述相似 / 调用链 / 优先级 / port / 语义 |
| 3 个直接竞品 | OpenSkills 10.6k stars / Skillport 183 commits / agent-skills-hub v1.6.10 |
| 1 个新兴安全巨头 | CertiK Skill Scanner（2026/5 发布） |
| 定价建议 | 免费 + 个人 Pro $5-8/月 + 团队 $12/人/月 |
| 平台优先级 | macOS 第一 / Windows 第二 / Linux 后 |

### 报告 3：Cindy 技术参考

| 维度 | 数据 |
|---|---|
| 发布日期 | 2026/7/26（TDW 2026） |
| 开源协议 | Apache-2.0 |
| GitHub stars | 2.0k（开源当月） |
| 团队规模 | 心动内部跨部门协作 + 公开成员 1 人 |
| 技术栈 | Electron 桌面 + Expo/RN 移动 + pnpm 10 + Node 22 + TypeScript |
| 核心原生模块 | better-sqlite3、node-pty、sharp、@parcel/watcher、esbuild |
| Monorepo 包数 | 14 个 packages + 2 个 apps + 1 个 git submodule |
| 必抄包 | auth、device-link、maker-scheduler、project-context |
| 不该抄的选择 | Electron（→Tauri）、不上云（→E2E 加密）、local SQLite only（→SQLite + 云 vault） |
| 建议 monorepo 骨架 | 6-7 个包（apps/desktop + apps/cli + 6 个 packages） |

### 报告 4：小白化桌面 UX 范式

| 维度 | 结论 |
|---|---|
| 核心隐喻 | Skill = AI 大脑，MCP = AI 工具箱，yo-skill = 保险库 |
| 首屏范式 | Raycast 式单一搜索框 + 按 Agent 分流 |
| 冲突呈现 | 并排卡片 + 差异高亮 + 保留 A / 保留 B / 合并 |
| 设置分层 | General / Sync / Security / Advanced 四层 |
| 默认值原则 | 冲突敏感度、同步频率、MCP 端口开箱即用 |
| 安全网 | 主密码 + 设备配对码 / 恢复码 |
| 关键参考 | 1Password、Raycast、Arc、Notion、Docker Desktop、GitHub Desktop、Linear、Cursor |

---

## 报告间引用关系

```
[1] ColaOS 调研 ──┬─→ 行业窗口期 / 用户习惯
                  ├─→ 竞品坐标（CertiK Skill Scanner / Meyo / 腾讯元宝派）
                  └─→ 商业模式参考（ColaOS $10/$30/$99）

[2] Skill Manager 调研 ──┬─→ 直接竞品（OpenSkills / Skillport / agent-skills-hub）
                        ├─→ 技术可行性（SKILL.md 标准化 / MCP 配置差异）
                        ├─→ 4 块差异化机会
                        └─→ 商业模式 + 风险评估

[3] Cindy 技术参考 ──┬─→ 工程纪律（monorepo / DCO / sha256 / postinstall）
                   ├─→ 必抄设计（device-link / project-context / 二进制分发）
                   └─→ 必避选择（Electron / 不上云 / local-only）

[4] 小白化桌面 UX 范式 ──┬─→ onboarding 隐喻与首屏结构
                        ├─→ 冲突/错误状态呈现方式
                        ├─→ 设置页信息分层
                        └─→ Progressive Disclosure + Sensible Defaults 原则
```

**交叉点**：
- 报告 1 + 报告 2：行业窗口期 vs 产品窗口期 → 6-9 个月是"双窗口期"
- 报告 2 + 报告 3：4 块差异化机会 vs Cindy 工程实现 → 哪些能直接抄
- 报告 1 + 报告 3：ColaOS "Skill 精选站" vs Cindy "Skill 第一公民" → 赛道共识
- 报告 2 + 报告 4：GUI + 云同步 + 冲突检测的产品机会 → 如何用小白语言落地
- 报告 3 + 报告 4：Cindy 的 device-link 工程实现 → 如何包装成 1Password 式"已信任设备审批"UX

---

## 下一步建议

按优先级排：

1. **MVP 范围定义**（1-2 天）— 砍到 6-7 个包，明确"必做 / 不做 / 以后做"
2. **Tauri 桌面选型深挖**（1 天）— Tauri 2.x 还是 Tauri 1.x、状态管理选什么、Rust 侧要写什么
3. **E2E 加密方案设计**（2-3 天）— 1Password / Bitwarden 范式 vs 自研，关键算法（Argon2id、libsodium）
4. **冲突检测算法选型**（1-2 天）— 6 维度里的"语义相似度"用 embedding 还是 BM25
5. **种子用户访谈**（3-5 天）— 找 10-20 个 OpenSkills / Skillport 现有用户问痛点
6. **Figma 3 屏设计**（3-5 天）— 主屏 / Skill 详情 / 冲突解决，直接参考报告 4 的隐喻与分层结论

**不要做**：
- ❌ MVP 阶段就做移动端
- ❌ MVP 阶段就支持所有 Agent（先做 Claude Code + Codex）
- ❌ MVP 阶段就做团队版（先个人版跑通）
- ❌ MVP 阶段就开源（先闭源跑 3 个月再考虑）

---

## 引用规范

所有报告统一采用：
- 行内引用：`【1】`
- 末尾参考资料：链接 + 来源 + 抓取日期

**原始来源可追溯**：
- ColaOS 官网：colaos.ai（已抓 7 个页面 + 3 篇深度报道）
- OpenSkills 仓库：github.com/numman-ali/OpenSkills
- Cindy 仓库：github.com/makecindy/cindy
- Skillport 仓库：github.com/gotalab/skillport
- CertiK Skill Scanner 公告：2026/5 公开

---

**四件套交付完成**：2026/8/11 14:00
**总调研时长**：约 2.5 小时（含多轮 web 搜索 + 20 个来源抓取 + 4 份报告撰写）
**总字数**：~18,000 字（不含本 README）
