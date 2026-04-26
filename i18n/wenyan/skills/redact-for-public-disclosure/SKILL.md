---
name: redact-for-public-disclosure
locale: wenyan
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

# 公示之刪削

分逆研之私庫與公庫，用刪削之察、形之拒列、孤提交之公布形。法可傳，特定之發現留私。

## 用時

- 公示閉源 CLI 之方法所得乃用
- 為非己之項目擬上游之議或缺陷報乃用
- 存私研庫為公參乃用
- 升 Phase 1-4 之察為公指南乃用
- 立公布之線於發現累積之前以防漏滯乃用
- 草稿幾洩敏標之後清理乃用

## 入

- **必要**：私研庫，含混敏度之內（真之源）
- **必要**：公鏡（別庫或 `public/` 工作樹），公削之內所往
- **可選**：擬公示之現草
- **可選**：版滯之策（默為「當前 + 前一留私」）
- **可選**：已知敏者之名表（廠商標、旗前綴或命空）

## 法

### 第一步：分諸候之事

書或升任何內前，分各事為四類。類定其可否公示及何時可公示。

| 類 | 義 | 可示乎 |
|---|---|---|
| **方法** | 察之*法*，獨立於任何特定發現 | 恆然 |
| **通形** | 類層之察（如「框常用單前綴之旗命空」） | 然 |
| **版特發現** | 繫於特定釋之具體察（如「於 vN.M，閘默閉」） | 唯版滯冷卻後 |
| **生內** | 縮名、字節偏移、暗旗名、當版閘邏輯、PRNG/鹽常數、內部碼名 | 永不 |

各草段、捕記、注前置類於審公示之前。混類之段宜分——方法淨提，餘留私。

得：每候事皆有類標。擬公鏡之草獨含方法與通形之入（加冷卻過後之版特發現）。

敗則：若事抗分類，默作生內。獨經對版滯策之明審後再分。

### 第二步：定版滯冷卻之策

先定「當前」與「可示」間隔幾版。二為常：當前 + 前一留私，更老之形可議。書策於私庫（如 `REDACTION_POLICY.md`），免後身復推。

```markdown
# Redaction Policy

Version-lag cool-off: **2 releases**.
- Current release (vN): all version-specific findings PRIVATE.
- Previous release (vN-1): all version-specific findings PRIVATE.
- Releases vN-2 and earlier: version-specific findings may move to public draft after Step 5 review.

Source of truth for "current": output of `monitor-binary-version-baselines`.
Owner: <name>. Reviewed quarterly.
```

「當前」必為實證之版（自所裝二進制而讀），非行政者。繫策於基線掃描之輸出，非繫於曆。

得：私庫已提交之 `REDACTION_POLICY.md`，含明冷卻與所有者。

敗則：若所涉者不能議冷卻之長，默最保守之議。冷卻可後縮；召回已洩之事不可。

### 第三步：建拒列之掃描

於單可執之文中守形，是為削策之真源。文居私庫（`tools/check-redaction.sh`），對公鏡而行。

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

各入條皆有人讀之標與正則。一入條對一敏標之*形*（非對字面之串——形可越版變而存）。退碼即洩之數；淨運退 0。

得：`tools/check-redaction.sh ./public-mirror` 於小庫秒內可行，無中時退 0。

敗則：若 `rg` 不可得，退用 `grep -rqE`。若形過寬（每行皆報洩），於源縮之，勿增抑。

### 第四步：草前守拒列

若 Phase 1-4 之發現可漏於草，當*前*擴掃描。草賤；教掃描新形可久。

流程：

1. 新發現入私庫（如新得之旗前綴）
2. 問：「若此漏，吾欲掃描何捕？」
3. 增形入條於 `tools/check-redaction.sh`（標 + 正則）
4. 對全公鏡行掃描，確新形未為合內所誤觸
5. 至此方可草涉此區之公內

此倒常序：先更掃描，後草。掃描成「何過敏不可示」之可執規約，而草不至無意越之。

得：`tools/check-redaction.sh` 之形入條早於可觸之公鏡內。`git log tools/check-redaction.sh` 示掃描之更先於相關草提交。

敗則：若掃描之更滯於草，立對新形審公鏡。削之，後提交掃描之更，附注述所現之形。

### 第五步：立私公檔組之分

明定許列，列同步至公鏡之檔。新檔默為私；升須過刪削之察。

```bash
# tools/public-allowlist.txt
README.md
LICENSE
guides/methodology-overview.md
guides/category-classification.md
docs/contributing.md
```

`tools/sync-to-public.sh` 讀許列，獨複此等檔至公鏡，若許列引不存之檔則非零退（捕誤書）。

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

升須三事按序：檔入許列、檔過刪削之察、審者承第一步之類標。

得：公鏡所含之檔正合 `tools/public-allowlist.txt` 所列。無不於許列之檔現於公鏡。

敗則：若公鏡有檔而不於許列，視為洩事——查其何來，後或除或經刪削之察正式升之。

### 第六步：以孤提交公布

公鏡乃單 `git commit --orphan` 為根之提交，每公布時重立。此防 `git log` 於公庫露未削之草。

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

公庫之 `git log` 示一提交。前草及任何刪削之迭留於私庫之史。公庫之 `git log -p`、`git reflog`、枝列皆不能復未削之內，蓋未嘗提交於彼也。

得：公鏡之 `git log --oneline` 每公布示一提交。無私庫史之引（無父 SHA、無合提交、無自私庫之標）。

敗則：若 `git push --force` 被拒（枝護），改開單提交之拉請於潔孤枝。勿以推私史解拒。

### 第七步：接 CI 之閘

於每公同步枝之提交行 `tools/check-redaction.sh`。察敗阻公布，非僅警。

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

二設計之擇：

- 掃描自私庫於 CI 時取，故拒列本身不居公庫（形本身為敏——示之則告讀者所應尋者）
- 此務以掃描之退碼退；非零阻流

得：致敏形之推使 CI 敗；公布不落。守者見敗標（如 `LEAK: vendor-prefixed flag`）而不見正則本身。

敗則：若不能授私庫之令於公 CI，獨嵌掃描之*最少漏*之部於公庫（寬形而不識廠者），全掃描自私庫推前而行。

### 第八步：誠處假陽

若掃描誤觸合內，宜縮形而非加略行。寬拒列附局部抑必朽——半年後無人記為何抑某行，下漏即過而不察。

決樹：

1. **此匹真安乎？** 復用第一步分之。若內實為偽裝之生內，削之；勿抑掃描
2. **形過寬乎？** 縮正則使安內不再匹。以 `check-redaction.sh` 中之注紀其縮，繫於激此者
3. **唯一二皆敗時**——且形構與合內過糾以致不能更縮——用單行抑附 `# REASON:` 注，述抑*何*以為安。注其日

```bash
# Bad — mystery suppression
echo "API endpoint pattern" >> ignore.txt

# Good — narrowed pattern with rationale
# Pattern v2: tightened from `\bgate\(` to `\bgate\(['\"][a-z]+_phase` after
# legitimate `gate(true)` calls in our own SDK examples started matching. 2026-04-15.
PATTERNS+=("vendor flag predicate|\\bgate\\(['\"][a-z]+_phase")
```

得：每掃描形附零或一行內注述其縮。抑（若有）附日與其由。

敗則：若抑累積（季逾一），拒列形誤。排刪削策之審而自分類事錄重建諸形。

### 第九步：周期削掃

非凡削勞由事而起。月行周期之掃，再分私庫近增之事，重對公鏡行掃描。漂自察於成事級之前。

掃單：

- [ ] 重讀版滯策；確實證「當前」版未變或更策
- [ ] 審近月私庫之提交，捕新增而未分類者（第一步）
- [ ] 對公鏡行 `tools/check-redaction.sh`（仍宜退 0）
- [ ] 審自上掃以來增之諸掃描形——有過寬者乎？有則縮之
- [ ] 若有版越冷卻，識可升之發現
- [ ] 確 `tools/public-allowlist.txt` 合公鏡實有之檔組

得：私庫每月一短掃日誌（如 `sweeps/2026-04.md`），含單之果與所行。

敗則：若掃屢被略，自動曆提。若掃屢得同漂，其上之流程有患——查為何草時略分類。

## 驗

- [ ] 公鏡所有之檔皆於 `tools/public-allowlist.txt`
- [ ] `tools/check-redaction.sh ./public-mirror` 退 0
- [ ] 公鏡之 `git log --oneline` 每公布示一孤提交
- [ ] 私庫存 `REDACTION_POLICY.md`，含明版滯冷卻
- [ ] 每 Phase 1-4 之發現有類標（方法／通形／版特／生內）
- [ ] 公 CI 每推皆行掃描；故設之試形使建敗
- [ ] 拒列掃描本身不居公庫
- [ ] 近月之掃日誌日期在前 35 日內

## 陷

- **「唯一例以實之」**：欲含一具體發現「以實方法」乃最常之漏徑。用偽佔位（如 `acme_widget_v3`、`widget_handler_42`）——明為造作，永不可繫於實品
- **用 `git rebase` 或 `git filter-branch` 於公庫原地擦漏**：強推改寫之史仍留痕於克隆與分叉。孤提交公布形乃結構之修；隨手史改非也
- **抑而不縮形**：附廿抑之掃乃零意之掃。每抑乃未來之漏，待境淡化
- **公 CI 警而不敗**：警必被忽。CI 閘必阻公布（非零退、無合按）
- **許列之漂**：私庫新增之檔不自動屬許列。默拒乃唯一安姿
- **誤密為削**：編、雜、rot13 一敏標而示之者，仍示之也——原可復。削謂「全不現」
- **公示拒列**：形本身乃發現之錄：見正則之讀者知於二進制中當 grep 何。掃描留私；唯其標（如 `LEAK: vendor-prefixed flag`）宜現於公 CI 日誌
- **視私庫為草堆**：其乃研之真源，非草地。施以版控、審、備之嚴，如待生產品

## 參

- `monitor-binary-version-baselines` — Phase 1，基線資版滯策：「當前」乃實證之事，非曆事
- `probe-feature-flag-state` — Phase 2-3，此處之分類發現入削線於類步（第一步）
- `conduct-empirical-wire-capture` — Phase 4，捕件（線錄、載式）需削後方可公引
- `security-audit-codebase` — 二線皆得拒列式掃描之益；此技專於研示，非密漏
- `manage-git-branches` — 孤提交公布形乃枝術；安行需彼處所書之枝衛之術
