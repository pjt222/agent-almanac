---
name: solve-modular-arithmetic
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Solve mod arithmetic probs: congruences, systems via CRT, mod inverses,
  Euler's theorem. Manual + computational. Use → linear congruences, mod
  inverses, large mod exponentiation, simultaneous congruences (CRT),
  cyclic groups + discrete log contexts.
license: MIT
allowed-tools: Read Bash
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: number-theory
  complexity: intermediate
  language: multi
  tags: number-theory, modular-arithmetic, congruences, crt, euler
---

# Solve Modular Arithmetic

Parse congruence systems → extended Euclidean for inverses → CRT for systems → Euler for exponentiation. Verify all by substitution.

## Use When

- Single linear congruence ax = b (mod m)
- System of simultaneous congruences (CRT)
- Mod inverse a^{-1} (mod m)
- Large mod exp a^k (mod m)
- Order of element in Z/mZ
- Cyclic groups, primitive roots, discrete log

## In

- **Required**: Congruence(s) | mod eqn
- **Optional**: Show extended Euclidean steps explicit?
- **Optional**: Apply Euler | Fermat?
- **Optional**: Find primitive roots | element orders?
- **Optional**: Output (step-by-step, compact, proof)

## Do

### Step 1: Parse System / Eqn

Extract math structure.

1. **ID type**:
   - Single linear: ax = b (mod m)
   - System: x = a1 (mod m1), x = a2 (mod m2), ...
   - Mod exp: a^k (mod m)
   - Mod inverse: find a^{-1} (mod m)

2. **Normalize**: Reduce coefs mod respective moduli. a, b, m non-neg, m > 0.

3. **Record** parsed problem in standard notation.

**Got:** Clearly parsed + normalized problem, all values reduced.

**If err:** Ambiguous notation ("solve 3x + 5 = 2 mod 7" → equation or 5=2 mod 7?) → clarify w/ user. Default: mod applies to entire eqn.

### Step 2: Solve Single Congruence

ax = b (mod m) via extended Euclidean.

1. **g = gcd(a, m)** via Euclidean:
   - Repeated div: m = q1·a + r1, a = q2·r1 + r2, ... until rem = 0
   - Last non-zero rem = gcd(a, m)

2. **Solvability**: solution iff g | b. Else no solution. Stop.

3. **Reduce**: ÷ g → (a/g)x = (b/g) (mod m/g). Now gcd(a/g, m/g) = 1.

4. **Find inverse** of a/g mod m/g via extended Euclidean:
   - Back-sub through Euclidean → 1 = (a/g)·s + (m/g)·t
   - Coef s (reduced mod m/g) = inverse

5. **Particular sol**: x0 = s·(b/g) mod (m/g).

6. **General sol**: x = x0 + (m/g)·k for k = 0, 1, ..., g-1 → all g incongruent solutions mod m.

**Extended Euclidean ex (find 17^{-1} mod 43):**
```
43 = 2*17 + 9
17 = 1*9  + 8
 9 = 1*8  + 1
 8 = 8*1  + 0

Back-substitute:
1 = 9 - 1*8
  = 9 - 1*(17 - 1*9) = 2*9 - 17
  = 2*(43 - 2*17) - 17 = 2*43 - 5*17

So 17*(-5) = 1 (mod 43), i.e., 17^{-1} = -5 = 38 (mod 43).
```

**Got:** Complete solution set, or proof no solution exists.

**If err:** Back-sub wrong result → verify each div step. Most common err: sign mistake in back-sub. Check: a · inverse mod m should = 1.

### Step 3: System via CRT

Solve x = a1 (mod m1), x = a2 (mod m2), ..., x = ak (mod mk).

1. **Pairwise coprime check**: every pair (mi, mj), gcd(mi, mj) = 1.
   - All coprime → CRT applies directly
   - Some not coprime → check compat: each non-coprime pair, ai = aj (mod gcd(mi, mj)). Compat → reduce via lcm. Incompat → no sol.

2. **M = m1 · m2 · ... · mk** (product of all).

3. **Each i, Mi = M/mi** (product except mi).

4. **Each i, yi = Mi^{-1} (mod mi)** via extended Euclidean (Step 2).

5. **Solution**: x = sum(ai · Mi · yi for i = 1..k) mod M.

6. **State**: x = [val] (mod M). Unique sol mod M.

**Common totients ref:**

| n    | phi(n) | n    | phi(n) | n    | phi(n) |
|------|--------|------|--------|------|--------|
| 2    | 1      | 10   | 4      | 20   | 8      |
| 3    | 2      | 11   | 10     | 24   | 8      |
| 4    | 2      | 12   | 4      | 25   | 20     |
| 5    | 4      | 13   | 12     | 30   | 8      |
| 6    | 2      | 14   | 6      | 36   | 12     |
| 7    | 6      | 15   | 8      | 48   | 16     |
| 8    | 4      | 16   | 8      | 60   | 16     |
| 9    | 6      | 18   | 6      | 100  | 40     |

**Got:** Unique sol mod M, or proof of incompat.

**If err:** CRT result fails verification → check Step 4 inverse calcs. Common: computing Mi^{-1} mod M instead of mod mi. Each inverse is mod *individual* mi, not product.

### Step 4: Apply Euler / Fermat

Eval mod exponentiations | simplify w/ Euler.

1. **Euler**: gcd(a, m) = 1 → a^{phi(m)} = 1 (mod m).
   - phi(m): if m = p1^e1 · p2^e2 · ... · pk^ek, phi(m) = m · product((1 - 1/pi) per prime pi | m).

2. **Fermat little (special)**: p prime, gcd(a, p) = 1 → a^{p-1} = 1 (mod p).

3. **Reduce exp**: compute a^k (mod m):
   - r = k mod phi(m)
   - a^k = a^r (mod m)

4. **a^r (mod m)** via repeated squaring (binary exp):
   - r in binary: r = b_n · 2^n + ... + b_1 · 2 + b_0
   - result = 1
   - Each bit MSB → LSB: result = result² mod m; bit = 1 → result = result · a mod m

5. **gcd(a, m) > 1**: Euler doesn't apply. Factor m + CRT to combine results from prime power moduli, lifting exponent | direct compute.

**Got:** a^k (mod m) value via exp reduction + repeated squaring.

**If err:** gcd(a, m) > 1 + result wrong → don't apply Euler. Compute direct | factor m into coprime parts where some coprime to a, solve mod each, recombine via CRT.

### Step 5: Verify by Substitution

Plug solution back.

1. **Single congruence**: a · x mod m = b?

2. **CRT systems**: each x = ai (mod mi), x mod mi = ai?

3. **Mod exponentiation**: verify w/ 2nd method (direct for small | independent repeated squaring impl).

4. **Document explicit**:
```
Solution: x = 23
Check 1: 23 mod 3 = 2 = a1. Correct.
Check 2: 23 mod 5 = 3 = a2. Correct.
Check 3: 23 mod 7 = 2 = a3. Correct.
All congruences satisfied.
```

**Got:** All eqns verified w/ explicit computation.

**If err:** Verify fails → trace back. Common: arith mistakes in extended Euclidean, wrong sign in back-sub, forget reduce mod M in final CRT step.

## Check

- [ ] Type ID'd (single, system, exp, inverse)
- [ ] All coefs reduced mod respective moduli
- [ ] ax = b (mod m): gcd(a, m) | b checked before solving
- [ ] Extended Euclidean back-sub verified: a · inverse mod m = 1
- [ ] CRT: pairwise coprime verified before
- [ ] CRT non-coprime: compat checked
- [ ] Euler applied only when gcd(a, m) = 1
- [ ] phi(m) from prime factorization, not guessed
- [ ] Repeated squaring uses mod reduction every step (no overflow)
- [ ] Every sol verified by substitution

## Traps

- **CRT w/o coprime check**: Standard formula needs pairwise coprime. Non-coprime → wrong answer not error. Check gcd(mi, mj) = 1 first.
- **Wrong inverse**: Mi^{-1} mod mi (individual), NOT mod M (product). Most common CRT impl err.
- **Euler when gcd(a, m) > 1**: a^{phi(m)} = 1 (mod m) needs gcd = 1. Else theorem doesn't apply, result wrong.
- **Sign errs in extended Euclidean back-sub**: Track signs each step. Final inverse may be neg → reduce mod m for positive rep.
- **Overflow in mod exp**: Even repeated squaring → intermediate products overflow. Reduce mod m after every mult, not just end.
- **Forget multiple solutions**: ax = b (mod m), g = gcd(a, m) > 1, g | b → exactly g incongruent solutions mod m, not just one.

## →

- `analyze-prime-numbers` — prime fact needed for phi(m) + verify coprime
- `explore-diophantine-equations` — linear Diophantine ax + by = c equiv to linear congruence ax = c (mod b)
- `prove-geometric-theorem` — mod arith in constructibility proofs (which regular n-gons are constructible)
