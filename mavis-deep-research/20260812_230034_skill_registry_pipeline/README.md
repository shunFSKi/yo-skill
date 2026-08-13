# yo-skill 仓库聚合管线设计 · README

**调研周期**：2026-08-12（三路并行调研子代理：Skill 侧来源 / MCP 侧来源 / 安全扫描与分类做法）
**调研目的**：回答"商店的 Skill/MCP 源从哪来"——确定主源组合，设计"拉取 → 归一化 → 丰富化 → 安全扫描 → 分类打标 → 托管索引"离线管线，给出 MVP 选品口径与工作量
**调研立场**：敢下判断、MVP 成本最低优先、所有来源当日实抓核实（未核实项已标注）

---

## 三句话总结

**主源定了**：Skill 用 claudeskills.info（公开免 key API + 383 条 featured 精选）+ 官方种子仓库；MCP 用官方 Registry（唯一 schema 标准化、可直接生成一键安装配置的来源）+ Glama 增强层补 license/official 标记。

**安全扫描是空位**：claudemarketplaces / Smithery / mcp.so / PulseMCP 全都不做目录级安全扫描——yo-skill 的 8 项静态规则（不执行 server，复用 mcp-shield / mcp-audit / Cisco mcp-scanner 编排）就是差异化卖点，正好喂给商店"已扫描"徽章。

**不全量镜像**：自维护"配方 + 指纹"（commit pin + sha256 基线），热门 ~100 条精选镜像 CDN 保底国内安装，长尾回源（装到的 = 扫过的，rug pull 窗口天然关闭）；MCP 走 npm/pypi 天然无需镜像。

**MVP 两周可落地**：Skill ~400 条 + MCP ~150 条精选，产物是静态 JSON（GitHub + jsDelivr 零成本托管），App 定时拉取替换商店 36 条演示数据；前置依赖是工程骨架先立。

## 关键数据卡片

| 决策点 | 结论 | 依据（2026-08-12 实抓） |
|---|---|---|
| Skill 主源 | claudeskills.info | 公开 JSON API、CORS `*`、无需 key；skill 11,352 条 + featured 383 条 |
| Skill 种子 | anthropics/skills 17 + vercel-labs/agent-skills 9 | git clone 解析 frontmatter；4 条 source-available 只索引 |
| MCP 主源 | 官方 MCP Registry `/v0/servers` | 免认证、cursor 增量；~9,652 latest（外部快照）；packages 24% / remotes 80% / 需凭据 29.6% |
| MCP 增强 | Glama API | 71,464 servers、免认证；license 62% / env schema 70% / official 9% |
| 安全扫描 | 8 项静态规则，≥70 分给"已扫描"徽章 | 全行业无目录级扫描；工具复用 mcp-shield / mcp-audit / mcp-scanner |
| 分类打标 | 关键词规则 + LLM 兜底 → 6 场景分类 | 各站分类技术导向且互不统一，直接映射不可行 |
| 托管 | 静态 JSON，GitHub + jsDelivr | 公开数据，与"云端只存密文"用户数据纪律不冲突 |
| 正文分发 | 配方 + 指纹自维护；热门 ~100 条镜像 CDN；长尾 pin commit 回源 | Homebrew formula 模式；commit pin 天然关闭 rug pull 窗口；无 LICENSE 一律不镜像 |
| 竞品验证 | 无一家做全量镜像：主流 = 配方+回源（官方 Registry / Cline / Cursor），skills.sh 仅热门 allowlist 缓存快照——与我们路线同构；竞品回源全装最新版，commit pin 是我们多出的严层 | 补充核查：Cline 市场 / skills.sh 源码 / Smithery 托管 / Cursor deeplink |
| MVP 规模/工期 | Skill ~400 + MCP ~150；1 人约 2 周 | 前置：工程骨架（`tools/registry-pipeline/`） |

**被排除的源**：skills.sh（结构最好但锁 Vercel OIDC，留代理接口作备选）、SkillsMP（要 key）、Composio 864 条（无 LICENSE 只索引）、mcp.so / PulseMCP（无 API / 要 B2B key）、一切只能爬 HTML 的站。

## 文件清单

- `README.md` —— 本索引
- `skill_registry_pipeline.md` —— 主报告：来源盘点（Skill 10 个 / MCP 7 个逐个核实）+ 五段管线架构 + 统一条目 schema + 8 项扫描规则 + 分类打标方案 + MVP 口径与工期（33 条可追溯来源）

## 下一步建议

1. 主源组合与 MVP 口径交用户确认（主报告 §一表）——确认后写回产品设计文档"下一步 #5"并标记已定稿
2. 工程骨架创建 `tools/registry-pipeline/`，先跑通 claudeskills featured 383 条 → index.json 最小闭环
3. 1000 条样本做规则 vs LLM 打标一致性测试；扫描规则集在 Composio 864 条上试跑校准（只扫不缓存）
4. 商店页接真索引 JSON，替换 36 条演示数据
