# @yo-skill/registry-pipeline

市场数据管线：从公开目录拉真实条目元数据 → 静态扫描 + 场景分类 → 抓源仓库 README → 落盘静态 JSON。

**只存信息，不存代码**：每条目存"叫什么 / 谁写的 / 怎么装 / 要什么 Key / 扫描结果 / README"，安装永远回源仓库（供应链纪律）。

## 数据源

| 来源 | 内容 | 接口 |
| ---- | ---- | ---- |
| claudeskills.info | Skill 全量（按源仓库去重的 repo 级条目） | 免 key JSON API |
| MCP 官方 Registry | MCP server 全量（active + 最新版去重，全分页） | 免 key JSON API |
| GitHub 代码搜索 | 全量 SKILL.md 采集（size 分片绕 1000 上限，解析 frontmatter；需 `GITHUB_TOKEN`/`REGISTRY_TOKEN`，上限 `GITHUB_HARVEST_MAX` 默认 25000） | search/code API |
| GitHub 源仓库 | 根 README（按 repo 去重，截断 12KB；分层：featured + stars 前 500 + MCP 新近 300） | raw.githubusercontent.com |

## 用法

```bash
pnpm fetch:registry        # 仓库根目录；等价于 pnpm --filter @yo-skill/registry-pipeline fetch
pnpm typecheck             # 本包 TS 检查
```

- 产物：`apps/web/public/registry/`（`meta.json` + `index.json` + `items/*.json`），官网构建期直接读，全站 SSG
- **幂等**：数据无变化时不落盘（`generated_at` 不动）；有变化才整体重写（清掉过期条目）并打新时间戳。`generated_at` 是下游判断要不要同步的锚点
- **代理**：fetch 自动走 `HTTP_PROXY` / `HTTPS_PROXY`（undici `EnvHttpProxyAgent`），没配代理则直连；注意 raw.githubusercontent.com 在大陆直连不通（DNS 污染），跑管线需要代理或 CI
- 输出目录可用环境变量覆盖：`REGISTRY_OUT_DIR=/path/to/repo node src/index.ts`

## 数据结构（数据仓库布局即此）

```
meta.json     # schema_version + generated_at + counts：同步锚点，客户端先拉它比对
index.json    # 全量卡片索引（每条最小集），列表页一次拉完
items/*.json  # 每条完整档案（安装配方 / env / 扫描明细 / README），详情页按需懒拉
```

## 定时同步（GitHub Actions）

工作流在仓库根 `.github/workflows/registry-sync.yml`，每天 UTC 03:17 / 15:17 跑，也可手动触发。

开箱即用：刷新本仓库 `apps/web/public/registry/` 并有变化才提交（官网托管平台检测到 push 自动重建，数据即"动态更新"）。

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

- GitHub raw（海外）：`https://raw.githubusercontent.com/shunFSKi/yo-skill-registry/main/meta.json`
- jsDelivr CDN（海外加速）：`https://cdn.jsdelivr.net/gh/shunFSKi/yo-skill-registry@main/meta.json`
- Gitee raw（国内）：`https://gitee.com/shunFSki/yo-skill-registry/raw/main/meta.json`

桌面端按网络环境选源：国内优先 Gitee，海外优先 GitHub/jsDelivr；拿不准就顺序 fallback，
双通道覆盖海内外。
