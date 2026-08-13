# yo-skill 仓库聚合管线设计：Skill/MCP 源从哪来、怎么进商店

**调研日期**：2026-08-12（三路并行调研：Skill 侧来源 / MCP 侧来源 / 安全扫描与分类做法，40+ 来源当日实抓）
**文档目的**：把"发现"页（商店）的 Skill/MCP 内容从 36 条演示数据落地为真实供给——确定主源、设计"拉取 → 归一化 → 丰富化 → 安全扫描 → 分类打标 → 托管索引"的离线管线，给出 MVP 选品口径与工作量
**立场**：敢下判断、MVP 成本最低优先；与已冻结结论一致（先聚合后精选【产品设计 V2】、云端只存密文、供应链 pinned + sha256）
**输入**：`../20260811_161937_yoskill_product_design/` §4.3 + 下一步 #5（仓库聚合管线设计）

---

## 一、结论速览

| 问题 | 结论 |
|---|---|
| 源从哪来 | **聚合公开目录，不自己生产**（产品设计已冻结：先聚合后精选）。本文给出落地架构 |
| Skill 主源 | **claudeskills.info**（公开免 key JSON API + CORS，`type=skill&featured=1` 直接给 383 条人工精选【4】）+ **官方种子仓库 git clone**（anthropics/skills 17 条 + vercel-labs/agent-skills 9 条【3】【7】） |
| MCP 主源 | **官方 MCP Registry**（`/v0/servers` 免认证，schema 标准化：`packages/remotes/environmentVariables` 机器可读，可直接生成一键安装配置【13】【15】）+ **Glama 增强层**（补 license / official 标记 / env schema【17】） |
| 安全扫描 | 主流市场（claudemarketplaces / Smithery / mcp.so / PulseMCP）**都不做目录级安全扫描**【11】【18】【21】——这是 yo-skill 的差异化空位。MVP 用 8 项静态规则，不执行 server |
| 分类打标 | 各站分类是技术导向且互不统一 → 必须自建映射：**关键词规则打底 + LLM 兜底**，输出到商店 6 场景分类（推荐/写作/编程/设计/办公/生活） |
| 托管形态 | **静态 JSON 文件**（index.json + items/*.json），GitHub 仓库 + jsDelivr CDN 零成本起步；App 启动时 + 每 24h 拉取，本地缓存兜底。**正文分发**（§3.5）：配方 + 指纹自维护，热门 ~100 条精选镜像 CDN，长尾 pin commit 回源，MCP 走 npm/pypi 无需镜像 |
| MVP 规模 | Skill ~400 条精选 + MCP ~150 条精选；一人约 2 周落地 |

---

## 二、来源盘点（当日实测）

### 2.1 SKILL.md 规范与生态位

- 权威规范 = `agentskills.io/specification`（Agent Skills 开放标准）【1】，规范仓库 agentskills/agentskills（Apache-2.0，⭐24,181）【2】。frontmatter 必填 `name`（小写连字符 ≤64 字符）+ `description`（≤1024 字符），可选 `license` / `compatibility` / `metadata` / `allowed-tools`（实验性）
- 生态采纳已核实：Claude Code / Codex / Gemini CLI / Cursor / Windsurf / Copilot / Kimi Code 等主流助手全支持，vercel-labs/skills README 列出 70+ agent 并把安装路径统一映射到 `~/.agents/skills/`【6】——与 yo-skill 存储定稿（行业标准位）一致

### 2.2 Skill 侧来源：规模 / 获取方式 / 协议风险 / 处置

| 来源 | 规模（2026-08-12） | 获取方式 | 协议风险 | 处置 |
|---|---|---|---|---|
| claudeskills.info | meta API：14,989 items，其中 skill 11,352；首页自称 42,816+ | **公开 JSON API，CORS `*`，无需 key**；`featured=1` 给 383 条精选；38 个 category【4】 | 返回源仓库链接，建议回源安装 | **主源** |
| anthropics/skills | 17 条 | git clone / Contents API | 13 条 Apache-2.0 可自由转载；docx/pdf/pptx/xlsx 4 条 source-available 再分发受限【3】 | **种子**（4 条只索引不缓存） |
| vercel-labs/agent-skills | 9 条 | git clone | MIT【7】 | **种子** |
| skills.sh（Vercel） | 第三方称索引 918,396（未核实）；curated 342 | API 结构最好（leaderboard/curated/全文），**但必须 Vercel OIDC token**，非 Vercel 部署不可用【5】 | 上游公开仓库文件 | **备选**（留 Vercel 代理接口） |
| SkillsMP | 首页自称 2,553,338 | 有 API 但需 key（匿名 50 req/天）【8】 | 聚合公开 GitHub 数据 | 备选 |
| ComposioHQ/awesome-claude-skills | 仓库内 864 个 SKILL.md（⭐72,345） | git clone 扫描 | **仓库无 LICENSE（license: null），直接复制内容风险高**【9】 | 只索引不缓存 |
| VoltAgent/awesome-agent-skills | README 列 1000+（⭐30,104） | README 解析 | MIT，仅索引不托管【10】 | 链接源 |
| claudemarketplaces.com | 未披露 | **无公开 API**（404 已核实），只能爬 HTML【11】 | 低 | MVP 排除 |
| CodeAgent Directory | 1,400+（推断） | 无 API，爬 HTML；页面嵌 SKILL.md 全文【12】 | 缓存原文需上游授权 | MVP 排除 |
| SkillHub / agentskill.sh / awesomeskills.dev | 9,500+ / 275,000+ / 30,053（各自称） | 需 key 或无 API | 商业 ToS | 排除 |

**关键判断**：全网不存在"完全开放、可下载全量 JSON"的 Skill 注册表。最实用的组合 = claudeskills.info 精选 + 官方种子 + GitHub 元数据自丰富。**管线第一公里只拉元数据，正文/脚本在用户触发安装时再回源获取**——既省扫描成本，又避开再分发版权风险。

### 2.3 MCP 侧来源：规模 / 获取方式 / 字段质量 / 处置

| 来源 | 规模（2026-08-12） | 获取方式 | 字段质量（实测） | 处置 |
|---|---|---|---|---|
| **官方 MCP Registry** | 实测分页拉取 3,300+ 条未跑完；外部快照 ~9,652 latest（2026-05）【13】【32】 | `/v0/servers` 免认证，cursor 分页 + `updated_since` 增量；schema freeze 于 v0.1【14】【15】 | 有 `packages` 24%（npm 82%）、有 `remotes` 80%、有 `repository` 57%、约 29.6% 需凭据（env/header 声明完整） | **主源** |
| Glama | 页面显示 71,464 servers | **公开 API 免认证**，cursor 分页【17】 | 100% 有 repo URL、62% 有 license、70% 有 env schema、9% official 标记；**无安装命令** | **增强层**（按 repository.url 关联） |
| Smithery | 实测 totalCount 7,902 | API 裸调成功（文档写要 Authorization）【18】 | 抽样 100% remote 托管、全部带 configSchema；专有格式非标准 server.json | 备选 |
| PulseMCP | ~6,975（第三方） | 字段同官方 + 增强，但**需 B2B 申请 key**【19】 | 高 | MVP 排除 |
| modelcontextprotocol/servers | ⭐89,486 | 已**不再是社区清单**：只留 7 个 reference servers（Fetch/Filesystem/Git/Memory 等）【16】 | — | reference 种子 |
| mcp.so / mcpservers.org / awesome-mcp-servers | 大 | 无 API / Cloudflare 拦截 / 人工 markdown【20】【21】 | 低 | MVP 排除 |

**关键判断**：官方 Registry 是**唯一同时提供标准 `packages`/`remotes`/`environmentVariables` 结构的来源**，可直接生成 `{command, args, env}` 或 `{url, headers}` 一键配置。但三条纪律必须记住：① 仍处 preview，官方明说"可能发生数据重置"→ 本地必须持久快照；② 字段覆盖不全（24% 有包、18% 有图标）→ 必须 Glama 增强；③ 80% 是远程 server → "一键安装"很多情况下 = "填 URL + 集中管 API Key"，正好落在 yo-skill 钥匙管理卖点上。

### 2.4 安全背书现状：全行业的空位

- claudemarketplaces：FAQ 明说质量靠 install count + stars + 垃圾过滤，**无单条审计**【11】；Smithery 只有人工 Verified（17%）【18】；mcp.so / PulseMCP / CodeAgent 均无安全扫描【12】【19】【21】
- 可复用的开源扫描器（不要自己造轮子）：**mcp-shield**（npm 包 7 项检查 + 0-100 评分【23】）、**mcp-audit**（静态配置扫描 + SARIF + rug-pull 基线 diff【26】）、**Cisco mcp-scanner**（YARA + LLM judge，有 static 子命令【24】）、**Invariant mcp-scan**（tool pinning 防 rug pull【22】）；Semgrep `p/secrets` 补硬编码凭据；`npm audit` / `pip-audit` / OSV 补依赖 CVE。Snyk agent-scan 默认要启动 stdio server，离线静态场景不适用【25】
- 攻击面（决定扫什么）：SKILL.md prompt injection【28】【29】、MCP tool poisoning（tool description 里藏用户不可见指令【27】）、rug pull（审核后更新变恶意【30】）、env 凭据窃取、typosquatting 供应链

### 2.5 竞品分发模式对比（2026-08-12 补充核查，2026-08-13 补 SkillHub / Happycapy）：全量自托管仅一家

| 模式 | 竞品 | 机制 | 对 yo-skill |
|---|---|---|---|
| 纯索引跳转 | claudemarketplaces【11】、Glama【17】、mcp.so【21】、awesome 清单【20】、ChatWise【34】 | 只给元数据/链接，安装靠用户自己复制 JSON 或跑命令 | 不做——小白劝退 |
| 原文镜像（展示层） | CodeAgent Directory【12】、SkillsMP【8】 | 网页嵌 SKILL.md 全文/文件树，但只是"展示"镜像，安装仍回源 | 不做——版权风险大于收益 |
| **配方 + 回源**（主流） | 官方 MCP Registry【13】、Cline 市场【35】、Cursor deeplink【36】、Cherry Studio / MCPHub【37】 | 清单与配方自己维护，payload 回源（clone 构建 / npx / uvx）；Cline 为人工审核 curated catalog | **我们的主路线** |
| 原文镜像（分发层，仅热门） | **skills.sh（Vercel）**【38】 | 仅 allowlisted 热门仓库走 Vercel 缓存快照（`skills.sh/api/download`），其余全部实时 git clone 回源 | **与我们 §3.5 同构——热门镜像 + 长尾回源** |
| 真托管 | Smithery【18】【39】 | Docker 容器真托管别人 server + Gateway 代理 + verified/scanPassed 分级 | MVP 不碰（重资产）；远程代理是 V2 付费点候选 |
| **Hosted registry**（全量自托管） | SkillHub【40】 | 数据 = GitHub 生态爬取（条目 slug 为「作者-仓库-技能名」，详情页标注 Content curated from original sources）+ 作者 CLI push/publish 双通道；自家 API 发文件直写各 agent 目录（纯 copy）；加 AI 评分 + embeddings 语义搜索增值层；Premium Stacks 付费墙 | 不做——无 LICENSE 全量搬运的版权风险 + 重运营，靠作者授权通道与商业 ToS 兜底才玩得转；**可抄**：AI 评分徽章、语义搜索、作者发布通道是 V2 候选 |
| **平台内置**（walled garden） | Happycapy Skill Store【41】 | 数据 = GitHub 生态爬取（连 anthropics/skills 的模板占位符都原样收录，无逐条审核）+ 自研模型包装技能（Nano Banana / Seedance 等）+ LLM 批量合成条目（「Automate and integrate X workflows」模板腔）；**技能只装进自家云端沙盒跑，不向本地分发**；订阅制（Pro/Max），目录规模 17万→32万→215万 系营销堆量 | 不正面竞争——它管不到用户本地机器上的 agent，印证「本地统一管理」是空位；可抄：分类 taxonomy、Featured 编辑推荐位；数量不是壁垒，质量分级才是 |

三条直接启示：① **一键安装的核心 = 配方本地化**（Cline/Cherry/MCPHub 都把 npx/uvx 封装成按钮，没有竞品让小白碰命令）；② **竞品回源全部装"最新版"，rug pull 窗口全开**——我们的 commit pin（装到的 = 扫过的）比所有竞品都严一层；③ **审核分级是行业惯例**（Cline 人工审核、Smithery verified + scanPassed、Registry 命名空间验证），"官方/精选/社区"分级 + "已扫描"徽章有先例，但目录级静态扫描仍无人做全。

---

## 三、管线架构

**形态**：离线脚本，不是服务。放未来 monorepo 的 `tools/registry-pipeline/`（Node 22 + TypeScript——JSON/GitHub API 生态最顺手，与 App 技术栈无关），手动或每日 cron 跑一次，产物是静态 JSON。

```
┌─ 来源适配器 fetchers/ ─────────────────────────────┐
│ skill-claudeskills   (公开 API，featured + 分页)    │
│ skill-official-seeds (git sparse clone × 2 仓库)   │
│ mcp-official-registry(/v0/servers，updated_since)  │
│ mcp-glama-enrich     (按 repository.url 关联)      │
└──────────────┬─────────────────────────────────────┘
               ▼
      ① 归一化 normalize → 统一条目 schema（§3.1）
               ▼
      ② 丰富化 enrich：GitHub API 补 stars / pushed_at / license
               ▼
      ③ 安全扫描 scan：8 项静态规则 → score + 分级（§3.2）
               ▼
      ④ 分类打标 tag：关键词规则 → LLM 兜底（§3.3）
               ▼
      ⑤ 人工精选队列 review：pending / uncategorized 待审
               ▼
      产物 dist/：index.json + items/{id}.json + changelog.json
               ▼
      托管：GitHub repo + jsDelivr CDN（MVP 零成本）→ 后续 R2
               ▼
      App：启动时 + 每 24h 拉取（ETag 增量），本地缓存兜底
      网站：同一份 dist/ 渲染公开发现站（2026-08-13 用户确认，见下）
```

**双端共用决定（2026-08-13 用户确认）**：用户确认 ① 做公开网站 ② App 内置 skillhub 式搜索安装——两者都由同一份聚合索引驱动：网站 = `dist/` 的公开渲染（浏览/搜索/详情/「用 yo-skill 安装」引导下载，兼作 SEO 获客入口），App 发现页 = 内置快照 + CDN 增量更新。**注意分层：聚合的是索引与元数据（必要），不是 payload 自托管（不做）**——SkillHub / Happycapy 的全量自托管模式（§2.5）与我们的 LICENSE 纪律冲突，索引收录不设 LICENSE 门槛（行业惯例，纯索引派均如此），但安装仍走配方 + commit pin 回源、镜像仍限热门精选。搜索分层：MVP 用静态索引 + 客户端搜索（Fuse.js / Pagefind），语义搜索（SkillHub 的 embeddings 路线）留作 V2。

### 3.1 统一条目 schema

```jsonc
{
  "id": "skill:claudeskills/xhs-copywriter",        // type:source/slug
  "type": "skill | mcp",
  "name": "小红书文案助手",
  "description": "……",                              // 来源 description，原样保留
  "author": "xxx",
  "source": { "registry": "claudeskills", "url": "…", "repo": "github.com/a/b" },
  "license": "MIT | Apache-2.0 | null",             // null 只索引不缓存
  "install": {                                      // 一键安装的机器可读描述
    "kind": "skill-dir | npm | pypi | remote",
    "command": "npx", "args": ["-y", "@x/mcp-y"],
    "env": [{ "name": "API_KEY", "required": true, "secret": true }],
    "remote_url": null
  },
  "quality": { "stars": 1234, "pushed_at": "…", "installs_estimate": 5200 },
  "security": { "score": 86, "checks": ["pass","pass",…], "scanned_at": "…" },
  "tags": { "category": "写作", "confidence": 0.92, "secondary": ["copywriting"] },
  "status": "curated | pending | blocked"
}
```

纪律：每条必须能回溯到源 URL（可审计）；`installs_estimate` 统一标 estimate（各站口径不一：Smithery useCount / PulseMCP 估算访客 / CodeAgent 安装数）。

### 3.2 安全扫描：8 项静态规则（不执行 server）

| # | 检查项 | 命中处置 |
|---|---|---|
| 1 | 描述层注入：`SKILL.md` / tool description 含 `ignore previous` / `do not tell` / `<IMPORTANT>` / 零宽字符 / RTL override / 可疑 Base64 | **blocked**（高危） |
| 2 | 敏感路径读取：`~/.ssh` `~/.aws` `.env` `/etc/passwd` 浏览器 Cookie、各助手配置文件 | **blocked** |
| 3 | 外部渗出：`curl/wget/fetch/requests` 向非官方域名发数据，或描述诱导上传对话历史 | 降分 + pending |
| 4 | 危险执行：`eval` / `Function` / `child_process` / `os.system` / `shell=True` | 降分 |
| 5 | 硬编码凭据：Semgrep `p/secrets` 类规则匹配 key/token/private key | **blocked** |
| 6 | 配置风险：过度索取 env、HTTP 非 HTTPS、token 放 URL query | 降分 |
| 7 | 依赖 CVE：`npm audit` / `pip-audit` / OSV | 按严重度降分 |
| 8 | 供应链：包名与知名包 Levenshtein 过近、发布 <30 天、install script 拉远程代码 | 降分 + pending |

评分 100 制（借鉴 mcp-shield），**≥70 才给商店"已扫描"徽章**；<70 进人工队列；命中 1/2/5 直接 blocked 不出库。实现上复用现成扫描器（§2.4），yo-skill 只做规则编排与评级。
**Rug pull 防线**：每条记录 tool description / SKILL.md 的 sha256；管线每次跑 diff，变了就降级重扫——与存储定稿"更新不得静默改模式"同一纪律。
文案纪律：徽章只说"**已扫描**"，永远不说"安全"——扫描是背书不是保证。

### 3.3 分类打标：规则打底 + LLM 兜底

各站分类是技术导向（Developer Tools / Databases…），yo-skill 是场景导向（推荐/写作/编程/设计/办公/生活），直接映射必然冲突（Productivity → 办公还是生活？）。方案：

- **输入**：名称 + 描述 + 来源站分类/tag + README 前 500 字
- **第一层 关键词规则**：写作（write/doc/blog/copy/note）、编程（code/dev/api/debug/test/git/database/deploy）、设计（image/video/ui/figma/art/generate image）、办公（calendar/email/task/spreadsheet/pdf/meeting/slide）、生活（weather/travel/recipe/fitness/home/music/movie）；推荐 = official / verified / featured / stars>1000 + 人工精选位
- **第二层 LLM 兜底**：多类命中或置信 <0.6 时调小模型（4o-mini 级），只输出 `{category, confidence, reason}`；<0.5 进"待审"
- **验收**：先拿 1000 条样本测规则 vs LLM 一致性，再定关键词权重；`secondary` 保留原站分类做筛选 tag

### 3.4 产物与托管

- `index.json`：轻量列表（500 条 × ~1KB），商店页直接渲染；`items/{id}.json`：详情（README 摘要、install、security 明细）；`changelog.json`：新增/下架/重扫记录
- `schema_version` + `generated_at`；App 端 ETag / If-Modified-Since 增量拉取
- 托管 MVP = GitHub 公开仓库 + jsDelivr（零成本、自带 CDN 与版本历史）；量大了再迁 R2。**产物全是公开数据，与"云端只存密文"的用户数据纪律不冲突**（vault 同步是另一条线）
- App 侧：启动时 + 每 24h 拉一次；失败用上次缓存；商店页 36 条演示数据届时整体替换

### 3.5 正文分发：不全量镜像——"配方 + 指纹"自维护，热门精选镜像，长尾 pin commit 回源

镜像 vs 回源的本质是三件事的权衡：**版权责任、维护成本、安装可靠性**。决策（2026-08-12 用户确认方向）：

- **我们维护的是"配方"**：index 里每条记录源仓库 + **扫描时的 commit sha** + SKILL.md / tool 描述 sha256 基线。这是 Homebrew formula 模式——配方是我们的，payload 不一定
- **长尾回源，pin commit**：安装时按 index 里的 commit 拉 `codeload.github.com/{owner}/{repo}/archive/{commit}.zip`，装到的就是扫过的版本，**rug pull 窗口天然关闭**——不需要为安全做全量镜像；桌面端只下载解压，不依赖 git
- **热门精选镜像**：featured 头部 ~100 条（仅 MIT/Apache 等 license 干净的）把 zip 镜像到自有 CDN。理由：① 目标用户在国内，GitHub 直连不稳定，热门条目安装成功率必须保底；② "扫过即所得"最强形态；③ 源仓库被删时热门条目不死。本质是"缓存热门"，不是"维护仓库"
- **MCP 侧不需要镜像**：本地包走 npm/pypi（它们自己就是镜像仓），版本 pin 即可；远程 server 没有 payload
- **源失效处置**：回源条目 404 → 标记下架；镜像条目继续可装；管线每次跑顺带 HEAD 检查源存活

三条纪律：无 LICENSE / source-available 一律不镜像（镜像 = 我们成为分发者）；镜像清单与 license 快照存仓库可审计；镜像版本跟随精选更新，**追的是"扫过的版本"，不是最新版**

---

## 四、MVP 选品口径与工作量

**Skill（目标 ~400 条）**：claudeskills featured 383 + 官方种子 26 → 去重、剔除 license 不明与扫描 blocked → 人工精选位置顶
**MCP（目标 ~150 条）**：官方 Registry 过滤（有 packages 或 remotes + 有 repository 可审计 + 主流 registryType）→ Glama official / license 优先 → 排除无安装方式、无源码、敏感操作未声明 auth 的

| 工作项 | 估时（1 人） |
|---|---|
| 4 个来源适配器 | 2-3 天 |
| 归一化 + GitHub 丰富化 | 1 天 |
| 安全扫描编排（复用现成扫描器） | 2-3 天 |
| 分类打标（含 1000 条一致性测试） | 1-2 天 |
| 索引产物 + 托管 + App 拉取联调 | 2 天 |
| 精选队列运营口径 | 持续，每周 1-2h |

**合计约 2 周**；前置依赖 = 工程骨架先立（`tools/registry-pipeline/` 有地方放）。

## 五、风险与纪律

- **版权**：只转载元数据与链接；正文默认回源（pin commit），仅 license 干净（MIT/Apache 等）的热门精选做镜像——镜像 = 我们成为分发者，无 LICENSE（Composio 864 条）/ source-available（官方 4 条）一律不镜像，镜像清单与 license 快照存仓库可审计
- **官方 Registry preview 数据重置**：本地持久快照每次全量留档，重置后可比对恢复
- **扫描误伤**：blocked 必须给人工复核通道，不让误杀拦掉优质条目
- **供应链纪律延伸到管线自身**：管线依赖同样 pinned version + sha256；管线本身不产任何遥测
- **不把鸡蛋放一个源**：claudeskills.info 若停服，SkillsMP / skills.sh（Vercel 代理）可递补；适配器层隔离这个不确定性

## 六、下一步

1. 主源组合与 MVP 口径交用户确认（本文 §一表）
2. 工程骨架创建 `tools/registry-pipeline/`，先跑通 claudeskills featured 383 条 → index.json 最小闭环
3. 1000 条样本做规则 vs LLM 打标一致性测试
4. 扫描规则集在 Composio 864 条上试跑（只扫不缓存），校准阈值
5. 商店页接真索引 JSON，替换 36 条演示数据

---

## 参考资料

| # | 来源 | 链接 | 抓取日期 |
|---|---|---|---|
| 【1】 | Agent Skills 规范 | https://agentskills.io/specification | 2026-08-12 |
| 【2】 | Agent Skills 规范仓库（Apache-2.0） | https://github.com/agentskills/agentskills | 2026-08-12 |
| 【3】 | Anthropic 官方 skills（17 条） | https://github.com/anthropics/skills | 2026-08-12 |
| 【4】 | Claude Skills Hub（公开 API + featured 精选；API 文档见其 /llms.txt） | https://claudeskills.info | 2026-08-12 |
| 【5】 | skills.sh（Vercel，OIDC 鉴权；API 文档 /docs/api） | https://skills.sh | 2026-08-12 |
| 【6】 | vercel-labs/skills CLI（70+ agent 映射行业标准位） | https://github.com/vercel-labs/skills | 2026-08-12 |
| 【7】 | vercel-labs/agent-skills（9 条，MIT） | https://github.com/vercel-labs/agent-skills | 2026-08-12 |
| 【8】 | SkillsMP（API 需 key；/docs/api） | https://skillsmp.com | 2026-08-12 |
| 【9】 | ComposioHQ/awesome-claude-skills（864 条，无 LICENSE） | https://github.com/ComposioHQ/awesome-claude-skills | 2026-08-12 |
| 【10】 | VoltAgent/awesome-agent-skills（MIT 索引） | https://github.com/VoltAgent/awesome-agent-skills | 2026-08-12 |
| 【11】 | claudemarketplaces.com（无公开 API；FAQ 质量口径） | https://claudemarketplaces.com | 2026-08-12 |
| 【12】 | CodeAgent Directory（嵌 SKILL.md 全文） | https://www.codeagent.directory | 2026-08-12 |
| 【13】 | 官方 MCP Registry API | https://registry.modelcontextprotocol.io/v0/servers | 2026-08-12 |
| 【14】 | 官方 Registry 仓库（preview / v0.1 freeze 状态说明） | https://github.com/modelcontextprotocol/registry | 2026-08-12 |
| 【15】 | server.json Schema（2025-12-11） | https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json | 2026-08-12 |
| 【16】 | modelcontextprotocol/servers（仅 7 个 reference） | https://github.com/modelcontextprotocol/servers | 2026-08-12 |
| 【17】 | Glama MCP API（免认证） | https://glama.ai/api/mcp/v1/servers | 2026-08-12 |
| 【18】 | Smithery API（实测裸调成功；Verified 17%） | https://api.smithery.ai/servers | 2026-08-12 |
| 【19】 | PulseMCP API 文档（B2B key） | https://www.pulsemcp.com/api/docs/v0.1 | 2026-08-12 |
| 【20】 | punkpeye/awesome-mcp-servers（人工 markdown） | https://github.com/punkpeye/awesome-mcp-servers | 2026-08-12 |
| 【21】 | mcp.so（Cloudflare 拦截，无 API；分类 /categories） | https://www.mcp.so | 2026-08-12 |
| 【22】 | Invariant mcp-scan（tool pinning 防 rug pull） | https://invariantlabs-ai.github.io/docs/mcp-scan/ | 2026-08-12 |
| 【23】 | mcp-shield（7 项检查 + 百分制） | https://github.com/BuildWithAbid/mcp-shield | 2026-08-12 |
| 【24】 | Cisco AI Defense mcp-scanner（static 模式） | https://github.com/cisco-ai-defense/mcp-scanner | 2026-08-12 |
| 【25】 | Snyk agent-scan（需执行 server，离线不适用） | https://github.com/snyk/agent-scan | 2026-08-12 |
| 【26】 | mcp-audit（SARIF + rug-pull 基线 diff） | https://github.com/adudley78/mcp-audit | 2026-08-12 |
| 【27】 | Invariant Labs：MCP Tool Poisoning Attacks | https://invariantlabs.ai/blog/mcp-security-notification-tool-poisoning-attacks | 2026-08-12 |
| 【28】 | Datadog Security Labs：Skill 供应链风险 | https://securitylabs.datadoghq.com/articles/malicious-skills-supply-chain-risks-in-coding-agents-with-dynamic-context/ | 2026-08-12 |
| 【29】 | CSA：SKILL.md Agent Context Poisoning | https://labs.cloudsecurityalliance.org/research/csa-research-note-skill-md-agent-context-poisoning-20260506/ | 2026-08-12 |
| 【30】 | Stytch：MCP Rug Pull | https://stytch.com/blog/mcp-security/ | 2026-08-12 |
| 【31】 | Semgrep（p/secrets 规则；semgrep/mcp） | https://github.com/semgrep/mcp | 2026-08-12 |
| 【32】 | Digital Applied：MCP 生态统计（Registry 规模快照 2026-05） | https://www.digitalapplied.com/blog/mcp-adoption-statistics-2026-model-context-protocol | 2026-08-12 |
| 【33】 | The AI List：MCP 目录（2,798 servers / 54 类） | https://theail.ist/mcps | 2026-08-12 |
| 【34】 | ChatWise Docs / Tools（手动 JSON + mcp-add deeplink） | https://docs.chatwise.app/tools | 2026-08-12 |
| 【35】 | cline/marketplace（PR 提交、GitHub Pages catalog、curated；安装回源见 cline/mcp-marketplace README 与 issue #1910） | https://github.com/cline/marketplace | 2026-08-12 |
| 【36】 | Cursor Docs / MCP Install Links（deeplink 配置注入） | https://cursor.com/docs/mcp/install-links | 2026-08-12 |
| 【37】 | Jeamee/MCPHub-Desktop（社区清单 + npx/uvx 回源；Cherry Studio 见 docs.cherry-ai.com） | https://github.com/Jeamee/MCPHub-Desktop | 2026-08-12 |
| 【38】 | vercel-labs/skills issue #1010（BLOB_ALLOWED_OWNERS + skills.sh/api/download 缓存快照，非 allowlist 回源 git clone） | https://github.com/vercel-labs/skills/issues/1010 | 2026-08-12 |
| 【39】 | Smithery Docs / Publish（BYO hosting + Gateway 代理；Docker 真托管见 madosh/MCP-ITSM README 架构图） | https://smithery.ai/docs/build/publish | 2026-08-12 |
| 【40】 | SkillHub 官网 + @skill-hub/cli npm 页（GitHub 生态爬取 + 作者 push/publish 双通道，hosted registry skillhub.club/api/v1，AI 评分/语义搜索，Premium Stacks 付费墙；爬取证据见条目详情页「Content curated from original sources」，如 /skills/obra-superpowers-systematic-debugging 标注 Source: obra/superpowers） | https://www.npmjs.com/package/@skill-hub/cli | 2026-08-13 |
| 【41】 | Happycapy Skill Store（2,154,976 条索引；产品本体 = 云端 agent-native computer，Claude Code / OpenClaw 驱动，订阅制；背景见小宇宙播客《HappyCapy伊娜：云端智能体电脑》「Skill 就是新的 APP，Skill Store 就是新的 App Store」） | https://happycapy.ai/skills | 2026-08-13 |
