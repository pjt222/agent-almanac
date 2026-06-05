---
name: solve-modular-arithmetic
description: >
  Solve modular arithmetic problems including congruences, systems
  via the Chinese Remainder Theorem, modular inverses, and
  Euler's theorem applications. Covers both manual and computational
  approaches. Use when solving linear congruences, computing modular
  inverses, evaluating large modular exponentiations, working with
  simultaneous congruences (CRT), or operating in cyclic groups and
  discrete logarithm contexts.
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

Solve modular arithmetic problems by parsing congruence systems, applying the extended Euclidean algorithm for inverses, using the Chinese Remainder Theorem for simultaneous congruences, and leveraging Euler's theorem for modular exponentiation. Verify every solution by substitution.

## When to Use

- Solving a single linear congruence ax = b (mod m)
- Solving a system of simultaneous congruences (Chinese Remainder Theorem)
- Computing a modular inverse a^{-1} (mod m)
- Evaluating large modular exponentiations a^k (mod m)
- Determining the order of an element in Z/mZ
- Working with cyclic groups, primitive roots, or discrete logarithm contexts

## Inputs

- **Required**: The congruence(s) or modular equation to solve
- **Optional**: Whether to show the extended Euclidean algorithm steps explicitly
- **Optional**: Whether Euler's theorem or Fermat's little theorem should be applied
- **Optional**: Whether to find primitive roots or element orders
- **Optional**: Output format (step-by-step, compact, or proof-style)

## Procedure

### Step 1: Parse the Congruence System or Modular Equation

Extract the mathematical structure from the problem statement.

1. **Identify the type**:
   - Single linear congruence: ax = b (mod m)
   - System of congruences: x = a1 (mod m1), x = a2 (mod m2), ...
   - Modular exponentiation: a^k (mod m)
   - Modular inverse: find a^{-1} (mod m)

2. **Normalize**: Reduce all coefficients modulo their respective moduli. Ensure a, b, m are non-negative integers with m > 0.

3. **Record** the parsed problem in standard notation.

**Expected:** A clearly parsed and normalized modular problem with all values reduced.

**On failure:** If the notation is ambiguous (e.g., "solve 3x + 5 = 2 mod 7" could mean 3x + 5 = 2 (mod 7) or 3x + (5 = 2 mod 7)), clarify with the user. Default to interpreting mod as applying to the entire equation.

### Step 2: Solve a Single Congruence (if applicable)

Solve ax = b (mod m) using the extended Euclidean algorithm.

1. **Compute g = gcd(a, m)** using the Euclidean algorithm:
   - Apply repeated division: m = q1*a + r1, a = q2*r1 + r2, ... until remainder = 0.
   - The last non-zero remainder is gcd(a, m).

2. **Check solvability**: ax = b (mod m) has a solution if and only if g | b.
   - If g does not divide b, the congruence has no solution. Stop.

3. **Reduce**: Divide through by g to get (a/g)x = (b/g) (mod m/g). Now gcd(a/g, m/g) = 1.

4. **Find the modular inverse** of a/g modulo m/g using the extended Euclidean algorithm:
   - Back-substitute through the Euclidean algorithm steps to express gcd as a linear combination: 1 = (a/g)*s + (m/g)*t.
   - The coefficient s (reduced mod m/g) is the inverse.

5. **Compute the particular solution**: x0 = s * (b/g) mod (m/g).

6. **Write the general solution**: x = x0 + (m/g)*k for k = 0, 1, ..., g - 1 gives all g incongruent solutions modulo m.

**Extended Euclidean algorithm example (finding 17^{-1} mod 43):**
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

**Expected:** The complete solution set for the congruence, or a proof that no solution exists.

**On failure:** If the extended Euclidean back-substitution produces the wrong result, verify each division step. The most common error is a sign mistake during back-substitution. Check: a * inverse mod m should equal 1.

### Step 3: Solve a System via the Chinese Remainder Theorem (if applicable)

Solve x = a1 (mod m1), x = a2 (mod m2), ..., x = ak (mod mk).

1. **Check pairwise coprimality**: For every pair (mi, mj), verify gcd(mi, mj) = 1.
   - If all pairs are coprime, CRT applies directly.
   - If some pairs are not coprime, check compatibility: for each non-coprime pair, verify ai = aj (mod gcd(mi, mj)). If compatible, reduce using lcm. If incompatible, no solution exists.

2. **Compute M = m1 * m2 * ... * mk** (the product of all moduli).

3. **For each i, compute Mi = M / mi** (the product of all moduli except mi).

4. **For each i, find yi = Mi^{-1} (mod mi)** using the extended Euclidean algorithm from Step 2.

5. **Compute the solution**: x = sum(ai * Mi * yi for i = 1..k) mod M.

6. **State the result**: x = [value] (mod M). This is the unique solution modulo M.

**Common totients reference:**

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

**Expected:** A unique solution modulo M, or a proof of incompatibility.

**On failure:** If the CRT computation yields a result that fails verification, check the modular inverse computations in step 4. A common mistake is computing Mi^{-1} mod M instead of Mi^{-1} mod mi. Each inverse is computed modulo the *individual* modulus, not the product.

### Step 4: Apply Euler's Theorem or Fermat's Little Theorem (if applicable)

Evaluate modular exponentiations or simplify expressions using Euler's theorem.

1. **Euler's theorem**: If gcd(a, m) = 1, then a^{phi(m)} = 1 (mod m).
   - Compute phi(m) using the totient formula: if m = p1^e1 * p2^e2 * ... * pk^ek, then phi(m) = m * product((1 - 1/pi) for each prime pi dividing m).

2. **Fermat's little theorem** (special case): If p is prime and gcd(a, p) = 1, then a^{p-1} = 1 (mod p).

3. **Reduce the exponent**: To compute a^k (mod m):
   - Compute r = k mod phi(m).
   - Then a^k = a^r (mod m).

4. **Compute a^r (mod m)** using repeated squaring (binary exponentiation):
   - Write r in binary: r = b_n * 2^n + ... + b_1 * 2 + b_0.
   - Start with result = 1.
   - For each bit from most significant to least: result = result^2 mod m; if bit is 1, result = result * a mod m.

5. **Handle the case gcd(a, m) > 1**: Euler's theorem does not apply directly. Factor m and use CRT to combine results from prime power moduli, using lifting the exponent or direct computation.

**Expected:** The value of a^k (mod m), computed via exponent reduction and repeated squaring.

**On failure:** If gcd(a, m) > 1 and the result seems wrong, do not apply Euler's theorem. Instead, compute directly or factor m into coprime parts where at least some parts are coprime to a, solve modulo each part, and recombine with CRT.

### Step 5: Verify Solution by Substitution

Check every solution by plugging it back into the original equations.

1. **For single congruences**: Compute a * x mod m and verify it equals b.

2. **For CRT systems**: For each congruence x = ai (mod mi), verify x mod mi = ai.

3. **For modular exponentiations**: If possible, verify with a second computational method (e.g., direct computation for small values, or independent repeated squaring implementation).

4. **Document the verification** explicitly:
```
Solution: x = 23
Check 1: 23 mod 3 = 2 = a1. Correct.
Check 2: 23 mod 5 = 3 = a2. Correct.
Check 3: 23 mod 7 = 2 = a3. Correct.
All congruences satisfied.
```

**Expected:** All original equations verified with explicit computation shown.

**On failure:** If verification fails, trace back through the procedure to find the computational error. Common sources: arithmetic mistakes in the extended Euclidean algorithm, wrong sign in back-substitution, or forgetting to reduce modulo M in the final CRT step.

## Validation

- [ ] Problem type is correctly identified (single congruence, system, exponentiation, inverse)
- [ ] All coefficients are reduced modulo their respective moduli
- [ ] For ax = b (mod m): gcd(a, m) | b is checked before solving
- [ ] Extended Euclidean algorithm back-substitution is verified: a * inverse mod m = 1
- [ ] For CRT: pairwise coprimality is verified before applying the theorem
- [ ] For CRT with non-coprime moduli: compatibility is checked
- [ ] Euler's theorem is applied only when gcd(a, m) = 1
- [ ] Totient phi(m) is computed from the prime factorization, not guessed
- [ ] Repeated squaring uses modular reduction at every step (no overflow)
- [ ] Every solution is verified by substitution into the original equations

## Common Pitfalls

- **Applying CRT without coprimality check**: The standard CRT formula requires pairwise coprime moduli. Applying it to non-coprime moduli gives a wrong answer, not an error. Always check gcd(mi, mj) = 1 first.

- **Computing the wrong inverse**: Mi^{-1} must be computed modulo mi (the *individual* modulus), not modulo M (the product). This is the single most common CRT implementation error.

- **Applying Euler's theorem when gcd(a, m) > 1**: a^{phi(m)} = 1 (mod m) requires gcd(a, m) = 1. If this fails, the theorem does not apply and the result is wrong.

- **Sign errors in extended Euclidean back-substitution**: Keep careful track of signs at each step. The final inverse may be negative; always reduce modulo m to get a positive representative.

- **Overflow in modular exponentiation**: Even with repeated squaring, intermediate products can overflow. Always reduce modulo m after every multiplication, not just at the end.

- **Forgetting multiple solutions**: ax = b (mod m) with g = gcd(a, m) > 1 and g | b has exactly g incongruent solutions modulo m, not just one.

## Related Skills

- `analyze-prime-numbers` -- Prime factorization is needed to compute phi(m) and to verify coprimality
- `explore-diophantine-equations` -- Linear Diophantine equations ax + by = c are equivalent to linear congruences ax = c (mod b)
- `prove-geometric-theorem` -- Modular arithmetic appears in constructibility proofs (e.g., which regular n-gons are constructible)
