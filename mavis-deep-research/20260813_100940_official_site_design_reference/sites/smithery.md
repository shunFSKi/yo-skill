# Smithery（https://smithery.ai/）
- 定位一句话：MCP server 的 registry + 托管连接层，让 agent 一键接入数千工具并自动处理 OAuth 与凭据。
- 商业模式：Freemium + 按量计费。Hobby 免费（50K RPCs/月，3 namespaces，含 managed OAuth / persistent connections）；Pay as you Go $10/月（100K RPCs，超出 $0.10/1K，100 namespaces）；Custom 企业版（含 SLA、Slack support）。

## 首屏
- 导航结构：左侧 Logo + MCP 数量徽章（715），中间搜索框（Search MCPs...），右侧 MCPs / Skills / Docs / Pricing / Publish 下拉 / Toolbox 按钮 / Login。
- 主标题原文：Give agents more agency
- 副文案：Connect agents to thousands of tools and services. Auth, credentials, and sessions handled for you.
- CTA：核心交互是一个搜索框 "Search for MCP servers..."，首屏下半部分直接铺 MCP 卡片流；顶部右侧 Toolbox / Login，无醒目实心 CTA 按钮。
- 视觉形式：左侧文案 + 右侧吉祥物插画（戴墨镜的橙色火焰小人），底部米白波浪分割；卡片区用白底小卡片展示热门 MCP，每张卡片带 logo、使用次数、一句话描述。

## 区块结构（自上而下）
1. Hero：标题 + 搜索框 + 吉祥物 + 顶部橙色公告条（Smithery is now a part of Arcade.dev!）。
2. MCP 卡片流：横向滚动的热门 MCP 卡片（Agent News、OneSignal、Exa Search、Context7、DevMatch 等），带使用次数与 verified 徽章。
3. CLI 演示：Connect once. Use everywhere.——展示 `npx smithery auth login`、`npx smithery mcp add notion` 等命令行代码块，代码块右侧带复制图标。
4. 三列卖点：Zero auth plumbing / Carry connections across runtimes / Open source。
5. 发布者板块：Publish on Smithery——Distribution（10.2k calls）+ Observability（折线图）两张卡片，CTA 为 "Publish MCP Server" 橙色按钮 + "Documentation" 灰边按钮。
6. 底部 CTA：Fireup your agent。
7. Footer：Resources / Company / Connect 三栏。

## 配色与气质
- 主色：品牌橙（近似 #F05A28）用于 Logo、公告条、主 CTA；背景是暖灰米色（#E8E6E1），不是纯白。
- 辅色：白底卡片 + 深灰文字；代码块用浅灰底、绿色注释、黑色命令，典型开发者工具风格。
- 字体气质：标题使用衬线体（与 Happycapy 类似的人文感），正文无衬线，整体在「开发者工具」与「友好品牌」之间取平衡。
- 信息密度：中高。首屏直接展示搜索 + 热门 MCP，没有大幅留白，功能导向极强。

## 转化路径
- 用户落地即可搜索 MCP 或浏览卡片；
- 顶部导航 MCPs / Skills 进入目录；
- CLI 演示区块让开发者看到一行命令即可接入；
- 发布者通过 "Publish" 入口贡献 MCP；
- 定价页简洁，免费档门槛清晰，按量计费对开发者友好。

## 值得抄
- **首页即 MCP 目录**：首屏下半部分直接展示可横向滚动的 MCP 卡片，每张卡片显示使用次数 + verified 徽章，把「 marketplace」做成首页内容而非独立页面。yo-skill 的「发现」页可以学习这种卡片密度与信任指标（使用次数、作者验证）。
- **搜索框即首页 CTA**：没有传统「Get Started」大按钮，而是把搜索框放在 hero 中央，暗示「先找你要的 tool」。
- **CLI 命令块带复制**：用真实命令行演示接入流程，降低开发者尝试门槛。
- **发布者视角的 Distribution + Observability**：两张卡片用数据（10.2k calls）和图表直观告诉创作者能获得什么，这种「创作者价值可视化」对 yo-skill 的 skill 作者生态有参考价值。

## 不值得抄 / 对我们不适用
- 暖灰米色背景 + 橙色品牌虽然识别度高，但与 yo-skill 已冻结的「E 墨极黑白骨架 + 翡翠交互」视觉系统冲突，不能照搬。
- Smithery 是云端 registry，yo-skill 是本地同步管理工具，因此「managed OAuth / persistent connections / RPC 计费」等产品叙事不相关。
- 吉祥物人格化风格（火焰小人）与 yo-skill 的小白化、冷静工具定位不符。

## 截图
- G:/work/project/skill-manager/mavis-deep-research/20260813_100940_official_site_design_reference/shots/smithery-top.jpg
- G:/work/project/skill-manager/mavis-deep-research/20260813_100940_official_site_design_reference/shots/smithery-mid.jpg
