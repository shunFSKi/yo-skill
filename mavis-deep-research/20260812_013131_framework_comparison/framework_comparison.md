# yo-skill 桌面实现框架选型对比

## 元信息

- **调研日期**:2026-08-12
- **目的**:在 AGENTS.md §3 已冻结的"Tauri"决策基础上,补齐 Wails / Flutter Desktop / .NET MAUI 等"第三方案"的空白(此前所有调研只在 Electron vs Tauri 之间二选一,无第三方案对标);验证 Tauri 决策是否仍然成立;给出前端框架与完整 MVP 技术栈建议。
- **立场**:独立开发者视角,服务于 yo-skill MVP 约束——macOS 第一 / Windows 第二 / Linux 后;不做移动端;闭源;已有 HTML/CSS 设计稿(`prototype/`,非产品代码);要"1Password / Things 3 做工"的精致 GUI。
- **判断口径**:敢下结论、数字可追溯、明确"抄什么 / 不抄什么"。

---

## 一、结论先行(TL;DR)

1. **桌面框架:Tauri 决策维持。** Wails / Flutter Desktop / .NET MAUI 经首次横向对比后**全部否决**(理由见 §四)。
2. **Tauri 必须打 4 条补丁**(来自 2026 生产实战痛点,见 §四.1):Linux 降级 / WebView2 引导 / updater 签名 / single-instance 注册顺序。
3. **诚实修正**:Tauri 的确定性优势是**包体积**,不是内存或启动——空应用实测它的内存/启动**不优于** Electron。真实优势在复杂应用无固定 Chromium+V8 开销。别信"Tauri 全面碾压"的宣传。
4. **前端层:React 18 + shadcn/ui + Tailwind + Vite + react-query**(抄 cc-switch 生产验证)。
5. **架构澄清**:Tauri 桌面端无 Node 运行时,`better-sqlite3` 仅用于 `apps/cli`,桌面端数据访问走 `rusqlite / tauri-plugin-sql`(Rust)。

---

## 二、候选框架清单

本次纳入对比的 5 个框架(覆盖所有"web 技术栈做桌面"+ 主流自渲染方案):

| 框架 | 语言 | 渲染 | 原决策状态 |
|---|---|---|---|
| Electron | JS/TS | 自带 Chromium | ❌ 已否决(作基线) |
| **Tauri 2.x** | Rust + TS | 系统 WebView | ✅ 已冻结 |
| Wails v3 | Go | 系统 WebView | 新增对比 |
| Flutter Desktop | Dart | 自带 Skia/Impeller | 新增对比 |
| .NET MAUI | C# | 原生 | 新增对比 |

> 注:Compose Desktop(Kotlin/JVM)与 Neutralino 因生态/成熟度原因未纳入主对比,文末 §七略提。

---

## 三、横向数据对比(2026 实测)

### 表 1:基础性能(空应用,Windows x64,Release)

数据源:Elanis/web-to-desktop-framework-comparison【1】(持续维护的客观对比仓库,2026-08-12 抓取)。

| 框架 | 安装包 | 内存(Release) | 启动时间 |
|---|---|---|---|
| Neutralino | ~2MB | ~514MB | — |
| **Tauri** | **~3-5MB** | **~313MB** | **~732ms** |
| Wails | ~8-11MB | ~317MB | ~573ms |
| Flutter | ~27MB | ~65MB | ~107ms |
| NodeGui | ~171MB | ~38MB(Debug) | — |
| Electron | ~306-364MB | ~260MB | ~202ms |

**关键读法**:
- **包体积**:Tauri 碾压级优势(3-5MB vs Electron 300MB+,~60-100 倍)。这是 Tauri 最硬的确定性优势。
- **内存**:⚠️ 反直觉——空应用下 Tauri(~313MB)**高于** Electron(~260MB)。原因是 Tauri 调起系统 WebView 进程,空应用下 WebView 自身开销占比大。Electron 在复杂应用下才暴露 Chromium+V8 固定开销。
- **启动**:Tauri(~732ms)**慢于** Electron(~202ms)和 Flutter(~107ms)。系统 WebView 冷启动有额外开销。

### 表 2:Tauri vs Electron(真实复杂应用,多源)

数据源:Rustify【2】、PkgPulse【3】、Levminer【4】。

| 指标 | Tauri | Electron |
|---|---|---|
| 包体积 | ~3-10MB | ~120-200MB |
| 空闲内存(真实应用) | ~40-80MB | ~150-400MB |
| macOS 渲染质感 | 系统 WebView(Safari 内核),接近原生 | 伪原生(Chromium 模拟) |

> 表 1 与表 2 的内存数字不矛盾:**表 1 是空应用**(WebView 自身基线开销主导,Tauri 不占优);**表 2 是真实复杂应用**(Electron 的 Chromium+V8 固定税主导,Tauri 反超)。给独立开发者的结论:**包体积选 Tauri 没争议;内存别拿空应用数字吹**。

### 表 3:能力矩阵

| 能力 | Tauri | Electron | Wails | Flutter | MAUI |
|---|---|---|---|---|---|
| 官方自动更新 | ✅ | ✅ | ❌ Planned | ❌(社区) | ❌ |
| 移动端(Android/iOS) | ✅(唯一全平台) | ❌ | ❌ | ✅ | 部分 |
| 跨平台渲染一致性 | ⚠️ 三引擎差异 | ✅ Chromium 统一 | ⚠️ 三引擎差异 | ✅ 自渲染像素级一致 | ✅ |
| 无边界窗口 | ✅ | ✅ | ✅ | ❌ not supported | ❌ not working【1】 |
| 生产验证(本赛道) | ✅ cc-switch 126k★ | ✅ Cindy 2k★ | ❌ 无对标 | ❌ 无对标 | ❌ |
| 生态/star | 92k+ | 122k | 26k | 178k | 年轻 |

---

## 四、各框架逐一评判

### 4.1 Tauri 2.x —— ✅ 维持,但打 4 条补丁

**为什么维持(优势)**

1. **包体积 ~3-5MB**,对独立开发者卖 C 端、要"轻"的产品是硬刚需(Electron 300MB 直接劝退小白首装)。
2. **本赛道有全栈生产验证**:cc-switch v3.19.2 用 Tauri 2.8.2 + React 18 + rusqlite + 一整套官方插件(single-instance / updater / deep-link / window-state)跑在 126k★ 的产品上【5】。意味着踩坑路径已被趟平、可直接抄。
3. **唯一官方支持移动端**的 web-to-desktop 框架——yo-skill MVP 不做移动端,但 V2 扩展时这是唯一不换框架的路径。
4. **Rust 内核**契合安全定位(E2E 加密、Argon2id、sha256 校验都有成熟 crate)。

**真实痛点(2026 生产实战,必须正视)**

来源:Hacker News【6】、Tauri Discussion #8524【7】、Firezone 博客【8】、Tauri 官方文档【9】【10】、Issue #13878【11】。

1. **三 WebView 引擎一致性("写一次,测三次")**:macOS=WKWebView / Windows=WebView2 / Linux=WebKitGTK。CSS 高级特性(scroll-driven animation、复杂 grid)在不同引擎渲染不同;三个引擎 bug 面各自不同。
2. **WebKitGTK 在 Linux 不稳定**:Tauri Discussion #8524 直接挂"WebKit is totally unstable",WebKit 上游修 bug 慢。**叠加** §三表 1 的数据(空应用 Linux 内存 Tauri 可能反超 Electron,见 Issue #5889【12】)——Linux 是 Tauri 最弱平台。
3. **WebView2 偶发安装失败(Windows)**:Firezone 报告"WebView2 just doesn't install sometimes",会砸首装率,连 CI 都会断。
4. **single-instance 插件必须第一个注册**【9】,否则被其他插件干扰;且跨版本(多次安装)可能失效;第二次启动静默无反馈【13】。
5. **updater 签名是常见坑**【10】:配置错 target 或 signing key 就静默失败;macOS 生产构建曾报所有外发网络请求失败【11】。

**裁决:维持 Tauri,加 4 条补丁(写进工程纪律)**

| # | 补丁 | 具体做法 | 抄谁 |
|---|---|---|---|
| 1 | **Linux 降级为"尽力而为"** | MVP 不承诺 Linux;打社区版标签,不进主战场测试矩阵。本来 AGENTS.md 就"Linux 后",这里明确**为什么** | 新增 |
| 2 | **Windows 带 WebView2 bootstrapper** | 安装包内嵌/链式安装 WebView2 Runtime,处理"装不上"的首装流失 | — |
| 3 | **updater RSA 签名 + GitHub Releases** | 走 `latest.json` + RSA pubkey 流程,CI 自动签名 | cc-switch §3.6 |
| 4 | **single-instance 第一个注册** | 在 Tauri Builder 最先 `.plugin(tauri_plugin_single_instance::init(...))` | cc-switch §3.6 |

### 4.2 Electron —— ❌ 维持否决

AGENTS.md 与 cindy_tech_reference.md §6.1 已否决,本次不翻案。理由维持:包 300MB+、Cindy 实测内存 500MB+、冷启动 1-3s、macOS 质感伪原生。Cindy 选 Electron 是因为它要同时吃桌面+移动(RN 共享 React 栈),yo-skill 不做移动端,这个理由不成立。

### 4.3 Wails(Go)—— ❌ 否决

**否决理由**:
1. **自动更新仍是 "Planned" 未落地**【1】——对要卖 C 端、要持续迭代的独立产品是硬伤(没法给小白用户推更新)。
2. **语言栈撕裂**:yo-skill 已定 TS(前端)+ Rust(Tauri 内核/加密),引入 Go = 三语言栈,独立开发者维护成本失控。
3. **无本赛道对标可抄**:cc-switch(Tauri)和 Cindy(Electron)都没用 Wails,踩坑只能自己趟。
4. 包体积(~8-11MB)虽小于 Electron,但仍 2-3 倍于 Tauri(带 Go runtime)。

**唯一适用场景**:你本人是 Go 重度开发者且不懂 Rust——但 AGENTS.md 已选 Rust 路线,此场景不成立。

### 4.4 Flutter Desktop(Dart)—— ❌ 否决

**否决理由**:
1. **无官方自动更新方案**(仅社区方案)【1】——同 Wails 的硬伤。
2. **视觉风格不匹配设计稿**:设计稿(`prototype/` + `DESIGN.md`)是 Web 视觉风格,React + shadcn/ui 能直接落地;Flutter 自带 Material/Cupertino,逼近该设计稿要大量自定义。(注:`prototype/` 是设计稿非产品代码,无论选哪个框架都从设计稿重画,故不作为否决主因——Flutter 否决主因仍是"无官方 updater + Rust 互操作复杂"。)
3. **Rust 互操作复杂**:Flutter(Dart)与加密/SQLite 的 Rust 生态要靠 `flutter_rust_bridge`,多一层 FFI 复杂度;Tauri 天生 Rust 内核无此问题。
4. **"1Password 质感"不占优**:Flutter 桌面默认 Material/Cupertino,做精致原生质感要大量自定义;而 shadcn/ui + 系统 WebView 在 macOS 上天然接近原生。
5. 虽然它内存最低(65MB)/启动最快(107ms),但上述 4 条否决项与性能无关。

### 4.5 .NET MAUI(C#)—— ❌ 否决

**否决理由**:
1. **最不成熟**:Elanis 基准里它大量标 N/A / WIP,无边界模式直接 "not working"【1】。
2. **企业向**:生态偏企业内部工具,卖 C 端小白用户违和;C# 桌面在独立开发者圈子冷门。
3. 自动更新标 "No"。无本赛道对标。

---

## 五、前端框架选型(框架内的框架)

桌面容器定 Tauri 后,前端栈还要选。这是 AGENTS.md 没冻结的空白。

### 5.1 推荐:React 18 + shadcn/ui + Tailwind + Vite + react-query

| 层 | 选型 | 理由 |
|---|---|---|
| UI 框架 | **React 18** | cc-switch 生产验证【5】;生态最大;shadcn/ui 以 React 为主 |
| 组件库 | **shadcn/ui + Radix** | 契合"1Password/Things 3 做工";复制源码进项目可深度改;视觉定稿 V4 的中性灰+翡翠交互色好落地 |
| 样式 | **Tailwind CSS** | 与 shadcn/ui 同栈;设计稿(`DESIGN.md`)的视觉变量(`--accent`/`--warn`)直接定义 Tailwind 主题 |
| 构建 | **Vite** | cc-switch 同款;Tauri 官方推荐 |
| 表单 | **react-hook-form + zod** | cc-switch 同款;MVP 的设置抽屉/JSON 编辑用得上 |
| 异步状态 | **@tanstack/react-query** | cc-switch 同款;管 IPC 调用与缓存 |
| UI 状态 | **Zustand(按需)** | 过滤框/选中态/抽屉开关;比 Redux 轻,比 Context 不重渲染;MVP 可先用 useState,复杂了再引入 |
| 图标 | **lucide-react** | shadcn/ui 标配 |
| 拖拽 | **@dnd-kit(按需)** | dedupe 合并页要用;cc-switch 同款 |
| i18n | **不做(MVP)** | cc-switch §4.8 结论:先中文单语,V2 再上 i18next |

### 5.2 为什么不选 Vue / Svelte / SolidJS

- **Vue**:生态在缩减,shadcn/ui 官方无 Vue 版(shadcn-vue 是社区维护,滞后),与 cc-switch 可抄性归零。
- **Svelte / SvelteKit**:编译时框架,Tauri 集成需额外配置;生态小,踩坑只能自己查。
- **SolidJS**:性能极佳、心智模型接近 React,但生态太小、招聘/求助难。**留作 V2 性能优化观察项**,MVP 不选。

**结论**:独立开发者 + 设计稿是 Web 风格(React + shadcn/ui 直接落地)+ cc-switch 可抄 = **React 是最低风险路径**。性能差异在 yo-skill 这种"瓷砖墙 + 表单 + 列表"的体量下根本不是瓶颈。

---

## 六、推荐 MVP 技术栈(冻结建议)

| 维度 | 选型 | 备注 |
|---|---|---|
| 桌面容器 | **Tauri 2.x** | + 4 条补丁(§四.1) |
| 前端 | React 18 + shadcn/ui + Tailwind + Vite | §五 |
| 内核语言 | **Rust**(桌面) + **TypeScript**(前端 + CLI) | |
| CLI | Node 22 + TypeScript | `apps/cli` 独立可跑 |
| 本地存储 | **rusqlite / tauri-plugin-sql**(桌面) + **better-sqlite3**(CLI) | 见下方架构澄清 |
| 云端 vault | E2E 加密,Argon2id 派生密钥,云端只存密文 | AGENTS.md §6 不变 |
| 加密 | Rust crate:`argon2`、`aes-gcm`、`sha2` | |
| 工程形态 | pnpm monorepo,6-7 包 | AGENTS.md 不变 |
| 二进制分发 | pinned + sha256 + postinstall | 抄 Cindy §4.3 |
| 自动更新 | tauri-plugin-updater + RSA + GitHub Releases | 抄 cc-switch §3.6 |
| 单实例/窗口状态 | tauri-plugin-single-instance(最先注册)/ window-state | 抄 cc-switch §3.6 |
| 测试 | vitest + testing-library + jsdom + msw(前端);Rust cargo test(内核) | cc-switch §3.8 |
| telemetry | 单一 `analytics/` 目录,默认 no-op | 抄 Cindy §7.3 |
| 平台优先级 | macOS 第一 / Windows 第二 / Linux 尽力而为 | Linux 从"后"明确降为"尽力而为" |

### 架构澄清:better-sqlite3 vs rusqlite 的"双层"

AGENTS.md §3 写"本地 better-sqlite3 + 云端 E2E vault 双层"。这里有个**容易被忽略的架构事实**:**Tauri 桌面端没有 Node 运行时**,所以 `better-sqlite3`(Node 原生模块)在桌面进程内**无法直接使用**。正确的"双层"切分是**按进程**:

- `apps/cli`(Node CLI)→ **better-sqlite3**
- `apps/desktop`(Tauri/Rust)→ **rusqlite** 或 **tauri-plugin-sql**
- `packages/vault`(共享)→ 只定义 **schema + 迁移 SQL + 类型**,不绑定具体驱动

schema 必须两端一致(SQLite 方言本身跨驱动兼容),所以共享 SQL 文件 + TS 类型即可。cc-switch 的做法印证了这点:它桌面端纯 rusqlite(0.31,bundled + backup + hooks features)【5】。

> 建议:把这条澄清补进 AGENTS.md §3,避免编码时在桌面端误装 better-sqlite3 踩坑。

---

## 七、未纳入主对比的方案(略提)

- **Compose Desktop(Kotlin/JVM)**:JVM 启动税 + 桌面生态偏小,独立开发者 C 端产品不合适。
- **Neutralino**:包最小(~2MB)但内存高(514MB)+ 生态极小,玩具级,不纳入。
- **Electrobun / Deno Desktop**:太新/太小众,生产验证不足,观察。
- **Qt / NodeGui**:Qt 学习曲线 + NodeGui 生态小,与 web 原型不兼容,否决。

---

## 八、风险登记与下一步

| 风险 | 等级 | 缓解 |
|---|---|---|
| WebKitGTK Linux 不稳定 | 中 | Linux 降级为尽力而为,不进 MVP 验收 |
| WebView2 Windows 装不上 | 中 | 安装包带 bootstrapper;首装失败给手动下载链接 |
| updater 签名配错静默失败 | 中 | 抄 cc-switch 配置;CI 跑签名校验测试 |
| 三 WebView 渲染差异 | 中 | macOS/Windows 双平台必测;原型先用稳妥 CSS,避开 scroll-driven animation 等新特性 |
| Rust 学习曲线(若不熟) | 低-中 | cc-switch 的 commands 层是现成模板;加密/SQLite 用成熟 crate |

**下一步建议**:
1. 把本报告的"4 条 Tauri 补丁" + "better-sqlite3 按进程分层"写进 AGENTS.md §3 作为补充条款。
2. 起 `apps/desktop` 骨架时,直接以 cc-switch v3.19.2 的 `tauri.conf.json` + updater + single-instance 配置为模板。
3. 先做一个**最小验证**:把 `prototype/index.html` 塞进 Tauri webview,在 macOS WKWebView 下实测 E 墨极配色 + 思源黑体 + 翡翠交互色的渲染一致性。这能花一天时间排除最大的不确定性。

---

## 参考资料

| # | 来源 | 链接 | 抓取日期 |
|---|---|---|---|
| 【1】 | Elanis/web-to-desktop-framework-comparison(GitHub,持续维护的横向基准) | https://github.com/Elanis/web-to-desktop-framework-comparison | 2026-08-12 |
| 【2】 | Rustify:Tauri vs Electron 2026 | https://rustify.rs/articles/rust-tauri-vs-electron-2026 | 2026-08-12 |
| 【3】 | PkgPulse:Electron vs Tauri 2026 | https://www.pkgpulse.com/guides/electron-vs-tauri-2026 | 2026-08-12 |
| 【4】 | Levminer:Tauri VS Electron Real World | https://www.levminer.com/blog/tauri-vs-electron | 2026-08-12 |
| 【5】 | cc_switch_design_reference.md(本仓库,cc-switch v3.19.2 全栈对标) | `mavis-deep-research/20260811_120500_cc_switch_design_reference/` | 2026-08-11 |
| 【6】 | Hacker News:system webviews 跨平台一致性讨论 | https://news.ycombinator.com/item?id=47070409 | 2026-08-12 |
| 【7】 | Tauri Discussion #8524:WebKitGTK 稳定性 | https://github.com/orgs/tauri-apps/discussions/8524 | 2026-08-12 |
| 【8】 | Firezone blog:使用 Tauri 的实战(WebView2 安装问题) | https://www.firezone.dev/blog/using-tauri | 2026-08-12 |
| 【9】 | Tauri 官方:single-instance 插件 | https://v2.tauri.app/plugin/single-instance/ | 2026-08-12 |
| 【10】 | Tauri 官方:updater 插件 | https://v2.tauri.app/plugin/updater/ | 2026-08-12 |
| 【11】 | Tauri Issue #13878:macOS 生产构建网络请求失败 | https://github.com/tauri-apps/tauri/issues/13878 | 2026-08-12 |
| 【12】 | Tauri Issue #5889:Linux 内存可能反超 Electron | https://github.com/tauri-apps/tauri/issues/5889 | 2026-08-12 |
| 【13】 | plugins-workspace #280:single-instance 无用户反馈 | https://github.com/tauri-apps/plugins-workspace/issues/280 | 2026-08-12 |

> 时效性声明:框架版本、star 数、Issue 状态均为 **2026-08-12 快照**;Tauri/Wails/Flutter 的能力矩阵(尤其 updater、移动端支持)会随版本演进,落地编码前建议复核最新状态。
