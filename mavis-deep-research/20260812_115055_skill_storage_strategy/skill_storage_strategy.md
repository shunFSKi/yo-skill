# Skill 存储位置竞品调研：通用目录 vs 应用目录

**调研日期**：2026-08-12
**调研目的**：回应"skill 应该可以让用户选择统一管理到通用目录或者应用目录"的产品设想——查清竞品怎么分发 Skill 文件、各 Agent 原生认哪些目录、symlink/copy 的工程坑，为 yo-skill 的收拢机制设计定方案
**立场**：本报告服务产品设计定稿 V2 遗留的开放问题"收拢机制技术设计：保险库单一事实源 → 各 Agent 目录的分发写回策略（复制 vs 链接）"【16】。结论敢下判断，事实全部可追溯

---

## 一、三句话总结

1. **"中央库 + 可分发到各 Agent"已是跨 Agent Skill 管理器的行业收敛形态**：2025-2026 年涌现的 5 个 GUI/CLI 管理器（Skills Manager / SkillDock / Skills Hub / Skill Desktop / one-skills-manager）全部是"集中库存一份，再同步/链接进各 Agent 目录"，其中 Skills Manager 直接打出 "symlink or copy, your choice"——用户设想的"让小白选"与竞品方向一致，但**竞品没有一家做成"通用目录 OR 应用目录"二选一**，都是中央库做单一事实源、应用目录只是入口。
2. **通用目录的行业标准正在形成：`~/.agents/skills/`（全局）与 `<项目>/.agents/skills/`（项目级）**。Codex CLI / Gemini CLI / OpenCode / Kimi Code / GitHub Copilot / Replit 已原生读取它【7】【13】【14】【15】【17】【18】，vercel skills CLI、GitHub CLI `gh skill`、JFrog CLI 都把它当 cross-agent canonical 目录【1】【5】【6】。**Claude Code 是最大的例外**——只认 `~/.claude/skills/`，不读 `.agents/skills/`【8】。
3. **symlink 不是免费午餐**：macOS 上 Claude Code 不认 symlinked settings（skill 目录官方明确支持软链，但生态有前科）【19】【8】、Cursor 文件监听不跟随目录软链【20】；Windows 上目录软链要管理员或开发者模式，junction 免权限但限同卷且 OneDrive 不同步【21】【22】【23】。**"symlink 优先 + copy 兜底"是跨平台工具的主流策略**【3】【4】，纯 symlink 方案在桌面端不可行。

---

## 二、竞品分发策略全景

按"集中库派 / 直拷派 / 插件派"分三类。注意：**GUI 桌面管理器全部在集中库派**——这与 yo-skill 的 GUI 定位直接对应。

### 2.1 集中库派（中央单一事实源 + 分发到各 Agent）

| 工具 | 中央目录 | 分发方式 | 用户可选？ | 来源 |
|---|---|---|---|---|
| vercel-labs/skills CLI（`npx skills`） | `~/.agents/skills/<name>/`（global）/ `<cwd>/.agents/skills/`（project） | **默认 symlink** 进各 Agent 目录，`--copy` 强制复制 | 安装时选 | 【1】 |
| Skills Manager（GUI） | "one folder you can back up, move, or point somewhere else" | 写入各 Agent 目录，**"symlink or copy, your choice"** | ✅ 明确可选 | 【2】 |
| SkillDock | `~/.skilldock/skills` | "enabled" = symlink 链入各工具目录，也支持 copy | ✅ | 【3】 |
| Skills Hub | 中央库（"install into one central repository"） | **symlink/junction 优先，自动回退 copy** | 半自动 | 【4】 |
| Skill Desktop（GUI） | `~/.skill_desktop` | symlink 同步到 `~/.claude/skills/`、`~/.cursor/skills/` 等 | — | 【25】 |
| one-skills-manager（CLI） | `~/.one-skills/skills/<name>/` | sync 时建 symlink 到各 Agent 目录 | — | 【26】 |

要点：
- **中央库即"通用目录"的用户可见形态**：Skills Manager 的卖点之一就是"所有东西落在一个你可以备份、搬走、换位置的文件夹"【2】——这正是小白能理解的"统一管理"。
- vercel skills CLI 的已知坑：`npx skills update` 会把 `--copy` 安装的 skill 静默变回 symlink（issue #1199）【27】——**每个 skill 的安装模式必须被记住**，更新不能偷偷改模式。yo-skill 直接吸收这个教训。
- SkillDock 还有一个值得抄的动作：**把 Agent 目录里已存在但未被管理的 skill "导入"进中央库**再统一分发【3】——对应 yo-skill 的"检测重复项、收拢到统一管理"。

### 2.2 直拷派（下载一次、复制多份）

| 工具 | 写入位置 | 特点 | 来源 |
|---|---|---|---|
| iflytek/skillhub（企业 registry + CLI） | 按 `--agent` 写入对应 Agent 目录；检测不到时 **fallback 到 `~/.agents/skills/`** | 无 symlink 选项；`--agent` 可重复指定多个 | 【5】 |
| JFrog CLI `jf agent skills` | 内置 harness 路径表，含 `cross-agent` → `.agents/skills/` | 企业供应链场景倾向 copy：**每个目标目录独立可审计** | 【6】 |
| skills.palebluedot.live / skillhub-club/cli | `~/.claude/skills/`、`~/.codex/skills/` 等 | 支持 `--dir` 自定义目录 | 【28】【29】 |

要点：
- copy 派的论据不是技术落后，而是**可靠性与可审计**：无权限门槛、无监听失效、无云同步冲突。代价是副本漂移、更新要回写多处、删除留孤儿。
- iflytek/skillhub 的 fallback 设计值得注意：检测不到 Agent 专用目录时落到 `~/.agents/skills/`【5】——通用目录在竞品眼里也是"兜底共识位"。

### 2.3 插件派（各 Agent 自家 marketplace 各装各的）

- obra/superpowers：通过 Claude Code `/plugin install`、Cursor `/add-plugin`、Codex `/plugins` 等各 Agent 插件系统安装，skill 文件落在插件缓存（社区仓库说法：`~/.config/superpowers/skills/`），**无集中目录、无跨 Agent 同步**【30】。
- 判断：插件路线与文件管理路线长期并存，但 MVP 阶段 yo-skill 只须管文件目录；插件生态是未来兼容项。

### 2.4 大厂入场信号

- **GitHub CLI `gh skill`**（2026-04 发布）：官方只承诺"自动装到 Agent 对应的正确目录"；社区实测 project scope 落 `.agents/skills/`（Copilot/Cursor/Codex/Gemini/Amp/Cline/OpenCode 等都读它），**唯独 Claude Code 落 `.claude/skills/`**【31】【32】。
- GitHub 都按"`.agents/skills/` 是项目级共识位、Claude 例外"来实现——这是对第二节结论最强的第三方背书。

---

## 三、各 Agent 原生加载路径对照（决定"通用目录"能覆盖谁）

| Agent | 全局 Skill 路径 | 项目级路径 | 认 `~/.agents/skills/`？ | 软链态度 | 来源 |
|---|---|---|---|---|---|
| Claude Code | `~/.claude/skills/` | `.claude/skills/` | ❌ 只认自家 | **官方明确支持** skill/rules 目录内软链 | 【8】 |
| Codex CLI | `~/.agents/skills/`（官方推荐位） | `.agents/skills/` | ✅ 它就是主推者 | 官方明确支持 symlinked skill folders | 【7】 |
| Gemini CLI | `~/.gemini/skills/` 或 `~/.agents/skills/`（alias） | `.gemini/skills/` 或 `.agents/skills/` | ✅ | 未明示 | 【13】 |
| OpenCode | `~/.config/opencode/skills/` + `~/.claude/skills/` + `~/.agents/skills/` | 同名项目级三路径 | ✅ | 未明示 | 【14】 |
| Kimi Code | `~/.kimi-code/skills/` + `~/.agents/skills/`（多目录扫描，含 `~/.claude/skills/` 兼容位） | `.agents/skills/` 等 | ✅ | 支持 `--skills-dir` 追加 | 【15】 |
| GitHub Copilot | `~/.copilot/skills/` + `~/.claude/skills/` + `~/.agents/skills/` | `.github/skills/` + `.claude/skills/` + `.agents/skills/` | ✅ | 未明示 | 【17】 |
| Replit | 无（云环境） | `.agents/skills/` | ✅（仅项目级） | — | 【18】 |
| Cursor | 无全局 skills 目录（User Rules 在设置 UI，疑似云端） | `.cursor/rules/`、`.cursor/skills/`（tools 生态写入位） | ❌ | **文件监听不跟随目录软链**（社区实测） | 【9】【20】 |
| Windsurf | `~/.codeium/windsurf/`（rules 单文件 global_rules.md） | `.windsurf/rules/`（`.devin/rules/` 优先） | ❌ | 规则是普通 .md，实际可链 | 【10】 |
| Cline | `~/Documents/Cline/Rules` | `.clinerules/*.md`，兼读 `AGENTS.md`、`~/.agents/AGENTS.md` | ❌（skill 目录无） | 未明示 | 【11】 |
| Roo Code | `~/.roo/rules/` | `.roo/rules/`、AGENTS.md | ❌ | **官方明确支持符号链接**（深度 ≤5） | 【12】 |
| Qwen Code | `~/.qwen/skills/` | `.qwen/skills/` | ❌（实验功能，需开关） | 未明示 | 【33】 |
| Trae | 设置中心 UI（无公开本地路径） | `.trae/rules/`、AGENTS.md | ❌ | 未明示 | 【34】 |
| Continue | 全局 rules 路径官方未明示 | `.continue/rules/` | ❌ | 未明示 | 【35】 |
| Aider | 无 skills 概念（`read:` 读入 md） | 同左 | ❌ | — | 【36】 |

结论：
- **选 `~/.agents/skills/` 作通用目录，6 个主流助手（Codex / Gemini / OpenCode / Kimi / Copilot / Replit）零分发直接生效**——这是"通用目录"模式的真实覆盖率，约一半。
- 另一半（Claude / Cursor / Windsurf / Trae / Qwen / Cline / Roo / Continue）仍需 yo-skill 在它们自家目录建"入口"（链接或副本）。其中 Claude Code 与 Roo Code 官方明确吃软链，Cursor 明确不吃（监听失效）【20】。
- rules/指令类内容是另一张地图（最大公约数是项目根 `AGENTS.md`，Claude 需 `CLAUDE.md` 桥接）【11】【12】【34】——**MVP 不做 rules 同步**，本报告不展开。

---

## 四、symlink / junction / copy 工程权衡（分平台）

### 4.1 三种链接/复制手段的硬事实

| 手段 | macOS | Windows | 一句话风险 |
|---|---|---|---|
| symlink | 无权限门槛 | **需管理员或开发者模式**（API 需 `SYMBOLIC_LINK_FLAG_ALLOW_UNPRIVILEGED_CREATE`）【21】【22】 | Claude Code 不认 symlinked settings.json（issue #3575）【19】；Cursor 监听不跟随目录软链【20】；云同步目录内行为不可预期（OneDrive 同步的是目标而非链接本身）【23】 |
| junction（仅目录） | 无此概念 | **免管理员**，目录级可用 | 限同卷；OneDrive 不原生支持 junction【23】；git 仓库内 junction 易被当成删除（社区报告） |
| hardlink（仅文件） | APFS **不支持目录硬链**【24】 | `mklink /H` 仅文件 | 对"分发 skill 目录"这个需求基本不可用，排除 |
| copy | 无门槛 | 无门槛 | 副本漂移、更新回写多处、删除留孤儿；胜在绝对兼容、可审计【6】 |

补充坑（全部有出处）：
- **mackup 的前车之鉴**：macOS Sonoma 起 symlinked 偏好文件会直接失效，mackup 官方README警告 link mode "will BREAK YOUR PREFERENCES" 并改推 copy mode【37】——虽然那是 plist 偏好而非 skill 目录，但说明"苹果生态对软链配置的容忍度在收紧"。
- **Git 与软链**：Windows 上 `core.symlinks=false` 时仓库内软链被还原成文本文件【38】——项目级分发 skill 到 git 仓库内时，软链方案有坑。
- **npm 生态的惯例**：`npm link` / 全局安装本就大量用 symlink，Windows 上自动降级为 `.cmd` shim【39】——"链接优先、平台降级"是成熟先例。
- **双写回吸方案**：Factory Engineering 推荐的最稳策略是 rsync 双向同步（先 reverse-sync 把各 IDE 目录的改动收回中央，再 forward-sync 镜像出去）【40】；sync-directory 的 `watch + copy` 是工程化同款【41】。

### 4.2 竞品策略归纳

主流收敛形态 = **"symlink/junction 优先 + copy 兜底 + 记住每个 skill 的模式"**：
- Skills Hub："prefers symlink/junction and automatically falls back to copy"【4】
- vercel skills：默认 symlink、可选 `--copy`【1】
- Skills Manager：用户显式二选一【2】
- JFrog / iflytek：企业场景纯 copy【5】【6】

---

## 五、对 yo-skill 的设计建议

### 5.1 把用户的"二选一"翻译成分层架构

用户要的选择（通用目录 vs 应用目录）应该保留，但**底层恒定不变：vault/集中库永远是单一事实源**（已冻结决策：本地 SQLCipher vault + 云端只存密文）。用户感知的"存哪"= **分发策略**，不是"真相源在哪"。理由：

- 竞品没有一家做真相源二选一——做了就丢掉统一更新、统一卸载、云端同步、冲突检测的全部基础；
- 小白能理解的是"这个本事放在哪、谁能用"，不是"哪个目录是 canonical"。

### 5.2 两种模式的落地定义

**模式 A：所有助手共用一份（默认，对应"通用目录"）**
- 实体文件放 `~/.agents/skills/<name>/`——行业标准位，Codex / Gemini / OpenCode / Kimi / Copilot / Replit **零分发直接生效**【7】【13】【14】【15】【17】【18】；
- 不认通用目录的助手（Claude / Cursor / Windsurf / Trae / Qwen…），yo-skill 自动在它自家目录建入口：macOS 用 symlink、Windows 用 junction（免管理员），建不了就自动降级 copy 并在 UI 标注；
- UI 话术不提 symlink/junction："这个助手不支持共用目录，yo-skill 帮你搭了座桥"。

**模式 B：每个助手单独放一份（对应"应用目录"）**
- 每个已安装助手的自家目录各放一份实体副本；
- 更新 / 卸载由 yo-skill 回写所有副本，绝不留孤儿（竞品 copy 派的最大痛点就是我们产品的差异化机会）；
- 适用场景明示给用户：Cursor（监听不吃软链【20】）、Windows 上目录在云同步盘里、企业权限受限环境。

### 5.3 必须守住的工程纪律

1. **每个 skill 记住自己的模式与每助手入口类型**（link / copy），更新、卸载、换电脑恢复都按记账执行——vercel #1199 静默改模式的教训【27】；
2. **Cursor 默认 copy**，即使用户选了模式 A，给 Cursor 的入口也直接建副本（或明确告知"Cursor 可能感知不到链接里的改动"）【20】；
3. **Windows 检测**：目标盘与 `~/.agents/skills/` 不同卷、或路径在 OneDrive/iCloud/Dropbox 同步范围内 → 自动降级 copy【23】；
4. **项目级 skill 不进 MVP 分发面**（git 仓库内软链有 `core.symlinks=false` 坑【38】），MVP 只管全局；
5. **Claude Code 只链 skill 目录、不碰它的 settings.json**（#3575 坑的是配置文件，skill 目录软链官方支持）【19】【8】；
6. **导入动作**：首次扫描时把各 Agent 目录已有的 skill 收拢进集中库再统一分发（抄 SkillDock【3】），这正是"检测重复项、收拢到统一管理"承诺的技术兑现。

### 5.4 UI 表达建议（对接原型）

- 设置里一个全局默认："新装的 Skill 放在——○ 所有助手共用一份（推荐）○ 每个助手单独放一份"；
- 单个 skill 详情页可覆盖全局默认，并列出"在哪些助手已生效 / 通过什么方式（共用目录 / 桥接 / 副本）"；
- 统一视图的"N 个助手"chip 是天然展示位：点开能看到生效方式明细；
- 全文不提 symlink / junction / copy，只出现"共用一份 / 桥接 / 单独放一份"。

### 5.5 范围外（本报告明确不做）

- rules / instructions 类内容（`.cursor/rules/`、`.clinerules/`、`AGENTS.md` 等）的同步——地图不同，另起专项；
- 插件生态（superpowers 路线）兼容；
- 项目级（project scope）skill 的分发与回吸。

---

## 六、下一步建议

1. 按 5.2 / 5.3 更新产品设计文档的"收拢机制技术设计"条目（原开放问题 4），把"模式 A/B + 记账纪律"写成定稿候选，交用户确认；
2. 原型补两处 UI：设置页全局默认 + skill 详情页"生效助手与方式"，验证小白话术；
3. Tauri 侧技术验证清单：Rust 建 junction（`std::os::windows::fs::symlink_dir` 或走 `mklink /J`）的权限实测、macOS symlink 进 `~/.claude/skills/` 的实测、OneDrive 目录检测方法。

---

## 参考资料

行内引用对应关系（全部 2026-08-12 抓取）：

- 【1】vercel-labs/skills README（Symlink Recommended / `--copy` / Installation Scope / Supported Agents 表）：https://github.com/vercel-labs/skills
- 【2】Skills Manager 官网（"symlink or copy, your choice"、"one folder you can back up"）：https://skillsmanager.dev ；仓库：https://github.com/xingkongliang/skills-manager
- 【3】SkillDock README（`~/.skilldock/skills` 中央库 + symlink enable + import 已有 skill）：https://github.com/wanghuan9/skilldock
- 【4】Skills Hub README（"prefers symlink/junction and automatically falls back to copy"）：https://github.com/qufei1993/skills-hub
- 【5】iflytek/skillhub CLI 文档（Install Target Resolution、`_fallback_` → `~/.agents/skills/`）：https://github.com/iflytek/skillhub/blob/main/docs/skillhub/en/guide/cli.md
- 【6】JFrog CLI for Skills（harness 路径表含 `cross-agent` → `.agents/skills/`，copy 分发）：https://docs.jfrog.com/artifactory/docs/jf-skills
- 【7】Codex 官方 Build skills 文档（`$HOME/.agents/skills/`、支持 symlinked skill folders）：https://developers.openai.com/codex/build-skills
- 【8】Claude Code Skills 官方文档（`~/.claude/skills/`、目录内软链支持）：https://docs.anthropic.com/en/docs/claude-code/skills ；Memory 文档：https://docs.anthropic.com/en/docs/claude-code/memory
- 【9】Cursor Rules 官方文档（`.cursor/rules/`、User Rules 无本地路径）：https://docs.cursor.com/context/rules
- 【10】Windsurf Memories 官方文档（global_rules.md、`.windsurf/rules/`）：https://docs.windsurf.com/windsurf/cascade/memories
- 【11】Cline Rules 官方文档（`~/Documents/Cline/Rules`、`.clinerules/`）：https://docs.cline.bot/customization/cline-rules
- 【12】Roo Code Custom Instructions 官方文档（`~/.roo/rules/`、明确支持符号链接深度≤5）：https://roocodeinc.github.io/Roo-Code/features/custom-instructions/
- 【13】Gemini CLI Skills 文档（`~/.agents/skills/` 作为 interoperable alias）：https://geminicli.com/docs/cli/skills/
- 【14】OpenCode Skills 文档（三路径扫描）：https://opencode.ai/docs/skills/
- 【15】Kimi Code Skills 文档（多目录扫描含 `~/.agents/skills/`、`--skills-dir`）：https://moonshotai.github.io/kimi-code/zh/customization/skills ；另一版本：https://www.kimi-cli.com/zh/customization/skills.html
- 【16】yo-skill 产品设计定稿 V2（开放问题 4：收拢机制技术设计）：`mavis-deep-research/20260811_161937_yoskill_product_design/yoskill_product_design.md`
- 【17】VS Code Agent Skills 官方文档（Copilot 的 `.agents/skills/` / `.claude/skills/` 兼容路径）：https://code.visualstudio.com/docs/agent-customization/agent-skills
- 【18】Replit Agent Skills 文档（项目级 `/.agents/skills/`）：https://docs.replit.com/features/agent/skills
- 【19】claude-code issue #3575（symlinked settings.json 权限识别失败，临时方案=换成实体副本）：https://github.com/anthropics/claude-code/issues/3575
- 【20】Factory Engineering《Skills: Managing Skills Across IDEs》（Cursor 监听不跟随目录软链；rsync 双向同步策略）：https://factoryengineering.dev/skills/ ；Cursor 论坛佐证：https://forum.cursor.com/t/rules-in-a-symlinked-subfolder-mdc-are-not-followed-again/152918
- 【21】Microsoft Learn：Create symbolic links 安全策略（默认仅 Administrators）：https://learn.microsoft.com/en-us/windows/security/threat-protection/security-policy-settings/create-symbolic-links
- 【22】Windows Developer Blog：Symlinks in Windows 10（开发者模式免提权 + 新 API 标志）：https://blogs.windows.com/windowsdeveloper/2016/12/02/symlinks-windows-10/
- 【23】Microsoft Learn Q&A：OneDrive 不原生支持 symlink/junction（同步目标而非链接）：https://learn.microsoft.com/en-us/answers/questions/1327239/onedrive-shortcuts-symlinks-and-junctions
- 【24】APFS 不支持目录硬链接（hardlink issue #31 引 Apple 官方 FAQ）：https://github.com/selkhateeb/hardlink/issues/31
- 【25】Skill Desktop 官网（`~/.skill_desktop` 中央库 + symlink 同步）：https://skill-desktop.com/
- 【26】one-skills-manager PyPI（`~/.one-skills/skills/` + symlink sync）：https://pypi.org/project/one-skills-manager/
- 【27】vercel-labs/skills issue #1199（update 把 `--copy` 静默改回 symlink）：https://github.com/vercel-labs/skills/issues/1199 ；canonical 位于 `.agents/skills/` 佐证 issue #748：https://github.com/vercel-labs/skills/issues/748
- 【28】skills.palebluedot.live CLI 文档（直拷各 Agent 目录 + `SKILLHUB_INSTALL_DIR`）：https://skills.palebluedot.live/docs/cli
- 【29】skillhub-club/cli README：https://github.com/skillhub-club/cli
- 【30】obra/superpowers README（各 Agent 插件安装）：https://github.com/obra/superpowers ；技能缓存位置（社区仓库说法）：https://github.com/obra/superpowers-skills
- 【31】GitHub Changelog：Manage agent skills with GitHub CLI（2026-04-16）：https://github.blog/changelog/2026-04-16-manage-agent-skills-with-github-cli/ ；手册：https://cli.github.com/manual/gh_skill
- 【32】gh skill 安装路径实测（project scope → `.agents/skills/`，Claude 例外）：https://github.com/colbytimm/my-dev-tools
- 【33】Qwen Code Skills 文档（实验性，仅 `~/.qwen/skills/`）：https://qwenlm.github.io/qwen-code-docs/en/users/features/skills/
- 【34】Trae Rules 官方文档：https://docs.trae.ai/ide/rules
- 【35】Continue Rules 官方文档：https://docs.continue.dev/customize/deep-dives/rules
- 【36】Aider 配置文档（无 skills 概念，`read:` 读入）：https://aider.chat/docs/config/aider_conf.html
- 【37】mackup README（link mode 在 macOS Sonoma+ "will BREAK YOUR PREFERENCES"）：https://github.com/lra/mackup ；issue #2035：https://github.com/lra/mackup/issues/2035
- 【38】git-config 文档：`core.symlinks=false` 时软链还原为文本文件：https://git-scm.com/docs/git-config
- 【39】npm 文档：npm link 的 symlink 机制与 `bin-links` Windows 降级：https://docs.npmjs.com/cli/v8/commands/npm-link/
- 【40】同【20】Factory Engineering（rsync reverse-sync + forward-sync）
- 【41】sync-directory README（`watch: true` + copy；hardlink 对 watcher 不友好）：https://github.com/hoperyy/sync-directory
- 其他参考：chezmoi Design FAQ（为什么默认不用 symlink）：https://chezmoi.io/user-guide/frequently-asked-questions/design/ ；GNU Stow man page：https://man.archlinux.org/man/stow.8 ；mklink 命令文档（/D 与 /J 差异）：https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/mklink ；skiload.com（目录索引站，不做分发）：https://skiload.com
