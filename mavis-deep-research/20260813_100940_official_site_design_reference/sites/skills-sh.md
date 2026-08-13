# skills.sh（https://skills.sh/）
- 定位一句话：Vercel 官方维护的开放 Agent Skills 目录与排行榜，主打 `npx skills add <owner/repo>` 的 CLI 一键安装。
- 商业模式：免费开源生态站，未设付费墙或订阅；核心目的是推广 Vercel 的 skill 规范与 CLI 工具。

## 首屏（导航结构 / 主标题原文 / 副文案 / CTA 文案与层级 / 视觉形式：产品截图？插画？纯排版？）
- 导航：极简顶栏，左侧 Vercel 三角 Logo +「Skills」；右侧「Packs（NEW 角标）、Topics、Official、Audits、Docs」。
- 主标题：无传统 h1，用 ASCII Art 拼出「SKILLS」，下方小字「THE OPEN AGENT SKILLS ECOSYSTEM」。
- 副文案：「Skills are reusable capabilities for AI agents. Install them with a single command to enhance your agents with access to procedural knowledge.」
- CTA 层级：主 CTA 是一个可复制 CLI 代码块「$ npx skills add <owner/repo>」（带复制按钮）；下方横向展示 20 个支持的 Agent 图标。
- 视觉形式：无产品截图、无插画，纯黑色背景 + ASCII 标题 + 代码块 + 图标墙，整体像「开发者工具 landing + 实时排行榜」的结合。

## 区块结构（自上而下逐区块列出）
1. 极简顶栏导航。
2. Hero：ASCII Art logo + 标语 + 副文案 + CLI 代码块 + Agent 图标墙。
3. Skills Leaderboard：搜索框 + 时间维度标签（All Time / Trending (24h) / Hot）+ 排行榜表格（# / SKILL / 8W ACTIVITY / INSTALLS）。
4. 排行榜列表：每行展示 skill 名、repo 路径、8 周活动 sparkline、安装量；部分行折叠「+N more from <repo> (X total)」。
5. 页脚：极简，无复杂信息（截图未展示完整页脚）。

## 配色与气质（主色 / 底色 / 字体气质 / 信息密度，必须来自截图实看）
- 主色：纯黑背景（#000 或接近），文字为白色/灰白，无彩色强调色，整体单色。
- 辅助色：CLI 代码块用深灰背景；表格行 hover/分隔用细微灰线；sparkline 用浅灰。
- 底色：全屏深黑，与 Vercel 品牌深色模式一致。
- 字体：等宽字体用于 ASCII logo 和 CLI 代码块；无衬线用于正文，字号偏小，信息紧凑。
- 气质：硬核开发者、CLI 文化、极客、去商业化；首屏像终端/命令行界面。
- 信息密度：中高密度——首屏不啰嗦，直接进入排行榜数据墙。

## 转化路径（落地 → 下载 / 安装 / 注册 / 浏览 的路径设计）
- 落地即命令：首屏 CLI 代码块让用户立刻知道如何安装 skill；点击复制 → 粘贴到终端执行。
- 浏览路径：向下滚动即见 Skills Leaderboard → 搜索或切换 All Time/Trending/Hot → 点击 skill 名进入详情 → 查看源仓库/安装说明。
- Agent 生态路径：Hero 的 Agent 图标墙暗示跨 Agent 兼容，吸引不同 Agent 用户。
- 文档路径：顶部「Docs」引导到规范文档；「Official」「Audits」建立官方与质量背书。

## 值得抄（具体到组件与手法，禁止"简洁大气"这类空话）
- **CLI 代码块作为首屏主 CTA**：把安装命令直接做成可复制代码块，开发者用户 3 秒知道怎么用。
- **ASCII Art 品牌标识**：用等宽字符拼出 LOGO，强化 CLI/终端气质，记忆点极强。
- **实时排行榜表格**：把 skill 按安装量排序，配 8 周活动 sparkline，让数据本身成为内容。
- **Agent 图标墙**：在 Hero 下方横向展示 20 个支持的 Agent 小图标，一眼传递跨平台生态。
- **时间维度切换**：All Time / Trending (24h) / Hot 三个标签，给同一榜单制造不同浏览动机。

## 不值得抄 / 对我们不适用
- **纯黑 CLI 风格**：与 yo-skill 已冻结的 E 墨极黑白骨架不同，skills.sh 是更硬核的「全黑终端风」，对目标小白用户过于极客。
- **无产品 GUI 展示**：作为桌面 App，yo-skill 官网需要展示实际窗口界面，不能只用代码块和表格。
- **无中文支持**：全英文界面，yo-skill 目标用户是中文小白。
- **缺少付费/云同步叙事**：skills.sh 是开源生态站，不需要解释 E2E 加密、跨电脑同步等 yo-skill 核心卖点。
- **排行榜作为首页主体**：对管理工具来说，首页不应是榜单，而应是「解决什么问题 + 如何管理」的价值陈述。

## 截图（列出本次两张 jpg 路径）
- `G:/work/project/skill-manager/mavis-deep-research/20260813_100940_official_site_design_reference/shots/skills-sh-top.jpg`
- `G:/work/project/skill-manager/mavis-deep-research/20260813_100940_official_site_design_reference/shots/skills-sh-mid.jpg`
