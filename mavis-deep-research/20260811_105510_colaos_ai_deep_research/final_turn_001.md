# colaos.ai 深度调研：一家内容创业公司转身做 AI 拍档,押对了什么、还差什么

colaos.ai 是 MarsWave（火星回响）在 2026 年推出的中文 AI 桌面产品 Cola / ColaOS 的官网。截至 2026 年 6 月,它已经从"一个面向 C 端用户的桌面 AI Agent"快速长成 Agent OS 大乱斗里叙事最完整、但财务体量仍最小的玩家之一。报告围绕"它是谁、做了什么、靠什么活、还能不能继续活"四个问题展开,基于官网、用户社区、媒体报道、团队博客、GitHub 仓库、创始人公开发言的交叉验证。

## 核心判断

**ColaOS 是中国 AI 创业团队里把"Agent OS"叙事从 PPT 做到工程化产品的少数案例**。它押注的不是"更强的模型能力",而是"持续上下文+长期关系"这条护城河——用户愿不愿意把电脑权限、长期记忆、工作流都交给一个外部 Agent。这条路如果跑通,护城河极深;如果跑不通,创始人冯雷本人的比喻是:"'活人感'提出的问题,比当前给出的答案更重要。"【1】

## 产品本体:不止是"AI 拍档",更是一组工程抽象

colaos.ai 中文站的核心叙事是"你的 AI 拍档 Cola——念念不忘,必有回响"。Cola 不是聊天机器人,也不是单纯的 Agent 工具,而是定位为"首个 Agent 操作系统"（First Soulful Agent OS）的桌面应用【2】。英文站 colaos.org 用 Soulful Agent 表述,中文站用"AI 拍档"+"灵魂 Agent",两边是同一套产品、同一份代码,只是叙事在不同文化市场的本地化版本。

**实际能做什么,官网列出了 10 个具体场景**:装上即用、告别杂乱（自动归类桌面文件）、开口就能做 PPT（梳理思路自动生成）、私人猎头（每日推送匹配岗位）、剪完直接发（自动配标题/标签/时间轴）、投资不靠猜（深扒财报+风险排查）、告别瞎算热量（拍照估算+饮食建议）、全自动"挂机"干活（睡前挂任务后台执行）、面试不再怯场（实战模拟）、专属安全树洞（情绪陪伴）【2】。这些场景的共同点是"一个用户每天都会重复发生的、跨工具的、需要上下文积累的事"。

**平台覆盖**是另一个值得注意的工程决策:macOS（Apple Silicon + Intel）、Windows（x64 + ARM64）、iOS、Android 都有原生客户端【3】。移动端必须配合桌面端使用——这一点很关键,它把"Agent OS"重新定义为"个人 AI 工作环境",而不是另一个云端 SaaS。

**计费模式是双层订阅 + 积分制**,这是理解 ColaOS 商业化策略的关键:

| 订阅档位 | 月费 | 模型范围 | 剩余名额 |
|---|---|---|---|
| Breeze（轻松上手） | $10 | Flash / Lite / Basic | 19 个 |
| Wander（最受欢迎） | $30 | 加解锁 Plus | 20 个 |
| Flow（心流） | $99 | 加解锁 Pro | 9 个 |

三档订阅承诺"享受订阅价 6 倍以上模型用量"。但 Plus/Pro 高级模型走积分扣费,需要另外充值【4】。这种"包月 + 额外积分"的设计是订阅制与按量计费的妥协,反映了一个现实:Token 价格虽然降了,但还没降到可以纯订阅包打。

**Cola Crew 是另一条用户增长线**:邀请码无上限,每带来一个有效注册,推荐人得 $2 积分 + 付费用户首月 5% 返佣;进阶到 Friends 还能拿到每日免费 Credits。注册返利 + 付费返佣的组合,是典型的 C 端 AI 产品的"撒钱换增长"打法【5】。

## 公司:从内容创作工具转身做 Agent 操作系统

colaos.ai 背后是 MarsWave PTE. LTD.（新加坡主体）。公司的真正"前传"是 ListenHub,2024 年 12 月由冯雷（CEO）和徐文健（CTO）创立,2025 年 1 月拿到 200 万美元天使+轮融资,天际资本领投,小米联合创始人王川跟投【6】。

**ListenHub 是 MarsWave 商业模型的第一次验证**。产品定位从"AI 播客工具"升级为"万物解说员"——把复杂知识一键转成解说视频、播客、PPT。在 0 投放的情况下做到 ARR 300 万美元、月度盈亏平衡,付费率 5%,月度流失率不到 3%【6】。ListenHub 的 COO 是来自百度/快手/MiniMax 的资深运营,曾在美国市场以极低预算做到单周 50 万新用户冷启动。

2026 年 1 月底,刚刚融到 200 万美元的两人在公园散步时决定了一件在外界看来很反常的事:**放下已经跑通、收入还在涨的 ListenHub,转去做通用 Agent**。理由是 ListenHub"更像是 AI 时代早期的过渡产品"——一个具体的导火索是 1 月团队的 OpenClaw 在全球爆火,以及团队原本排给 ListenHub 的一个音频编辑器功能需要两个月工期,但用 Agent 做根本不需要那么久【7】。

这个决定背后,是 MarsWave 对自己组织能力的判断:2025 年下半年他们扩招了一倍,人多了但产出没跟上,每天加班到凌晨数据没变化。徐文健把那段状态形容为"每个人都在疯狂救火"【7】。结论是:旧组织里长不出新东西。团队随后拆成 Infra/APP/Agent/Soul Team 四个组,新增的 Soul Team 负责人唐国荣是个不会写代码的前媒体人——这本身就是"AI Native 组织"的活样板,99% 代码由 AI 写,人负责判断【7】。

**5 周后,Cola 第一个 Mac 内测版本出来**。到 6 月底,积累 1 万+ 用户、1 千+ 付费用户,月卡定价 99 美元,头部用户每月开销能到 1000-2000 美元。冯雷给公司定的目标是 2026 年 1000 万美元 ARR,2027 年 1 亿美元 ARR【7】。这意味着 ColaOS 不能只是叙事,必须在 18 个月内证明自己的商业化能力。

**创始人和团队的公开身份**。冯雷在 X 上的账号是 @oran_ge,媒体曝光里也常被称 Oran Ge。他在 2026 年 4 月 2 日公开把 ColaOS 定位为"首个有灵魂的操作系统",这个表述成了品牌最被引用的金句【8】。CTO 徐文健负责把冯雷的判断运行进组织。工程师团队有 9+ 人,博客署名包括 Ethan（写 Agent 自我/记忆两篇核心文章）、Mack（Claude Prompt Caching 实践）、0xFango（一个人管 20 个仓库的 Agent Harness 实践）、Xinbao（Vibe Cola Mod 设计）、Shuo（QA 链路）、LitoMore（pnpm 维护发现）、Gaoyang（Windows 沙箱 Detours 实现）、Zili（AI Native 工程师转型）、Kaibin（追 AI 跑这一年）【9】。这个团队的核心特征是 AI Native——博客里反复出现的主题不是"如何用 AI 写代码",而是"AI 时代工程师应该怎么重新定位自己"。

## 技术差异化:Mod、记忆、沙箱、Self-reference

colaos.ai 没有自己的基础大模型。它的差异化全部押在"中间层"——围绕模型把 Agent 的工程抽象做深。从技术博客和开源仓库可以拼出几个核心抽象:

**Mod 体系是 ColaOS 的核心架构**。Mod 不是"能做什么的 Skill",而是"在哪个作用域内能用这个 Skill"的抽象,由 Scope + Session + Runner 组成。Xinbao 在《Vibe Cola:第一个 Mod 背后的设计思路》里特别强调,这不是把代码能力塞进聊天窗口,而是构造一个真正的代码工作区【9】。在 MarsWave 开源的 marswaveai/skills 仓库里,15 个 Skill 都被组织成独立的"作用域"——比如 listenhub-voice、podcast、tts、music、cola-avatar-pack【10】。

**记忆系统的"显著性书签+夜间巩固"是另一些技术博客的核心**。Ethan 的《别再让 Agent 写记忆》指出,Agent 记忆系统真正要解决的是上下文预算效率,而不是"记得越多越好"。Cola 的方案是:显著事件写成书签,主 Agent 保持轻量;夜间启动巩固流程把书签整理成长期记忆【9】。这套设计借鉴了人类睡眠记忆巩固的神经科学隐喻,工程化起来反而比"什么都存"更可控。

**Self-reference 解决"连续自我"问题**。Ethan 的《给 Agent 一个自我》进一步讨论:为什么单靠记忆无法让 Agent 成为一个有连续自我的存在,以及 Cola 如何通过 self-reference 让 Agent 在经历中生长【9】。这是一个比较玄的提法,但它回应的是用户对"Cola 是她,不是它"的人格化感知。

**Windows 沙箱的 Detours fshook**。Gaoyang 的《ColaOS 中 Windows 沙箱设计演进》记录了 Windows 内测版中基于 Detours 的 fshook 沙箱设计——文件 IO Hook 原理、进程收敛、策略下发、日志通道、违规反馈【9】。这是 ColaOS 跑在 Windows 上能"控制你的文件而不失控"的工程基础。在桌面 Agent 普遍还在"建议式操作"的阶段,ColaOS 直接走到了"实际执行+沙箱隔离"。

**GitHub 开源是判断"技术深度"最直接的证据**。marswaveai/skills 仓库有 50 个 commit,15 个 Skill 全部支持 Claude Code、Cursor、Windsurf、Codex、Trae 等多个客户端【10】;marswaveai/listenhub-cli 仓库有 47 个 commit,是 ListenHub 的命令行 SDK,完整覆盖了 podcast、TTS、music、image、video、voice clone 等创作工作流【11】。更值得注意的是 marswaveai/TypeNo——一个 macOS 语音输入应用,2025 年 5 月已经发到 v1.4.0,工程化程度远超普通 side project【12】。这些仓库的活跃度说明 MarsWave 不是只做产品 demo,是真的有工程底蕴。

## 市场反应:口碑是真的,但"10k 用户"离 PMF 还远

**产品体验层面的口碑是真的**。PingWest 硅星人的独家首发评测(Yoky)是 ColaOS 最重要的背书,作者用 24 小时就回不去 Claude/Gemini,关键体验点包括:无感获取上下文（Cola 直接读你的文件、浏览器历史、Obsidian 笔记,不用你自我介绍）、真正的 One Prompt（一句话完成全流程）、Computer Use 和 Browser Use 打通（不再区分技术路径）、命令式 vs 主动式 Agent 切换【13】。CSDN 上 4 万字的深度解读《ColaOS 发布:当 Agent 开始有"活人感",竞争就不再只是拼能力了》把 ColaOS 放到 Agent 整个行业的演化里分析,提炼出"连续在场、过程可感、主动承接、风格稳定、被接住感"五个维度,认为"活人感"会是下一代 Agent 的真正护城河【14】。

**用户社区是真活跃的**。colaos.ai/community 页面直接聚合 X 和即刻的真实声音,102 条 X 推文 + 68 条即刻动态,标签分类包括日常使用(9)、用户真爱(38)、行业观点(53)、搭建创造(1)、神吐槽(1)【15】。用户讨论度最高的不是功能,而是"心迹"——Cola 自己写的可见 AI 反思日志,会在关键时刻记录对你这个人的理解,Jimmy Lin 把它形容为"封神,达到 her 水平"【15】。但要注意:102 条 X 推文 + 68 条即刻 = 170 个样本,样本量是真实的,但要警惕"核心用户群"和"沉默大多数"的差异。

**用户规模 vs. 商业化进展**。到 2026 年 6 月底,ColaOS 累计 1 万+ 用户、1 千+ 付费用户【7】。按 99 美元月卡估算,理论月度收入约 10 万美元,年度化 120 万美元——比 ListenHub 的 300 万美元 ARR 还小一个量级。结合公司 2026 年 1000 万美元 ARR 的目标,意味着 7-12 月需要把付费用户数从 1000 推到接近 9000。这不是不可能,但难度很高。

**官方没有公开续费率数据**。ListenHub 的"月度流失率 <3%"是 MarsWave 唯一被披露的留存指标,ColaOS 的续费率/留存率没有官方数据。考虑到 ColaOS 当前用户基数小、早期用户更可能是"AI Native 尝鲜者",真实留存数据要等样本量放大才能判断。

## 竞争格局:在 Agent OS 大乱斗里,ColaOS 是叙事最完整的小玩家

2026 年的 Agent OS 大乱斗已经成型。把市场玩家按定位分四层:

| 类型 | 代表玩家 | ColaOS 优势 | ColaOS 劣势 |
|---|---|---|---|
| 协同办公派 | 钉钉 Agent OS（2025/12 发布）、飞书 aily、字节扣子、腾讯 Marvis | 个性化叙事、产品打磨深度、内容创作 Skill 矩阵 | 没有 IM/办公套件作为预装入口 |
| 桌面 Agent 派 | OpenClaw、Manus、Genspark、智谱 AutoClaw、阶跃 StepClaw | 长期记忆、关系叙事、AI Native 团队 | 没有开源生态、没有 Token 套利红利 |
| 企业级 OS 派 | 华为 openJiuwen、实在智能 TARS、星流 SerpMind、阿里灵基 | 团队小、组织快、不被协同绑架 | 没有企业级权限/审计/SLA |
| Coding Agent 派 | Claude Code、Cursor、字节 Trae、Codex | Vibe Cola 已在内部使用 | 没有 IDE 入口,开发者不优先选它 |

**先发优势已经被巨头消化**。钉钉 2025 年 12 月 23 日发布 Agent OS 1.1"木兰",同步推出 DingTalk Real 企业 AI 硬件【16】;飞书 aily 强调"飞书生态原生"+ 公牛集团等大客户落地;字节扣子 2025 年用户量达数百万,加上 2026 年初豆包插件市场持续扩张——他们都有 ColaOS 没有的东西:预装入口、协同网络、企业合规。ColaOS 的先发时间窗口最多 6-9 个月。

**ColaOS 真正的非对称优势是"内容创作 Skill 矩阵"**。marswaveai/skills 仓库里 15 个 Skill 覆盖 podcast、voice clone、music、video、explainer、slides、TTS、image gen、ASR、URL parser——这 13 个领域 ListenHub 已经跑通过商业化验证(300 万 ARR),ColaOS 等于自带一个"AI 内容创作全家桶",其他桌面 Agent 玩家基本是从零开始建生态。这是 MarsWave 团队最被低估的资产。

## 风险:数据合规、Token 成本、巨头夹击

**数据合规是 ColaOS 最大的隐性风险**。PingWest 评测里 Yoky 明确指出"因为它要了解你的电脑,你需要给它授权"——ColaOS 要读你的文件、浏览器历史、Obsidian 笔记,才能实现"无感获取上下文"【13】。这在中国市场会撞上数据出境/隐私合规红线,在企业市场几乎不可能落地。在 C 端,用户的授权意愿是命门:愿意把电脑权限交给一个外部 Agent 的用户,是高度自筛选的小众群体,规模天花板可能比想象中低。

**Token 成本是结构性压力**。"双层订阅 + 积分制"不是商业模式选择,是上游成本倒逼。Yoky 评测时"当天额度用完了"【13】,ColaOS 用户社区里"Pro 3 句话 30 块"是常态【15】。Token 成本没有继续下降到能纯订阅之前,ColaOS 就必须持续教育用户"为什么值得花更多钱"。

**团队正面对的核心分歧是"单 Agent vs 多 Agent"**。这在 ColaOS 转型期差点撕裂团队——一位参与写出第一版核心代码的成员最终选择离开,他坚信应该做多 Agent 方向【7】。冯雷和徐文健选择了单 Agent + Soulful Agent 路线,但这条路没被验证过。

**ARR 目标的压力**。2026 年目标 1000 万美元 ARR、2027 年 1 亿美元——按当前付费用户基数,12 个月内付费用户要从 1000 涨到近 9000,24 个月内涨到 8 万。这是 ARR 每年 10 倍的增速,在 C 端 AI 赛道除了 Cursor、Anysphere 这类 IDE 工具,几乎没有先例。如果 2026 年底 ARR 不到 500 万美元,2027 年融资将非常困难,公司可能被迫收缩 ColaOS、重新押注 ListenHub。

## 谁应该关注 ColaOS

- 内容创作者/自媒体/IP 运营:自带 13 个内容 Skill,长期记忆对内容生产价值高。
- AI Native 团队/独立开发者:用 ColaOS 当日常 Agent + Skill 平台,比配置 OpenClaw 更省心。
- 投资人/竞品研究:作为"内容创业公司转型做 Agent OS"的样本,看一个 10 万美元月卡档能不能跑通 C 端 Agent 商业化。
- 产品经理/UX 研究者:看"活人感"叙事如何在产品工程里落地——Self-reference、心迹、显著性书签这些都是可学习的模式。

**不适合关注的**:需要企业级合规/SLA/SOC2 的大企业(ColaOS 没做信创/审计/权限分级);已经被钉钉/飞书/字节深度绑定的企业用户(迁移成本不划算);对国产芯片 + 大模型组合有强诉求的客户(ColaOS 走的是国际模型聚合路线)。

## 参考资料

【1】 ColaOS 发布:当 Agent 开始有"活人感",竞争就不再只是拼能力了(CSDN 转载 PingWest 硅星人), https://blog.csdn.net/budingyilai/article/details/159856028

【2】 colaos.ai 首页(关于 Cola / 10 个场景), https://colaos.ai/

【3】 colaos.ai 下载页(平台/架构支持), https://colaos.ai/download

【4】 colaos.ai 定价(Token Plan + 积分制), https://colaos.ai/pricing

【5】 colaos.ai Cola Crew(邀请返佣机制), https://colaos.ai/cola-crew

【6】 ListenHub 完成 200 万美元天使轮融资(CSDN 转载钛媒体), https://blog.csdn.net/csdnnews/article/details/156486142

【7】 拿到融资 200 万美元那天,他们决定亲手推翻自己(企鹅号/36 氪系), https://so.html5.qq.com/page/real_search_news?docid=70000021_0706a4c43e117852

【8】 AIGC 2026 圆桌论坛实录(量子位):ColaOS & MarsWave CEO 冯雷访谈, https://so.html5.qq.com/page/real_search_news?docid=70000021_5446a13db3b34452

【9】 colaos.ai 博客列表(9 篇工程师署名技术文章), https://colaos.ai/blog

【10】 GitHub marswaveai/skills(Skill 矩阵开源仓库), https://github.com/marswaveai/skills

【11】 GitHub marswaveai/listenhub-cli(ListenHub CLI SDK), https://github.com/marswaveai/listenhub-cli

【12】 GitHub marswaveai/TypeNo(macOS 语音输入应用), https://github.com/marswaveai/TypeNo/releases

【13】 独家首发丨首个「Soulful Agent」ColaOS 上线(企鹅号转载 PingWest 硅星人), https://so.html5.qq.com/page/real_search_news?docid=70000021_57769cdd0d131352

【14】 ColaOS 发布:当 Agent 开始有"活人感"——同上【1】深度分析版

【15】 colaos.ai/community(用户 X + 即刻 真实声音聚合,102 + 68 条), https://colaos.ai/community

【16】 钉钉发布全球首个为 AI 打造的工作智能操作系统 Agent OS(澎湃新闻/腾讯新闻), https://new.qq.com/rain/a/20251224A03KZ400
