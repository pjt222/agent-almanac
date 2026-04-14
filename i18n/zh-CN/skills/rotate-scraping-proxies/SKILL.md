---
name: rotate-scraping-proxies
description: >
  当抓取任务被封锁时，使用与服务商无关的代理轮换方案进行升级处置——在数据中心、
  住宅和移动代理池之间做出选择，将轮换机制与 scrapling 集成，为有状态流程配置
  会话粘滞，监控成本与健康度，并始终在法律与伦理边界之内行事。仅当
  `headless-web-scraping` 客户端隐匿手段（StealthyFetcher、限速、robots.txt）
  已不足以应对、且流量本身合法时，才将其作为下一步。
license: MIT
allowed-tools: Bash Read Write Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: web-scraping
  complexity: intermediate
  language: Python
  tags: web-scraping, proxies, rotation, residential, scrapling, networking
  locale: zh-CN
  source_locale: en
  source_commit: 89cb55b1
  translator: "Claude + human review"
  translation_date: "2026-04-14"
---

# 轮换爬取代理

当客户端隐匿手段已经用尽时，在网络层面对抓取任务进行升级处置。代理轮换是最后
的手段，而非默认选项——它成本昂贵、涉及伦理争议，且极易被滥用。本技能不仅讲授
如何用好轮换，也同样重视说明何时*不该*使用它。

## 适用场景

- `headless-web-scraping`（Fetcher → StealthyFetcher → DynamicFetcher）都
  已尝试过，目标站点依然返回 403/429 或进行地理封锁
- 限速已经达到 3 秒以上的间隔，且 `robots.txt` 允许访问该路径
- User-Agent 和 TLS 指纹已经足够真实（不再是默认的
  `python-requests`）
- 你的抓取行为合法：公开数据、不绕过认证、不绕过付费墙、不在无法律依据的
  情况下采集个人数据
- 你有预算承担代理流量费用，并能接受随之而来的运维复杂度

**不适用场景**：存在公开 API（请使用它）、站点的服务条款禁止自动化访问、
抓取行为会绕过地域授权、目的是欺诈 / 撞库 / 抢购机器人 / 内容盗版。

## 输入参数

- **必需**：目标 URL 以及抓取它们的法律依据
- **必需**：代理池凭证（从环境变量读取，切勿硬编码）
- **必需**：代理池类型——数据中心、住宅或移动
- **可选**：地理定向（国家 / 地区 / 城市）
- **可选**：轮换粒度——按请求（默认）或粘滞会话
- **可选**：每日流量 / 费用上限
- **可选**：限速间隔（秒，默认：1，即使启用了轮换也应保持）

## 执行步骤

### 第 1 步：开工前的合法性与伦理检查

整个工作流的闸门是一份有书面记录的法律与伦理审查。跳过这一步是最大的危害
来源。

```python
# Inputs to confirm before writing any code:
# 1. 数据是否公开（无需登录）？
# 2. robots.txt 是否允许访问该路径？
# 3. 站点的服务条款是否禁止自动化访问？（请通读）
# 4. 抓取过程是否会处理个人数据？如果会，法律依据是什么？
# 5. 此次访问是否会绕过地域授权、付费墙或身份认证？
# 6. 是否存在公开 API 或数据转储，使抓取变得不必要？
# 7. 如果范围较大，是否已与站点所有者联系？
```

**Expected:** 每个问题都有可辩护的书面答案。出现第一个"否"或"未知"
即停止流程，直到问题得到解决。

**On failure:**
- 服务条款禁止自动化访问——不要继续；请联系站点所有者，或改用官方 API
  或已获授权的数据集
- 存在个人数据但没有合法依据——不要继续；请让隐私法律顾问介入
- 会绕过身份认证或地域授权——任何情况下都不得继续

### 第 2 步：选择代理池类型

不同类型的代理池在成本、被检测难度和伦理属性上各有差异。选择能切实解决你
所遇封锁的最低价位层级。

| 代理池类型 | 可检测性 | 成本 | 最适用于 |
|-----------|---------|------|----------|
| 数据中心 | 高（容易被 Cloudflare/Akamai 封禁） | $ | 不设真正反爬措施、仅需地理切换的站点 |
| 住宅 | 低（真实的 ISP IP） | $$$ | 屏蔽数据中心 ASN 的站点 |
| 移动 | 极低（运营商级 NAT，与数千人共享） | $$$$ | 连住宅代理都封禁的站点（少见） |

**住宅与移动代理的伦理警示**：这些代理池会让你的流量途经真实消费者的网络
连接。代理池运营商的同意模型参差不齐——有些会向用户付费，有些则把出口
节点同意条款捆绑在用户根本不会阅读的"免费 VPN"最终用户许可协议里。请
优先选择那些经过审计、采用明确选择加入（opt-in）同意模型的服务商。
如果你不愿意让一个陌生人把抓取流量通过你自家路由器转发，那就不要把你的
流量通过别人的路由器转发。

**Expected:** 有书面记录的选择，选择了最低价位的可行层级，并简要说明为何
拒绝更高层级（或为何需要更高层级）。

**On failure:**
- 数据中心被封锁、但住宅代理超出预算——先收窄抓取范围（减少 URL 数量、
  降低访问频率），再考虑升级层级
- 找不到拥有明确选择加入同意模型的服务商——请重新考虑此次抓取是否确有
  必要

### 第 3 步：将轮换与 Scrapling 集成

把代理接入 scrapling 的 fetcher。凭证从环境变量读取——绝不硬编码，绝不把
`.env` 提交到 git。

```python
import os
import random
from scrapling import Fetcher, StealthyFetcher

# Pattern A: 服务商托管的轮换入口（单一 URL，服务商按请求内部轮换）
PROXY_URL = os.environ["SCRAPING_PROXY_URL"]  # http://user:pass@gateway.example:7777

fetcher = StealthyFetcher()
fetcher.configure(
    headless=True,
    timeout=60,
    network_idle=True,
    proxy=PROXY_URL,
)

# Pattern B: 显式代理池，自行轮换
POOL = os.environ["SCRAPING_PROXY_POOL"].split(",")  # 逗号分隔的 URL 列表

def fetch_with_rotation(url):
    proxy = random.choice(POOL)
    fetcher = StealthyFetcher()
    fetcher.configure(headless=True, timeout=60, proxy=proxy)
    return fetcher.get(url)
```

**Expected:** 请求成功，且出口 IP 在不同调用间发生变化。在执行真正的抓取
前，先调用一个 IP 回显接口（例如 `https://api.ipify.org`）进行确认。

**On failure:**
- `407` Proxy Authentication Required——凭证错误，或密码的 URL 编码出错
  （重新对特殊字符进行编码）
- 每次调用都返回相同 IP——服务商入口可能默认采用粘滞会话；请查阅文档，
  使用 `-rotating` 或按请求轮换的参数
- 延迟大幅上升——这是预期现象；轮换会为每个请求增加 200–2000 毫秒的
  开销

### 第 4 步：粘滞会话与代理池健康度

按工作负载确定轮换粒度，然后持续维持代理池的健康。

```python
# 有状态流程（登录、类似购物车多页面抓取）使用粘滞会话
# 多数服务商通过用户名暴露会话 ID：
#   user-session-abc123:pass@gateway.example:7777
# 使用同一个会话 ID 的所有请求会在约 10 分钟内从同一个 IP 出口。

# 匿名批量抓取使用按请求轮换（默认）

# 代理池健康检查——在批量运行前调用
def check_pool(pool, sample_size=5):
    sample = random.sample(pool, min(sample_size, len(pool)))
    alive = []
    for proxy in sample:
        try:
            r = StealthyFetcher().configure(proxy=proxy, timeout=10).get(
                "https://api.ipify.org"
            )
            if r.status == 200:
                alive.append(proxy)
        except Exception:
            pass
    return alive

# 对瞬时代理故障进行退避重试
def fetch_with_backoff(url, max_attempts=3):
    for attempt in range(max_attempts):
        try:
            r = fetch_with_rotation(url)
            if r.status not in (407, 502, 503):
                return r
        except Exception:
            pass
        time.sleep(2 ** attempt)
    return None
```

**Expected:** 有状态流程在多个请求之间保留 cookie；批量匿名抓取在多个
请求之间呈现 IP 变化；失效的代理会被跳过，而不是陷入循环。

**On failure:**
- 登录在流程中途中断——会话内部发生了轮换；请切换到粘滞会话凭证
- 抽样中的所有代理都未通过健康检查——代理池已耗尽或凭证已过期；请轮换
  凭证或联系服务商

### 第 5 步：监控、成本控制与紧急停机开关

代理流量同时计费到每 GB 和每请求。失控的爬虫会带来失控的账单。务必配置
用量上限和中止机制。

```python
import time

class ScrapeBudget:
    def __init__(self, max_requests, max_duration_seconds, max_failures):
        self.max_requests = max_requests
        self.max_duration = max_duration_seconds
        self.max_failures = max_failures
        self.requests = 0
        self.failures = 0
        self.start = time.monotonic()

    def allow(self):
        if self.requests >= self.max_requests:
            return False, "request cap reached"
        if time.monotonic() - self.start >= self.max_duration:
            return False, "time cap reached"
        if self.failures >= self.max_failures:
            return False, "failure cap reached (circuit breaker)"
        return True, None

    def record(self, success):
        self.requests += 1
        if not success:
            self.failures += 1

budget = ScrapeBudget(max_requests=1000, max_duration_seconds=3600, max_failures=20)

for url in target_urls:
    ok, reason = budget.allow()
    if not ok:
        print(f"Aborting: {reason}")
        break
    response = fetch_with_backoff(url)
    budget.record(success=response is not None)
    time.sleep(1)  # 即便启用了轮换，也仍需保持限速
```

**Expected:** 预算上限在成本失控前就先触发。日志中记录了每个代理的成功
率，便于识别并排除行为异常的出口 IP。

**On failure:**
- 失败率攀升超过 20%——暂停；站点已经识别出轮换模式（例如你的 IP 都
  位于同一子网）；更换代理池类型或停止作业
- 单条记录成本超出预期 5 倍以上——积极使用缓存、对 URL 去重，在可行
  时做批量处理

## 验证清单

- [ ] 第 1 步的合法性检查在任何代码运行之前就已以书面形式记录在案
- [ ] 任何被版本追踪的文件中都不包含代理凭证、代理池 URL 或会话 ID
      （用 grep 搜索 `gateway.`、`proxy=`、服务商主机名）
- [ ] `.env`（或同类文件）已列入 `.gitignore`
- [ ] 代理池的选择有充分依据：最低价位的可行层级，且对住宅/移动代理
      已核实其同意模型
- [ ] 在真正开始抓取前，已通过回显接口确认了 IP 变化
- [ ] 有状态流程使用粘滞会话；匿名批量抓取使用按请求轮换
- [ ] 预算上限（请求数、持续时间、失败数）已接入并经过测试
- [ ] 仍保留限速（≥1 秒）——轮换不是肆意轰炸的借口
- [ ] `robots.txt` 仍被遵守——轮换不能凌驾于它之上

## 常见陷阱

- **在隐匿手段尚未用尽之前就开始轮换**：站点往往并不需要一个新的 IP——
  它需要的是真实的 User-Agent、TLS 指纹和更慢的访问节奏。先尝试
  `StealthyFetcher` 和限速；轮换代价昂贵，在非必要情况下部署它也不
  符合伦理。
- **硬编码凭证**：将代理 URL 粘贴进源代码会让它泄露到 git、容器镜像和
  堆栈跟踪中。一律从环境变量或密钥管理服务读取。
- **在会话中途轮换**：按请求轮换会破坏任何依赖 cookie、CSRF 令牌或购物车
  状态的流程。有状态工作请使用粘滞会话。
- **把轮换视为"合乎伦理的匿名"**：轮换把*你自己*对目标站点隐藏起来，
  但并不能让有害的抓取行为变得合乎伦理。服务条款、版权、隐私法以及
  关于限速的伦理准则依然原样适用。
- **把住宅代理用于高风险场景**：撞库、抢购机器人、地域绕过的流媒体
  盗用、欺诈——这些明确不在本技能的适用范围之内。如果你的用例看起来
  像这样，请立即停止。
- **因为"我们现在有了轮换"就无视 `robots.txt`**：轮换不授予任何许可。
  禁止访问的指令依然是禁止访问的指令。
- **没有紧急停机开关**：一个无人值守、跑在按量计费代理池上的循环任务，
  一夜之间就能变成一张四位数的账单。务必对请求数、持续时间和失败数
  设置上限。
- **选择同意模型不透明的住宅代理池**：某些服务商通过真实用户从不阅读的
  "免费 VPN"最终用户许可协议来获取出口节点。请支付溢价，选择经过审计、
  采用明确选择加入同意模型的服务商。

## 相关技能

- [headless-web-scraping](../headless-web-scraping/SKILL.md) —— 上游技能；
  请始终从那里开始。本技能仅作为升级手段使用。
- [use-graphql-api](../use-graphql-api/SKILL.md) —— 当官方 API 存在时，
  优先使用它而非抓取。
- [deploy-searxng](../deploy-searxng/SKILL.md) —— 自托管的搜索服务可以
  完全避开对搜索引擎的抓取。
- [configure-reverse-proxy](../configure-reverse-proxy/SKILL.md) —— 相反
  方向的网络场景（对外提供服务而非拉取），是一个有益的邻近参考。
- [security-audit-codebase](../security-audit-codebase/SKILL.md) —— 在
  集成凭证后运行，用以确认没有凭证泄露到代码仓库中。

<!-- Keep under 500 lines. Extract large examples to references/EXAMPLES.md if needed. -->
