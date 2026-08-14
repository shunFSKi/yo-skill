# AGENTS.md — skill-manager（yo-skill）项目工作区

> 面向 AI coding agent 的项目说明。本文件描述**当前工作区的真实状态**，请以此为唯一事实来源，不要臆测不存在的代码或配置。

---

## 一、项目概览

这是独立开发者产品 **yo-skill**（跨 Agent 工具的 Skill / Prompt / MCP 同步管理工具，定位 "AI 工具的 1Password"）的**调研与规划工作区**。

**当前状态：调研文档仓库 + 桌面端静态 UI 原型（`prototype/`，双击即开）+ 官网 Web 应用（`apps/web`，Next.js 15，已可 `pnpm dev` 跑起来，含真实数据的 Skill 与 MCP 市场）。**

- 已有代码：`apps/web`（官网落地页 + 等待列表 API + `/market` 市场，pnpm workspace）、`packages/ui-kit`（共享 UI 骨架）与 `tools/registry-pipeline`（市场数据管线，Node TS）；桌面端（Tauri/Rust）尚未动工
- 没有测试、没有 CI/CD、没有部署流程
- 主体内容仍是 **Markdown 调研报告**（中文撰写）+ 产品设计定稿 V2 + 桌面端 7 屏 HTML 原型

因此：根目录的 `pnpm dev / build / lint / typecheck` 只作用于 `@yo-skill/web`；桌面端若开始编码，应先与用户确认（调研结论建议 Tauri + Cargo workspace，见下文"已冻结的技术决策"）。

## 二、目录结构

```
skill-manager/
├── AGENTS.md                        # 本文件
├── PRODUCT.md                       # 产品事实记录（impeccable init 产出：用户 / 定位 / 约束 / 品牌绑定）
├── DESIGN.md                        # 视觉设计系统（从 7 屏原型归纳：色彩 / 字体 / 组件约定）
├── package.json / pnpm-workspace.yaml / tsconfig.base.json  # pnpm monorepo 根（Node 22+ / pnpm 10+）
├── apps/
│   └── web/                         # 官网 Web 应用 @yo-skill/web（Next.js 15 App Router + React 18 + Tailwind + next-themes；落地页 + /api/waitlist + /market 真实数据市场（209 条 SSG，详情页含源仓库 README）+ account 占位；视觉「纸上墨字 + 一笔翡翠」，详见本目录 README）
├── packages/
│   └── ui-kit/                      # 共享 UI 原语骨架（TS，与未来的 apps/desktop 复用）
├── tools/
│   └── registry-pipeline/           # 市场数据管线 @yo-skill/registry-pipeline（Node 22 直跑 TS：拉 claudeskills.info + MCP 官方 Registry 真实元数据 + 源仓库 README → 5 条静态扫描 + 场景分类 → 落盘 apps/web/public/registry/*.json；根目录 pnpm fetch:registry 重跑即更新；fetch 走环境变量代理；幂等——数据无变化不落盘；定时同步工作流在 .github/workflows/registry-sync.yml；数据仓已建：GitHub `shunFSKi/yo-skill-registry` 海外主仓 + Gitee 同名仓国内镜像〔走 Gitee 官方镜像功能 Pull，非工作流推送〕，接入细节见该目录 README）
├── prototype/                       # 桌面端 UI 设计稿（纯静态 HTML/CSS，仅供视觉参考、非产品代码，双击 index.html 进入）
│   ├── README.md                    # 原型说明 + 7 屏清单（先读这个）
│   ├── yo.css                       # 共享设计系统（E 墨极调色层 + 深色模式，变量已语义化 --accent/--warn；尾部 .ob-* 向导组件）
│   ├── yo.js                        # 浅/深模式切换（localStorage 记忆 > URL ?mode= 参数 > 跟随系统）+ 条目图标哈希着色
│   ├── yo-dedupe.js                 # 重复项演示状态（组注册表 + 合并/三选一/保持现状持久化，dedupe 页与主屏提醒条共用）
│   ├── themes.html                  # 五套候选配色对比页（2026-08-11 视觉定稿 V2 决策存档）
│   ├── colors.html                  # 状态配色三选一对比页（2026-08-11 视觉定稿 V4 决策存档）
│   ├── logos/                       # 主流 Agent 官方品牌 SVG（simple-icons 下载，本地引用无依赖）
│   ├── index.html                   # 屏 1：主屏已安装（默认按助手看：15 个主流助手瓷砖墙 + 过滤框 + 全局搜索；统一视图：跨助手按名合并 Skill/MCP，Skill/MCP 分段切换；提醒条联动 dedupe 状态）
│   ├── skill.html                   # 屏 2：能力卡片详情（含存放方式选择：所有助手共用一份〔默认〕/ 每个助手单独放一份；源 README 面板；?name=&type=&from= 数据驱动）
│   ├── dedupe.html                  # 屏 3：重复项合并页（2026-08-12 真交互：合并/三选一/保持现状真持久化 + 撤销，与主屏提醒条联动）
│   ├── store.html                   # 屏 4：仓库「发现」页（Skill/MCP 分段切换 + 分类/搜索/排序真过滤 + 安装弹层全流程）
│   ├── settings.html                # 屏 5：设置（Cindy 式分区 tab：通用 / 云同步与设备 / API Key / Skill 存放 / 关于，全演示交互）
│   ├── onboarding.html              # 屏 6：首次启动收拢向导（旅程 1：自动扫描 → 一键统一管理 → 云同步/恢复码，先给价值再要账号）
│   ├── restore.html                 # 屏 7：换电脑恢复向导（旅程 4：主密码解锁 → 一键恢复 → 结果清单 + 顺便安装未装助手）
│   ├── shots/                       # 1440×900 验收截图（主屏双态 / 发现页弹层与详情 / 设置分区 / 重复项已处理态 / 向导三镜）+ 主题对比 10 张
│   └── （web/ 已删除）               # 官网静态原型 2026-08-13 废弃，官网落在 apps/web（Next.js），不在本目录放官网
├── mavis-deep-research/             # 深度调研产出（按时间戳归档）
│   ├── 20260811_105510_colaos_ai_deep_research/
│   │   ├── README.md                # 三件套总索引 + 关键数据卡片（先读这个）
│   │   ├── final_turn_001.md        # 报告 1：ColaOS 行业调研（~5000 字）
│   │   ├── skill_manager_research.md # 报告 2：产品机会与竞品调研（~4500 字）
│   │   ├── cindy_tech_reference.md  # 报告 3：心动 Cindy 工程参考（~5500 字）
│   │   ├── naming_debate_result.md  # AI 三方辩论记录：命名 + 定位决策树
│   │   └── yo-skill_brand_brief.md  # 品牌定稿：命名 / 调性 / 视觉 / 文案
│   ├── 20260811_120500_cc_switch_design_reference/
│   │   ├── README.md                # 索引 + 学/不学清单（先读这个）
│   │   └── cc_switch_design_reference.md # cc-switch（Tauri 同栈）实战对标（~7500 字）
│   ├── 20260811_134500_xiaobai_desktop_ux_paradigms/
│   │   ├── README.md                # 索引 + 关键结论卡片
│   │   └── xiaobai_desktop_ux_paradigms.md # 小白化桌面 UX 范式调研（~3000 字）
│   ├── 20260811_161937_yoskill_product_design/
│   │   ├── README.md                # 产品设计 V1 索引 + 三句话总结（先读这个）
│   │   ├── yoskill_product_design.md # 产品设计定稿 V2：架构 / 六条旅程 / 界面 / 一键清单 / 文案（~5500 字）
│   │   └── reference_skill_prompt_sync_ux.md # 原始调研：Skill/Prompt/同步工具 UX 参考
│   ├── 20260812_013131_framework_comparison/
│   │   ├── README.md                # 索引 + 关键数据卡片（先读这个）
│   │   ├── framework_comparison.md  # 桌面框架选型对比：Tauri 维持，Wails/Flutter/MAUI 否决，Tauri 4 条补丁
│   │   └── storage_architecture.md  # 存储专项：rusqlite+SQLCipher，vault 单一 Rust crate，CLI 改 Rust
│   ├── 20260812_115055_skill_storage_strategy/
│   │   ├── README.md                # 索引 + 关键数据卡片（先读这个）
│   │   └── skill_storage_strategy.md # Skill 存储竞品调研：通用目录 ~/.agents/skills/ 成行业标准位，中央库+symlink/junction 优先 copy 兜底
│   ├── 20260812_230034_skill_registry_pipeline/
│   │   ├── README.md                # 索引 + 关键数据卡片（先读这个）
│   │   └── skill_registry_pipeline.md # 仓库聚合管线：Skill 主源 claudeskills.info + MCP 主源官方 Registry（+Glama 增强），8 项安全静态扫描，MVP 400+150 条约 2 周
│   └── 20260813_100940_official_site_design_reference/
│       ├── README.md                # 索引 + 关键数据卡片（先读这个）
│       ├── official_site_design_reference.md # 同类官网设计调研：12 站四种首屏打法，12 个可抄手法按 ROI 排序，P0-P2 改版清单
│       ├── sites/                   # 12 张站点卡片
│       └── shots/                   # 24 张真实浏览器截图（首屏 + 中段）
├── self-media/                      # 自媒体账号任务（2026-08-11 自 Mac ai_research 迁入，Mac 原件已删）
│   ├── README.md                    # 索引（先读这个）
│   ├── xilo2991_network/            # X 圈层调研 + 顺哥账号运营工作区（自有 AGENTS.md / INDEX.md 入口）
│   └── raw_data/                    # 原始数据：小红书"随波逐流"近 30 天证据截图
├── e-commerce/                      # 闲鱼电商任务（2026-08-11 自 Mac ai_research 迁入，Mac 原件已删）
│   ├── README.md                    # 索引（先读这个）
│   └── sellable_packs/              # 5 个可售数字产品包（含闲鱼上架文案 / 商品图 / 卖家清单）
└── research/
    └── colaos_ai/                   # 空目录（预留的原始资料存放位）
```

阅读顺序：先读调研目录下的 `README.md`（含三句话总结与数据卡片），再按需深入各报告。

## 三、已冻结的核心结论（改动前先读）

以下结论由调研与辩论产出，是当前项目的"事实层"，后续工作应与之一致，除非用户明确要求推翻：

**产品定位（已定稿）**
- 产品名：`yo-skill`（全小写连字符，唯一对外口径；❌ YoSkill / Yoskill / Yo Skill 等写法均已否决）
- 一句话定位："让 AI 学会新本事，跨电脑随身带"
- 目标用户：AI 重度但不懂 Skill/MCP 术语的小白用户（25-40 岁，$5-12/月付费意愿）
- 界面术语（2026-08-11 用户改定）：Agent 称 AI 助手，Skill / MCP / API Key 直接用原文，导航为 已安装 / 发现；原"大脑/工具箱/保险库/钥匙"隐喻体系已废弃；禁用"武器库 / 治理 / 资产 / 市场"等企业级或硬核话术
- 视觉定稿 V4（2026-08-11 用户改定）：**E 墨极**黑白骨架 + 功能色——交互翡翠 `#29A383`（Radix jade 同族，可点行动）、成功徽章中性化（中性灰底 + 翡翠勾，`--ok` 绿 `#30A46C` 仅留同步点等微小语义位）、危险红 `#E5484D`（仅卸载类）、琥珀橙 `#E8890C` 仅提醒 + 完整深色模式；V2"行动层纯黑白"、V3"交互蓝"同日相继被用户修订（Tailwind 默认色廉价、蓝太普通、紫"AI 味"均否决），薄荷绿旧案已废弃（五套候选存档于 `prototype/themes.html`，状态配色三选一存档于 `prototype/colors.html`）；中文思源黑体、英文 Inter

**已冻结的技术决策（调研建议，尚未落地为代码）**
- 桌面框架：**Tauri**（明确避开 Cindy 的 Electron 路线）。2026-08-12 横向复核（见 `mavis-deep-research/20260812_013131_framework_comparison/`）：Wails / Flutter Desktop / .NET MAUI 首次纳入对比后**全部否决**（Wails 自动更新未落地、Flutter 无官方 updater 且原型迁移成本高、MAUI 最不成熟），Electron 维持否决。**Tauri 须打 4 条补丁**：① Linux 降级（见下"平台优先级"）② Windows 安装包带 WebView2 bootstrapper（WebView2 偶发安装失败砸首装率）③ updater 必须 RSA 签名 + GitHub Releases（抄 cc-switch）④ `tauri-plugin-single-instance` 必须第一个注册
- 工程形态：**Cargo workspace（主体）+ pnpm workspace（前端）**，不是纯 pnpm monorepo；主体在 Rust 侧。MVP 阶段砍到 **6-7 个包**（不要学 Cindy 的 14 包）
- 建议骨架：`apps/desktop`（Tauri：`src-tauri/` Rust + 前端）+ `crates/`（`vault` / `sync-engine` / `conflict-detector` / `skill-index` / `agent-adapter`，均为 **Rust crate**，单一真相源层）+ `packages/ui-kit`（**TS**）。**无 CLI**——目标用户是小白，CLI 对他们是天书（2026-08-12 用户改定；原 `apps/cli` 是早期"先 CLI 后 GUI"残留，该路线已推翻）
- 前端框架（2026-08-12 冻结）：**React 18 + shadcn/ui + Radix + Tailwind + Vite + @tanstack/react-query**；UI 状态用 Zustand（按需引入）。抄 cc-switch 生产验证路径；Solid/Svelte 性能更好但生态小，留作 V2 观察
- 存储：**单一 Rust crate（`vault`）**——`rusqlite`（features: `bundled` + `backup` + `hooks`）+ **SQLCipher**（本地整库 AES-256 加密）+ Argon2id 派生密钥（连接时 `PRAGMA key`）。**排除官方 `tauri-plugin-sql`**（底层 sqlx 不支持 SQLite 加密）。云端 E2E 加密 vault 只存密文不变。`vault` crate 只服务 desktop（详见 `storage_architecture.md`）
- Skill 收拢/分发机制（2026-08-12 用户确认）：**vault 中央库恒定单一事实源，用户选的是分发方式**——模式 A「所有助手共用一份」（**默认**：实体放 `~/.agents/skills/` 行业标准位，Codex/Gemini/OpenCode/Kimi/Copilot/Replit 零分发直接生效；不认的助手自动搭桥——macOS symlink / Windows junction（免管理员），失败降级 copy）/ 模式 B「每个助手单独放一份」（Cursor【文件监听不吃目录软链】、云同步盘、权限受限环境兜底，更新/卸载回写所有副本）；每个 skill 记账（模式 + 每助手入口类型），**更新不得静默改模式**（vercel skills #1199 教训）；界面话术不出现 symlink/junction/copy（竞品依据与 6 条工程纪律详见 `mavis-deep-research/20260812_115055_skill_storage_strategy/` §五）
- 平台优先级：macOS 第一 / Windows 第二；**MVP 不做 Linux**（2026-08-12 用户改定：WebKitGTK 不稳定 + 空应用内存反超 Electron，Linux 是 Tauri 最弱平台，砍掉省跨平台测试负担；后续按社区需求再评估）；MVP **不做移动端**
- Agent 支持面：**主流 Agent 全支持**（2026-08-12 用户改定，原"MVP 只支持 Claude Code + Codex"已推翻；原型演示 15 个：Claude Code / Codex / Gemini CLI / Cursor / Windsurf / GitHub Copilot / Kimi Code / Cline / Roo Code / Continue / Aider / Trae / Qwen Code / OpenCode / Replit，品牌色瓷砖 + 真实 logo），不做团队版、暂不开源
- 核心差异化：GUI + 云同步、6 维度冲突检测（同名 / 描述相似 / 调用链 / 优先级 / port / 语义）、Skill 对比推荐、MCP 一站式管理
- 值得从 Cindy 抄的工程纪律：工具二进制按平台分发（独立 update 脚本 + pinned version + sha256 校验 + postinstall 钩子）、device-link 配对 UX、project-context 的全局/项目双层抽象、telemetry 集中在一个 `analytics/` 目录且默认 no-op

**明确的"不要做"清单（MVP 阶段）**
- ❌ 不做移动端
- ❌ 不做团队版
- ❌ 不开源（先闭源跑 3 个月）
- ❌ 不重提已否决的命名（清单见 `yo-skill_brand_brief.md` 附录 A）

## 四、文档编写约定

本仓库的全部产出是中文 Markdown 报告，沿用既有惯例：

- **语言**：中文（技术名词、代码、命令、URL 保留英文原文）
- **结构**：报告开头有元信息块（调研日期 / 目的 / 立场），正文用编号小节，关键数据用表格
- **立场风格**：敢下判断、不写空话、结论可追溯到原始来源
- **引用规范**（见调研 README 的"引用规范"节）：
  - 行内引用：`【1】`
  - 末尾"参考资料"节：链接 + 来源 + 抓取日期
- **时间戳归档**：调研产出按 `YYYYMMDD_HHMMSS_<主题>/` 目录归档，目录内放一份 `README.md` 做索引
- 新报告应更新所在目录的 `README.md` 索引（如有）

## 五、测试与构建

**官网（已存在）**：根目录 `pnpm dev`（:3000）/ `pnpm build` / `pnpm lint` / `pnpm typecheck`，均 filter 到 `@yo-skill/web`（typecheck 为全 workspace）；`pnpm fetch:registry` 重跑市场数据管线刷新 `apps/web/public/registry/`。⚠️ 踩坑：跑过 `pnpm build` 后 `pnpm dev` 会样式丢失，删掉 `apps/web/.next` 再 dev 即可（见 `apps/web/README.md`）。

**调研报告**：没有测试框架。验证一份报告的正确方式是：检查事实与数据来源是否一致、引用是否可追溯、与已冻结结论是否冲突。

**桌面端（未动工，预期方向）**：
- **前端层**：Node.js 22+ / pnpm 10 / TypeScript（参考 Cindy 工程水位）
- **后端 + 数据层**：Rust 工具链（Tauri 桌面端 `src-tauri/`、`crates/*` 均为 Rust）
- 建议沿用 Cindy 的工程纪律：DCO sign-off（`git commit -s`）、Git LFS 管二进制、外部工具 sha256 校验测试

## 六、安全注意事项

- 产品核心卖点是 **E2E 加密 / 零知识云同步**——任何涉及云端存储的设计都必须保持"云端只存密文"原则
- 未来实现"Agent 检测器"时需读取用户主目录下的配置（`~/.claude/skills/`、`~/.codex/skills/` 等），涉及 macOS TCC 授权、Windows UAC 等平台权限问题
- 供应链安全底线：外部二进制必须 pinned version + sha256 校验
- telemetry 默认 no-op，且集中在单一 `analytics/` 目录，保证用户可审计、一行删除即可完全离线
- 本仓库当前不含任何密钥或敏感凭据；不要在此存放真实用户数据

## 七、给 agent 的工作提示

- 用户的主要诉求目前是**推进调研结论 → MVP 落地**：下一步事项见调研 README 的"下一步建议"（MVP 范围定义、Tauri 选型深挖、E2E 加密方案、冲突检测算法选型、种子用户访谈、Figma 设计）
- 修改既有报告时保持原有结构与引用规范；推翻已冻结结论前先与用户确认
- 引用外部事实（竞品数据、融资额、star 数等）时，注意这些是 **2026-08-11 时点**的快照，涉及时效性判断需重新核验
