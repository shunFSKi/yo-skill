# Cline（https://cline.bot/）
- 定位一句话：开源 AI 编程 agent，覆盖 VS Code 扩展、CLI、SDK，强调 open-source、BYOK、无 vendor lock-in。
- 商业模式：开源免费（个人开发者）+ 按量支付 AI inference + Enterprise 定制（SSO、SLA、Dedicated Support、集中计费等）。无订阅费。

## 首屏
- 导航结构：Logo + IDE / CLI / SDK / ClinePass / Docs / More 下拉，右侧 Sign In + GitHub stars（66k）按钮。
- 主标题原文：The Open Coding Agent
- 副文案：Ship securely w/ GPT in the CLI；One open source agent runtime. Use it in your editor, your terminal, or embed it in your own products. Trusted by 8M+ developers.
- CTA：三个 tab 切换 CLI / IDE / SDK，CLI tab 展示可复制的安装命令 `npm i -g cline` 与 "Explore Cline CLI →"；下方还有 marketplace + open vsx registry / 66.1k stars / 4.1/5 VS Code Marketplace ratings 三个信任徽章。
- 视觉形式：左侧文字 + 右侧 ASCII/点阵风格动态图形（大脑/地球意象），紫渐变标题；首屏没有完整产品截图，靠 CLI 安装块和信任徽章建立开发者可信度。

## 区块结构（自上而下）
1. 顶部公告条：NEWS — Introducing ClinePass — the easiest way to use open weights models in Cline.（黑底白字，右侧 Learn More →）
2. Hero：紫渐变标题 + 副标题 + 三 tab 安装演示 + 右侧动态点阵图 + 信任徽章行。
3. 客户背书：Trusted by developers and leaders at（一排公司 logo）。
4. 视频/功能演示：See Cline at work——三个功能点（Understand your codebase / Refactor large codebases / Automate with Cline CLI）。
5. 卖点网格：Everything an agent should do, in your editor and your terminal.——8 个两列排布的 feature（Edits across your project / Runs bash commands / Plan, then Act / Rules and Skills / Every model, your choice / Extend with MCP and plugins / Multi-agent teams and schedules / Connect to Slack, Linear, and CI）。
6. 模型支持：Any model, your infrastructure——展示支持的 providers logo（OpenAI、Anthropic、Google、Ollama 等）+ BYOK 文案。
7. 底部 CTA：Ready to experience AI coding without limits? + Get Started。
8. Footer：Product / Docs / Models / Blog / Enterprise / MCP Marketplace / Community / Support / Company 等链接 + 邮件订阅。

## 配色与气质
- 主色：紫色渐变（#7C3AED → #A855F7 左右）用于标题与 CTA，黑底用于公告条与 GitHub stars 按钮。
- 底色：纯白，整体干净明亮；feature 区用紫色小方块作为列表标记。
- 字体气质：标题使用粗体无衬线（现代、技术感强），正文偏灰；整体是典型开发者工具站风格，比 Happycapy/Smithery 更「硬核开源」。
- 信息密度：中。首屏把三个产品形态（IDE/CLI/SDK）浓缩在一个 tab 组件里，向下是密集的功能网格与背书行。

## 转化路径
- 开发者落地即见安装命令，可一键复制；
- IDE tab 导向 VS Code Marketplace，CLI tab 导向 npm，SDK tab 导向文档；
- 向下滚动建立功能信任；
- 底部 Get Started 进入安装/文档；
- Enterprise 通过导航 More → Enterprise 或 pricing 页 Contact Sales。

## 值得抄
- **CLI 安装块作为首屏 CTA**：把 `npm i -g cline` 做成带 tab 切换的可复制代码块，对开发者极其直观。yo-skill 若面向技术用户，可在 hero 放「下载 macOS / Windows」或 `brew install yo-skill` 式命令块。
- **GitHub stars 与评分徽章常驻导航**：右上角 66k stars 按钮和首屏 4.1/5 评分徽章，把开源社会证明放在最显眼位置。
- **三形态 tab 切换（IDE / CLI / SDK）**：一个 hero 组件同时服务三类用户，避免页面过长。
- **8 宫格功能清单**：没有大图，用标题 + 一句话 + 紫色列表点高效覆盖卖点，适合功能多但不想堆截图的工具站。
- **MCP Marketplace 入口放在 footer 与导航**：表明 Cline 把 marketplace 作为生态入口而非首页主体， yo-skill 的「发现」页可参考这种「主站讲产品，marketplace 独立入口」的结构。

## 不值得抄 / 对我们不适用
- 紫渐变 + 点阵动态图是典型 AI coding agent 视觉符号，与 yo-skill 已定的「E 墨极黑白 + 翡翠交互」视觉系统不符，且紫色已被项目明确否决（「紫 AI 味」）。
- Cline 核心卖点是开源、CLI、代码生成，yo-skill 是跨助手 skill/MCP 同步管理，因此「Plan then Act」「Runs bash commands」等功能叙事不可照搬。
- 硬核开发者语言（IDE/CLI/SDK、vendor lock-in、BYOK）对 yo-skill 的小白目标用户过重。

## 截图
- G:/work/project/skill-manager/mavis-deep-research/20260813_100940_official_site_design_reference/shots/cline-top.jpg
- G:/work/project/skill-manager/mavis-deep-research/20260813_100940_official_site_design_reference/shots/cline-mid.jpg
