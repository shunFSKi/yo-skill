# Product

<!-- impeccable:product-schema 1 -->

## Platform

web（设计原型为静态网页；最终产品形态为 Tauri 桌面应用，原型即桌面端 UI 的高保真预览）

## Stack

用户已选定：纯静态 HTML/CSS（单文件多屏原型，浏览器直接打开评审；后续可拆进 Tauri 前端）

## Users

25-40 岁的 AI 重度但不懂 Skill/MCP 术语的小白用户。场景：用 Claude Code / Codex 等 AI 助手工作，想在多台电脑间保持 AI 能力一致，但不愿碰终端、JSON、配置文件路径。

## Product Purpose

yo-skill 帮用户统一管理多个 AI 助手（Agent）的 Skill 与 MCP：自动识别本机 Agent、收拢去重、一键安装/更新、E2E 加密跨电脑同步。一句话定位（已定稿）："让 AI 学会新本事，跨电脑随身带"。成功 = 用户全程不碰终端完成所有管理意图。

## Positioning

"AI 工具的 1Password"：唯一直接竞品全是 CLI + 本地 + git-based；yo-skill 是 GUI + 云同步 + 收拢去重（单一事实源）+ 冲突/重复检测的小白化桌面管理器。

## Operating Context

桌面端按需打开的管理工具：首次 onboarding（扫描导入）、日常发现安装、启停开关、重复项合并、冲突解决、Agent 更新、换新电脑一键恢复（核心付费场景/啊哈时刻）。

## Capabilities and Constraints

- 六条用户旅程、11 个"一键点"（详见 `mavis-deep-research/20260811_161937_yoskill_product_design/yoskill_product_design.md`）
- 主流 Agent 全支持（2026-08-12 用户改定，原"MVP 只支持 Claude Code + Codex"已推翻）：Claude Code / Codex / Gemini CLI / Cursor / Windsurf / GitHub Copilot / Kimi Code 等，界面用真实品牌 logo；不做移动端/团队版/开放市场入驻
- 界面术语（2026-08-11 用户改定）：Agent 称 AI 助手，Skill / MCP / API Key 直接用原文，导航为 已安装 / 发现；原隐喻体系（大脑/本事/工具箱/保险库/钥匙）已废弃；仍禁用 server/JSON/env/dedupe 等实现词
- 冲突页与重复页是异常态、不占常驻导航；导航项 ≤3
- 云端只存密文（E2E）；telemetry 默认 no-op

## Brand Commitments

- 产品名：`yo-skill`（全小写连字符，唯一对外口径）
- 色彩（V4，2026-08-11 用户改定）：**E 墨极**黑白骨架 + 功能色——交互翡翠 `#29A383`（Radix jade 同族；一切可点行动：按钮/开关/选中）、成功徽章中性化（中性灰底 + 翡翠勾，`--ok` 绿 `#30A46C` 仅留同步点等微小语义位）、危险红 `#E5484D`（仅卸载类 quiet）、琥珀橙 `#E8890C` 仅提醒（可更新/重复/冲突/需要 API Key），含完整深色模式；V2"行动层纯黑白"、V3"交互蓝"均已修订（蓝太普通、紫"AI 味"被否），薄荷绿旧案已废弃，候选对比存档于 `prototype/themes.html` 与 `prototype/colors.html`
- 字体：中文思源黑体（Source Han Sans / Noto Sans SC）、英文 Inter
- 调性：温暖友好的工具产品，敢下判断但不说教；错误文案说人话+给出路

## Evidence on Hand

- 产品设计定稿 V2：`mavis-deep-research/20260811_161937_yoskill_product_design/yoskill_product_design.md`
- 品牌定稿：`mavis-deep-research/20260811_105510_colaos_ai_deep_research/yo-skill_brand_brief.md`
- 竞品/范式调研：同目录下 3 份报告 + cc-switch 对标
- 没有 logo 文件、没有真实用户数据、没有截图素材；原型中的 Skill/MCP 条目为演示数据（需标注合成）

## Product Principles

1. 一键闭环：一次点击，产品兜底，结果可见；需要碰终端/文件/复制粘贴的交互视为设计事故
2. 术语直白：界面直接用 Skill / MCP / API Key 等通用名词，不造隐喻（2026-08-11 起原 助手/大脑/工具箱/保险库/钥匙 五概念体系废弃）
3. 渐进披露：首屏只呈现"你现在能做什么"，高级参数默认折叠，sensible defaults 开箱即用
4. 聚合管理：按能力聚合（跨 Agent 去重），一处更新多处生效
