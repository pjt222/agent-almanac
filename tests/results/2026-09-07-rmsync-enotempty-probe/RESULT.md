# rmSync ENOTEMPTY probe — what clears a concurrent writer, per Node version (#791)

**Date:** 2026-09-07. **Machine:** WSL2 Ubuntu 24.04, `/tmp` on ext4, the probe beside this file.
**Question:** when another process is still creating entries under a directory while
`rmSync(dir, { recursive: true, force: true })` walks it, does the removal throw `ENOTEMPTY` —
and does `node:fs`'s `{ maxRetries, retryDelay }` option, the fix #791 proposed, clear it?

## Method

`enotempty-probe.mjs <trials> <writerMs>`. Each trial makes a fresh temp directory with one
subdirectory, spawns a child `node -e` that creates files in that subdirectory in a tight loop
for `writerMs` milliseconds, **waits until the child's first file is visible**, then performs one
removal with the arm's strategy and records the outcome. The first version of this probe did not
wait, and measured nothing: node's start-up is slower than a 15 ms spin, so every arm ran to
completion before the writer began and all three reported `removed` 20 of 20. Four arms per run,
twenty trials each, on the three Node versions installed here — 22.16.0 (the floor of
`engines.node`, `>=22.12.0`), 24.20.0 (what `ci-scripts.yml` runs), 25.9.0 (this machine's
default).

## Results — 20 trials per arm, writer active for 60 ms after its first file

| Node | bare `rmSync` (the teardown as it was) | `maxRetries: 3, retryDelay: 50` (the proposed fix) | `maxRetries: 10, retryDelay: 20` | `rmTree` (`scripts/test/_tmp.js`, defaults) |
|---|---|---|---|---|
| v22.16.0 | ENOTEMPTY 20 of 20 | **ENOTEMPTY 20 of 20**, max 315 ms | **ENOTEMPTY 20 of 20**, max 1156 ms | removed 20 of 20, max 198 ms |
| v24.20.0 (CI) | removed 15, ENOTEMPTY 5 | removed 20 of 20 | removed 20 of 20 | removed 20 of 20, max 81 ms |
| v25.9.0 | removed 12, ENOTEMPTY 8 | removed 20 of 20 | removed 20 of 20 | removed 20 of 20, max 96 ms |

Two earlier runs of the same probe before the `rmTree` arm was added had the same shape: on 22
every `maxRetries` trial failed (319 ms and 1165 ms), on 24 the bare arm failed 3 of 20, on 25 it
failed 6 of 20 and — with the writer active for 200 ms — 2 of 10, while every retrying arm on
24 and 25 removed everything. The bare-arm rate on 24 and 25 is stochastic; the 22 arms have been
all-or-nothing on every run.

## Reading

- **The mechanism is real on every version.** A concurrent creator under the directory makes the
  bare teardown throw `ENOTEMPTY`; the rate differs (every trial on 22, a minority on 24 and 25 —
  why the rate differs was not measured) and never reaches zero. `force: true` does not help; it
  suppresses ENOENT only.
- **`maxRetries` is a fix on Node 24 and 25 and not on Node 22.** On 22 the option retries only
  the final `rmdir` after the walk; entries created between the walk and the retry are never
  removed, so every retry fails the same way and the option adds nothing but delay — 315 ms and
  1156 ms of it. The proposed one-line fix would therefore have shipped a teardown that is green
  on the version CI runs and still fails on the floor of the supported range. That is the shape
  of "the instrument agrees with the claim on the one arm you ran".
- **Re-invoking `rmSync` re-walks the tree on every version.** `rmTree` does that with linear
  backoff and removed the directory in every trial on all three versions, at a cost of under
  200 ms in the worst case. Its retry logic is pinned deterministically in
  `scripts/test/tmp-helper.test.js` through injected `rm` and `sleep`; the race itself cannot be
  staged on demand, because there is no hook between the walk and the final `rmdir`, and a test
  that reproduced it only sometimes would be the flake in a new coat.
- **What produced the CI failure is not identified.** The fixture in the failing suite runs
  `git init`, `git add` and `git commit` through `execFileSync`, all of which have exited before
  teardown, and nothing in the tool under test spawns a background child (`spawnSync` only). The
  retry covers any writer that stops within the backoff window, which is the only property the
  fix needs and the only one this probe measures.

## Reproduce

```bash
node tests/results/2026-09-07-rmsync-enotempty-probe/enotempty-probe.mjs 20 60
~/.nvm/versions/node/v22.16.0/bin/node tests/results/2026-09-07-rmsync-enotempty-probe/enotempty-probe.mjs 20 60
```
