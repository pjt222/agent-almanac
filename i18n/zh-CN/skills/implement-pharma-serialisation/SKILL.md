---
name: implement-pharma-serialisation
description: >
  实施符合 EU FMD、US DSCSA 及其他全球法规的药品序列化和追溯系统。
  涵盖唯一标识符生成、聚合层级、EPCIS 数据交换和验证终端集成。
  适用于新产品上市序列化实施、与 EMVS/NMVS 集成、设计 DSCSA 合规
  交易交换、构建 EPCIS 事件库，或将序列化扩展到其他市场
  （中国、巴西、俄罗斯）时使用。
locale: zh-CN
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: compliance
  complexity: advanced
  language: multi
  tags: serialisation, eu-fmd, dscsa, epcis, track-and-trace, pharma
---

# 实施药品序列化

为符合全球追溯法规要求搭建药品序列化系统。

## 适用场景

- 为在欧盟或美国市场的新产品上市实施序列化
- 与欧洲药品验证系统（EMVS/NMVS）集成
- 设计 DSCSA 合规的交易信息交换
- 构建或集成 EPCIS 事件库以实现供应链可视化
- 将序列化扩展到其他市场（中国 NMPA、巴西 ANVISA 等）

## 输入

- **必填**：产品信息（GTIN、产品代码、剂型、包装规格）
- **必填**：目标市场法规（EU FMD、DSCSA 或两者均适用）
- **必填**：包装层级（单件、捆包、箱、托盘）
- **可选**：用于集成的现有 ERP/MES 系统详情
- **可选**：合同制造商的序列化能力
- **可选**：验证终端规范

## 步骤

### 第 1 步：了解法规全貌

| 法规 | 地区 | 关键要求 | 截止日期 |
|------|------|---------|---------|
| EU FMD (2011/62/EU) | 欧盟/欧洲经济区 | 每个单位包含唯一标识符及防篡改特征 | 2019年2月起生效 |
| DSCSA | 美国 | 包装级电子化、可互操作追溯 | 2024年11月起全面执行 |
| 中国 NMPA | 中国 | 每最小销售单位的唯一药品追溯码 | 滚动推进 |
| 巴西 ANVISA (SNCM) | 巴西 | 带 IUM 的药品序列化 | 滚动推进 |
| 俄罗斯 MDLP | 俄罗斯 | 每单位密码码，强制扫描 | 已生效 |

各法规关键数据要素：

**EU FMD 唯一标识符（依据授权法规 2016/161）：**
- 产品代码（GS1 GTIN-14）
- 序列号（最多 20 位字母数字字符，随机生成）
- 批次/批号
- 有效期

**DSCSA 交易信息：**
- 产品标识符（NDC/GTIN、序列号、批次、有效期）
- 交易信息（日期、实体、发货详情）
- 交易历史和交易声明
- 包装级验证

**预期结果：** 清晰了解适用于每个产品-市场组合的法规。
**失败处理：** 在继续前与监管事务部门确认市场要求。

### 第 2 步：设计序列化数据模型

```sql
-- 核心序列化数据模型
CREATE TABLE serial_numbers (
    id BIGSERIAL PRIMARY KEY,
    gtin VARCHAR(14) NOT NULL,          -- GS1 GTIN-14
    serial_number VARCHAR(20) NOT NULL,  -- 每个 GTIN 唯一
    batch_lot VARCHAR(20) NOT NULL,
    expiry_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, DECOMMISSIONED, DISPENSED 等
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(gtin, serial_number)
);

-- 聚合层级
CREATE TABLE aggregation (
    id BIGSERIAL PRIMARY KEY,
    parent_code VARCHAR(50) NOT NULL,     -- SSCC 或更高级别代码
    parent_level VARCHAR(10) NOT NULL,    -- CASE, PALLET, BUNDLE
    child_code VARCHAR(50) NOT NULL,      -- GTIN+序列号或子 SSCC
    child_level VARCHAR(10) NOT NULL,     -- UNIT, BUNDLE, CASE
    aggregation_event_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EPCIS 事件
CREATE TABLE epcis_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(30) NOT NULL,      -- ObjectEvent, AggregationEvent, TransactionEvent
    action VARCHAR(10) NOT NULL,          -- ADD, OBSERVE, DELETE
    biz_step VARCHAR(100),               -- urn:epcglobal:cbv:bizstep:commissioning
    disposition VARCHAR(100),             -- urn:epcglobal:cbv:disp:active
    read_point VARCHAR(100),             -- urn:epc:id:sgln:location
    event_time TIMESTAMPTZ NOT NULL,
    event_timezone VARCHAR(6) NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

聚合层级：

```
托盘（SSCC）
  └── 箱（SSCC）
       └── 捆包（GTIN + 序列号）[可选层级]
            └── 单件（GTIN + 序列号）
```

**预期结果：** 数据模型支持完整包装层级和 EPCIS 事件追踪。
**失败处理：** 若现有 ERP 架构存在冲突，设计集成层而非直接修改 ERP。

### 第 3 步：实施序列号生成

```python
import secrets
import string

def generate_serial_number(length: int = 20, charset: str = None) -> str:
    """生成符合 GS1 标准的随机序列号。

    EU FMD 要求随机序列号以防止预测。
    最多 20 个字符，字母数字（GS1 应用标识符 21）。
    """
    if charset is None:
        # GS1 AI(21) 允许：数字、大写字母、小写字母及部分特殊字符
        # 大多数实现仅使用字母数字以确保互操作性
        charset = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(charset) for _ in range(length))


def generate_serial_batch(gtin: str, batch_lot: str, expiry: str, count: int) -> list:
    """为生产运行生成一批唯一序列号。"""
    serials = set()
    while len(serials) < count:
        serials.add(generate_serial_number())
    return [
        {
            "gtin": gtin,
            "serial_number": sn,
            "batch_lot": batch_lot,
            "expiry_date": expiry,
            "status": "COMMISSIONED"
        }
        for sn in serials
    ]
```

**预期结果：** 序列号是密码学随机的，每个 GTIN 唯一，并在打印前存储。
**失败处理：** 若出现唯一性冲突，重新生成冲突序列号并记录该事件。

### 第 4 步：实施 GS1 DataMatrix 编码

二维 DataMatrix 条码编码 GS1 元素字符串：

```
(01)GTIN(21)序列号(10)批次(17)有效期
```

示例：
```
(01)05012345678901(21)A1B2C3D4E5(10)LOT123(17)261231
```

其中：
- AI(01) = GTIN-14
- AI(21) = 序列号
- AI(10) = 批次/批号
- AI(17) = 有效期（YYMMDD）

GS1 DataMatrix 使用 FNC1 作为分隔符（GS 字符，ASCII 29）来分隔可变长度字段。

```python
def encode_gs1_element_string(gtin: str, serial: str, batch: str, expiry: str) -> str:
    """为 DataMatrix 打印编码 GS1 元素字符串。

    FNC1（GS 字符 \\x1d）分隔可变长度字段。
    AI(01) 和 AI(17) 为固定长度，其后无需分隔符。
    AI(21) 和 AI(10) 为可变长度，需要 FNC1 终止符。
    """
    GS = '\x1d'  # GS1 FNC1 / 组分隔符
    return f"01{gtin}21{serial}{GS}10{batch}{GS}17{expiry}"
```

**预期结果：** 编码字符串通过 GS1 认证验证器（ISO 15415 C 级或以上）扫描测试打印件验证。
**失败处理：** 若扫描验证失败，检查打印质量、静区和编码顺序。

### 第 5 步：与国家验证系统集成

#### EU FMD — EMVS/NMVS 集成

```
MAH → 上传序列数据 → EU Hub → 分发到国家系统（NMVS）
                                ├── 德国（securPharm）
                                ├── 法国（CTS）
                                ├── 意大利（AIFA）
                                └── ... 31 个市场
```

API 操作：
1. **上传**（MAH → EU Hub）：批量上传已委托序列号
2. **验证**（药房 → NMVS）：在配发前检查序列状态
3. **注销**（药房 → NMVS）：在销售点标记为已配发
4. **重新激活**（MAH → NMVS）：撤销意外注销

#### DSCSA — 验证路由器服务

```
贸易伙伴 A → VRS 请求 → 验证路由器 → MAH 的 VRS → 响应
```

实施 VRS 响应端点：

```python
# 简化的 VRS 端点（DSCSA 验证）
from fastapi import FastAPI, HTTPException

app = FastAPI()

@app.get("/verify/{gtin}/{serial}/{lot}/{expiry}")
async def verify_product(gtin: str, serial: str, lot: str, expiry: str):
    """DSCSA 产品验证端点。"""
    record = await lookup_serial(gtin, serial)
    if record is None:
        return {"verified": False, "reason": "SERIAL_NOT_FOUND"}
    if record.batch_lot != lot or str(record.expiry_date) != expiry:
        return {"verified": False, "reason": "DATA_MISMATCH"}
    if record.status != "ACTIVE":
        return {"verified": False, "reason": f"STATUS_{record.status}"}
    return {"verified": True, "status": record.status}
```

**预期结果：** 验证端点在 1 秒内以正确状态响应。
**失败处理：** 若国家系统上传失败，使用指数退避重试并通知运营团队。

### 第 6 步：实施 EPCIS 事件捕获

以 EPCIS 2.0 格式记录供应链事件：

```json
{
  "@context": "https://ref.gs1.org/standards/epcis/2.0.0/epcis-context.jsonld",
  "type": "ObjectEvent",
  "eventTime": "2025-03-15T10:30:00.000+01:00",
  "eventTimeZoneOffset": "+01:00",
  "epcList": ["urn:epc:id:sgtin:5012345.067890.A1B2C3D4E5"],
  "action": "ADD",
  "bizStep": "urn:epcglobal:cbv:bizstep:commissioning",
  "disposition": "urn:epcglobal:cbv:disp:active",
  "readPoint": {"id": "urn:epc:id:sgln:5012345.00001.0"},
  "bizLocation": {"id": "urn:epc:id:sgln:5012345.00001.0"}
}
```

药品供应链中的关键业务步骤：
- `commissioning` — 序列号分配给实物单位
- `packing` — 聚合到箱/托盘
- `shipping` — 从某地点发出
- `receiving` — 到达某地点
- `dispensing` — 配发给患者（注销触发点）

**预期结果：** 每次状态变更均生成带正确时间戳和地点的 EPCIS 事件。
**失败处理：** 事件捕获失败必须排队重试；绝不能静默丢弃。

## 验证清单

- [ ] 序列号已随机化，每个 GTIN 唯一
- [ ] GS1 DataMatrix 编码经条码扫描仪验证（ISO 15415 C 级或以上）
- [ ] 聚合层级正确链接单件→捆包→箱→托盘
- [ ] 国家验证系统集成已测试（上传、验证、注销）
- [ ] 所有业务步骤均已捕获 EPCIS 事件
- [ ] 验证端点在 1 秒内响应
- [ ] 异常处理涵盖上传失败、扫描失败和网络错误

## 常见问题

- **顺序序列号**：EU FMD 明确要求随机化以防止仿冒，绝不使用顺序编号
- **聚合错误**：拆箱（打开箱子）必须更新层级关系，运送带错误子关联的箱子会导致下游验证失败
- **时区处理**：EPCIS 事件必须包含时区偏移，使用不带偏移的本地时间会在跨站点时造成事件排序歧义
- **上传延迟**：序列数据必须在产品进入供应链之前上传到国家系统，延迟上传=产品在药房被标记为可疑
- **忽视异常**：合法产品定期会产生错误警报，建立调查和解决警报的流程至关重要

## 相关技能

- `perform-csv-assessment` — 将序列化系统作为计算机化系统进行验证
- `conduct-gxp-audit` — 审计序列化流程
- `implement-audit-trail` — 序列化事件的审计追踪
- `serialize-data-formats` — 通用数据序列化（不同领域，互补概念）
- `design-serialization-schema` — 数据交换格式的架构设计
