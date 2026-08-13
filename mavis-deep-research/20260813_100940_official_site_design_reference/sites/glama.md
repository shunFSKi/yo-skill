# Glama MCP Registry（https://glama.ai/mcp/servers）

- 定位一句话：开源 MCP Server 的聚合目录 + 托管平台，强调数据规模（7 万+ servers）与实时更新。
- 商业模式：Freemium。开源 MCP server 在 Glama 上部署/运行免费；个人付费 Pro $26/月（含 $26 AI credits、10 个 fast hosted servers 等），Business $80/月（30 个 fast hosted servers）。

## 首屏（导航结构 / 主标题原文 / 副文案 / CTA 文案与层级 / 视觉形式：产品截图？插画？纯排版？）

- 导航结构（顶部固定）：Logo「Glama」+ Primary 导航 Servers / Connectors / Tools / Clients / Inspector / Pricing / Community(Discord 图标) + 右侧「Sign Up」按钮。
- 主标题原文：页面无传统 H1 hero，首屏核心文案是数据条「71,665 servers. Updated 2026-08-13 10:00」+ 搜索框占位「Search for MCP servers, tools, and more」。
- 副文案：无 slogan，靠左侧分类统计与「MCP tools」「MCP Connectors」「Popular MCP Servers」三个区块标题驱动。
- CTA：首屏主要是「Add Server」按钮（深色描边）和全局搜索；顶部右侧「Sign Up」是唯一账户转化入口。
- 视觉形式：纯排版 + 数据卡片网格，无产品截图或插画；左侧为分类筛选边栏，右侧为内容区。

## 区块结构（自上而下逐区块列出）

1. 顶部全局导航栏（固定）。
2. 面包屑：Glama > MCP > Servers。
3. 数据条 + Deep Search / Search Relevance 下拉 / Add Server 按钮 + 全局搜索框。
4. 左侧边栏分类统计（Remote / Python / TypeScript / Local / Tools / Developer Tools / Hybrid / Search / Resources / Prompts / App Automation / AI & Machine Learning / Official / Knowledge & Memory / Finance / Autonomous Agents / Databases / RAG Systems / Research & Data / Agent Orchestration / Security…）。
5. 右侧主内容：
   - MCP tools（横向小卡片，展示最近工具名）。
   - MCP Connectors（横向小卡片）。
   - Popular MCP Servers（2 列大卡片网格）。
6. 每张 server 卡片：logo + 名称 + official 徽章 + license/quality/maintenance 三枚评分徽章 + 描述 + 更新时间 + 统计数字（下载/星标/调用/工具数等）+ 支持平台图标（Apple/Linux/Windows）。
7. 页脚：未在截图内完整呈现。

## 配色与气质（主色 / 底色 / 深浅 / 字体气质 / 信息密度，必须来自截图实看）

- 主色：深黑底（接近 #0B0F19 / GitHub Dark），文字以灰白为主；Glama logo 带紫-蓝渐变；链接为亮蓝色；评分 A 为翡翠绿，B/C 为橙/琥珀，F 为红。
- 底色：整体深色模式，卡片为稍浅的深灰，边框极细。
- 深浅：高对比暗色主题，无浅色模式切换可见。
- 字体气质：无衬线系统字体，数字与分类名等宽/等宽感，技术工具型。
- 信息密度：极高。单屏内同时展示分类统计、工具条、连接器条、6-8 张 server 卡片，每张卡片包含 8+ 个信息点。

## 转化路径（落地 → 下载 / 安装 / 注册 / 浏览 的路径设计）

- 落地即目录：用户进入后可直接搜索或点击分类。
- 浏览：左侧分类筛选 → 右侧卡片列表 → 点击卡片进入详情页。
- 注册：顶部固定「Sign Up」按钮全程可见；详情页内应引导部署/安装。
- 付费：导航「Pricing」进入独立定价页，Pro/Business 两档并列，CTA「Start Now」。

## 值得抄（具体到组件与手法，如"hero 把 CLI 命令做成可点击复制的芯片"，禁止"简洁大气"这类空话）

- **三徽章质量评分系统**：每张 server 卡片固定展示 license / quality / maintenance 三个等级徽章（A/B/C/F），用颜色区分，让用户 1 秒判断可信度。
- **官方徽章**：名称右侧带蓝底白字「official」小徽章，降低选择成本。
- **左侧分类统计面板**：每个分类名右侧带精确数字（如 Python 30,268），既作筛选又作信任背书。
- **卡片底部平台兼容性图标**：用 Apple / Linux / Windows 小图标表示支持平台，无需展开。
- **卡片内多维数据**：更新时间、星标、调用量、工具数等用图标+数字紧凑排列，适合高阶用户横向比较。

## 不值得抄 / 对我们不适用

- 无 hero/slogan 区：首屏直接是目录，对 yo-skill 目标小白用户不够友好，缺少「让 AI 学会新本事」这类价值传递。
- 信息密度过高：小白看到 license/quality/maintenance 评分、多个数字、多平台图标会认知过载。
- 深色单一模式：若 yo-skill 官网要覆盖小白/非技术用户，应提供浅色模式或默认浅色。
- 目录即首页：对 yo-skill 而言，官网应先讲清「统一管理跨助手 Skill/MCP」的故事，再引导到发现页，而不是直接铺目录。

## 截图（列出本次两张 jpg 路径）

- `G:/work/project/skill-manager/mavis-deep-research/20260813_100940_official_site_design_reference/shots/glama-top.jpg`
- `G:/work/project/skill-manager/mavis-deep-research/20260813_100940_official_site_design_reference/shots/glama-mid.jpg`
