---
name: explore-diophantine-equations
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

Solve Diophantine equations -- polynomial equations where only integer solutions are sought. Classify the equation by type, test for solvability, find particular and general solutions, and generate solution families. Covers linear equations, Pell equations, Pythagorean triples, and general quadratic forms.

## When to Use

- Finding all integer solutions to a linear equation ax + by = c
- Solving Pell's equation x^2 - Dy^2 = 1 (or = -1)
- Generating Pythagorean triples or other parametric integer families
- Proving that a given equation has no integer solutions (via modular constraints)
- Testing solvability of a general quadratic Diophantine equation
- Finding the fundamental solution from which all others are generated

## Inputs

- **Required**: The Diophantine equation to solve (in explicit form, e.g., 3x + 5y = 17 or x^2 - 7y^2 = 1)
- **Optional**: Whether to find all solutions, just one particular solution, or prove non-existence
- **Optional**: Constraints on variable ranges (e.g., positive integers only)
- **Optional**: Whether to express the general solution parametrically
- **Optional**: Preferred proof technique (constructive, descent, modular obstruction)

## Procedure

### Step 1: Classify the Equation Type

Determine the structure of the Diophantine equation to select the appropriate solving method.

1. **Linear**: ax + by = c where a, b, c are given integers and x, y are unknowns.
   - Solving method: Extended Euclidean algorithm.

2. **Pell equation**: x^2 - Dy^2 = 1 (or = -1, or = N) where D is a positive non-square integer.
   - Solving method: Continued fraction expansion of sqrt(D).

3. **Pythagorean**: x^2 + y^2 = z^2.
   - Solving method: Parametric family x = m^2 - n^2, y = 2mn, z = m^2 + n^2.

4. **General quadratic**: ax^2 + bxy + cy^2 + dx + ey + f = 0.
   - Solving method: Complete the square, reduce to Pell or simpler form, or apply modular constraints.

5. **Higher-order or special**: Fermat-type (x^n + y^n = z^n for n > 2), sum of squares, or other.
   - Solving method: Modular obstruction, descent, or known impossibility results.

Record the classification and chosen method.

**Expected:** A precise classification with the solving strategy identified.

**On failure:** If the equation does not fit a standard type, try substitution or transformation to reduce it to a known form. For example, x^2 + y^2 + z^2 = n can be approached via Legendre's three-square theorem. If no reduction is apparent, apply modular constraints (Step 4) to test for obstructions.

### Step 2: Solve Linear Diophantine Equations (if type = linear)

Solve ax + by = c for integer x, y.

1. **Compute g = gcd(a, b)** using the Euclidean algorithm.

2. **Test solvability**: Solutions exist if and only if g | c.
   - If g does not divide c, prove non-existence: "Since gcd(a, b) = g and g does not divide c, the equation ax + by = c has no integer solutions."
   - Stop if no solution exists.

3. **Simplify**: Divide through by g to get (a/g)x + (b/g)y = c/g, where now gcd(a/g, b/g) = 1.

4. **Find a particular solution** using the extended Euclidean algorithm:
   - Express 1 = (a/g)*s + (b/g)*t via back-substitution.
   - Multiply by c/g: (c/g) = (a/g)*(s*c/g) + (b/g)*(t*c/g).
   - Particular solution: x0 = s * (c/g), y0 = t * (c/g).

5. **Write the general solution**:
   - x = x0 + (b/g)*k
   - y = y0 - (a/g)*k
   - for all integers k.

6. **Apply constraints** (if positive solutions required):
   - Solve x0 + (b/g)*k > 0 and y0 - (a/g)*k > 0 for k.
   - Report the range of valid k values or state that no positive solution exists.

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

**Expected:** The general solution family (x, y) parameterized by an integer k, with verification of the particular solution.

**On failure:** If the particular solution is wrong, re-check the extended Euclidean back-substitution step by step. The most common error is a sign mistake. Verify: a * x0 + b * y0 should equal c exactly (not just modulo something).

### Step 3: Solve Pell Equations (if type = Pell)

Solve x^2 - Dy^2 = 1 where D is a positive non-square integer.

1. **Verify D is not a perfect square**: If D = k^2, then x^2 - k^2*y^2 = (x - ky)(x + ky) = 1, which forces x - ky = x + ky = +/-1, giving y = 0, x = +/-1 (trivial). The equation is interesting only for non-square D.

2. **Compute the continued fraction expansion of sqrt(D)**:
   - Initialize: a0 = floor(sqrt(D)), m0 = 0, d0 = 1.
   - Iterate: m_{i+1} = d_i * a_i - m_i, d_{i+1} = (D - m_{i+1}^2) / d_i, a_{i+1} = floor((a0 + m_{i+1}) / d_{i+1}).
   - Continue until the sequence of a_i repeats (the expansion is periodic after a0).
   - Record the period length r.

3. **Extract the fundamental solution from convergents**:
   - Compute the convergents p_i / q_i of the continued fraction.
   - The convergent p_{r-1} / q_{r-1} (at the end of the first period) gives the fundamental solution:
     - If r is even: (x1, y1) = (p_{r-1}, q_{r-1}) solves x^2 - Dy^2 = 1.
     - If r is odd: (p_{r-1}, q_{r-1}) solves x^2 - Dy^2 = -1 (the negative Pell equation). Then (p_{2r-1}, q_{2r-1}) solves the positive equation.

4. **Generate further solutions** from the fundamental solution (x1, y1):
   - The recurrence: x_{n+1} + y_{n+1} * sqrt(D) = (x1 + y1 * sqrt(D))^{n+1}.
   - Equivalently: x_{n+1} = x1 * x_n + D * y1 * y_n, y_{n+1} = x1 * y_n + y1 * x_n.

5. **Present** the fundamental solution and the recurrence for generating all solutions.

**Fundamental solutions for small D:**

| D  | (x1, y1) | D  | (x1, y1)   | D  | (x1, y1)   |
|----|----------|----|-------------|----|-----------  |
| 2  | (3, 2)   | 7  | (8, 3)      | 13 | (649, 180)  |
| 3  | (2, 1)   | 8  | (3, 1)      | 14 | (15, 4)     |
| 5  | (9, 4)   | 10 | (19, 6)     | 15 | (4, 1)      |
| 6  | (5, 2)   | 11 | (10, 3)     | 17 | (33, 8)     |

**Expected:** The fundamental solution (x1, y1) verified by substitution, plus the recurrence for generating all positive solutions.

**On failure:** If the continued fraction computation does not converge to a period, check the iteration formula. The period length r can be large (e.g., D = 61 has r = 11 and fundamental solution (1766319049, 226153980)). For large D, use computational tools rather than manual computation.

### Step 4: Apply Modular Constraints for Existence/Non-Existence (if type = general quadratic or higher)

Prove that an equation has no integer solutions by showing a modular obstruction.

1. **Choose a modulus m** (typically m = 2, 3, 4, 5, 7, 8, or 16).

2. **Enumerate all residues**: Compute the left-hand side modulo m for all possible residues of the variables.

3. **Check if any combination gives the required right-hand side modulo m**.
   - If no combination works, the equation has no solution (modular obstruction).

4. **Common obstructions**:
   - **Squares mod 4**: n^2 = 0 or 1 (mod 4). So x^2 + y^2 = c has no solution if c = 3 (mod 4).
   - **Squares mod 8**: n^2 = 0, 1, or 4 (mod 8). So x^2 + y^2 + z^2 = c has no solution if c = 7 (mod 8).
   - **Cubes mod 9**: n^3 = 0, 1, or 8 (mod 9). So x^3 + y^3 + z^3 = c may be obstructed for certain c mod 9.

5. **If no obstruction is found**, a modular approach cannot prove non-existence. Solutions may or may not exist; try constructive methods or descent.

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

**Expected:** Either a proof of non-existence via modular obstruction, or a statement that no obstruction was found at the tested moduli.

**On failure:** If modular methods are inconclusive, try infinite descent: assume a solution exists, derive a strictly smaller solution, and repeat until a contradiction with positivity is reached. This technique is classical for proving x^4 + y^4 = z^2 has no non-trivial solutions.

### Step 5: Generate Solution Families from Fundamental Solution

Express all solutions in terms of the fundamental solution and integer parameters.

1. **For linear equations**: The family is x = x0 + (b/g)*k, y = y0 - (a/g)*k (from Step 2).

2. **For Pell equations**: Use the recurrence from Step 3 to generate the first several solutions:
   ```
   (x1, y1), (x2, y2), (x3, y3), ...
   ```
   List at least 3-5 solutions as a sanity check.

3. **For Pythagorean triples**: Generate primitive triples from parameters m > n > 0, gcd(m, n) = 1, m - n odd:
   - a = m^2 - n^2, b = 2mn, c = m^2 + n^2.
   - All primitive triples arise this way (up to swapping a and b).

4. **For general families**: Express solutions in parametric form if possible. If the equation defines a curve of genus 0, a rational parametrization exists. If genus >= 1, there may be finitely many solutions (Faltings' theorem for genus >= 2).

5. **Verify** at least 3 members of the family by substitution into the original equation.

**Example (Pell, D = 2):**
```
Fundamental: (x1, y1) = (3, 2). Check: 9 - 2*4 = 1. Correct.
(x2, y2) = (3*3 + 2*2*2, 3*2 + 2*3) = (17, 12). Check: 289 - 2*144 = 1.
(x3, y3) = (3*17 + 2*2*12, 3*12 + 2*17) = (99, 70). Check: 9801 - 2*4900 = 1.
```

**Expected:** A parametric or recursive description of all solutions, with at least 3 solutions verified.

**On failure:** If generated solutions fail verification, the fundamental solution or the recurrence formula is wrong. For Pell equations, re-derive the fundamental solution from the continued fraction. For linear equations, re-check the extended Euclidean computation.

## Validation

- [ ] Equation is correctly classified by type (linear, Pell, Pythagorean, general quadratic, higher-order)
- [ ] For linear equations: gcd(a, b) | c is checked before solving
- [ ] Extended Euclidean back-substitution is verified: a*x0 + b*y0 = c exactly
- [ ] General solution includes all solutions (parameterized by integer k or recurrence)
- [ ] For Pell: D is verified as non-square before applying continued fraction method
- [ ] For Pell: fundamental solution satisfies x1^2 - D*y1^2 = 1 by direct computation
- [ ] Modular obstruction proofs enumerate all residue combinations, not just some
- [ ] At least 3 members of any solution family are verified by substitution
- [ ] Constraints (positive integers, bounded range) are applied after finding the general solution
- [ ] Non-existence claims are justified either by gcd condition or modular obstruction

## Common Pitfalls

- **Assuming all equations with gcd | c have positive solutions**: The general solution x = x0 + (b/g)*k includes negative values. Positive solutions may not exist even when the equation is solvable over all integers.

- **Confusing x^2 - Dy^2 = 1 with x^2 - Dy^2 = -1**: The negative Pell equation has solutions only when the continued fraction period length is odd. Applying the positive equation formula to a negative equation target gives the wrong result.

- **Forgetting the trivial solution of Pell's equation**: (x, y) = (1, 0) always satisfies x^2 - Dy^2 = 1 but is not useful for generating non-trivial solutions. The fundamental solution is the *smallest* solution with y > 0.

- **Incomplete modular obstruction**: Checking only mod 2 or mod 4 may miss obstructions visible at higher moduli. If the first few moduli show no obstruction, try mod 8, 9, 16, or the discriminant of the quadratic form.

- **Off-by-one in continued fraction period**: The convergent indices must be carefully tracked. The fundamental solution comes from p_{r-1}/q_{r-1} where r is the period length, not from p_r/q_r.

- **Infinite descent without a base case**: When using descent to prove non-existence, you must show that the descent terminates at a contradiction (e.g., x = 0 contradicts x > 0). Without this base case, the argument is incomplete.

- **Applying Fermat's Last Theorem incorrectly**: x^n + y^n = z^n has no non-trivial integer solutions for n > 2 (Wiles, 1995), but this does not apply to equations with different coefficients like 2x^3 + 3y^3 = z^3.

## Related Skills

- `analyze-prime-numbers` -- Factorization and gcd computation are prerequisites for Diophantine solving
- `solve-modular-arithmetic` -- Linear congruences ax = c (mod b) are equivalent to linear Diophantine equations
- `derive-theoretical-result` -- Formal derivation techniques for proving Diophantine impossibility results
