# @yo-skill/web

yo-skill 官网 / Web 应用 —— Next.js 15 (App Router) 全栈，承载官网落地页、Skill 与 MCP 市场（静态数据版已上线）、会员系统（Phase 3）。

## 启动

在仓库根目录：

```bash
pnpm install
pnpm dev             # 启动 web，打开 http://localhost:3000
pnpm build           # 生产构建（市场详情页头部 200 条 SSG 预渲染，长尾按需 ISR）
pnpm lint            # ESLint
pnpm typecheck       # 全 workspace TS 检查
pnpm fetch:registry  # 重跑市场数据管线，刷新 public/registry/*.json
```

> 需要 Node 22+ / pnpm 10+。Phase 1 官网落地页无需任何环境变量。
>
> ⚠️ **踩坑**：跑过 `pnpm build` 后若 `pnpm dev` 出现样式丢失 / 交互失效 / 页面不 hydrate（图谱不画、主题切不了），
> 是 production build 产物污染了 `.next`，dev 加载不到 `main-app.js` 等运行时 chunk。
> 删掉 `apps/web/.next` 再 `pnpm dev` 即可恢复。

## 架构

```
src/
├── app/
│   ├── layout.tsx          # 字体(next/font) + 主题(next-themes) + 全局 WaitlistDialog
│   ├── page.tsx            # 官网落地页（9 区块）
│   ├── globals.css         # 纸上墨字 + 一笔翡翠设计系统（CSS 变量 + 组件类）
│   ├── market/             # 市场发现页（4 万+ 条：服务端过滤，URL 即状态——分段/分类/分词搜索/排序/分页全走 searchParams，客户端岛只渲染当前页 48 条并回写 URL；见 lib/market-query.ts）
│   │   └── item/[id]/      # 条目详情：头部 200 条 SSG 预渲染 + 长尾按需 ISR（1d）
│   ├── account/            # Phase 3 会员占位
│   └── api/waitlist/       # 等待列表（Phase 1 仅日志，Phase 2 接 DB）
├── components/
│   ├── theme-provider.tsx  # next-themes 包装
│   └── site/               # 落地页区块组件（含活的产品预览窗 product-preview、
│                           # 签名笔触 stroke、交互小岛 live-demos）+ market-explorer 市场岛
├── lib/                    # utils / 站点数据 / waitlist 触发器 / registry 数据层
│                           # （构建期读 JSON）/ safe-id / colors 哈希着色
└── server/                 # db / auth 预留（Phase 3）
```

市场数据来自 `tools/registry-pipeline`（根目录 `pnpm fetch:registry`）：从公开接口
（claudeskills.info 全量 + MCP 官方 Registry 全分页 + GitHub 代码搜索采集 SKILL.md）
拉真实条目元数据，过 5 条静态扫描规则 +
场景分类打标，并按 repo 去重抓取源仓库 README（raw.githubusercontent.com，
截断 12KB，抓不到不显示），落盘 `public/registry/`（`index.json` + `items/*.json` +
`meta.json`）。页面构建期/请求期直接读 JSON（进程内缓存），不需要运行时数据库；重跑管线即更新，
真部署时用 GitHub Actions 定时跑即可。徽章只说「已扫描」不说「安全」，被拦条目不出库。
README 用 react-markdown + `skipHtml` 渲染（丢弃原始 HTML，无注入面）。
定时同步工作流与数据仓库（GitHub 主 + Gitee 镜像）接入步骤见
`tools/registry-pipeline/README.md` 与 `.github/workflows/registry-sync.yml`。

monorepo：`apps/web` + `packages/ui-kit`（共享 UI，与未来的 `apps/desktop` 复用）
+ `tools/registry-pipeline`（市场数据管线）。

## 视觉系统：纸上墨字 + 一笔翡翠

**完全独立设计，不复用桌面端品牌资产；不摆放桌面端截图，产品一律以活组件预览呈现（hero 预览窗可切分段、可拨开关，bento 两格嵌可点交互）。** 配色与字体落地于 `globals.css` 的 CSS 变量：

- 暖纸 `#F7F6F2` × 温墨 `#1B1B18` 骨架，唯一强调色 = 品牌翡翠 `#29A383` 全站锁定；行动按钮深翡翠 `#1E7D60` 实心底（白字 AA）
- 暖夜深色 `#131311` / `#F2F1EB` / 翡翠提亮 `#2FB490`（按钮转翡翠底墨字）
- 一处刻意「墨块」段落（换机恢复 + 安全底线合并一区）做全页唯一色彩转折
- 签名元素：标题关键词下的手绘感翡翠笔触（SVG stroke 描画动画，`stroke.tsx`），仅用两处：hero「一键」、FinalCTA「好用」
- 字体：拉丁 Inter + 中文思源黑体（next/font 加载，等宽用 ui-monospace 系统栈）
- 纯黑系 Agent logo 深色下自动反白（`site-data.ts` 的 `darkInvert` 标记）
- 动效：IntersectionObserver 滚动显现 + 笔触描画（无 scroll 监听动画），全量 `prefers-reduced-motion` 降级

## 分期路线

| Phase | 内容 | 状态 |
| ----- | ---- | ---- |
| 1 | monorepo 骨架 + 官网落地页 + 等待列表 | ✅ |
| 2 | Skill 与 MCP 市场（真实数据静态版：浏览/搜索/分类/排序/详情 SSG，安装 CTA 统一弹等待列表） | ✅（2026-08-13）；原 Postgres/Prisma 方案被静态 registry JSON 取代 |
| 3 | 会员系统（Auth.js + Stripe + 账户中心） | 预留路由 `app/account`、`server/auth` |
| 4 | 与桌面端集成（云同步 API、deeplink、`packages/ui-kit` 共享） | — |

## 红线（绝对避免）

- cindy.app 五大招牌：mono 编号标签 / marquee 滚动带 / ghost 水印 / crosshair / 黑段顶边线卡（任一出现即视为抄袭——上一版官网因此被删）。
- 堆全量假数字、广告位、企业版入口、首页 newsletter 框。
- 文案隐喻：大脑 / 工具箱 / 保险库 / 钥匙；企业级话术（赋能 / 资产治理 / 释放生产力）；硬核术语（Model Context Protocol）。
- 廉价渐变、过度玻璃拟态（暖调以纸面质感为主）。

## 文案口径

- 产品名一律 `yo-skill`（全小写连字符）。
- 产品术语一律用**源名称**：`Agent` / `Skill` / `MCP` / `API Key`，不用中文翻译词（不写"AI 助手""工具""本事"）。
- 首屏主口号：「一键，管好你所有的 Agent」（"一键"用赭橙强调）。
- 副标：不用碰命令行，yo-skill 自动认出你电脑里的 Agent，挑好 Skill、配好 MCP，一键装好管好。换电脑也随身带。
- PRODUCT.md 内部定位句「让 AI 学会新本事，跨电脑随身带」是产品层事实，官网对外用更直白、强调"一键 / 多平台 / 小白操作"的口径。
