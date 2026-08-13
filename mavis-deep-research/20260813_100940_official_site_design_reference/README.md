# 同类官网设计参考调研（2026-08-13）

> 12 个同类/同气质官网的设计打法调研，为 yo-skill 公开官网（`prototype/web/`）改版提供参照。

## 三句话总结

1. 同类官网首屏只有四种打法：**产品界面即 hero**（cursor/raycast/1password/happycapy）、**目录即首页**（smithery/glama/skillhub/claudeskills）、**命令即 CTA**（skills.sh/cline）、**内容驱动**（pulsemcp）；yo-skill = 打法 1 为主 + 打法 2 为辅，现有结构方向正确。
2. 最值得抄的五件事：**hero 数据条**（skillhub）、**官方集合卡**（claudeskills）、**可复制命令芯片**（skills.sh/cline）、**双窗层叠场景图**（cursor）、**消费级 pastel 分类按钮**（mcp.so）。
3. 明确不做：堆全量数字、广告赞助位、高密度极客黑、企业版分流、newsletter 订阅框。

## 文件清单

- `official_site_design_reference.md` —— 主报告（12 站总览表 / 四种打法 / 12 个可抄手法按 ROI 排序 / 不做清单 / 对 prototype/web/ 的 P0-P2 改版清单）**先读这个**
- `sites/` —— 12 张站点卡片（首屏/区块/配色/转化路径/值得抄/不值得抄）
- `shots/` —— 24 张真实浏览器截图（Kimi WebBridge，首屏 + 中段）

## 关键数据卡片

| 维度 | 结论 |
|---|---|
|  hero 主流形式 | 产品真实界面（截图/层叠窗/动态输入框），抽象插画已过时 |
| 数据条 | skillhub 用 4 列（收录/分类/平台/更新时间）建立规模感与新鲜度，我们 P0 抄 |
| 信任徽章 | glama 三分微徽章（license/quality/maintenance）＞我们单徽章，详情页升级方向 |
| 分类入口 | mcp.so pastel 彩色大按钮最消费级，适合小白；我们的黑白瓷砖要 pastel 化 |
| 安装转化 | skills.sh/cline 首屏直接放可复制命令块；我们详情页 deeplink 芯片同理升级 |

## 与既有调研的关系

- 数据管线与竞品**商业模式**对比：`../20260812_230034_skill_registry_pipeline/`（本目录只看**设计打法**）
- 视觉定稿 V4（E 墨极 + 翡翠）见根目录 `DESIGN.md`——本站所有手法落地时都必须换算到该设计系统内
