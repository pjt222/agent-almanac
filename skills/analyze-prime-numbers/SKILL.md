---
name: analyze-prime-numbers
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

Analyze prime numbers by selecting and applying the appropriate algorithm for the task at hand: primality testing, integer factorization, or prime distribution analysis. Verify results computationally and relate findings to the Prime Number Theorem.

## When to Use

- Determining whether a given integer is prime or composite
- Finding the complete prime factorization of an integer
- Counting or listing primes up to a given bound
- Verifying the Prime Number Theorem approximation for a specific range
- Investigating properties of primes in a number-theoretic proof or computation

## Inputs

- **Required**: The integer(s) to analyze, or a bound for distribution analysis
- **Required**: Task type -- one of: primality test, factorization, or distribution analysis
- **Optional**: Preferred algorithm (trial division, Miller-Rabin, Sieve of Eratosthenes, Pollard's rho)
- **Optional**: Whether to produce a formal proof of primality or just a computational verdict
- **Optional**: Output format (factor tree, prime list, count, table)

## Procedure

### Step 1: Determine the Task Type

Classify the request into one of three categories and select the appropriate algorithmic path.

1. **Primality test**: Given a single integer n, determine whether n is prime.
2. **Factorization**: Given a composite integer n, find its complete prime factorization.
3. **Distribution analysis**: Given a bound N, analyze the primes up to N (count, list, gaps, density).

Record the task type and the input value(s).

**Expected:** A clear classification with the input values recorded.

**On failure:** If the input is ambiguous (e.g., "analyze 60"), ask the user to clarify whether they want a primality test, factorization, or distribution analysis. Default to factorization for composite numbers and primality confirmation for suspected primes.

### Step 2: Apply Primality Testing (if task = primality)

Test whether n is prime using an algorithm matched to the size of n.

1. **Handle trivial cases**: n < 2 is not prime. n = 2 or n = 3 is prime. If n is even and n > 2, it is composite.

2. **Small n (n < 10^6)**: Use trial division.
   - Test divisibility by all primes p up to floor(sqrt(n)).
   - Optimization: test 2, then odd numbers 3, 5, 7, ... or use a 6k +/- 1 wheel.
   - If no divisor found, n is prime.

3. **Large n (n >= 10^6)**: Use Miller-Rabin probabilistic test.
   - Write n - 1 = 2^s * d where d is odd.
   - For each witness a in {2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37}:
     - Compute x = a^d mod n.
     - If x = 1 or x = n - 1, this witness passes.
     - Otherwise, square x up to s - 1 times. If x ever equals n - 1, pass.
     - If no pass, n is composite (a is a witness).
   - For n < 3.317 * 10^24, the witnesses {2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37} give a deterministic result.

4. **Record the verdict**: prime or composite, with the witness or certificate.

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

**Expected:** A definitive answer (prime or composite) with the algorithm used and any witnesses or divisors found.

**On failure:** If Miller-Rabin reports "probably prime" but certainty is required, escalate to a deterministic test (e.g., AKS or ECPP). For trial division, if computation is too slow, switch to Miller-Rabin.

### Step 3: Apply Factorization (if task = factorization)

Factor n completely into its prime power decomposition.

1. **Extract small factors by trial division**:
   - Divide out 2 as many times as possible, recording the exponent.
   - Divide out odd primes 3, 5, 7, 11, ... up to a cutoff (e.g., 10^4 or sqrt(n) if n is small).
   - After each division, update n to the remaining cofactor.

2. **If cofactor > 1 and cofactor < 10^12**: Continue trial division up to sqrt(cofactor).

3. **If cofactor > 1 and cofactor >= 10^12**: Apply Pollard's rho algorithm.
   - Choose f(x) = x^2 + c (mod n) with random c.
   - Use Floyd's cycle detection: x = f(x), y = f(f(y)).
   - Compute d = gcd(|x - y|, n) at each step.
   - If 1 < d < n, d is a non-trivial factor. Recurse on d and n/d.
   - If d = n, retry with a different c.

4. **Verify**: Multiply all found prime factors (with exponents) and confirm the product equals the original n. Test each factor for primality.

5. **Present the result** in standard form: n = p1^a1 * p2^a2 * ... * pk^ak with p1 < p2 < ... < pk.

**Algorithm complexity notes:**

| Algorithm       | Complexity                  | Best for              |
|-----------------|-----------------------------|-----------------------|
| Trial division  | O(sqrt(n))                  | n < 10^12             |
| Pollard's rho   | O(n^{1/4}) expected         | n up to ~10^18        |
| Quadratic sieve | L(n)^{1+o(1)}              | n up to ~10^50        |
| GNFS            | L(n)^{(64/9)^{1/3}+o(1)}  | n > 10^50             |

**Expected:** A complete prime factorization in canonical form, verified by multiplication.

**On failure:** If Pollard's rho fails to find a factor after many iterations (cycle detected without a non-trivial gcd), try different values of c (at least 5 attempts). If all fail, the cofactor may be prime -- confirm with a primality test.

### Step 4: Apply Distribution Analysis (if task = distribution)

Analyze the distribution of primes up to a given bound N.

1. **Generate primes using the Sieve of Eratosthenes**:
   - Create a boolean array of size N + 1, initialized to true.
   - Set indices 0 and 1 to false (not prime).
   - For each p from 2 to floor(sqrt(N)):
     - If p is still marked true, mark all multiples p^2, p^2 + p, p^2 + 2p, ... as false.
   - Collect all indices still marked true.

2. **Count primes**: Compute pi(N) = number of primes up to N.

3. **Compare with the Prime Number Theorem**:
   - PNT approximation: pi(N) ~ N / ln(N).
   - Logarithmic integral approximation: Li(N) = integral from 2 to N of 1/ln(t) dt.
   - Compute the relative error: |pi(N) - N/ln(N)| / pi(N).

4. **Analyze prime gaps** (optional):
   - Compute gaps between consecutive primes.
   - Report the maximum gap, average gap, and any twin primes (gap = 2).
   - Average gap near N is approximately ln(N).

5. **Present findings** in a summary table:

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

**Expected:** A count of primes with PNT comparison and optional gap analysis.

**On failure:** If N is too large for in-memory sieving (N > 10^9), use a segmented sieve that processes the range in blocks. If only a count is needed (not a list), use the Meissel-Lehmer algorithm for pi(N) directly.

### Step 5: Verify Results Computationally

Cross-check all results using an independent computation method.

1. **For primality**: If trial division was used, verify with a quick Miller-Rabin pass (or vice versa). For known primes, check against published prime tables or OEIS sequences.

2. **For factorization**: Multiply all factors and confirm equality with the original input. Independently test each claimed prime factor for primality.

3. **For distribution**: Spot-check by testing 3-5 individual numbers from the sieve output for primality. Compare pi(N) against published values for standard benchmarks (pi(10^k) for k = 1, ..., 9).

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

4. **Document the verification** with the method used and the outcome.

**Expected:** All results independently verified with no discrepancies.

**On failure:** If verification reveals a discrepancy, re-run the original computation with extra checks enabled (e.g., verbose trial division logging). The most common errors are off-by-one in sieve bounds, integer overflow in modular arithmetic, and mistaking a pseudoprime for a prime.

## Validation

- [ ] Task type is correctly classified (primality, factorization, or distribution)
- [ ] Algorithm is appropriate for the input size
- [ ] Trivial cases (n < 2, n = 2, even n) are handled before general algorithms
- [ ] Primality verdicts are definitive (not "probably prime" without qualification)
- [ ] Factorizations multiply back to the original number
- [ ] Every claimed prime factor has been tested for primality
- [ ] Sieve bounds include sqrt(N) coverage for marking composites
- [ ] PNT comparison uses the correct formula (N/ln(N) or Li(N))
- [ ] Results are verified by an independent method or against published values
- [ ] Edge cases (n = 0, 1, 2, negative inputs) are addressed

## Common Pitfalls

- **Forgetting n = 1 is not prime**: By convention, 1 is neither prime nor composite. Many algorithms silently misclassify it.

- **Integer overflow in modular exponentiation**: When computing a^d mod n for Miller-Rabin, naive exponentiation overflows. Use modular exponentiation (repeated squaring with mod at each step).

- **Sieve off-by-one errors**: The sieve must mark composites starting from p^2, not from 2p. Starting from 2p wastes time but is correct; starting from p+1 is wrong.

- **Pollard's rho cycle with d = n**: If gcd(|x - y|, n) = n, the algorithm has found the trivial factor. Retry with a different polynomial constant c, not just a different starting point.

- **Carmichael numbers fooling Fermat's test**: Numbers like 561 = 3 * 11 * 17 pass Fermat's primality test for all coprime bases. Always use Miller-Rabin, not plain Fermat.

- **Confusing pi(n) with the constant pi**: The prime counting function pi(n) and the circle constant 3.14159... share notation. Context must be unambiguous.

## Related Skills

- `solve-modular-arithmetic` -- Modular arithmetic underpins Miller-Rabin and many factorization methods
- `explore-diophantine-equations` -- Prime factorization is a prerequisite for solving many Diophantine equations
- `formulate-quantum-problem` -- Shor's algorithm for integer factorization connects primes to quantum computing
