# 官网功能迭代调研索引（2026-08-15）

> 本目录是 yo-skill 官网（`apps/web`）下一轮迭代的**功能补齐 + 设计优化**调研归档。

## 三句话总结

1. 对 8 个同类站点做功能级对标（2026-08-15 实地抓取）：**提交入口、目录 API/llms.txt、每助手安装路径、Collections、Newsletter、官方/发布商标签**是多家都有而我们没有的行业标配；其中前四个半天到一天就能补齐。
2. 我们手里已有但没利用的数据很多：`star_history`（30 天快照可直接算 Trending）、`install.kind`（remote 可直接出 hosted 标识）、`security.checks` / `license` / `pushed_at`（可直接拼三微章信任体系）——一大批功能是"读现有数据换个展示"，不需要管线改造。
3. 当前官网有一个洞级别的缺口：**`/api/waitlist` 只 console.log 不持久化**，邮箱在丢；另有移动端导航缺失、隐私/条款死链两个修复项。这三个比任何新功能都优先。

## 数据卡片

| 指标 | 值 |
|---|---|
| 对标站点数 | 8（skillhub / claudeskills / skills.sh / smithery / glama / mcp.so / pulsemcp / raycast store）+ 生态位扫描 |
| 功能矩阵维度 | 19 项功能 × 8 站 |
| 行业标配（≥3 家有、我们没有） | 6 项 |
| P0 功能项 | 10 项（含 3 项修复） |
| P1 / P2 功能项 | 7 / 5 项 |
| 设计优化项 | 8 项（3 项为上轮设计调研遗留） |
| 前置管线改动 | 2 项（index.json 加 `added_at`/`pushed_at`、分类 5→12） |

## 实施状态（2026-08-15 当日落地）

除后端依赖项（F1 waitlist 持久化、F18 newsletter、F19 作者认领、F20 遥测、F22 账号）外全部实施完成并通过 typecheck/lint/生产构建：

- **已落地**：F2 提交入口（footer 资源列）/ F3 llms.txt + `/api/v1/*` / F4 远程标识 / F5 Agent 路径矩阵（8 个无据 Agent 标「自动适配」，未编路径）/ F6 可复制芯片 / F7 三微章（License 徽章等管线回填后自动出现）/ F8 同类推荐 / F9 SEO 三件套（JSON-LD + 动态 OG + sitemap 分层 653 条）/ F10 修复两件套 / F11 近期上升区（stars-cache 攒够快照自动出现）/ F12 四档排序 / F13 S/A/B 等级徽章 / F14 合集页 / F15 RSS / F16 分类 5→10（管线已改，下次 CI 跑批落数据）/ F17 deeplink 预注册 / D2 pastel 分类 / D6 新鲜度标识
- **管线配套**：index.json 已扩充 `pushed_at`/`added_at`（幂等继承）/`remote`/`license` 四字段并跑完存量迁移；harvest-cache 新记录带 `ts`；GraphQL 富化加 `licenseInfo`
- **D4 已补做**（当日晚些时候）：hero 双窗层叠——主窗「已安装」（可交互）+ 斜后层叠的迷你「发现」窗（`discover-preview.tsx`，用市场真实头部 3 条 Skill，构建期注入；小屏隐藏后窗不挤占主窗；深浅双主题验收通过）
- **遗留**：F7 的 License 徽章与 F11 的 Trending 都依赖数据随每日 CI 积累，属「实现完成、等数据点亮」状态

## 文件

- `official_site_feature_roadmap.md` — 主报告：竞品功能矩阵、P0/P1/P2 功能清单（含落位/依赖/成本）、设计优化清单、明确不做清单、参考资料
- 上轮**视觉设计**调研（12 站四种首屏打法、12 手法）：`../20260813_100940_official_site_design_reference/`
