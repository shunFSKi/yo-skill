# @yo-skill/registry-pipeline

市场数据管线：从公开目录拉真实条目元数据 → 静态扫描 + 场景分类 + 综合质量分 → 抓源仓库 README → 落盘静态 JSON。

**只存信息，不存代码**：每条目存"叫什么 / 谁写的 / 怎么装 / 要什么 Key / 扫描结果 / README"，安装永远回源仓库（供应链纪律）。

## 数据源

| 来源 | 内容 | 接口 |
| ---- | ---- | ---- |
| claudeskills.info | Skill 全量（按源仓库去重的 repo 级条目） | 免 key JSON API |
| MCP 官方 Registry | MCP server 全量（active + 最新版去重，全分页） | 免 key JSON API |
| GitHub 代码搜索 | **每日定额增量**采集 SKILL.md（size 分片绕 1000 上限；`GITHUB_HARVEST_DAILY` 默认 8000/次，状态存 `harvest-cache.json`：分片队列 + 全量记录含墓碑，队列扫完自动重置专扫新文件；需 `GITHUB_TOKEN`/`REGISTRY_TOKEN`） | search/code API |
| GitHub GraphQL | repo stars/pushedAt/license 富化 + 每日 star 快照（100 repo/批，缓存 `stars-cache.json`，每日增量，`STARS_MAX_REPOS` 默认 4500；快照每 repo 最多 30 个点，详情页画「近段时间」曲线；license 取 `licenseInfo.spdxId`，2026-08-15 起随缓存自然过期节奏补齐，不强制全量重抓） | graphql API |
| GitHub 源仓库 | 根 README 完整抓取（按 repo 去重，截断 200KB；分层：featured + stars 前 1500 + MCP 新近 300） | raw.githubusercontent.com |

**增量采集（2026-08-14 拍板）**：不搞一次性全量（会顶到 CI 6 小时上限且配额风险大），每天固定采一批，官网随每日提交实时增长，十几天爬完全量（参照 agentskillshub 标称 13 万+）。已采文件的内容变化不回溯——换 CI 时长与配额的确定性。

**收录口径（2026-08-14 拍板，对齐 skills.sh 质量门槛思路）**：GitHub 源只收文件 ≥500B（frontmatter 之外要有正文）、description ≥20 字符、路径不在 test/fixture/example/template/node_modules/docs 黑名单里的 SKILL.md；同名同描述的 fork/复制洪水去重，只留 stars 最高的一份。曾踩坑：25k 上限在 101-224B 分片就打满，>300B 的正经 skill（superpowers 等）整批漏采，且 ≤300B 文件全是占位垃圾——所以下限和上限一起改。

**综合质量分（score.ts，0-100）**：参考 agentskillshub 的多维评分思路取可用子集——stars 对数分（45）+ 维护新鲜度（20）+ 静态扫描通过（15）+ README（10）+ 描述丰富度（10），落进每条 item 的 `quality.score`，官网「推荐优先」排序依据；「Stars 高到低」保留为可选排序。

**场景分类（tag.ts，2026-08-15 扩充 5 → 10 类）**：`写作 / 编程 / 设计 / 办公 / 生活 / 金融 / AI / 数据 / 运维 / 营销`。关键词命中计数取最多，无命中保持 null（精确率优先，不硬塞）。扩充依据：对 16,783 条无分类条目均匀抽样 200 条人工判读（金融 ~14% / AI ~14% / 数据 ~10% / 运维 ~8% / 营销 ~6%；教育、媒体占比 <2% 不立类）；全库干跑无分类占比 57.5% → 36.4%。关键词避让清单（sem→semantic、tax→taxonomy、stock→库存、crypto→cryptographic、defi→definition、cli→client 等）见 tag.ts 头注。

## 用法

```bash
pnpm fetch:registry        # 仓库根目录；等价于 pnpm --filter @yo-skill/registry-pipeline fetch
pnpm typecheck             # 本包 TS 检查
pnpm migrate:index-fields  # 一次性迁移：给存量 index.json 补 pushed_at/added_at/remote/license（见下）
pnpm shard:index           # 一次性/手动补产：从存量 index.json 生成 shards/ 分片（不联网，幂等）
```

- 产物：`apps/web/public/registry/`（`meta.json` + `index.json` + `items/*.json` + `shards/` 分片），官网构建期直接读，全站 SSG
- **幂等**：数据无变化时不落盘（`generated_at` 不动）；有变化才整体重写（清掉过期条目）并打新时间戳。`generated_at` 是下游判断要不要同步的锚点
- **代理**：fetch 自动走 `HTTP_PROXY` / `HTTPS_PROXY`（undici `EnvHttpProxyAgent`），没配代理则直连；注意 raw.githubusercontent.com 在大陆直连不通（DNS 污染），跑管线需要代理或 CI
- 输出目录可用环境变量覆盖：`REGISTRY_OUT_DIR=/path/to/repo node src/index.ts`

## 数据结构（数据仓库布局即此）

```
meta.json           # schema_version + generated_at + counts：同步锚点，客户端先拉它比对
index.json          # 全量卡片索引（每条最小集），列表页一次拉完
shards/             # index 的分片形态（2026-08-16 起）：manifest.json + index-NNN.json 紧凑数组（单片 ≤800KB）。
                    # 为什么存在：镜像源单文件上限——Gitee raw >1MB 匿名 403、jsDelivr ≤20MB——整包 index
                    # 已 ~17MB 且随日采增长，分片是唯一全镜像可用、无增长天花板的形态；桌面端分片优先、整包兜底。
                    # 手动补产：pnpm shard:index（scripts/shard-index.ts，不联网，幂等；管线跑批自动产出）
items/*.json        # 每条完整档案（安装配方 / env / 扫描明细 / README），详情页按需懒拉
stars-cache.json    # GitHub repo stars/pushedAt/license 富化缓存 + 每日 star 快照（每 repo 最多 30 点）：每日增量补新 + 7 天过期刷新
harvest-cache.json  # SKILL.md 增量采集状态：待采分片队列 + 全量采集记录（含墓碑；2026-08-15 起新记录带 ts 首见日期，旧记录不回补）
```

**index.json 条目字段**（2026-08-15 扩充，新增四个）：

| 字段 | 口径 |
| ---- | ---- |
| id / type / name / description / stars / score / scanned / category / featured / needsKey / repo | 原有最小集 |
| `pushed_at` | 源仓库最近推送时间（自 item `quality.pushed_at` 提升）；null = 来源没给 |
| `added_at` | 首次收录日（YYYY-MM-DD）。写盘时读上一版 index.json：已有 id 保留原值（含 null），新 id 记当天；上一版不存在则全 null。同一天重跑逐字节一致，不破坏幂等；存量条目（2026-08-15 迁移前收录）永久为 null——收录日不可考，不造假 |
| `remote` | `install.kind === "remote"`（纯远程 MCP，免安装） |
| `license` | 源仓库 SPDX id（GraphQL `licenseInfo` 经 stars-cache 流入）；null = 未知或未轮到补抓 |

**一次性迁移脚本**：`scripts/migrate-index-fields.ts`（`pnpm migrate:index-fields`）——不联网给存量 index.json 补上述四字段（pushed_at/remote 从 items/*.json 读，added_at/license 全 null 等真实数据源），字段顺序与 `toIndexItem` 一致保证下次跑批 diff 干净；写完回读自验条数与字段齐全。2026-08-15 已执行：29,167 条条数不变，pushed_at 有值 28,974、remote=true 9,937。

## 定时同步（GitHub Actions）

工作流在仓库根 `.github/workflows/registry-sync.yml`，每天 UTC 03:17 / 15:17 跑，也可手动触发。

开箱即用：刷新本仓库 `apps/web/public/registry/` 并有变化才提交（官网托管平台检测到 push 自动重建，数据即"动态更新"）。提交步 push 前先 `git pull --rebase` 且重试 3 次——管线跑批约 2 小时，期间人工推送抢占 main 会导致数据 commit 被 fetch first 拒绝（2026-08-14 实测撞车）。

接入独立数据仓库（桌面端分发源）：

> 数据仓已建：**GitHub `shunFSKi/yo-skill-registry`**（公开，海外主仓）。以下为重建/换仓时的操作步骤。

1. 建一个公开仓库，首次先推一个 main 分支（空 README 即可）
2. 本仓库 Settings → Secrets and variables → Actions：
   - Variables 加 `REGISTRY_REPO` = `shunFSKi/yo-skill-registry`
   - Secrets 加 `REGISTRY_TOKEN` = 对数据仓有写权限的 PAT（Fine-grained，只授该仓 Contents: Read and write）
3. 下次定时/手动触发即自动同步推送（2026-08-14 已端到端验证跑通）

> 踩坑存档：同步用 `rsync -a --delete` 必须 `--exclude='.git'`——否则数据仓的 `.git` 被删，后续 git 命令上溯到主仓，会把整个 registry-data/ 提交进主仓（2026-08-14 实战事故，工作流里已有排除 + origin 守卫）。

接入 Gitee 国内镜像：

> 镜像仓已建：**Gitee `shunFSKi/yo-skill-registry`**（开源）。走 Gitee 官方「仓库镜像」功能单向 Pull GitHub 数据仓，**不由工作流推送**。自动同步已配通（2026-08-14 终版）：CI 推完数据仓后直接 curl Gitee `remote_mirror/pull` API 触发同步（主仓 secret `GITEE_TOKEN`）——GitHub webhook 方案实测不可靠：2 万+ 文件的 push payload 太大，Gitee 接收超过 GitHub 10s 投递超时，永远显示失败。webhook 留作兜底。

1. Gitee 建同名公开仓库（不初始化 README/.gitignore）
2. 仓库 → 管理 → 仓库镜像管理 → 添加镜像：方向 **Pull**，镜像仓库选 GitHub 数据仓，私人令牌填 GitHub PAT（classic，勾 `repo` + `admin:repo_hook`）
3. 已知坑：勾选「自动从 GitHub 同步仓库」会报「webhook生成失败」（Gitee 侧问题，2026-08-14 实测），先取消勾选把镜像建成，再按下一条手动配 webhook
4. **自动同步终版（2026-08-14）**：CI 工作流推完数据仓后 curl Gitee API 触发同步，无需任何 webhook 配置；主仓 secret 配 `GITEE_TOKEN`（Gitee 私人令牌，scope 勾 `projects`，user_info 强制附带；过期时间留空 = 永不过期）。**webhook 方案已弃用为主**：GitHub push 携带 2 万+ 文件的 payload 巨大，Gitee 接收慢于 GitHub 10s 投递超时，投递永远显示 500（实测两次）；webhook 保留作兜底——GitHub 数据仓 `https://gitee.com/api/v5/repos/shunFSKi/yo-skill-registry/remote_mirror/pull?access_token=<Gitee令牌>`，Just the push event
5. 前提：Gitee 账号需已绑定手机号 + GitHub 第三方账号（账号设置里可查）

下游读取地址（**GitHub 系对应海外，Gitee 对应国内**）：

- GitHub raw（海外主源）：`https://raw.githubusercontent.com/shunFSKi/yo-skill-registry/main/meta.json`
- Gitee raw（国内兜底）：`https://gitee.com/shunFSki/yo-skill-registry/raw/main/meta.json`
- jsDelivr CDN（殿后）：`https://cdn.jsdelivr.net/gh/shunFSKi/yo-skill-registry@main/meta.json`

**镜像源单文件上限（2026-08-16 实测）**：Gitee raw >1MB 匿名 403、jsDelivr 单文件 ≤20MB、
>50MB 仓库 jsDelivr 整体拒服务。整包 index.json 已 ~17MB 且日增，因此数据仓另产
`shards/` 分片（单片 ≤800KB，全镜像可用），桌面端读取**分片优先、整包兜底**。

桌面端选源策略（已实现于 `crates/skill-index`，`MarketSource::HttpFallback`）：
GitHub → Gitee → jsDelivr 三 CDN（cdn/fastly/gcore）顺序兜底，任一源成功即用，
全挂聚合报错——不判网络环境，靠失败降级覆盖海内外。
