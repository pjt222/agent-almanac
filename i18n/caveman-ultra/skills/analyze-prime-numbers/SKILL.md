---
name: analyze-prime-numbers
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Analyze prime numbers using primality tests, factorization algorithms,
  prime distribution analysis, and sieve methods. Covers trial division,
  Miller-Rabin, Sieve of Eratosthenes, and the Prime Number Theorem.
  Use when determining whether an integer is prime or composite, finding
  prime factorizations, counting or listing primes up to a bound, or
  investigating prime properties within a number-theoretic proof or
  computation.
license: MIT
allowed-tools: Read Bash
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: number-theory
  complexity: intermediate
  language: multi
  tags: number-theory, primes, primality, factorization, sieve
---

# Analyze Prime Numbers

Select + apply right algo: primality, factorization, distribution. Verify computationally + relate to Prime Number Theorem.

## Use When

- Int prime or composite?
- Complete prime factorization
- Count/list primes up to bound
- Verify PNT approx for range
- Investigate prime props in number-theoretic proof/compute

## In

- **Required**: Int(s) to analyze, or bound for distribution
- **Required**: Task — primality, factorization, distribution
- **Optional**: Preferred algo (trial div, Miller-Rabin, Sieve Eratosthenes, Pollard's rho)
- **Optional**: Formal proof or computational verdict
- **Optional**: Out format (factor tree, prime list, count, table)

## Do

### Step 1: Determine Task

Classify → 1 of 3 + select algo path:

1. **Primality**: Int n, prime?
2. **Factorization**: Composite n, complete prime factorization
3. **Distribution**: Bound N, analyze primes ≤ N (count, list, gaps, density)

Record task + in values.

**→** Clear classification + in values recorded.

**If err:** Ambiguous ("analyze 60") → ask clarify primality vs factorization vs distribution. Default factorization for composites + primality confirm suspected primes.

### Step 2: Primality Testing (if task = primality)

Test n prime, algo matched to size:

1. **Trivial**: n < 2 not prime. n = 2 or 3 prime. n even + n > 2 → composite.

2. **Small n (<10^6)**: Trial division.
   - Test div all primes p ≤ floor(sqrt(n)).
   - Opt: test 2, then odd 3, 5, 7, ... or 6k +/- 1 wheel.
   - No divisor → prime.

3. **Large n (>=10^6)**: Miller-Rabin probabilistic.
   - n - 1 = 2^s * d, d odd.
   - Per witness a in {2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37}:
     - Compute x = a^d mod n.
     - x = 1 or x = n - 1 → pass.
     - Else square x up to s - 1 times. x = n - 1 ever → pass.
     - No pass → composite (a = witness).
   - n < 3.317 * 10^24 → witnesses give deterministic result.

4. **Record verdict**: prime or composite + witness/cert.

**Small primes (1st 25):**

| Index | Prime | Index | Prime | Index | Prime |
|-------|-------|-------|-------|-------|-------|
| 1     | 2     | 10    | 29    | 19    | 67    |
| 2     | 3     | 11    | 31    | 20    | 71    |
| 3     | 5     | 12    | 37    | 21    | 73    |
| 4     | 7     | 13    | 41    | 22    | 79    |
| 5     | 11    | 14    | 43    | 23    | 83    |
| 6     | 13    | 15    | 47    | 24    | 89    |
| 7     | 17    | 16    | 53    | 25    | 97    |
| 8     | 19    | 17    | 59    |       |       |
| 9     | 23    | 18    | 61    |       |       |

**→** Definitive (prime/composite) + algo used + witnesses/divisors.

**If err:** Miller-Rabin "probably prime" + certainty needed → escalate deterministic (AKS or ECPP). Trial div too slow → Miller-Rabin.

### Step 3: Factorization (if task = factorization)

Factor n completely → prime power decomposition:

1. **Extract small factors by trial div**:
   - Divide 2 as many times as possible, record exponent.
   - Divide odd primes 3, 5, 7, 11, ... up to cutoff (10^4 or sqrt(n) if small).
   - After each div, update n → cofactor.

2. **Cofactor > 1 + <10^12**: Continue trial div ≤ sqrt(cofactor).

3. **Cofactor >= 10^12**: Pollard's rho.
   - f(x) = x^2 + c (mod n), random c.
   - Floyd cycle: x = f(x), y = f(f(y)).
   - d = gcd(|x - y|, n) each step.
   - 1 < d < n → non-trivial factor. Recurse d + n/d.
   - d = n → retry diff c.

4. **Verify**: Multiply all prime factors + exponents = original n. Test each factor primality.

5. **Present**: n = p1^a1 * p2^a2 * ... * pk^ak, p1 < p2 < ... < pk.

**Algo complexity:**

| Algo       | Complexity                  | Best for              |
|-----------------|-----------------------------|-----------------------|
| Trial division  | O(sqrt(n))                  | n < 10^12             |
| Pollard's rho   | O(n^{1/4}) expected         | n up to ~10^18        |
| Quadratic sieve | L(n)^{1+o(1)}              | n up to ~10^50        |
| GNFS            | L(n)^{(64/9)^{1/3}+o(1)}  | n > 10^50             |

**→** Complete prime factorization canonical form + multiplication verified.

**If err:** Pollard's rho fails after many iters (cycle w/o non-trivial gcd) → try diff c (≥5 attempts). All fail → cofactor may be prime → confirm primality.

### Step 4: Distribution Analysis (if task = distribution)

Distribution of primes up to N:

1. **Generate via Sieve Eratosthenes**:
   - Bool array size N + 1, true.
   - Set 0 + 1 false (not prime).
   - Per p from 2 to floor(sqrt(N)):
     - Still true → mark multiples p^2, p^2 + p, p^2 + 2p, ... false.
   - Collect indices still true.

2. **Count**: pi(N) = primes up to N.

3. **Compare w/ PNT**:
   - PNT approx: pi(N) ~ N / ln(N).
   - Logarithmic integral: Li(N) = integral 2 to N of 1/ln(t) dt.
   - Relative err: |pi(N) - N/ln(N)| / pi(N).

4. **Analyze gaps** (optional):
   - Gaps between consecutive primes.
   - Max gap, avg gap, twin primes (gap = 2).
   - Avg gap near N ~ ln(N).

5. **Present summary**:

```
Bound N:       1,000,000
pi(N):         78,498
N/ln(N):       72,382
Li(N):         78,628
Relative error (N/ln(N)):  7.79%
Relative error (Li(N)):    0.17%
Max prime gap:  148 (between 492113 and 492227)
Twin primes:    8,169 pairs
```

**→** Count + PNT compare + optional gap analysis.

**If err:** N too large in-mem sieve (N > 10^9) → segmented sieve processes range in blocks. Count only (no list) → Meissel-Lehmer for pi(N) direct.

### Step 5: Verify Computationally

Cross-check via independent method:

1. **Primality**: Trial div used → verify quick Miller-Rabin (or vice versa). Known primes → check published tables or OEIS.

2. **Factorization**: Multiply factors + confirm = original. Independently test each claimed prime.

3. **Distribution**: Spot-check 3-5 numbers from sieve out for primality. Compare pi(N) published values (pi(10^k) k = 1, ..., 9).

**Published pi(N):**

| N       | pi(N)        |
|---------|-------------|
| 10      | 4           |
| 100     | 25          |
| 1,000   | 168         |
| 10,000  | 1,229       |
| 100,000 | 9,592       |
| 10^6    | 78,498      |
| 10^7    | 664,579     |
| 10^8    | 5,761,455   |
| 10^9    | 50,847,534  |

4. **Doc verification** + method + outcome.

**→** All results independently verified no discrepancies.

**If err:** Verification → discrepancy → re-run w/ extra checks (verbose trial div logging). Common: off-by-one sieve bounds, int overflow modular arithmetic, pseudoprime mistaken prime.

## Check

- [ ] Task correctly classified (primality, factorization, distribution)
- [ ] Algo appropriate for in size
- [ ] Trivial cases (n < 2, n = 2, even n) handled pre-general
- [ ] Primality verdicts definitive (not "probably prime" unqualified)
- [ ] Factorizations multiply back to original
- [ ] Every claimed prime factor tested primality
- [ ] Sieve bounds include sqrt(N) coverage
- [ ] PNT compare uses correct formula (N/ln(N) or Li(N))
- [ ] Results verified by independent method or published values
- [ ] Edge cases (n = 0, 1, 2, neg) addressed

## Traps

- **Forget n = 1 not prime**: Convention — 1 neither prime nor composite. Many algos silently misclassify.

- **Int overflow modular exp**: Computing a^d mod n for Miller-Rabin, naive exp overflows. Use modular exp (repeated squaring + mod each step).

- **Sieve off-by-one**: Mark composites starting p^2, not 2p. 2p wastes time but correct; p+1 wrong.

- **Pollard's rho cycle w/ d = n**: gcd(|x - y|, n) = n → algo found trivial factor. Retry diff c not just starting pt.

- **Carmichael nums fooling Fermat**: Nums like 561 = 3 * 11 * 17 pass Fermat primality all coprime bases. Always Miller-Rabin, not plain Fermat.

- **Confuse pi(n) w/ constant pi**: Prime counting fn pi(n) + circle constant 3.14159 share notation. Ctx unambiguous.

## →

- `solve-modular-arithmetic` — underpins Miller-Rabin + factorization
- `explore-diophantine-equations` — factorization prereq for solving many
- `formulate-quantum-problem` — Shor's algo for factorization connects primes → quantum
