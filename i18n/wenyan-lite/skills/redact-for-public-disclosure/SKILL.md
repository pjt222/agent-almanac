---
name: redact-for-public-disclosure
locale: wenyan-lite
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

# 公開揭露之刪修

藉刪修檢核器、模式拒絕清單與孤立提交發布模式，將逆向工程之研究倉庫切分為私有真相源與公開揭露子集。方法可遠行；具體發現留為私有。

## 適用時機

- 發布有關所整合之封閉源 CLI 平台之方法論發現
- 為非己有之項目擬上游提案或缺陷報告
- 將私有研究倉庫存檔為公開參照
- 將調查筆記（第 1-4 階段成果）擢升為公開指南
- 於發現累積之前確立發布管線，使洩漏風險不致堆積
- 草稿幾將敏感識別符出貨之險後加以善後

## 輸入

- **必要**：含混合敏感性內容之私有研究倉庫（真相源）
- **必要**：目標公開鏡像（獨立倉庫，或一 `public/` 工作樹），刪修後內容將於此發布
- **選擇性**：擬發布之既有草稿
- **選擇性**：版本滯後策略（預設為「當前加先前一版維持私有」）
- **選擇性**：已知敏感之供應商識別符、旗標前綴或命名空間清單

## 步驟

### 步驟一：將每候選事實分類

書寫或擢升任何內容前，先將每事實分入下列四類之一。類別決定其能否與何時出貨。

| 類別 | 定義 | 可分享？ |
|---|---|---|
| **方法論** | 調查之*如何*，與任何具體發現獨立 | 永遠可 |
| **通用模式** | 類層次之觀察（如「平台常用單前綴旗標命名空間」） | 可 |
| **版本特定發現** | 繫於特定發行之具體觀察（如「於 vN.M，閘預設關閉」） | 唯版本滯後冷卻期後可 |
| **現行內部** | 縮寫名、位元組偏移、暗旗標名、當前版本之閘邏輯、PRNG／鹽常數、內部代號 | 永不可 |

於檢視擬發布之前，標註每草稿段、捕獲日誌或筆記之類別。混雜類別之段須拆分——方法論可清淨抽出，餘者留私。

**預期：** 每候選事實皆有類別標籤。擬入公開鏡像之草稿僅含方法論與通用模式條目（外加冷卻期外之版本特定發現）。

**失敗時：** 若某事實難以分類，預設視為現行內部。唯經對版本滯後策略明確檢視後方得重新分類。

### 步驟二：制定版本滯後冷卻策略

預先決定「當前」與「可分享」之間隔多少版本。二為典型：當前加先前一版維持私有，更舊之模式可論。將策略寫入私有倉庫（如 `REDACTION_POLICY.md`），免得日後重新推導。

```markdown
# Redaction Policy

Version-lag cool-off: **2 releases**.
- Current release (vN): all version-specific findings PRIVATE.
- Previous release (vN-1): all version-specific findings PRIVATE.
- Releases vN-2 and earlier: version-specific findings may move to public draft after Step 5 review.

Source of truth for "current": output of `monitor-binary-version-baselines`.
Owner: <name>. Reviewed quarterly.
```

「當前」版本須為實證的（自所裝二進位讀取），非行政的。將策略繫於基線掃描器輸出而非繫於日曆。

**預期：** 私有倉庫中已提交之 `REDACTION_POLICY.md`，含明確冷卻期與負責人。

**失敗時：** 若利害關係人無法就冷卻期達成共識，預設取最保守之提案。冷卻期可日後縮短；洩漏不可召回。

### 步驟三：建立拒絕清單掃描器

於單一可執行腳本中維護模式，使其為刪修策略之真相源。腳本居私有倉庫（`tools/check-redaction.sh`）並對公開鏡像運行。

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

每條目有人類可讀標籤與一正則式。每敏感識別符*形狀*一條目（非每字面字串——形狀經得起版本變動）。退出碼等於洩漏數；潔淨運行退 0。

**預期：** `tools/check-redaction.sh ./public-mirror` 於小倉庫上一秒內運行完畢，無匹配時退 0。

**失敗時：** 若 `rg` 不可用，退至 `grep -rqE`。若模式過廣（每次運行皆報洩漏），於源頭收緊而非加抑制。

### 步驟四：擬稿之前維護拒絕清單

當第 1-4 階段發現可能透過草稿洩漏，於草稿撰寫*前*擴充掃描器。草稿廉價；教掃描器新模式則持久。

工作流：

1. 新發現落入私有倉庫（如新發現之旗標前綴）
2. 自問：「此若洩漏，吾欲掃描器捉何物？」
3. 加模式條目至 `tools/check-redaction.sh`（標籤加正則式）
4. 對整個公開鏡像運行掃描器，確認新模式未已被合法內容絆倒
5. 唯然後方擬涉及該領域之公開內容

此倒置慣常順序：掃描器先更新，草稿後撰。掃描器成為「過於敏感不宜發布」之可執行規範，草稿不致無意中超前之。

**預期：** `tools/check-redaction.sh` 中之模式條目早於任何可能匹配之公開鏡像內容。`git log tools/check-redaction.sh` 顯示掃描器更新先於相關草稿提交落地。

**失敗時：** 若掃描器更新落後於草稿，立即依新模式稽核公開鏡像。先刪修，再提交掃描器更新並加註說明所發現之模式。

### 步驟五：確立私／公文件集分割

定義明確之允許清單，列載同步至公開鏡像之文件。新文件預設為私；擢升須過刪修檢核。

```bash
# tools/public-allowlist.txt
README.md
LICENSE
guides/methodology-overview.md
guides/category-classification.md
docs/contributing.md
```

`tools/sync-to-public.sh` 讀取允許清單，僅將該等文件複製至公開鏡像，並於允許清單引用不存在文件時退非零碼（捉錯字）。

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

擢升須依序具備三事：文件加入允許清單、文件通過刪修檢核、評審確認步驟一之類別標籤。

**預期：** 公開鏡像所含恰為 `tools/public-allowlist.txt` 所列之文件。無允許清單外之文件出現於公開鏡像。

**失敗時：** 若公開鏡像出現允許清單所無之文件，視為洩漏事件——調查其如何到達，繼而或移除之或於刪修評審後正式擢升之。

### 步驟六：藉孤立提交發布

公開鏡像為單一以 `git commit --orphan` 為根之提交，每次發布皆重建之。此防公開倉庫之 `git log` 暴露刪修前之草稿。

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

公開倉庫之 `git log` 恰顯一提交。先前草稿與任何刪修迭代留於私有倉庫之歷史中。公開倉庫上之 `git log -p`、`git reflog` 或分支列表皆無法復原刪修前之內容，因其從未提交於彼。

**預期：** 公開鏡像之 `git log --oneline` 每次發布顯一提交。無提及私有倉庫歷史之引用（無父 SHA、無合併提交、無自私有倉庫來之標籤）。

**失敗時：** 若 `git push --force` 遭拒（分支保護），改自潔淨之孤立分支開單提交拉取請求。切勿藉推送私有歷史以解拒絕。

### 步驟七：佈署 CI 閘

於公開同步分支之每次提交運行 `tools/check-redaction.sh`。檢核失敗應阻擋發布而非僅警告。

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

此處有二設計抉擇：

- 掃描器於 CI 時自私有倉庫拉取，使拒絕清單本身永不居公開倉庫（模式本身即敏感——發布之則告讀者該尋何物）
- 任務以掃描器之退出碼退出；非零阻擋工作流

**預期：** 引入拒絕清單模式之推送將令 CI 失敗；發布不落地。維護者見失敗標籤（如 `LEAK: vendor-prefixed flag`）而不見正則式本身。

**失敗時：** 若私有倉庫權杖無法授予公開 CI，於公開倉庫嵌入掃描器之*最小洩漏*部分（廣形狀模式，本身不識別供應商）並於私有倉庫推送前運行完整掃描器。

### 步驟八：誠實處置誤報

當掃描器於合法內容上絆倒，宜收緊模式而非加忽略行。帶局部抑制之廣拒絕清單腐爛甚速——半年後無人記得某行為何被抑制，下次洩漏便溜過無覺。

決策樹：

1. **此匹配是否實安全？** 依步驟一重新分類。若內容實為偽裝之現行內部，刪修之；勿抑制掃描器
2. **模式是否過廣？** 收緊正則式使安全內容不再匹配。於 `check-redaction.sh` 中以註解記錄收緊，連結觸發此事之案例
3. **唯 1、2 皆敗時** ——且模式於結構上與合法內容糾纏太深無從進一步收窄——方用單行抑制，附 `# REASON:` 註解陳述抑制*為何*安全。註明日期

```bash
# Bad — mystery suppression
echo "API endpoint pattern" >> ignore.txt

# Good — narrowed pattern with rationale
# Pattern v2: tightened from `\bgate\(` to `\bgate\(['\"][a-z]+_phase` after
# legitimate `gate(true)` calls in our own SDK examples started matching. 2026-04-15.
PATTERNS+=("vendor flag predicate|\\bgate\\(['\"][a-z]+_phase")
```

**預期：** 每掃描器模式有零或一行內註解說明收緊。抑制（若有）皆載日期與緣由。

**失敗時：** 若抑制累積（每季逾一），拒絕清單之形狀有誤。排定刪修策略檢討，自分類過之事實清單重建模式。

### 步驟九：定期刪修巡檢

非所有刪修工作皆事件驅動。執定期巡檢（每月為典型），對私有倉庫近期新增重新分類，並對公開鏡像重新運行掃描器。漂移於成事件級之前先自捉。

巡檢清單：

- [ ] 重讀版本滯後策略；確認實證「當前」版本未變或更新策略
- [ ] 稽核近月之私有倉庫提交，查未經分類之新增發現（步驟一）
- [ ] 對公開鏡像運行 `tools/check-redaction.sh`（應仍退 0）
- [ ] 檢視自上次巡檢以來新增之掃描器模式——有過廣者否？若有則收緊
- [ ] 若任何版本已過冷卻期，識別現可擢升之發現
- [ ] 確認 `tools/public-allowlist.txt` 與實際公開鏡像文件集相符

**預期：** 私有倉庫每月一短巡檢日誌（如 `sweeps/2026-04.md`），記清單結果與所採行動。

**失敗時：** 若巡檢屢被略，自動化日曆提醒。若巡檢屢發現同樣漂移，問題在其上游工作流——調查為何擬稿時略過分類。

## 驗證

- [ ] 公開鏡像中每文件皆於 `tools/public-allowlist.txt` 之上
- [ ] `tools/check-redaction.sh ./public-mirror` 退 0
- [ ] 公開鏡像之 `git log --oneline` 每次發布顯一孤立提交
- [ ] `REDACTION_POLICY.md` 存於私有倉庫，附明確之版本滯後冷卻期
- [ ] 每第 1-4 階段發現皆有類別標籤（方法論／通用模式／版本特定／現行內部）
- [ ] 公開 CI 於每次推送運行掃描器；故意之測試模式令構建失敗
- [ ] 拒絕清單掃描器本身不居公開倉庫
- [ ] 最近月份之巡檢日誌日期於近 35 日內

## 常見陷阱

- **「就一例以使具體」**：欲含一具體發現「以立基方法論」之誘惑乃最常見之洩漏路徑。應用合成佔位符（如 `acme_widget_v3`、`widget_handler_42`）——明顯杜撰，永不可追溯至真產品
- **以 `git rebase` 或 `git filter-branch` 在公開倉庫上原地擦除洩漏**：強推改寫之歷史仍於克隆與分叉中留痕。孤立提交發布模式為結構性修復；臨時改寫歷史則否
- **以抑制代收緊模式**：含二十抑制之掃描器即無有意義覆蓋之掃描器。每抑制即未來等待脈絡褪去之洩漏
- **公開 CI 警告而非失敗**：警告必被忽。CI 閘須阻擋發布（非零退出，無合併鈕）
- **允許清單漂移**：私有倉庫新增之文件並非自動屬於允許清單。預設拒絕為唯一安全姿態
- **誤以加密為刪修**：將敏感識別符編碼、雜湊或 rot13 後發布結果，仍是發布之——原文可復原。刪修意為「全然不出現」
- **發布拒絕清單**：模式本身為發現目錄：見正則式之讀者即知該於二進位中 grep 何物。掃描器宜私；公開 CI 日誌中僅其標籤（如 `LEAK: vendor-prefixed flag`）可現
- **將私有倉庫視為草稿堆**：其乃研究之真相源，非草稿空間。應施與生產製品相同之版本化、評審與備份紀律

## 相關技能

- `monitor-binary-version-baselines` — 第一階段，基線供版本滯後策略：何為「當前」乃實證事實，非日曆事實
- `probe-feature-flag-state` — 第二、三階段，分類之發現於類別步驟（步驟一）入刪修管線
- `conduct-empirical-wire-capture` — 第四階段，捕獲成果（線報日誌、有效負載結構）於可公開引用前皆須刪修
- `security-audit-codebase` — 兩條管線皆得益於拒絕清單式掃描；本技能專注於研究揭露而非機密洩漏
- `manage-git-branches` — 孤立提交發布模式乃分支操作；安全執行需所載分支衛生實踐
