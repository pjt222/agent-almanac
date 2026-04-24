---
name: explore-diophantine-equations
locale: caveman
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

Solve Diophantine equations -- polynomial equations where only integer solutions wanted. Sort equation by type, test for solvability, find particular and general solutions, and make solution families. Covers linear equations, Pell equations, Pythagorean triples, and general quadratic forms.

## When Use

- Find all integer solutions to linear equation ax + by = c
- Solve Pell's equation x^2 - Dy^2 = 1 (or = -1)
- Make Pythagorean triples or other parametric integer families
- Prove given equation has no integer solutions (via modular limits)
- Test solvability of general quadratic Diophantine equation
- Find fundamental solution from which all others grow

## Inputs

- **Required**: Diophantine equation to solve (in clear form, e.g., 3x + 5y = 17 or x^2 - 7y^2 = 1)
- **Optional**: Find all solutions, just one particular solution, or prove non-exist
- **Optional**: Limits on variable ranges (e.g., positive integers only)
- **Optional**: Express general solution in parametric form
- **Optional**: Preferred proof technique (constructive, descent, modular block)

## Steps

### Step 1: Classify the Equation Type

Figure structure of Diophantine equation to pick right solve method.

1. **Linear**: ax + by = c where a, b, c are given integers and x, y unknowns.
   - Solving method: Extended Euclidean algorithm.

2. **Pell equation**: x^2 - Dy^2 = 1 (or = -1, or = N) where D is positive non-square integer.
   - Solving method: Continued fraction expansion of sqrt(D).

3. **Pythagorean**: x^2 + y^2 = z^2.
   - Solving method: Parametric family x = m^2 - n^2, y = 2mn, z = m^2 + n^2.

4. **General quadratic**: ax^2 + bxy + cy^2 + dx + ey + f = 0.
   - Solving method: Complete the square, reduce to Pell or simpler form, or apply modular limits.

5. **Higher-order or special**: Fermat-type (x^n + y^n = z^n for n > 2), sum of squares, or other.
   - Solving method: Modular block, descent, or known impossibility results.

Log sort and picked method.

**Got:** Precise sort with solving strategy picked.

**If fail:** Equation not fit standard type? Try swap or transform to shrink to known form. E.g., x^2 + y^2 + z^2 = n can go via Legendre's three-square theorem. No shrink clear? Apply modular limits (Step 4) to test for blocks.

### Step 2: Solve Linear Diophantine Equations (if type = linear)

Solve ax + by = c for integer x, y.

1. **Compute g = gcd(a, b)** using Euclidean algorithm.

2. **Test solvability**: Solutions exist iff g | c.
   - If g does not divide c, prove non-exist: "Since gcd(a, b) = g and g does not divide c, equation ax + by = c has no integer solutions."
   - Stop if no solution exists.

3. **Simplify**: Divide through by g to get (a/g)x + (b/g)y = c/g, where now gcd(a/g, b/g) = 1.

4. **Find particular solution** using extended Euclidean algorithm:
   - Express 1 = (a/g)*s + (b/g)*t via back-swap.
   - Multiply by c/g: (c/g) = (a/g)*(s*c/g) + (b/g)*(t*c/g).
   - Particular solution: x0 = s * (c/g), y0 = t * (c/g).

5. **Write general solution**:
   - x = x0 + (b/g)*k
   - y = y0 - (a/g)*k
   - for all integers k.

6. **Apply limits** (if positive solutions needed):
   - Solve x0 + (b/g)*k > 0 and y0 - (a/g)*k > 0 for k.
   - Report range of valid k values or state no positive solution exists.

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

**Got:** General solution family (x, y) parameterized by integer k, with check of particular solution.

**If fail:** Particular solution wrong? Re-check extended Euclidean back-swap step by step. Most common error is sign slip. Verify: a * x0 + b * y0 should equal c exact (not just mod something).

### Step 3: Solve Pell Equations (if type = Pell)

Solve x^2 - Dy^2 = 1 where D is positive non-square integer.

1. **Verify D not perfect square**: If D = k^2, then x^2 - k^2*y^2 = (x - ky)(x + ky) = 1, which forces x - ky = x + ky = +/-1, giving y = 0, x = +/-1 (trivial). Equation interesting only for non-square D.

2. **Compute continued fraction expansion of sqrt(D)**:
   - Start: a0 = floor(sqrt(D)), m0 = 0, d0 = 1.
   - Iterate: m_{i+1} = d_i * a_i - m_i, d_{i+1} = (D - m_{i+1}^2) / d_i, a_{i+1} = floor((a0 + m_{i+1}) / d_{i+1}).
   - Keep going until sequence of a_i repeats (expansion is periodic after a0).
   - Log period length r.

3. **Pull fundamental solution from convergents**:
   - Compute convergents p_i / q_i of continued fraction.
   - Convergent p_{r-1} / q_{r-1} (at end of first period) gives fundamental solution:
     - If r even: (x1, y1) = (p_{r-1}, q_{r-1}) solves x^2 - Dy^2 = 1.
     - If r odd: (p_{r-1}, q_{r-1}) solves x^2 - Dy^2 = -1 (negative Pell). Then (p_{2r-1}, q_{2r-1}) solves positive.

4. **Make more solutions** from fundamental solution (x1, y1):
   - Recurrence: x_{n+1} + y_{n+1} * sqrt(D) = (x1 + y1 * sqrt(D))^{n+1}.
   - Equivalently: x_{n+1} = x1 * x_n + D * y1 * y_n, y_{n+1} = x1 * y_n + y1 * x_n.

5. **Present** fundamental solution and recurrence for making all solutions.

**Fundamental solutions for small D:**

| D  | (x1, y1) | D  | (x1, y1)   | D  | (x1, y1)   |
|----|----------|----|-------------|----|-----------  |
| 2  | (3, 2)   | 7  | (8, 3)      | 13 | (649, 180)  |
| 3  | (2, 1)   | 8  | (3, 1)      | 14 | (15, 4)     |
| 5  | (9, 4)   | 10 | (19, 6)     | 15 | (4, 1)      |
| 6  | (5, 2)   | 11 | (10, 3)     | 17 | (33, 8)     |

**Got:** Fundamental solution (x1, y1) checked by sub, plus recurrence for making all positive solutions.

**If fail:** Continued fraction compute not converge to period? Check iteration formula. Period length r can be big (e.g., D = 61 has r = 11 and fundamental solution (1766319049, 226153980)). For big D, use tools rather than manual compute.

### Step 4: Apply Modular Constraints for Existence/Non-Existence (if type = general quadratic or higher)

Prove equation has no integer solutions by showing modular block.

1. **Pick modulus m** (usually m = 2, 3, 4, 5, 7, 8, or 16).

2. **List all residues**: Compute left-hand side mod m for all possible residues of vars.

3. **Check if any combo gives needed right-hand side mod m**.
   - If no combo works, equation has no solution (modular block).

4. **Common blocks**:
   - **Squares mod 4**: n^2 = 0 or 1 (mod 4). So x^2 + y^2 = c has no solution if c = 3 (mod 4).
   - **Squares mod 8**: n^2 = 0, 1, or 4 (mod 8). So x^2 + y^2 + z^2 = c has no solution if c = 7 (mod 8).
   - **Cubes mod 9**: n^3 = 0, 1, or 8 (mod 9). So x^3 + y^3 + z^3 = c may be blocked for certain c mod 9.

5. **If no block found**, modular way cannot prove non-exist. Solutions may or may not exist; try constructive methods or descent.

**Quadratic residues reference:**

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

**Got:** Either proof of non-exist via modular block, or statement that no block found at tested moduli.

**If fail:** Modular methods unclear? Try infinite descent: assume solution exists, pull strictly smaller solution, repeat until clash with positivity. This technique is classic for proving x^4 + y^4 = z^2 has no non-trivial solutions.

### Step 5: Generate Solution Families from Fundamental Solution

Express all solutions in terms of fundamental solution and integer parameters.

1. **For linear equations**: Family is x = x0 + (b/g)*k, y = y0 - (a/g)*k (from Step 2).

2. **For Pell equations**: Use recurrence from Step 3 to make first several solutions:
   ```
   (x1, y1), (x2, y2), (x3, y3), ...
   ```
   List at least 3-5 solutions as sanity check.

3. **For Pythagorean triples**: Make primitive triples from params m > n > 0, gcd(m, n) = 1, m - n odd:
   - a = m^2 - n^2, b = 2mn, c = m^2 + n^2.
   - All primitive triples come this way (up to swap a and b).

4. **For general families**: Express solutions in parametric form if can. If equation defines curve of genus 0, rational parametrization exists. If genus >= 1, there may be finitely many solutions (Faltings' theorem for genus >= 2).

5. **Verify** at least 3 members of family by sub into original equation.

**Example (Pell, D = 2):**
```
Fundamental: (x1, y1) = (3, 2). Check: 9 - 2*4 = 1. Correct.
(x2, y2) = (3*3 + 2*2*2, 3*2 + 2*3) = (17, 12). Check: 289 - 2*144 = 1.
(x3, y3) = (3*17 + 2*2*12, 3*12 + 2*17) = (99, 70). Check: 9801 - 2*4900 = 1.
```

**Got:** Parametric or recursive desc of all solutions, with at least 3 solutions checked.

**If fail:** Made solutions fail check? Fundamental solution or recurrence formula wrong. For Pell equations, re-derive fundamental solution from continued fraction. For linear equations, re-check extended Euclidean compute.

## Validation

- [ ] Equation sorted right by type (linear, Pell, Pythagorean, general quadratic, higher-order)
- [ ] For linear equations: gcd(a, b) | c checked before solving
- [ ] Extended Euclidean back-swap checked: a*x0 + b*y0 = c exact
- [ ] General solution has all solutions (parameterized by integer k or recurrence)
- [ ] For Pell: D checked as non-square before apply continued fraction method
- [ ] For Pell: fundamental solution fits x1^2 - D*y1^2 = 1 by direct compute
- [ ] Modular block proofs list all residue combos, not just some
- [ ] At least 3 members of any solution family checked by sub
- [ ] Limits (positive integers, bounded range) applied after find general solution
- [ ] Non-exist claims backed by gcd condition or modular block

## Pitfalls

- **Assume all equations with gcd | c have positive solutions**: General solution x = x0 + (b/g)*k has negative values. Positive solutions may not exist even when equation solvable over all integers.

- **Mix x^2 - Dy^2 = 1 with x^2 - Dy^2 = -1**: Negative Pell equation has solutions only when continued fraction period length is odd. Using positive equation formula on negative equation target gives wrong result.

- **Forget trivial solution of Pell's equation**: (x, y) = (1, 0) always fits x^2 - Dy^2 = 1 but not useful for making non-trivial solutions. Fundamental solution is *smallest* solution with y > 0.

- **Thin modular block**: Check only mod 2 or mod 4 may miss blocks at higher moduli. If first few moduli show no block, try mod 8, 9, 16, or discriminant of quadratic form.

- **Off-by-one in continued fraction period**: Convergent indices must be carefully tracked. Fundamental solution comes from p_{r-1}/q_{r-1} where r is period length, not from p_r/q_r.

- **Infinite descent with no base case**: When using descent to prove non-exist, must show descent ends at clash (e.g., x = 0 clashes with x > 0). Without this base case, argument incomplete.

- **Apply Fermat's Last Theorem wrong**: x^n + y^n = z^n has no non-trivial integer solutions for n > 2 (Wiles, 1995), but this does not apply to equations with different coefficients like 2x^3 + 3y^3 = z^3.

## See Also

- `analyze-prime-numbers` -- Factorization and gcd compute are pre-reqs for Diophantine solving
- `solve-modular-arithmetic` -- Linear congruences ax = c (mod b) are same as linear Diophantine equations
- `derive-theoretical-result` -- Formal derivation methods for proving Diophantine impossibility results
