---
name: redact-for-public-disclosure
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Redact reverse-engineering findings for public disclosure while preserving
  methodology, generalizable patterns, and teaching value. Covers the
  private-vs-public repo split, deny-list pattern maintenance, orphan-commit
  publish pattern that prevents `git log` leaks, category-based redaction
  calibration (methodology/pattern/version-finding/internal), and the
  `check-redaction.sh`-style CI gate that blocks merges when a deny-listed
  pattern appears. Use when publishing findings about a CLI harness you don't
  own, when preparing upstream proposals to an unrelated project, or when
  archiving a private research repo for public reference.
license: MIT
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: investigation
  complexity: intermediate
  language: multi
  tags: redaction, disclosure, deny-list, orphan-commit, ci-gate, research-publishing
---

# 公開遮密

逆研究分私公二庫。遮檢、模拒列、孤提發布以防 `git log` 漏。法傳，發見私守。

## 用

- 公布閉源 CLI 法察
- 為他項擬上游提案或錯報
- 公存私研庫
- 升察札（一至四階產）為公導
- 設發布管於發見積前以免漏險積
- 險過後清——某稿幾發敏識

## 入

- **必**：私研庫含敏雜容（真源）
- **必**：公鏡（別庫或 `public/` 工樹）以發遮容
- **可**：欲發稿
- **可**：版隔策（默「今+前一守私」）
- **可**：已知敏供商識、旗綴、命名空表

## 行

### 一：分類各候實

書或升容前、各實分四類。類定可否、何時發。

| Category | Definition | Shareable? |
|---|---|---|
| **methodology** | The *how* of investigation, independent of any specific finding | Always |
| **generic pattern** | Class-level observations (e.g., "harnesses commonly use a single-prefix flag namespace") | Yes |
| **version-specific finding** | Concrete observation tied to a specific release (e.g., "in vN.M, the gate defaults off") | Only after the version-lag cool-off |
| **live internal** | Minified names, byte offsets, dark flag names, current-version gate logic, PRNG/salt constants, internal codenames | Never |

各稿段、捕誌、札、發前必標類。混類者分——法傳潔升、餘守私。

得：各候實有類標。公鏡稿唯含法與通模條（並過冷期之版發見）。

敗：實拒分→默為內活。唯依版隔策明審後再分。

### 二：設版隔冷期策

先定「今」與「可發」間距。二常用：今+前一守私、舊模可議。書策入私庫（如 `REDACTION_POLICY.md`）使後己無需再推。

```markdown
# Redaction Policy

Version-lag cool-off: **2 releases**.
- Current release (vN): all version-specific findings PRIVATE.
- Previous release (vN-1): all version-specific findings PRIVATE.
- Releases vN-2 and earlier: version-specific findings may move to public draft after Step 5 review.

Source of truth for "current": output of `monitor-binary-version-baselines`.
Owner: <name>. Reviewed quarterly.
```

「今」必經驗（讀於裝二進）非政。繫策於基掃出非曆。

得：私庫提交 `REDACTION_POLICY.md`、明冷期與責主。

敗：眾無能議冷期→默最保守提。冷期可後縮；漏出召不回。

### 三：建拒列掃

維模於一執本——遮策真源。本居私庫（`tools/check-redaction.sh`）、行於公鏡。

```bash
#!/usr/bin/env bash
set -u
PUBLIC_REPO="${1:-./public}"
LEAKS=0

PATTERNS=(
  "minified identifier shape|<regex matching short bundle-style identifiers>"
  "vendor-prefixed flag|<regex matching the vendor's flag prefix>"
  "PRNG/salt constant|<regex matching the specific constants>"
)

for entry in "${PATTERNS[@]}"; do
  desc="${entry%%|*}"
  pattern="${entry##*|}"
  if rg -q "$pattern" "$PUBLIC_REPO"; then
    echo "LEAK: $desc"; LEAKS=$((LEAKS+1))
  fi
done
exit $LEAKS
```

各條有人讀標與正則。一條一敏識*形*（非字串——形耐版變）。退碼等漏數；潔行退 0。

得：`tools/check-redaction.sh ./public-mirror` 於小庫秒內、無匹則退 0。

敗：無 `rg`→退用 `grep -rqE`。模過寬（每行報漏）→源處窄之、勿增抑。

### 四：起稿前維拒列

一至四階發見可漏於稿時、增掃*前*。稿廉；教掃新模耐久。

流程：

1. 新發見入私庫（如新識旗綴）
2. 問：「若漏、欲掃捕何？」
3. 增模條於 `tools/check-redaction.sh`（標+正則）
4. 行掃於整公鏡、確新模未為合容誤觸
5. 然後乃起公容於該域

此倒常序：掃先更、稿後書。掃成「過敏不可發」之執規、稿不可誤超。

得：`tools/check-redaction.sh` 模條早於可匹之公鏡容。`git log tools/check-redaction.sh` 顯掃更早於相關稿提交。

敗：掃更落稿→立審公鏡於新模。遮、後提交掃更含述發見模之註。

### 五：立私公檔分

明列許發鏡之檔。新檔默私；升需遮檢過。

```bash
# tools/public-allowlist.txt
README.md
LICENSE
guides/methodology-overview.md
guides/category-classification.md
docs/contributing.md
```

`tools/sync-to-public.sh` 讀許列、唯複此檔至公鏡、若許列引不存之檔則非零退（捕筆誤）。

```bash
#!/usr/bin/env bash
set -eu
PRIVATE_ROOT="${1:?private repo path required}"
PUBLIC_ROOT="${2:?public mirror path required}"
ALLOWLIST="$PRIVATE_ROOT/tools/public-allowlist.txt"

while IFS= read -r path; do
  [ -z "$path" ] && continue
  case "$path" in \#*) continue ;; esac
  src="$PRIVATE_ROOT/$path"
  dst="$PUBLIC_ROOT/$path"
  if [ ! -e "$src" ]; then
    echo "MISSING: $path"; exit 2
  fi
  mkdir -p "$(dirname "$dst")"
  cp -a "$src" "$dst"
done < "$ALLOWLIST"
```

升需序三：檔入許列、檔過遮檢、覆審者確一階類標。

得：公鏡含正 `tools/public-allowlist.txt` 列檔。無檔現於公鏡而不在許列。

敗：檔現公鏡而缺許列→視為漏事——察其至、後或除之或經遮審後正升。

### 六：以孤提交發布

公鏡為一 `git commit --orphan` 根提交、各發布重建。此防公庫 `git log` 揭遮前稿。

```bash
# In the public mirror (separate repo or worktree)
cd /path/to/public-mirror
git checkout --orphan publish-tmp
git rm -rf .                                    # Clear the index
# Sync from private using the allow-list
bash /path/to/private/tools/sync-to-public.sh /path/to/private .
git add -A
git commit -m "Publish: <date>"
git branch -D main 2>/dev/null || true
git branch -m main
git push --force origin main
```

公庫 `git log` 顯一提交。前稿與遮迭守私庫史。`git log -p`、`git reflog`、公庫枝列皆不能取遮前容、因彼從未提交此處。

得：`git log --oneline` 於公鏡顯一發布一提交。無私庫史引（無父 SHA、無合提交、無私庫標）。

敗：`git push --force` 拒（枝護）→改開單提交合請於潔孤枝。勿以推私史解拒。

### 七：接 CI 閘

於公同步枝每提交行 `tools/check-redaction.sh`。失檢阻發布、非僅警。

```yaml
# .github/workflows/redaction-check.yml (in the public mirror repo)
name: redaction-check
on:
  push:
    branches: [main, publish-*]
  pull_request:
    branches: [main]
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install ripgrep
        run: sudo apt-get update && sudo apt-get install -y ripgrep
      - name: Fetch redaction scanner
        env:
          GH_TOKEN: ${{ secrets.PRIVATE_REPO_TOKEN }}
        run: |
          gh api repos/<org>/<private-repo>/contents/tools/check-redaction.sh \
            --jq .content | base64 -d > check-redaction.sh
          chmod +x check-redaction.sh
      - name: Run scanner
        run: ./check-redaction.sh .
```

二設擇於此：

- 掃從私庫於 CI 時取，故拒列本身不居公庫（模本敏——發之則告讀者所尋）
- 業以掃退碼退；非零阻流程

得：引拒模之推 CI 失；發布不落。維者見失標（如 `LEAK: vendor-prefixed flag`）而不見正則。

敗：私庫令不可授公 CI→公庫只嵌掃*最少漏*部（廣形模、不識供商）並推前自私庫行全掃。

### 八：誠處假陽

掃觸合容→宜窄模、勿加忽行。寬拒列加局抑速朽——半年後無人記某行何抑、次漏滑過。

決樹：

1. **匹真安乎？** 用一階重分。若實為偽裝內活、遮之；勿抑掃
2. **模過寬乎？** 緊正則使安容不再匹。以 `check-redaction.sh` 註述緊由與引案
3. **唯一二皆敗時**——模構與合容深纏不能再窄——用單行抑加 `# REASON:` 註述*為何*抑安。註以日

```bash
# Bad — mystery suppression
echo "API endpoint pattern" >> ignore.txt

# Good — narrowed pattern with rationale
# Pattern v2: tightened from `\bgate\(` to `\bgate\(['\"][a-z]+_phase` after
# legitimate `gate(true)` calls in our own SDK examples started matching. 2026-04-15.
PATTERNS+=("vendor flag predicate|\\bgate\\(['\"][a-z]+_phase")
```

得：各掃模有零或一行內註述緊。抑（若有）有日有由。

敗：抑積（季逾一）→拒列形誤。排遮策審、由分類實庫重建模。

### 九：定期遮掃

非皆事驅。定（月為常）行掃、重分私庫近添、重行掃於公鏡。漂在事級前自捕。

掃單：

- [ ] 重讀版隔策；確經驗「今」未變或更策
- [ ] 審末月私庫提交、新發見未分（一）
- [ ] 行 `tools/check-redaction.sh` 於公鏡（仍應退 0）
- [ ] 審末掃以來新模——任過寬乎？緊之
- [ ] 任版過冷期→識可升發見
- [ ] 確 `tools/public-allowlist.txt` 合公鏡實檔集

得：私庫月有簡掃誌（如 `sweeps/2026-04.md`）含單果與動。

敗：掃常略→自動曆提。掃常見同漂→其上游流程為患——察為何起稿時略分類。

## 驗

- [ ] 公鏡每檔皆於 `tools/public-allowlist.txt`
- [ ] `tools/check-redaction.sh ./public-mirror` 退 0
- [ ] `git log --oneline` 於公鏡每發布顯一孤提交
- [ ] `REDACTION_POLICY.md` 存私庫含明版隔冷期
- [ ] 各一至四階發見有類標（法/通模/版發見/內活）
- [ ] 公 CI 每推行掃；故意試模建敗
- [ ] 拒掃本身不居公庫
- [ ] 末月掃誌日於 35 日內

## 忌

- **「就一具體例」**：「以實接法」之誘最常致漏。用合成位（如 `acme_widget_v3`、`widget_handler_42`）——明造、不可溯真品
- **以 `git rebase` 或 `git filter-branch` 就地清漏於公庫**：強推改史仍留跡於克隆與分叉。孤提交發布為構修；隨手改史則否
- **抑代窄模**：二十抑之掃為零真覆。各抑為待脈淡之未漏
- **公 CI 警代失**：警常忽。CI 閘必阻發布（非零退、無合鈕）
- **許列漂**：私庫新檔不自動屬許列。默拒乃唯安態
- **混密為遮**：碼、雜、rot13 敏識而發其果仍發之——原可復。遮即「全不現」
- **發拒列**：模本即發見錄：見正則者知二進中所 grep 何。守掃私；唯標（如 `LEAK: vendor-prefixed flag`）應現於公 CI 誌
- **視私庫為稿堆**：彼為研真源、非草地。施同版、審、備之律於任產物

## 參

- `monitor-binary-version-baselines` — 一階、基哺版隔策：「今」之計為經驗實非曆實
- `probe-feature-flag-state` — 二三階、分類發見入遮管於類步（一）
- `conduct-empirical-wire-capture` — 四階、捕產（線誌、載荷模）需遮乃可公引
- `security-audit-codebase` — 二管皆受拒列式掃益；此技專研發布、非密漏
- `manage-git-branches` — 孤提交發布乃枝動；安行需此處述枝衛律
