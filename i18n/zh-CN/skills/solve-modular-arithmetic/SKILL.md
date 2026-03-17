---
name: solve-modular-arithmetic
description: >
  求解模运算问题：同余方程、中国剩余定理、Euler 定理和
  模幂运算。涵盖基本模运算、线性同余方程组和密码学中的
  RSA 算法应用。
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: number-theory
  complexity: intermediate
  language: natural
  tags: number-theory, modular-arithmetic, congruences, chinese-remainder-theorem, rsa
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# 求解模运算问题

系统求解涉及同余式、中国剩余定理和 Euler 定理的模运算问题。

## 适用场景

- 求解线性同余方程 ax ≡ b (mod m)
- 应用中国剩余定理求解同余方程组
- 使用 Euler 定理和 Fermat 小定理简化模幂运算
- 计算模逆元
- 理解和实现 RSA 加密算法的数学基础

## 输入

- **必需**：模运算问题的陈述
- **可选**：是否需要详细的中间步骤
- **可选**：应用上下文（纯数学或密码学）
- **可选**：计算工具偏好（手算或编程辅助）

## 步骤

### 第 1 步：建立模运算框架

分析问题并确定所需的模运算工具：

1. **基本定义**：a ≡ b (mod m) 意味着 m | (a - b)。
2. **模运算性质**：
   - 加法：如果 a ≡ b 且 c ≡ d (mod m)，则 a+c ≡ b+d (mod m)
   - 乘法：如果 a ≡ b 且 c ≡ d (mod m)，则 ac ≡ bd (mod m)
   - 幂运算：如果 a ≡ b (mod m)，则 a^k ≡ b^k (mod m)
   - **注意**：除法不能直接用——需要模逆元
3. **关键定理识别**：
   - **Euler 定理**：gcd(a, m) = 1 时，a^phi(m) ≡ 1 (mod m)
   - **Fermat 小定理**：p 为素数且 p 不整除 a 时，a^(p-1) ≡ 1 (mod p)
   - **中国剩余定理**：模数两两互素时，同余方程组有唯一解
4. **Euler 函数 phi(m)**：
   - phi(p) = p - 1（p 为素数）
   - phi(p^k) = p^(k-1)(p - 1)
   - phi(mn) = phi(m)phi(n)（当 gcd(m,n) = 1）

**预期结果：** 问题已分析，所需的定理和工具已确定。

**失败处理：** 如果问题涉及非互素的模数，中国剩余定理不能直接应用。需要先检查兼容性条件。

### 第 2 步：求解同余方程

执行核心计算：

1. **线性同余方程** ax ≡ b (mod m)：
   - 计算 d = gcd(a, m)
   - 如果 d 不整除 b，方程无解
   - 如果 d 整除 b，化简为 (a/d)x ≡ (b/d) (mod m/d)
   - 用扩展 Euclid 算法找 a/d 的模逆元
   - 解为 x ≡ x_0 (mod m/d)，共 d 个模 m 的解
2. **模逆元**：a 的模 m 逆元 a^(-1) 满足 aa^(-1) ≡ 1 (mod m)
   - 存在条件：gcd(a, m) = 1
   - 计算方法：扩展 Euclid 算法或 a^(phi(m)-1) mod m
3. **同余方程组**（中国剩余定理）：
   - x ≡ a_1 (mod m_1), x ≡ a_2 (mod m_2), ..., x ≡ a_k (mod m_k)
   - 令 M = m_1 * m_2 * ... * m_k
   - 对每个 i，计算 M_i = M / m_i 和 y_i = M_i^(-1) (mod m_i)
   - 解为 x ≡ sum(a_i * M_i * y_i) (mod M)

**预期结果：** 同余方程的解，或方程组的唯一解（模 M）。

**失败处理：** 如果扩展 Euclid 算法的实现有误，通过直接验证 ax ≡ b (mod m) 来检查结果。

### 第 3 步：模幂运算和应用

高效计算大数模幂和应用于密码学：

1. **快速幂**（反复平方法）：
   - 计算 a^n mod m
   - 将 n 写成二进制：n = b_k * 2^k + ... + b_1 * 2 + b_0
   - 反复平方：result = 1；对每位 b_i，result = result^2 * a^(b_i) mod m
   - 复杂度 O(log n) 次模乘
2. **Euler 定理简化**：
   - 计算 a^n mod m 时，先将 n 化简为 n mod phi(m)
   - 例如：7^222 mod 10 → phi(10) = 4 → 222 mod 4 = 2 → 7^2 = 49 → 49 mod 10 = 9
3. **RSA 算法**：
   - 密钥生成：选素数 p, q；n = pq；phi(n) = (p-1)(q-1)；选 e 使 gcd(e, phi(n)) = 1；计算 d = e^(-1) mod phi(n)
   - 加密：c = m^e mod n
   - 解密：m = c^d mod n
   - 正确性：c^d = m^(ed) ≡ m^(1 + k*phi(n)) ≡ m (mod n)（由 Euler 定理）

**预期结果：** 正确的模幂运算结果，或完整的 RSA 密钥对及加密/解密演示。

**失败处理：** 如果模幂运算结果不正确，使用小数值例子（如 3^5 mod 7 = 5）验证算法实现。

## 验证清单

- [ ] gcd 计算正确
- [ ] 线性同余方程的可解性条件已检查
- [ ] 模逆元通过乘法验证（a * a^(-1) ≡ 1 (mod m)）
- [ ] 中国剩余定理的互素条件已验证
- [ ] 解已代入原方程验证
- [ ] 模幂运算使用了快速幂算法
- [ ] RSA 参数满足安全要求（密钥长度足够）

## 常见问题

- **忘记检查 gcd 条件**：ax ≡ b (mod m) 有解当且仅当 gcd(a,m) | b。不检查就直接计算可能得到错误结果。
- **模运算中使用负数**：许多编程语言中 (-7) mod 5 返回 -2 而非 3。在模运算中总是取正余数。
- **中国剩余定理应用于非互素模数**：CRT 要求模数两两互素。如果不满足，需要先分解为互素分量。
- **Euler 定理的前提条件**：a^phi(m) ≡ 1 (mod m) 要求 gcd(a, m) = 1。如果 a 和 m 不互素，定理不适用。
- **RSA 中使用太小的素数**：教学示例可以用小素数，但实际应用必须使用至少 1024 位的素数。

## 相关技能

- `analyze-prime-numbers` -- 模运算大量依赖素数性质
- `explore-diophantine-equations` -- 丢番图方程常涉及模运算技巧
