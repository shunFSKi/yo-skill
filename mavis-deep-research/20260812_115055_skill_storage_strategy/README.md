# Skill 存储位置竞品调研（通用目录 vs 应用目录）—— 索引

> 调研日期：2026-08-12
> 归档目录：`20260812_115055_skill_storage_strategy/`
> 上游依赖：产品设计定稿 V2 开放问题 4（收拢机制技术设计：复制 vs 链接）、统一视图原型（2026-08-12）
> 落地状态：**已定稿**（2026-08-12 用户确认模式 A/B，已写回 `yoskill_product_design.md` §4.2/§4.4/§九 与 AGENTS.md §三）

## 三句话总结

1. **行业已收敛到"中央库 + 分发到各 Agent"，没人做真相源二选一**：5 个 2025-2026 跨 Agent 管理器（Skills Manager / SkillDock / Skills Hub / Skill Desktop / one-skills-manager）全是集中库存一份、再同步/链接进各 Agent 目录；Skills Manager 直接打 "symlink or copy, your choice"——用户"让小白选通用目录还是应用目录"的直觉成立，但应翻译成"分发策略可选"，中央库（vault）永远做单一事实源。
2. **通用目录的行业标准位是 `~/.agents/skills/`**：Codex / Gemini / OpenCode / Kimi / Copilot / Replit 六个主流助手原生读它（零分发直接生效）；**Claude Code 是最大例外**只认 `~/.claude/skills/`；GitHub CLI `gh skill`、vercel `npx skills`、JFrog CLI 都把它当 cross-agent canonical 目录。
3. **工程策略 = symlink/junction 优先 + copy 兜底 + 记住每个 skill 的模式**：macOS 用 symlink（Claude/Roo 官方支持，但 Cursor 监听不吃目录软链→默认 copy）、Windows 用 junction（免管理员，限同卷、OneDrive 不同步→降级 copy）；vercel #1199 教训：更新不能静默改变安装模式。

## 关键数据卡片

**竞品分发策略三派**

| 派别 | 代表 | 中央目录 | 分发 | 用户可选 |
|---|---|---|---|---|
| 集中库派（GUI 全在这） | vercel skills CLI、Skills Manager、SkillDock、Skills Hub、Skill Desktop | `~/.agents/skills/` 或自家库 | symlink/junction 优先，copy 兜底 | ✅ 多家明确可选 |
| 直拷派 | iflytek/skillhub、JFrog CLI | 无 | 下载一次复制多份（企业可审计） | — |
| 插件派 | obra/superpowers | 无（各 Agent 插件缓存） | 各装各的，无同步 | — |

**各 Agent 认不认 `~/.agents/skills/`（全局通用目录覆盖率）**

| ✅ 原生认（零分发） | ❌ 不认（要桥接/副本） |
|---|---|
| Codex CLI（主推者）、Gemini CLI、OpenCode、Kimi Code、GitHub Copilot、Replit（仅项目级） | Claude Code、Cursor、Windsurf、Trae、Qwen Code、Cline、Roo Code、Continue、Aider（无 skills 概念） |

**链接/复制手段分平台风险速查**

| 手段 | macOS | Windows |
|---|---|---|
| symlink | 无权限门槛；Claude settings 前科、Cursor 监听失效 | 需管理员/开发者模式 |
| junction | — | 免管理员、目录级首选；限同卷、OneDrive 不同步 |
| copy | 绝对兼容 | 绝对兼容；代价是副本漂移 |
| hardlink | APFS 不支持目录硬链 | 仅文件级，排除 |

## 文件清单

- `README.md` —— 本索引
- `skill_storage_strategy.md` —— 主报告：竞品三派全景 + 各 Agent 加载路径对照表 + symlink/junction/copy 工程权衡 + 对 yo-skill 的模式 A/B 设计建议与 6 条工程纪律（41 条可追溯来源）

## 下一步建议

1. 报告 §5.2 的模式 A（共用一份，默认 `~/.agents/skills/` + 桥接）/ 模式 B（每助手一份副本）交用户确认后，写回 `yoskill_product_design.md` 开放问题 4 与 AGENTS.md 冻结结论；
2. 原型补两处 UI 验证小白话术：设置页全局默认 + skill 详情页"在哪些助手已生效、通过什么方式（共用/桥接/副本）"；
3. Tauri 侧技术验证：Rust 建 junction 权限实测、macOS symlink 进 `~/.claude/skills/` 实测、OneDrive 目录检测方法。
