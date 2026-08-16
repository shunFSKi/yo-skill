# 官网功能迭代调研：功能补齐与设计优化清单

> - **调研日期**：2026-08-15
> - **目的**：为 yo-skill 官网（`apps/web`）下一轮功能迭代提供竞品依据与优先级清单
> - **立场**：先修洞，再补行业标配，最后做差异化。所有竞品结论基于 2026-08-15 当日实地抓取（URL 见文末参考资料），访问失败的已注明，不凭记忆编造
> - **与上轮关系**：`../20260813_100940_official_site_design_reference/` 调研的是**视觉设计打法**；本轮调研**功能特性**。上轮 P0 中"数据条"已落地（`DataBand`），"可复制命令芯片""分类瓷砖 pastel 化"未落地，并入本轮清单

---

## 一、现状快照（`apps/web`，2026-08-15 盘点）

已有：落地页 9 区块（hero/数据条/痛点/功能 bento/同步流程/助手墙/市场预览/FAQ/CTA）；`/market` 市场（29,167 条：8,077 Skill + 21,090 MCP，服务端过滤、URL 即状态、5 分类、搜索、推荐/stars 两档排序、48/页分页）；详情页（README、stars 曲线、5 项安全扫描清单、安装说明，头部 200 SSG + 长尾 ISR 1 天）；`/api/waitlist`；sitemap/robots；next-themes 双主题。

缺口（按严重度）：

| 级别 | 缺口 | 位置 |
|---|---|---|
| 洞 | waitlist 邮箱**只 console.log 不持久化**，上线即在丢线索 | `src/app/api/waitlist/route.ts` |
| 修复 | 移动端无汉堡导航（`md` 以下导航链接直接隐藏） | `Nav` |
| 修复 | 隐私政策 / 服务条款是 `#` 死链 | `Footer` |
| 功能 | 提交入口、目录 API、相关推荐、Trending、三微章、deeplink 等均无 | 见下文 |

## 二、竞品功能矩阵（8 站 × 19 功能，2026-08-15 抓取）

| 功能 | SkillHub | claudeskills | skills.sh | Smithery | Glama | MCP.so | PulseMCP | Raycast | **yo-skill** |
|---|---|---|---|---|---|---|---|---|---|
| 基础搜索 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 分类过滤 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓（5 类） |
| 安全扫描/标签 | ✓ | ✗ | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ | ✓（5 项） |
| 语义/混合搜索 | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| 多维度排序 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✗（2 档） |
| AI 评分/质量徽章 | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Collections/合集 | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| 每助手安装路径 | ✓ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| CLI 安装助手 | ✓ | ✗ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Hosted/Remote 标识 | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ | ✓ | ✗ | ✗ |
| 调用量/可观测 | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ | ✗ |
| 目录 API / llms.txt | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ |
| 提交入口 | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| 用户账号/OAuth | ✓ | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ |
| Newsletter/内容 | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ |
| Deeplink 一键安装 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| 官方/发布商标签 | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ | ✓ | ✗ | ✗ |
| 相关推荐 | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✓ | ✗ |
| RSS/Feeds | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |

生态位观察（2026-08）：官方 MCP Registry 做元数据标准层，垂直市场（skillhub/skills.sh/smithery）做策展+安装层，pulsemcp 做内容媒体层，raycast 是 Store UX 标杆。行业碎片化加剧（Anthropic/Google/Vercel/OpenClaw 各自建生态），跨助手统一管理的窗口期仍在。

## 三、行业标配（≥3 家有、我们没有）

按补齐性价比排序：

1. **提交入口**（5 家有）——MVP 用 GitHub issue template 即可，零后端
2. **目录 API / llms.txt**（3 家有）——让其他 agent 能读我们的市场，分发飞轮
3. **每助手安装路径 / 跨客户端安装引导**（2 家，但与我们核心定位完全重合）
4. **Collections / 合集**（3 家有）——提高访问深度，可先静态策展
5. **官方/发布商标签**（4 家有）——信任分层
6. **Newsletter / 内容归档**（2 家有，但 waitlist 的天然升级版）

## 四、可加功能清单（P0 → P2）

成本标注：🟢 半天内 / 🟡 1-2 天 / 🟠 3 天以上或需管线配合。

### P0（下次迭代就做）

| # | 功能 | 出处 | 落位与做法 | 依赖 | 成本 |
|---|---|---|---|---|---|
| F1 | **waitlist 持久化（修洞）** | — | `/api/waitlist` 接入持久化：Buttondown/Loops API（省事，自带确认邮件）或 Supabase/Postgres（与 Phase 2 规划一致）二选一 | 需用户选型 | 🟢 |
| F2 | **提交入口** | 5 家有 | 市场页顶 + 详情页加「提交 Skill/MCP」「纠错/认领」链接，指向数据仓 `yo-skill-registry` 的 GitHub issue templates | 无后端 | 🟢 |
| F3 | **llms.txt + 只读 JSON API** | claudeskills/skillhub/glama | `/llms.txt`（说明 + API 索引）+ `/api/v1/search?q=&type=&cat=` + `/api/v1/items/[id]`，纯读 `public/registry/*.json` | 无 | 🟡 |
| F4 | **MCP hosted/remote 标识** | smithery/mcp.so/pulsemcp | `install.kind === "remote"` 出「远程托管」badge（数据已有），卡片 + 详情页 | 无 | 🟢 |
| F5 | **每助手安装路径矩阵** | skillhub | 详情页加「装进你的助手」表：15 个助手各自的落盘路径/是否认 `~/.agents/skills/` 标准位；数据表同时是桌面端 `agent-adapter` 的雏形 | 需整理 15 助手适配表 | 🟡 |
| F6 | **可复制命令芯片** | skills.sh/cline（上轮手法 3 遗留） | 详情页安装区升级：skill 目录路径 / `npx` 命令 / MCP config JSON 片段，等宽芯片 + 一键复制 | 无 | 🟢 |
| F7 | **三微章信任体系** | glama（上轮手法 9 遗留） | 详情页头部：已扫描·5/5 项（`security.checks`）/ License（`license`，无则灰显「未知」）/ 活跃维护（`quality.pushed_at` 90 天内有提交）——**数据全部已有** | 无 | 🟢 |
| F8 | **相关推荐** | glama/raycast | 详情页底部「同类推荐」6 条：同 category 按 score 取 top | 无 | 🟢 |
| F9 | **SEO 补强** | 内容站标配 | ① item 页加 JSON-LD（SoftwareApplication）② 动态 OG 图（`next/og`，含名称/stars/score 徽章）③ sitemap 从 top 200 扩为分层（featured 全部 + 各分类 top N） | 无 | 🟡 |
| F10 | **修复两件套** | — | 移动端汉堡导航；隐私政策/服务条款页面（哪怕是简版） | 隐私/条款需用户定稿文案 | 🟢 |

### P1（P0 之后接着做）

| # | 功能 | 出处 | 落位与做法 | 依赖 | 成本 |
|---|---|---|---|---|---|
| F11 | **Trending / 新收录分区** | skills.sh/mcp.so | 市场页顶部「本周上升最快」（`star_history` 7 日增量，**数据已有**）+「新收录」（需 `added_at`）；首页 `MarketPreview` 可同步换源 | 管线改 index.json（见 §六） | 🟡 |
| F12 | **排序与信息扩展** | skillhub 等 | 排序加「最新收录」「最近更新」；列表显示命中总数；空结果页给推荐 | 同 F11 | 🟢 |
| F13 | **质量等级徽章 S/A/B** | skillhub | `score` 映射等级（如 ≥85 S / ≥70 A / ≥50 B），卡片与详情页展示；与现有 score.ts 天然衔接 | 无 | 🟢 |
| F14 | **Collections 合集页** | skillhub/skills.sh/raycast | 先静态策展：41 条 featured 组成「官方精选集」+ 2-3 个手工场景包（如「写作入门包」）；`/market/collections` 路由 | 策展内容 | 🟡 |
| F15 | **RSS/Atom feeds** | raycast | `/market/feed.xml?type=&cat=`，输出最新收录；footer 加链接 | 依赖 F11 的 `added_at` | 🟢 |
| F16 | **分类扩充 5 → ~12** | 竞品普遍 29-37 类 | 管线分类器扩类目（现 16,783/29,167 条无分类，覆盖率仅 42%）；分类页加 SEO 文案段 | 管线 | 🟠 |
| F17 | **yoskill:// deeplink 预注册** | raycast | 详情页「一键安装」按钮协议化为 `yoskill://install?id=`；未装客户端时优雅降级到下载/waitlist 引导页 | 桌面端上线后生效，网页侧先行 | 🟡 |

### P2（内容运营成熟 / 桌面端上线后）

| # | 功能 | 出处 | 说明 |
|---|---|---|---|
| F18 | Newsletter（每周新收录精选） | pulsemcp/skillhub | waitlist 的自然升级，复用 F1 的邮件通道 |
| F19 | 作者认领 + `yoskill.json` 元数据覆盖 | glama | 解决纯抓取信息陈旧问题；需验证流程 |
| F20 | 真实安装遥测排行榜 | skills.sh/smithery | 桌面端上线后再议；**必须 opt-in**，与「telemetry 默认 no-op」原则对齐 |
| F21 | 语义/混合搜索 | skillhub | 重投入，等搜索成为主要路径再做 |
| F22 | 账号 / 收藏 / 我的清单 | smithery/raycast | Phase 3（`/account` 已占位） |

## 五、设计优化清单

| # | 项 | 出处 | 说明 | 优先级 |
|---|---|---|---|---|
| D1 | 移动端汉堡导航 + 隐私/条款页 | 修复项 | 同 F10，设计与功能一起做 | P0 |
| D2 | 分类瓷砖 pastel 化 | 上轮手法 5（mcp.so） | 市场分类 chips 低饱和 pastel 底，不破 E 墨极骨架，翡翠仍只给交互 | P0 |
| D3 | 三微章视觉 | 上轮手法 9（glama） | 中性灰底 + 翡翠勾（成功徽章中性化约定），勿用整块绿色 | P0 |
| D4 | hero 双窗层叠 | 上轮手法 4（cursor） | 主屏 + 发现页双窗层叠；素材可用 `prototype/shots/` 现有截图 | P1 |
| D5 | 市场顶部 Trending 位 | 上轮手法 8（mcp.so） | 依赖 F11 数据；轮播或横滑卡 | P1 |
| D6 | 卡片新鲜度标识 | mcp.so「Added 3 days ago」 | New badge / 7 日 star 增量（+123 ↑），依赖 F11 | P1 |
| D7 | 类比教育区「为什么需要 yo-skill」 | 上轮手法 11（pulsemcp） | 「Skill 散落在 5 个助手 = 密码记在 5 张便签上」 | P2 |
| D8 | 顶部通知条 | 上轮手法 10（1password） | 预留发布位（如「Windows 版上线」），平时隐藏 | P2 |

## 六、前置管线改动（解锁上述功能的最小集）

仅需 2 项，均在 `tools/registry-pipeline`：

1. **`index.json` 每条补 `pushed_at` 与 `added_at`**：`pushed_at` 在 `items/*.json` 已有，提升进 index；`added_at` 若 `harvest-cache.json` 已有首次发现时间则回填，否则从改造日起增量记录。解锁：F11 Trending/新收录、F12 排序、F15 RSS、D6。
2. **分类器扩类目**（5 → ~12，提高覆盖率）：解锁 F16。

## 七、明确不做清单（竞品做了但我们不做）

- ❌ **LLM API 代理/转售**（skillhub 卖 Claude API Key）——偏离定位，引入计费与合规负担
- ❌ **Serverless MCP 托管**（smithery/glama hosted connector）——基础设施级投入，MVP 不做
- ❌ **付费墙 / Premium Stacks**（skillhub）——MVP 先验证单用户价值
- ❌ **广告/赞助位**（mcp.so Sponsors）——伤信任，无此商业模式
- ❌ **企业版分流 / 联系销售**（1password/cursor）——已冻结：不做团队版
- ❌ **绑定单一客户端的安装特权**（mcp.so → Cline）——与跨助手统一矛盾
- ❌ **默认开启的用户遥测**（skills.sh 匿名安装统计）——与「telemetry 默认 no-op」原则冲突；F20 若做必须 opt-in
- ❌ **首页 newsletter 订阅框**（pulsemcp）——北极星是 waitlist/下载不是订阅（维持上轮结论）

## 参考资料

| # | 站点/资料 | URL | 抓取日期 |
|---|---|---|---|
| 【1】 | SkillHub（含 /rankings /skill-stacks /docs/api） | https://www.skillhub.club/ | 2026-08-15 |
| 【2】 | claudeskills.info（含 /llms.txt /api/v1/meta /submit） | https://claudeskills.info/ | 2026-08-15 |
| 【3】 | skills.sh（含 /trending /hot /docs） | https://skills.sh/ | 2026-08-15 |
| 【4】 | Smithery（含 /docs/concepts/cli /servers/*） | https://smithery.ai/ | 2026-08-15 |
| 【5】 | Glama（含 /mcp/servers/*/score /mcp/faq） | https://glama.ai/mcp/servers | 2026-08-15 |
| 【6】 | mcp.so | https://mcp.so/ | 2026-08-15 |
| 【7】 | PulseMCP（含 /posts /clients /servers） | https://www.pulsemcp.com/ | 2026-08-15 |
| 【8】 | Raycast Store（含 deeplinks 文档 /store feed.xml） | https://www.raycast.com/store | 2026-08-15 |
| 【9】 | MCP 官方 Registry | https://registry.modelcontextprotocol.io/ | 2026-08-15 |
| 【10】 | Agent Skills 生态报告（agentman.ai） | https://agentman.ai/blog/agent-skills-ecosystem-report-2026 | 2026-08-15 |
| 【11】 | 市场对比（Totalum） | https://www.totalum.app/blog/agent-skills-marketplaces-2026 | 2026-08-15 |
| 【12】 | awesome-claude-skills（ComposioHQ，~13k⭐） | https://www.firecrawl.dev/blog/best-claude-code-skills | 2026-08-15 |
