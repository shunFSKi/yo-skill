# 小白化一键操作的桌面产品设计范式调研

**调研周期**：2026 年 8 月 11 日  
**调研目的**：为 yo-skill 桌面端提炼可借鉴的 onboarding、核心操作简化、复杂概念降维设计范式。  
**核心问题**：
1. 竞品用什么隐喻向小白解释复杂概念？
2. 首屏引导怎么做？
3. 错误状态与冲突怎么呈现给非技术用户？
4. 设置页的信息如何分层？

---

## 报告文件

| 文件 | 内容 |
|---|---|
| `xiaobai_desktop_ux_paradigms.md` | 完整调研报告（约 3,000 字），覆盖 1Password、Raycast、Arc、Notion、Docker Desktop、GitHub Desktop、Linear、Cursor 及 Progressive Disclosure / Sensible Defaults 原则 |

---

## 三句话总结

**1Password 范式**：把"密钥 / 加密 / 同步"降维成"保险库 + 紧急工具包 + 已信任设备审批"，是 yo-skill 做 E2E 加密云同步时最值得抄的隐喻体系。

**Raycast 范式**：用一个搜索框聚合所有入口，让用户不需要记忆功能位置；配合 Frecency 排序和 Action Panel，小白也能自然养成键盘习惯。

**GitHub Desktop / Docker Desktop 范式**：把底层 CLI / git 术语翻译成动词按钮和可视化仪表板，但保留"高级用户可回退到原始界面"的逃生通道。

---

## 关键结论卡片

| 维度 | 结论 |
|---|---|
| 隐喻 | Skill = AI 大脑，MCP = AI 工具箱，yo-skill = 这些能力的"保险库" |
| 首屏 | 单一搜索框 + 按 Agent 分流 onboarding |
| 冲突呈现 | 并排卡片 + 差异高亮 + 三个动作按钮（保留 A / 保留 B / 合并） |
| 设置分层 | General / Sync / Security / Advanced 四层；高级参数默认折叠 |
| 默认值 | 冲突敏感度、同步频率、MCP 端口范围都应开箱即用 |
| 安全网 | 主密码 + 设备配对码 / 恢复码，避免一丢密钥就全丢 |

---

## 阅读建议

- 若时间有限：直接跳到报告第 9 节「对 yo-skill 的可迁移启示」。
- 若需设计讨论：重点看 1Password（隐喻）、Raycast（入口）、GitHub Desktop（冲突）、Linear（设置分层）四节。
- 若需原则支撑：看第 8 节 Progressive Disclosure 与 Sensible Defaults。

---

**交付完成**：2026/8/11 14:00
