# SkillHub（https://www.skillhub.club/）
- 定位一句话：面向 Claude Code、Codex、Gemini CLI 等多 Agent 平台的 Skill Registry + 组合包市场，兼做 AI 评分与一键安装入口。
- 商业模式：免费浏览目录；付费墙在「技能组合包」与部分高级功能。定价页显示 Pro 订阅 $9.99/月（50 AI queries/天、优先搜索、新功能早鸟、邮件支持）；Credits 买断 $4.99/50、$14.99/200、$29.99/500；另有 Agent Plans $19-$199/月。另有「SPONSORED BY HAPPYCAPY」赞助位。

## 首屏（导航结构 / 主标题原文 / 副文案 / CTA 文案与层级 / 视觉形式：产品截图？插画？纯排版？）
- 导航：Logo + 文字标 SKILLHUB；左导航「全部 SKILLS、REDSKILL、排行榜、组合包、发布、文档」；右区搜索框 +「启动应用」+「登录」+ 深色切换 + 语言切换。顶部另有一条 sponsor banner「MAIN SITE ↗」。
- 主标题（中英双语大标题）：「为每个工作流找到合适的 / Agent Skills」。
- 副文案：「搜索适用于 Claude Code、Codex、Gemini CLI、OpenCode 和 OpenClaw 的 AI 测评 Agent Skills，对比质量与安全信号，探索推荐 Skill Set，并一键安装。」
- 数据条：148.5K 已发布 SKILLS / 29 分类 / 5 AGENT 平台 / 2026年8月13日 目录更新时间。
- CTA 层级：主搜索框（占位「你希望 Agent 学会做什么？」）+ 次级按钮「浏览全部 SKILLS →」（黑底）+「发布 SKILL」（白底描边）。
- 视觉形式：无产品截图/插画，纯排版 + 数据条 + 搜索框 + 分类标签云，信息密度高，像「目录站+搜索引擎」的首页。

## 区块结构（自上而下逐区块列出）
1. 顶部 sponsor banner（HAPPYCAPY）。
2. 导航栏。
3. Hero：英文小标签「AGENT SKILLS 解决方案」+ 大标题 + 副文案 + 数据条 + 搜索框 + 分类标签 + 双 CTA。
4. S 级 Skills：「质量优先的发现体验」+ 横向卡片列表（skill-creator、systematic-debugging、file-search、iam 等），每张卡片带 S 级徽章、作者、简介、箭头外链。
5. 技能组合包（Premium Stacks）：标题 + 副标题「为特定工作流预配置的技能组合。先预览后购买，Pro 会员可直接下载」+ 橙色「查看全部组合 →」+ 6 张组合包卡片（OSS Investment Scorecard、Solopreneur Toolkit、AI Video Ad Generator 等），卡片带 FEATURED 角标、封面图、包含 skill 数、credits 价格、「View Details」按钮。
6. Pro 转化条：「👑 升级 Pro 会员解锁全部精选技能组合包 升级 Pro」。
7. For creators / Publish once：引导发布者区。
8. Newsletter：「Stay Updated」+ 邮箱输入。
9. CLI 入口：「Prefer the terminal?」+ `npx @skill-hub/cli install frontend-design` 等代码块。
10. FAQ（Claude Skills 是什么、如何安装、如何创建、评分维度等）。
11. 页脚：关于、联系、GitHub、Claude 文档等。

## 配色与气质（主色 / 底色 / 字体气质 / 信息密度，必须来自截图实看）
- 主色：几乎纯黑白骨架；黑色用于主按钮、文字、边框；白色背景。
- 点缀色：琥珀/橙色用于 FEATURED 角标、「查看全部组合」按钮、Pro 升级提示；蓝色仅用于少量图标/链接（如「开始了解」弹窗按钮）。
- 底色：纯白，卡片浅灰/白底，整体干净高对比。
- 字体：中文黑体 + 英文无衬线，标题字重很重（粗黑），正文灰度层次丰富。
- 气质：工具型、目录站、理性、信息密集；不像 SaaS 营销页，更像「带电商属性的垂直搜索」。
- 信息密度：高——首屏即塞入数据条、搜索、标签、CTA、S 级卡片。

## 转化路径（落地 → 下载 / 安装 / 注册 / 浏览 的路径设计）
- 落地即搜索：用户可直接在 Hero 搜索框输入需求 → 进入结果页浏览 Skills。
- 浏览路径：点击「浏览全部 SKILLS」或 S 级卡片 → 进入目录列表 → 点击 skill → 详情页 → 复制 SKILL.md 或一键安装（依赖 Desktop 客户端/CLI）。
- 付费路径：在「技能组合包」区块看到 FEATURED 卡片 → View Details → 预览 → 触发 Pro 订阅或购买 Credits。
- 发布路径：「发布 SKILL」→ 引导创建/上传 SKILL.md。
- Desktop 转化：顶部「启动应用」+ 弹窗「SkillHub Desktop 来了！」（一键安装到 Claude Code、本地管理收藏）。

## 值得抄（具体到组件与手法，禁止"简洁大气"这类空话）
- **Hero 数据条**：把「已发布 Skills 数 / 分类数 / Agent 平台数 / 目录更新时间」做成紧凑的 4 列指标条，立刻建立平台规模感和 freshness。
- **搜索框即 CTA**：首页最大交互点是搜索框，占位文案用「你希望 Agent 学会做什么？」把功能诉求直接翻译成用户语言。
- **S 级徽章系统**：给 skill 打 S/A 等级并前置展示，降低选择成本，也制造质量背书。
- **组合包卡片**：用封面图 + FEATURED 角标 + 包含 skill 数 + credits 价格，把「虚拟服务」包装成可商品化的套装。
- **CLI 代码块作为转化入口**：在页尾放可复制执行的 `npx` 命令，把开发者用户自然引流到命令行工具。

## 不值得抄 / 对我们不适用
- **首页同时是目录+电商+创作者平台**：yo-skill 是管理工具，不是 skill 市场，不需要在官网首屏塞大量目录卡片和 credits 定价。
- **橙色 FEATURED 角标过多**：多个卡片同时出现 FEATURED 会降低标签意义，对 yo-skill 的「精选推荐」应更克制。
- **Pro 付费墙前置**：技能组合包区块对未登录用户直接展示付费按钮，可能让小白用户感到门槛；yo-skill 首屏应优先讲清「统一管理」价值。
- **语言混杂**：中英双语标题和英文为主的 skill 卡片对中文小白不够友好，yo-skill 界面术语已冻结为中文优先。

## 截图（列出本次两张 jpg 路径）
- `G:/work/project/skill-manager/mavis-deep-research/20260813_100940_official_site_design_reference/shots/skillhub-top.jpg`
- `G:/work/project/skill-manager/mavis-deep-research/20260813_100940_official_site_design_reference/shots/skillhub-mid.jpg`
