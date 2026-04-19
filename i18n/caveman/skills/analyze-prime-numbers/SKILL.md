---
name: analyze-prime-numbers
locale: caveman
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

Analyze prime numbers. Select and apply appropriate algorithm for task at hand: primality testing, integer factorization, or prime distribution analysis. Verify results computationally. Relate findings to Prime Number Theorem.

## When Use

- Determining whether given integer is prime or composite
- Finding complete prime factorization of integer
- Counting or listing primes up to given bound
- Verifying Prime Number Theorem approximation for specific range
- Investigating properties of primes in number-theoretic proof or computation

## Inputs

- **Required**: Integer(s) to analyze, or bound for distribution analysis
- **Required**: Task type -- one of: primality test, factorization, distribution analysis
- **Optional**: Preferred algorithm (trial division, Miller-Rabin, Sieve of Eratosthenes, Pollard's rho)
- **Optional**: Whether to produce formal proof of primality or just computational verdict
- **Optional**: Output format (factor tree, prime list, count, table)

## Steps

### Step 1: Determine Task Type

Classify request into one of three categories. Select appropriate algorithmic path.

1. **Primality test**: Given single integer n, determine whether n is prime.
2. **Factorization**: Given composite integer n, find its complete prime factorization.
3. **Distribution analysis**: Given bound N, analyze primes up to N (count, list, gaps, density).

Record task type and input value(s).

**Got:** Clear classification with input values recorded.

**If fail:** Input ambiguous (e.g., "analyze 60")? Ask user to clarify whether they want primality test, factorization, or distribution analysis. Default to factorization for composite numbers and primality confirmation for suspected primes.

### Step 2: Apply Primality Testing (if task = primality)

Test whether n prime using algorithm matched to size of n.

1. **Handle trivial cases**: n < 2 not prime. n = 2 or n = 3 prime. n even and n > 2? Composite.

2. **Small n (n < 10^6)**: Use trial division.
   - Test divisibility by all primes p up to floor(sqrt(n)).
   - Optimization: test 2, then odd numbers 3, 5, 7, ... or use 6k +/- 1 wheel.
   - No divisor found? n prime.

3. **Large n (n >= 10^6)**: Use Miller-Rabin probabilistic test.
   - Write n - 1 = 2^s * d where d is odd.
   - For each witness a in {2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37}:
     - Compute x = a^d mod n.
     - x = 1 or x = n - 1? This witness passes.
     - Otherwise, square x up to s - 1 times. x ever equals n - 1? Pass.
     - No pass? n composite (a is witness).
   - For n < 3.317 * 10^24, witnesses {2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37} give deterministic result.

4. **Record verdict**: prime or composite, with witness or certificate.

**Small primes reference (first 25):**

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

**Got:** Definitive answer (prime or composite) with algorithm used and any witnesses or divisors found.

**If fail:** Miller-Rabin reports "probably prime" but certainty required? Escalate to deterministic test (e.g., AKS or ECPP). For trial division, computation too slow? Switch to Miller-Rabin.

### Step 3: Apply Factorization (if task = factorization)

Factor n complete into its prime power decomposition.

1. **Extract small factors by trial division**:
   - Divide out 2 as many times as possible, recording exponent.
   - Divide out odd primes 3, 5, 7, 11, ... up to cutoff (e.g., 10^4 or sqrt(n) if n small).
   - After each division, update n to remaining cofactor.

2. **Cofactor > 1 and cofactor < 10^12**: Continue trial division up to sqrt(cofactor).

3. **Cofactor > 1 and cofactor >= 10^12**: Apply Pollard's rho algorithm.
   - Choose f(x) = x^2 + c (mod n) with random c.
   - Use Floyd's cycle detection: x = f(x), y = f(f(y)).
   - Compute d = gcd(|x - y|, n) at each step.
   - 1 < d < n? d is non-trivial factor. Recurse on d and n/d.
   - d = n? Retry with different c.

4. **Verify**: Multiply all found prime factors (with exponents) and confirm product equals original n. Test each factor for primality.

5. **Present result** in standard form: n = p1^a1 * p2^a2 * ... * pk^ak with p1 < p2 < ... < pk.

**Algorithm complexity notes:**

| Algorithm       | Complexity                  | Best for              |
|-----------------|-----------------------------|-----------------------|
| Trial division  | O(sqrt(n))                  | n < 10^12             |
| Pollard's rho   | O(n^{1/4}) expected         | n up to ~10^18        |
| Quadratic sieve | L(n)^{1+o(1)}              | n up to ~10^50        |
| GNFS            | L(n)^{(64/9)^{1/3}+o(1)}  | n > 10^50             |

**Got:** Complete prime factorization in canonical form, verified by multiplication.

**If fail:** Pollard's rho fails to find factor after many iterations (cycle detected without non-trivial gcd)? Try different values of c (at least 5 attempts). All fail? Cofactor may be prime -- confirm with primality test.

### Step 4: Apply Distribution Analysis (if task = distribution)

Analyze distribution of primes up to given bound N.

1. **Generate primes using Sieve of Eratosthenes**:
   - Create boolean array of size N + 1, initialized to true.
   - Set indices 0 and 1 to false (not prime).
   - For each p from 2 to floor(sqrt(N)):
     - p still marked true? Mark all multiples p^2, p^2 + p, p^2 + 2p, ... as false.
   - Collect all indices still marked true.

2. **Count primes**: Compute pi(N) = number of primes up to N.

3. **Compare with Prime Number Theorem**:
   - PNT approximation: pi(N) ~ N / ln(N).
   - Logarithmic integral approximation: Li(N) = integral from 2 to N of 1/ln(t) dt.
   - Compute relative error: |pi(N) - N/ln(N)| / pi(N).

4. **Analyze prime gaps** (optional):
   - Compute gaps between consecutive primes.
   - Report maximum gap, average gap, any twin primes (gap = 2).
   - Average gap near N approximately ln(N).

5. **Present findings** in summary table:

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

**Got:** Count of primes with PNT comparison and optional gap analysis.

**If fail:** N too large for in-memory sieving (N > 10^9)? Use segmented sieve that processes range in blocks. Only count needed (not list)? Use Meissel-Lehmer algorithm for pi(N) directly.

### Step 5: Verify Results Computationally

Cross-check all results using independent computation method.

1. **For primality**: Trial division used? Verify with quick Miller-Rabin pass (or vice versa). For known primes, check against published prime tables or OEIS sequences.

2. **For factorization**: Multiply all factors and confirm equality with original input. Independently test each claimed prime factor for primality.

3. **For distribution**: Spot-check by testing 3-5 individual numbers from sieve output for primality. Compare pi(N) against published values for standard benchmarks (pi(10^k) for k = 1, ..., 9).

**Published values of pi(N):**

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

4. **Document verification** with method used and outcome.

**Got:** All results independently verified with no discrepancies.

**If fail:** Verification reveals discrepancy? Re-run original computation with extra checks enabled (e.g., verbose trial division logging). Most common errors: off-by-one in sieve bounds, integer overflow in modular arithmetic, mistaking pseudoprime for prime.

## Checks

- [ ] Task type correctly classified (primality, factorization, distribution)
- [ ] Algorithm appropriate for input size
- [ ] Trivial cases (n < 2, n = 2, even n) handled before general algorithms
- [ ] Primality verdicts definitive (not "probably prime" without qualification)
- [ ] Factorizations multiply back to original number
- [ ] Every claimed prime factor tested for primality
- [ ] Sieve bounds include sqrt(N) coverage for marking composites
- [ ] PNT comparison uses correct formula (N/ln(N) or Li(N))
- [ ] Results verified by independent method or against published values
- [ ] Edge cases (n = 0, 1, 2, negative inputs) addressed

## Pitfalls

- **Forgetting n = 1 not prime**: By convention, 1 neither prime nor composite. Many algorithms silently misclassify it.

- **Integer overflow in modular exponentiation**: When computing a^d mod n for Miller-Rabin, naive exponentiation overflows. Use modular exponentiation (repeated squaring with mod at each step).

- **Sieve off-by-one errors**: Sieve must mark composites starting from p^2, not from 2p. Starting from 2p wastes time but correct; starting from p+1 wrong.

- **Pollard's rho cycle with d = n**: gcd(|x - y|, n) = n? Algorithm has found trivial factor. Retry with different polynomial constant c, not just different starting point.

- **Carmichael numbers fooling Fermat's test**: Numbers like 561 = 3 * 11 * 17 pass Fermat's primality test for all coprime bases. Always use Miller-Rabin, not plain Fermat.

- **Confusing pi(n) with constant pi**: Prime counting function pi(n) and circle constant 3.14159... share notation. Context must be unambiguous.

## See Also

- `solve-modular-arithmetic` -- Modular arithmetic underpins Miller-Rabin and many factorization methods
- `explore-diophantine-equations` -- Prime factorization is prerequisite for solving many Diophantine equations
- `formulate-quantum-problem` -- Shor's algorithm for integer factorization connects primes to quantum computing
