---
name: explore-diophantine-equations
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Solve Diophantine equations (integer-only solutions) including linear,
  quadratic, and Pell equations. Covers the extended Euclidean algorithm,
  descent methods, and existence proofs. Use when finding all integer
  solutions to ax + by = c, solving Pell's equation, generating Pythagorean
  triples, proving no integer solutions exist via modular constraints, or
  finding the fundamental solution from which all others are generated.
license: MIT
allowed-tools: Read Bash
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: number-theory
  complexity: advanced
  language: multi
  tags: number-theory, diophantine, integer-solutions, pell-equation, euclidean
---

# Explore Diophantine Equations

Solve Diophantine equations — polynomial w/ integer-only solutions. Classify by type, test solvability, find particular + general, generate families. Linear, Pell, Pythagorean, general quadratic.

## Use When

- All integer solutions ax + by = c
- Pell's x^2 - Dy^2 = 1 (or = -1)
- Pythagorean triples or parametric families
- Prove no integer solutions (modular constraints)
- Test solvability general quadratic Diophantine
- Fundamental solution from which all others generate

## In

- **Required**: Equation explicit form (e.g., 3x + 5y = 17 or x^2 - 7y^2 = 1)
- **Optional**: Find all solutions, 1 particular, or prove non-existence
- **Optional**: Constraints (positive integers only)
- **Optional**: Express general parametrically
- **Optional**: Proof technique (constructive, descent, modular obstruction)

## Do

### Step 1: Classify

Determine structure → select method.

1. **Linear**: ax + by = c (a, b, c integers, x, y unknown).
   - Method: Extended Euclidean.

2. **Pell**: x^2 - Dy^2 = 1 (or -1, or N) (D positive non-square).
   - Method: Continued fraction of sqrt(D).

3. **Pythagorean**: x^2 + y^2 = z^2.
   - Method: Parametric x = m^2 - n^2, y = 2mn, z = m^2 + n^2.

4. **General quadratic**: ax^2 + bxy + cy^2 + dx + ey + f = 0.
   - Method: Complete square, reduce to Pell or simpler, or modular constraints.

5. **Higher-order/special**: Fermat-type (x^n + y^n = z^n, n > 2), sum of squares, other.
   - Method: Modular obstruction, descent, known impossibility.

Record classification + method.

→ Precise classification + strategy.

If err: no standard type → try substitution/transformation to known form. x^2 + y^2 + z^2 = n via Legendre's 3-square. No reduction → modular (Step 4).

### Step 2: Linear Diophantine (if linear)

Solve ax + by = c for integer x, y.

1. **Compute g = gcd(a, b)** via Euclidean.

2. **Test**: Solutions iff g | c.
   - g !| c → prove non-existence: "gcd(a, b) = g, g doesn't divide c → no integer solutions."
   - Stop.

3. **Simplify**: Divide by g → (a/g)x + (b/g)y = c/g, gcd(a/g, b/g) = 1.

4. **Particular via extended Euclidean**:
   - 1 = (a/g)*s + (b/g)*t via back-substitution.
   - Multiply c/g: (c/g) = (a/g)*(s*c/g) + (b/g)*(t*c/g).
   - Particular: x0 = s * (c/g), y0 = t * (c/g).

5. **General**:
   - x = x0 + (b/g)*k
   - y = y0 - (a/g)*k
   - All integers k.

6. **Apply constraints** (positive solutions):
   - Solve x0 + (b/g)*k > 0 + y0 - (a/g)*k > 0 for k.
   - Range valid k or state no positive.

**Example (15x + 21y = 39):**
```
gcd(15, 21) = 3. Does 3 | 39? Yes.
Simplify: 5x + 7y = 13.
Extended Euclidean: 1 = 3*5 - 2*7.
Multiply by 13: 13 = 39*5 - 26*7.
Particular: x0 = 39, y0 = -26.
General: x = 39 + 7k, y = -26 - 5k, k in Z.
Check (k=0): 5*39 + 7*(-26) = 195 - 182 = 13. Correct.
```

→ General family (x, y) parameterized by k + verified particular.

If err: particular wrong → re-check extended Euclidean back-sub step-by-step. Common: sign mistake. Verify: a * x0 + b * y0 = c exactly (not modulo).

### Step 3: Pell (if Pell)

Solve x^2 - Dy^2 = 1 (D positive non-square).

1. **Verify D non-square**: D = k^2 → x^2 - k^2*y^2 = (x - ky)(x + ky) = 1 → x - ky = x + ky = ±1 → y = 0, x = ±1 (trivial). Only interesting non-square D.

2. **Continued fraction sqrt(D)**:
   - Init: a0 = floor(sqrt(D)), m0 = 0, d0 = 1.
   - Iterate: m_{i+1} = d_i * a_i - m_i, d_{i+1} = (D - m_{i+1}^2) / d_i, a_{i+1} = floor((a0 + m_{i+1}) / d_{i+1}).
   - Until sequence a_i repeats (periodic after a0).
   - Record period r.

3. **Fundamental from convergents**:
   - Compute p_i / q_i.
   - p_{r-1} / q_{r-1} (end of 1st period) → fundamental:
     - r even: (x1, y1) = (p_{r-1}, q_{r-1}) solves x^2 - Dy^2 = 1.
     - r odd: (p_{r-1}, q_{r-1}) solves x^2 - Dy^2 = -1 (negative Pell). (p_{2r-1}, q_{2r-1}) solves positive.

4. **Further solutions** from (x1, y1):
   - Recurrence: x_{n+1} + y_{n+1} * sqrt(D) = (x1 + y1 * sqrt(D))^{n+1}.
   - Equiv: x_{n+1} = x1 * x_n + D * y1 * y_n, y_{n+1} = x1 * y_n + y1 * x_n.

5. **Present** fundamental + recurrence.

**Fundamentals small D:**

| D  | (x1, y1) | D  | (x1, y1)   | D  | (x1, y1)   |
|----|----------|----|-------------|----|-----------  |
| 2  | (3, 2)   | 7  | (8, 3)      | 13 | (649, 180)  |
| 3  | (2, 1)   | 8  | (3, 1)      | 14 | (15, 4)     |
| 5  | (9, 4)   | 10 | (19, 6)     | 15 | (4, 1)      |
| 6  | (5, 2)   | 11 | (10, 3)     | 17 | (33, 8)     |

→ Fundamental (x1, y1) verified by substitution + recurrence.

If err: continued fraction no converge to period → check iteration. Period r can be large (D = 61 → r = 11, fundamental (1766319049, 226153980)). Large D → computational tools not manual.

### Step 4: Modular Constraints (general quadratic/higher)

Prove no integer solutions via modular obstruction.

1. **Choose modulus m** (typ 2, 3, 4, 5, 7, 8, 16).

2. **Enumerate residues**: Compute LHS mod m for all possible var residues.

3. **Check combination gives RHS mod m**.
   - None works → no solution (obstruction).

4. **Common obstructions**:
   - **Squares mod 4**: n^2 = 0 or 1 (mod 4). x^2 + y^2 = c no solution if c = 3 (mod 4).
   - **Squares mod 8**: n^2 = 0, 1, 4 (mod 8). x^2 + y^2 + z^2 = c no solution if c = 7 (mod 8).
   - **Cubes mod 9**: n^3 = 0, 1, 8 (mod 9). x^3 + y^3 + z^3 = c may obstruct certain c mod 9.

5. **No obstruction found** → modular can't prove non-existence. Solutions may or may not → constructive or descent.

**Quadratic residues ref:**

| Mod | Squares (residues)         |
|-----|---------------------------|
| 3   | {0, 1}                    |
| 4   | {0, 1}                    |
| 5   | {0, 1, 4}                |
| 7   | {0, 1, 2, 4}             |
| 8   | {0, 1, 4}                |
| 11  | {0, 1, 3, 4, 5, 9}       |
| 13  | {0, 1, 3, 4, 9, 10, 12}  |
| 16  | {0, 1, 4, 9}             |

→ Proof non-existence or statement no obstruction at tested moduli.

If err: modular inconclusive → infinite descent: assume solution, derive strictly smaller, repeat → contradict positivity. Classic for x^4 + y^4 = z^2 no non-trivial.

### Step 5: Generate Families

Express all solutions via fundamental + integer params.

1. **Linear**: x = x0 + (b/g)*k, y = y0 - (a/g)*k (Step 2).

2. **Pell**: Recurrence Step 3 → first several:
   ```
   (x1, y1), (x2, y2), (x3, y3), ...
   ```
   List ≥3-5 as sanity check.

3. **Pythagorean**: Primitive triples from m > n > 0, gcd(m, n) = 1, m - n odd:
   - a = m^2 - n^2, b = 2mn, c = m^2 + n^2.
   - All primitives arise (up to swap a, b).

4. **General**: Parametric if possible. Curve genus 0 → rational parametrization. Genus ≥1 → may be finitely many (Faltings for genus ≥ 2).

5. **Verify** ≥3 family members by substitution.

**Example (Pell, D = 2):**
```
Fundamental: (x1, y1) = (3, 2). Check: 9 - 2*4 = 1. Correct.
(x2, y2) = (3*3 + 2*2*2, 3*2 + 2*3) = (17, 12). Check: 289 - 2*144 = 1.
(x3, y3) = (3*17 + 2*2*12, 3*12 + 2*17) = (99, 70). Check: 9801 - 2*4900 = 1.
```

→ Parametric/recursive all solutions + ≥3 verified.

If err: generated fail verification → fundamental or recurrence wrong. Pell → re-derive fundamental from continued fraction. Linear → re-check extended Euclidean.

## Check

- [ ] Correctly classified (linear, Pell, Pythagorean, general quadratic, higher-order)
- [ ] Linear: gcd(a, b) | c checked before solve
- [ ] Extended Euclidean back-sub verified: a*x0 + b*y0 = c exactly
- [ ] General includes all (parameterized k or recurrence)
- [ ] Pell: D verified non-square before continued fraction
- [ ] Pell: fundamental satisfies x1^2 - D*y1^2 = 1 direct computation
- [ ] Modular obstruction proofs enumerate all residues
- [ ] ≥3 family members verified substitution
- [ ] Constraints applied after general
- [ ] Non-existence claims justified by gcd or modular

## Traps

- **Assume gcd | c → positive solutions**: General x = x0 + (b/g)*k includes negatives. Positive may not exist even solvable over integers.
- **Confuse x^2 - Dy^2 = 1 vs -1**: Negative Pell has solutions only when continued fraction period odd. Applying positive formula to negative target → wrong.
- **Forget trivial Pell**: (x, y) = (1, 0) always satisfies x^2 - Dy^2 = 1 but useless generating non-trivial. Fundamental = *smallest* w/ y > 0.
- **Incomplete modular obstruction**: Only mod 2/4 may miss higher. First few no obstruction → try 8, 9, 16, or discriminant.
- **Off-by-one continued fraction period**: Convergent indices tracked. Fundamental from p_{r-1}/q_{r-1} where r = period, not p_r/q_r.
- **Descent w/o base case**: Must show descent terminates contradiction (x = 0 contradicts x > 0). Without base → incomplete.
- **Fermat's Last Thm wrong**: x^n + y^n = z^n no non-trivial for n > 2 (Wiles, 1995), but not applies diff coefficients like 2x^3 + 3y^3 = z^3.

## →

- `analyze-prime-numbers` — Factorization + gcd prereqs
- `solve-modular-arithmetic` — Linear congruences ax = c (mod b) equiv to linear Diophantine
- `derive-theoretical-result` — Formal derivation for Diophantine impossibility
