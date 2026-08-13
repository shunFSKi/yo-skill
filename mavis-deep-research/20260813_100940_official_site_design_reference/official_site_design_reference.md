# 同类官网设计参考调研（12 站）

> - **调研日期**：2026-08-13
> - **目的**：为 yo-skill 公开官网（`prototype/web/`）的改版提供设计参照与决策依据
> - **立场**：抄手法不抄皮。所有结论可追溯到 `sites/` 下 12 张站点卡片与 `shots/` 下 24 张真实浏览器截图（Kimi WebBridge，2026-08-13 快照）
> - **范围说明**：本次调研的是"官网/发现站的**设计打法**"，竞品数据管线与商业模式对比见 `../20260812_230034_skill_registry_pipeline/`

---

## 一、调研范围与方法

12 个站点分三组：

| 组 | 站点 | 选取理由 |
|---|---|---|
| Skill 生态 | skillhub.club【1】、claudeskills.info【2】、skills.sh【3】 | 直接同类：Skill 目录/市场 |
| MCP 目录 | smithery.ai【4】、glama.ai【5】、mcp.so【6】、pulsemcp.com【7】 | 直接同类：MCP 目录/注册表 |
| 产品标杆 | happycapy.ai【8】、cline.bot【9】、raycast.com【10】、1password.com【11】、cursor.com【12】 | 同气质参照：happycapy 同生态、cline 同生态开源、raycast=store 模式标杆、1password=我们定位对标、cursor=AI 工具官网标杆 |

方法：每站真实浏览器截首屏 + 中段（存 `shots/<slug>-top/mid.jpg`），提取导航/标题/CTA/区块结构，写站点卡片（存 `sites/<slug>.md`）。

## 二、12 站总览

| 站 | 一句话定位 | 首屏视觉形式 | 主 CTA | 配色气质 | 商业模式 |
|---|---|---|---|---|---|
| skillhub.club | Skill 目录 + 市场混合体 | 纯排版 + 4 列数据条 + 大搜索框 | 搜索 / 浏览全部 Skills / 发布 Skill | 白底黑字高密度，电商感 | Pro 订阅（Premium Stacks 付费墙） |
| claudeskills.info | Claude Skills 聚合目录 | 官方集合卡片 + 分类网格 | 浏览集合 | 暖棕色调社区精选感 | 免费（引流） |
| skills.sh | Vercel 官方 Skill 排行榜 | ASCII logo + CLI 代码块 | 复制 `npx skills add` 命令 | 全黑终端极客风 | 免费（Vercel 生态引流） |
| smithery.ai | MCP registry | 首屏下半直接铺 MCP 卡片流 | 浏览 / 安装 | 橙 + 暖灰开发者风 | 免费 + 托管服务 |
| glama.ai | MCP 巨型目录 | 高密度深色卡片流 | 浏览 | 深色极客高密度 | 免费 |
| mcp.so | MCP 消费级市场 | Trending 轮播 + 彩色分类大按钮 | 浏览 / Sign In | 浅色温馨消费级 | 广告赞助位 + 免费 |
| pulsemcp.com | MCP 资讯门户 | newsletter 订阅 + 手绘插画 | 订阅邮件 | 人文编辑气质 | 资讯 + 导流 |
| happycapy.ai | 云端 agent 电脑 | 动态占位 command bar（循环打字演示任务） | Start free | 暖灰人文风，衬线标题 | 订阅（Pro/Max） |
| cline.bot | 开源 coding agent | 安装命令代码块（IDE/CLI/SDK tab 切换） | 复制 `npm i -g cline` | 白底紫渐变硬核开源 | 开源引流 + 云服务 |
| raycast.com | 效率启动器 | 大文字 + 功能卡嵌真实产品 UI 局部截图 | Download | 纯黑高对比 | 订阅（Pro） |
| 1password.com | 密码/访问管理 | Business/Personal 分流开关 + Admin Console 截图 | 试用 / 联系销售 | 深蓝海渐变企业级 | 订阅（个人/家庭/团队/企业） |
| cursor.com | AI 编程 agent | 多窗口层叠产品场景图（Desktop + CLI） | Download for Windows | 浅色暖调留白大 | 订阅（Pro/Ultra/企业） |

## 三、核心发现：首屏只有四种打法

1. **产品界面即 hero**（cursor / raycast / happycapy / 1password）——把产品真实界面（层叠窗、局部功能卡、动态输入框、Admin Console）放在首屏正中，访客 3 秒看懂产品形态。**产品官网的标准打法。**
2. **目录即首页**（smithery / glama / skillhub / claudeskills）——首屏直接铺条目卡片流或搜索框，内容就是首页。**流量分发站的打法。**
3. **命令即 CTA**（skills.sh / cline）——首屏主行动不是按钮而是可复制的安装命令代码块，开发者 3 秒知道怎么用。**开发者工具零门槛打法。**
4. **内容/资讯驱动**（pulsemcp）——newsletter 订阅为北极星，靠类比教育区（"MCP 之于 AI 如同 HTTP 之于 Web"）建立认知。

**判断**：yo-skill 官网 = **打法 1 为主**（落地页获客转化）+ **打法 2 为辅**（发现站承接浏览与 SEO），我们现有结构方向正确；打法 3 的手法吸收进详情页 deeplink 芯片。打法 4 不适用 MVP。

## 四、值得抄的 12 个手法（按对我们的 ROI 排序）

| # | 手法 | 出处 | 落位到 yo-skill |
|---|---|---|---|
| 1 | **数据条建立规模感与新鲜度**：4 列数据（148.5K Skills / 29 分类 / 5 平台 / 目录更新时间） | skillhub【1】 | hero 下方加数据条：收录数 / 分类数 / 支持助手数 / 每日更新。成本最低、信任增益最高 |
| 2 | **官方集合卡片**：Anthropic / Microsoft / GitHub 官方 skill 集合做成可点击的背书卡（含条目数） | claudeskills【2】 | 发现站加"官方集合"入口卡；比纯 logo 墙多一层内容 |
| 3 | **可复制命令芯片**：安装命令做成等宽代码块 + 一键复制（cline 还做 IDE/CLI/SDK tab 切换） | skills.sh【3】、cline【9】 | 详情页 deeplink `yoskill://install?id=` 升级为可复制芯片，作为主行动 |
| 4 | **多窗口层叠场景图**：Desktop 大窗 + CLI 小窗层叠在艺术化背景上 | cursor【12】 | hero 从单窗升级为主屏 + 发现页双窗层叠，品牌记忆点 |
| 5 | **消费级彩色分类大按钮**：每分类一个 pastel 色胶囊大按钮 | mcp.so【6】 | 分类瓷砖 pastel 化（低饱和，不破 E 墨极骨架，翡翠仍只给交互） |
| 6 | **功能卡嵌真实 UI 局部截图**：不用抽象插画，直接放产品局部 | raycast【10】 | 叙事区已用整窗截图，可补局部特写卡（如合并按钮、同步点特写） |
| 7 | **动态占位演示**：输入框循环打字演示真实任务 | happycapy【8】 | hero 可做"一句话演示"轮播（"帮我把 5 个助手的 Skill 收进一个地方…"），小白秒懂 |
| 8 | **Trending 轮播横幅**："本周热门"轮播 + 浅色 blob 装饰 | mcp.so【6】 | 发现站顶部轮播位：本周热门 / 新收录 |
| 9 | **三徽章信任体系**：license / quality / maintenance 三分微徽章 | glama【5】 | "已扫描"单徽章升级：已扫描·分 / LICENSE / 活跃维护 三微章（详情页先行） |
| 10 | **顶部通知条**：细条通告（沙金色，克制） | 1password【11】 | 预留发布位（如"Windows 版上线"），平时隐藏 |
| 11 | **类比教育区 + 真人背书**："MCP 之于 AI 如同 HTTP 之于 Web" + 创始人出面 | pulsemcp【7】 | "为什么需要 yo-skill"类比区：Skill 散落在 5 个助手 = 密码记在 5 张便签上 |
| 12 | **Business/Personal 分流开关**：用户自我分流后看对应方案 | 1password【11】 | MVP 不适用（无团队版），记入 V2 候选 |

## 五、不做清单（竞品做了但我们不做）

- **不堆全量数字**（skillhub 148.5K、happycapy 2M+）——我们走精选 + 全量扫描路线，数据条只写真实收录量与扫描项数，宁小不假
- **不做广告/赞助位**（mcp.so Sponsors 区、skillhub 站内广告条）——MVP 无此商业模式，且伤信任
- **不学 glama 高密度纯黑极客风**——目标用户是小白，保持留白与低信息密度
- **不做企业版分流 / 联系销售入口**（1password / cursor Enterprise）——MVP 无团队版
- **首页不放 newsletter 订阅框**（pulsemcp）——北极星是下载不是订阅，V2 再评估

## 六、对 `prototype/web/` 的落地改版清单（按优先级）

- **P0**（下次迭代就做）：
  ① hero 下方加数据条（手法 1）
  ② 详情页 deeplink 升级可复制命令芯片（手法 3）
  ③ 分类瓷砖 pastel 化（手法 5）
- **P1**：
  ④ hero 双窗层叠（手法 4）或主屏/发现页截图轮播
  ⑤ 详情页三微章体系（手法 9）
  ⑥ 发现站顶部 Trending 位（手法 8）
- **P2**（随内容运营成熟再做）：
  ⑦ "为什么需要 yo-skill"类比教育区（手法 11）
  ⑧ 顶部通知条（手法 10）
  ⑨ hero 动态演示文案（手法 7）

## 参考资料

| # | 站点 | URL | 抓取日期 |
|---|---|---|---|
| 【1】 | SkillHub | https://www.skillhub.club/ | 2026-08-13 |
| 【2】 | claudeskills.info | https://claudeskills.info/ | 2026-08-13 |
| 【3】 | skills.sh（Vercel） | https://skills.sh/ | 2026-08-13 |
| 【4】 | Smithery | https://smithery.ai/ | 2026-08-13 |
| 【5】 | Glama MCP 目录 | https://glama.ai/mcp/servers | 2026-08-13 |
| 【6】 | mcp.so | https://mcp.so/ | 2026-08-13 |
| 【7】 | PulseMCP | https://www.pulsemcp.com/ | 2026-08-13 |
| 【8】 | Happycapy | https://happycapy.ai/ | 2026-08-13 |
| 【9】 | Cline | https://cline.bot/ | 2026-08-13 |
| 【10】 | Raycast | https://www.raycast.com/ | 2026-08-13 |
| 【11】 | 1Password | https://1password.com/ | 2026-08-13 |
| 【12】 | Cursor | https://cursor.com/ | 2026-08-13 |

每站详细分析见 `sites/<slug>.md`（12 张卡片），真实浏览器截图见 `shots/<slug>-top.jpg` / `shots/<slug>-mid.jpg`（24 张）。
