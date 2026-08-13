# Claude Skills Hub（https://claudeskills.info/）
- 定位一句话：第三方 Claude Skills 聚合目录站，按官方集合、使用场景分类、安装量排行来组织海量 skill。
- 商业模式：免费浏览与下载；变现主要靠广告位（首页有 OtterMind 赞助条、顶部导航有「Advertise」入口）。未看到付费墙或订阅计划。

## 首屏（导航结构 / 主标题原文 / 副文案 / CTA 文案与层级 / 视觉形式：产品截图？插画？纯排版？）
- 导航：左侧 Logo 文字「Claude Skills Hub」+ 主入口「Skills、MCP、Plugins」+ 下拉「Learn、More」；右侧「Search skills（图标）」「Advertise」「深色切换」「English」「Login」。
- 主标题：「Find Awesome Claude Skills」（Claude 一词用铁锈红/棕色高亮）。
- 副文案：「Claude Skills Hub is a third-party Claude Skills Marketplace with 42,816+ Skills collected」。
- CTA：核心是一个搜索框「Search skills by name, description, tags...」，没有显式大按钮，搜索即主要动作。
- 视觉形式：无产品截图/插画，纯排版 + 搜索框 + 数据数字；首屏非常像一个「搜索引擎首页」。

## 区块结构（自上而下逐区块列出）
1. 导航栏。
2. Hero：大标题 + 副文案 + 居中搜索框。
3. Sponsor 条：OtterMind — Run agent skills in the cloud（带 logo + 说明 + 橙色 CTA「Explore OtterMind →」）。
4. Official Agent Skills Collections：官方/大厂集合卡片（Anthropic 462 skills、Microsoft 338 skills、GitHub 210 skills、PostHog、Google Workspace、Trail of Bits）。
5. Browse Skills by Category：12 个分类大卡片网格（DevOps、Security、Frontend、Workflow、Testing、Documentation、Coding、Backend、Integrations、Marketing、Research、Finance）。
6. Best Claude Code Skills：按分类展示 Top 5 排行（Frontend Design、Marketing、SEO、Testing & QA 等），每项带 repo 路径与安装量（如 tdd 659.8K installs）。
7. Stay Updated with Claude Skills：邮箱订阅区。
8. FAQ：8 个问题（What are Claude Skills / How do they work / How to install / Are they free 等）。
9. Query this directory over HTTP：面向 AI agent 的 API 说明 + `llms.txt` 链接。
10. 页脚：Ecosystem Research、About、Editorial Methodology、Ranking Methodology、Contact、Privacy、Terms。

## 配色与气质（主色 / 底色 / 字体气质 / 信息密度，必须来自截图实看）
- 主色：暖白/米白背景（#FAFAF8 附近），深棕/铁锈红（#9C4B2C 附近）用于标题高亮、分类 skill 数量、View All 链接；橙色用于主要 CTA（Login、Explore OtterMind、Subscribe）。
- 底色：整体偏暖，不是冷白；卡片用浅灰白，边框很细。
- 字体：英文无衬线，标题字重中等，正文灰度柔和。
- 气质：干净、温和、社区感强，不像激进营销页，更像「有编辑精选味道的目录站」。
- 信息密度：中高密度——首屏只放搜索框，下面紧跟大量分类卡片和排行榜。

## 转化路径（落地 → 下载 / 安装 / 注册 / 浏览 的路径设计）
- 落地即搜索：用户在 Hero 搜索框输入关键词 → 进入结果页。
- 分类浏览：点击 Browse Skills by Category 的大卡片 → 进入分类列表 → 点击 skill → GitHub 源仓库详情 → 按仓库说明安装。
- 官方集合路径：点击 Anthropic/Microsoft 等集合 → 查看该组织下的 skills 列表。
- 排行榜路径：Best Claude Code Skills 区块直接展示热门 skill 与安装量 → 点击跳 GitHub。
- 提交路径：FAQ 引导用户创建 GitHub 仓库后通过 Submit 页提交。
- 订阅路径：邮箱订阅沉淀回访。

## 值得抄（具体到组件与手法，禁止"简洁大气"这类空话）
- **大数字作为信任状**：首屏直接展示「42,816+ Skills collected」，用一个具体数字建立规模感。
- **官方集合卡片**：用品牌 logo + 组织名 + skill 数量做成可点击卡片，把「官方背书」可视化。
- **分类大卡片网格**：每个分类显示 skill 数量（铁锈红色），让用户一眼判断内容体量。
- **按分类 Top 5 排行**：Frontend Design、Marketing、SEO、Testing & QA 等分类各列 5 个热门 skill + 安装量，制造「社区流行」参照。
- **API/llms.txt 入口**：在页尾面向 AI agent 提供 HTTP API 说明，符合当前 AI 可发现性趋势。

## 不值得抄 / 对我们不适用
- **单一 Agent 锁定**：整个站只服务 Claude Skills，而 yo-skill 要跨 Agent（Claude、Codex、Gemini、Cursor 等），不能直接照搬其品牌叙事。
- **跳转 GitHub 安装**：用户点击 skill 后跳到 GitHub 源仓库手动安装，对小白门槛高；yo-skill 的价值是「一键管理/分发」，所以官网应强调安装后的管理体验，而非仅做目录跳转。
- **暖棕色调**：与 yo-skill 已冻结的 E 墨极黑白骨架 + 交互翡翠/危险红/琥珀橙不匹配。
- **缺少产品截图**：官网没有任何桌面 App 或管理界面预览，若 yo-skill 是工具型产品，官网需要展示 GUI 窗口截图。

## 截图（列出本次两张 jpg 路径）
- `G:/work/project/skill-manager/mavis-deep-research/20260813_100940_official_site_design_reference/shots/claudeskills-top.jpg`
- `G:/work/project/skill-manager/mavis-deep-research/20260813_100940_official_site_design_reference/shots/claudeskills-mid.jpg`
