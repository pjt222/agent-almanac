---
name: file-trademark
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Trademark filing procedures covering EUIPO (EU), USPTO (US), and WIPO Madrid
  Protocol (international). Walks through pre-filing conflict checks, Nice
  classification, descriptiveness assessment, mark type decisions, filing basis
  strategy, office-specific e-filing procedures, Madrid Protocol extension, post-
  filing monitoring, and open-source trademark policy drafting. Use after running
  screen-trademark to confirm the mark is clear, when ready to secure trademark
  rights in one or more jurisdictions.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: intellectual-property
  complexity: advanced
  language: natural
  tags: intellectual-property, trademark, filing, euipo, uspto, madrid-protocol
---

# File Trademark

File trademark application with EUIPO (EU), USPTO (US), or WIPO Madrid Protocol (international). This skill covers real filing proc — from pre-filing check through post-register watch and open-source trademark policy. Assumes conflict screen already done via `screen-trademark`.

## When Use

- Ready to file trademark app after conflict screen is clear
- Picking between EU, US, or international filing strategies
- Filing EU trademark and claiming priority for later US filing
- Extending existing national mark internationally via Madrid Protocol
- Drafting open-source trademark use policy after register
- Responding to office actions or opposition proceedings during exam

## Inputs

- **Required**: Mark to be filed (word, logo, or combined)
- **Required**: Goods and services desc
- **Required**: Target jurisdictions (EU, US, international, or mix)
- **Required**: Applicant name and address
- **Optional**: Screen-trademark results (conflict search report)
- **Optional**: Logo files (if filing figurative or combined mark)
- **Optional**: Priority claim (earlier filing in other jurisdiction, within 6 months)
- **Optional**: Proof of use in commerce (needed for USPTO 1(a) basis)
- **Optional**: Open-source project context (for trademark policy in Step 10)

## Filing Cost Reference

| Office | Base Fee | Per Class | Notes |
|--------|----------|-----------|-------|
| EUIPO | 850 EUR | +50 EUR (2nd), +150 EUR (3rd+) | SME Fund: 75% rebate |
| USPTO (TEAS Plus) | $250 | per class | Foreign applicants need US attorney |
| USPTO (TEAS Standard) | $350 | per class | More flexible goods description |
| Madrid Protocol | 653 CHF | varies by country | Depends on base mark for 5 years |

## Steps

### Step 1: Pre-Filing Checks

Check mark is clear for filing before spending on app fees.

1. Confirm `screen-trademark` was run:
   - Review conflict search report for same or confusingly similar marks
   - Check all target jurisdictions covered in screen
   - Check screen is recent (ideally within last 30 days)
2. Run final conflict checks vs official DBs:
   - **EUIPO TMview**: Search across all EU member state registers
   - **WIPO Global Brand Database**: International registrations
   - **USPTO TESS**: US federal register (use structured search: `"mark text"[BI]`)
   - **DPMAregister**: German national register (if filing EU, covers biggest EU market)
3. Check domain name and social media handles are open or secured:
   - Domain open backs distinctiveness arguments if challenged
   - Matching handles drop consumer confusion risk
4. Log search results as **Pre-Filing Clearance Record**

**Got:** Confirmation no blocking marks exist in target jurisdictions. Pre-Filing Clearance Record logs diligence and backs any future opposition defense.

**If fail:** Clashing marks found? Check severity: same mark + same goods = do not file. Similar mark + related goods = seek legal counsel on likelihood of confusion. If clashes limited to one jurisdiction, think file only in clear jurisdictions.

### Step 2: Nice Classification Selection

Spot right goods and services classes under Nice Classification system.

1. Use TMclass tool (tmclass.tmdn.org) for class spot:
   - Enter goods/services desc
   - TMclass suggests harmonized terms accepted by most offices
   - Using pre-approved terms from TMclass DB drops exam delays
2. Common classes for tech and software:
   - **Class 9**: Downloadable software, mobile apps, computer hardware
   - **Class 35**: Advertising, business management, SaaS platform admin
   - **Class 42**: SaaS, cloud computing, software dev services
   - **Class 38**: Telecommunications, online platforms, messaging services
3. Draft goods and services desc:
   - Be specific enough to pin your real use but broad enough for future growth
   - TEAS Plus (USPTO) needs terms from ID Manual — use pre-approved terms
   - EUIPO takes TMclass harmonized terms direct
4. Balance cost vs coverage:
   - Each extra class adds fees (see cost table above)
   - File in classes where you now use or plan to use mark
   - Over-broad filings with no use may be challenged (especially in US)

**Got:** Final list of Nice classes with specific, pre-approved goods and services descs for each class. Descs match real business use.

**If fail:** TMclass not suggest clear match? Check Nice Classification explanatory notes (WIPO Nice page). Vague goods sometimes span many classes — file in all relevant classes rather than risk exclusion.

### Step 3: Descriptiveness Assessment

Check whether mark is registrable or likely to face descriptiveness objections.

1. Check mark on **Abercrombie spectrum** (US standard, widely used):
   - **Generic**: Common name for product (e.g., "Computer" for computers) — never registrable
   - **Descriptive**: Direct describes quality or feature (e.g., "QuickBooks") — registrable only with secondary meaning
   - **Suggestive**: Hints but not direct describes (e.g., "Netflix") — registrable without secondary meaning
   - **Arbitrary**: Real word used in unrelated context (e.g., "Apple" for electronics) — strong protection
   - **Fanciful**: Made-up word (e.g., "Xerox") — strongest protection
2. Check vs EUTMR absolute grounds (Article 7(1)):
   - Art. 7(1)(b): Devoid of distinctive character
   - Art. 7(1)(c): Descriptive of characteristics of the goods/services
   - Art. 7(1)(d): Customary in the trade (generic in the relevant sector)
3. If mark is borderline descriptive:
   - Grab evidence of acquired distinctiveness (ad spend, sales figures, consumer surveys)
   - Think add distinct element (logo, stylization)
   - Tune word mark to move toward suggestive or arbitrary
4. Log check with reason

**Got:** Mark sorted on Abercrombie spectrum as suggestive, arbitrary, or fanciful — all registrable without secondary meaning. Borderline cases flagged with mitigation strategy.

**If fail:** Mark is descriptive or generic? Do not file — it will be refused. Redesign mark to move up distinctiveness spectrum. Big use history exists? Think Section 2(f) claim (acquired distinctiveness) for US or same claim under Art. 7(3) EUTMR for EU.

### Step 4: Mark Type Decision

Pick register type that best guards brand.

1. **Word mark** (standard chars):
   - Guards word itself no matter font, color, or style
   - Broadest guard — covers any visual show
   - Cannot add design elements
   - Best pick when brand value is in name, not logo
2. **Figurative mark** (logo or design):
   - Guards specific visual show
   - Narrower guard — does not cover word in other styles
   - Needed when logo itself is main brand ID
   - Must submit clear image file (JPG/PNG, EUIPO: max 2 MB, min 945x945 px)
3. **Combined mark** (word + logo together):
   - Guards specific combo as filed
   - Narrower than word mark alone — limited to specific combo
   - Common but strategy suboptimal: if logo shifts, register may not cover new version
4. **Strategy advice**:
   - File word mark first (broadest guard, most cost-useful)
   - File separate figurative mark for logo only if logo has big standalone brand value
   - Avoid combined marks unless budget limits stop separate filings

**Got:** Clear mark type pick with strategy reason. Word mark is default advice unless logo carries own brand value.

**If fail:** Unsure whether name alone is distinct enough? Test by asking: "Would consumers know this name in plain text, without logo?" If yes, file word mark. If logo is inseparable from brand ID, think file both word and figurative marks separate.

### Step 5: Filing Basis Selection

Figure legal basis for app (mainly for USPTO).

1. **Use in commerce — Section 1(a)**:
   - Mark already in use in interstate commerce (US) or genuine use (EU)
   - Must submit specimen showing mark as used (screenshot, packaging, ad)
   - Fastest path to register
2. **Intent to use — Section 1(b)**:
   - Mark not yet in use but applicant has bona fide intent to use
   - Needs Statement of Use before register (extra fees, deadlines)
   - Lets secure priority before launch
   - Extensions of time open (up to 36 months total)
3. **Foreign priority — Section 44(d)**:
   - Claim priority from foreign filing within last 6 months
   - **Strategy**: File EUIPO first (lower cost, faster), then claim 44(d) priority for USPTO
   - This gives US filing same priority date as EU filing
   - Needs certified copy of foreign app
4. **Foreign registration — Section 44(e)**:
   - Based on foreign register (not just app)
   - No use in US commerce needed at filing (but must eventually use)
5. **Madrid Protocol extension — Section 66(a)**:
   - Designating US through Madrid system
   - See Step 8 for Madrid details

**Got:** Filing basis picked with timeline and specimen needs logged. If using EU-first strategy (EUIPO then 44(d) to USPTO), 6-month priority window is calendared.

**If fail:** No use in commerce exists and no foreign filing pending? Section 1(b) (intent to use) is only option for USPTO. Factor in extra Statement of Use costs and deadlines. For EUIPO, no use needed at filing — declaration of intent is enough.

### Step 6: EUIPO E-Filing Procedure

File EU trademark app online.

1. Go to EUIPO e-filing portal (euipo.europa.eu):
   - Make EUIPO user account if not yet registered
   - Use "Fast Track" filing for pre-approved TMclass terms (faster exam)
2. Fill app form:
   - **Applicant details**: Name, address, legal form, nationality
   - **Representative**: Optional for EU-based applicants; needed for non-EU applicants
   - **Mark**: Enter word mark text or upload figurative mark image
   - **Goods and services**: Pick TMclass terms or enter custom descs
   - **Filing language**: Pick from EN, FR, DE, ES, IT (second language needed)
   - **Priority claim**: Enter foreign app number and date if claiming priority
3. Review fee summary:
   - 1 class: 850 EUR
   - 2 classes: 900 EUR (+50 EUR)
   - 3+ classes: 900 EUR + 150 EUR per extra class
   - **SME Fund (EUIPOIdeaforIP)**: Small and medium enterprises can claim 75% reimbursement
4. Pay online (credit card, bank transfer, or EUIPO current account)
5. Save filing receipt with app number and filing date

**Got:** EUIPO app filed with confirm receipt. App number and filing date logged. If using Fast Track, exam usually done within 1 month.

**If fail:** Online portal rejects filing (tech error)? Save screenshot and try again. If goods/services desc rejected, switch to pre-approved TMclass terms. If pay fails, app saved as draft for 30 days.

### Step 7: USPTO Filing Procedure

File US federal trademark app online.

1. Go to USPTO TEAS (Trademark Electronic Application System):
   - Pick TEAS Plus ($250/class) or TEAS Standard ($350/class)
   - TEAS Plus needs pre-approved ID Manual terms; TEAS Standard allows free-form descs
2. **Foreign applicant rule**:
   - Applicants based outside US MUST pick US-licensed attorney
   - Attorney must be member in good standing of US state bar
   - This rule applies even if filing through Madrid Protocol
3. Fill app form:
   - **Applicant info**: Name, address, entity type, citizenship/state of org
   - **Attorney info**: Name, bar membership, correspondence email
   - **Mark**: Enter word mark in standard chars or upload design mark image
   - **Goods and services**: Pick from ID Manual (TEAS Plus) or draft custom (TEAS Standard)
   - **Filing basis**: Pick Section 1(a), 1(b), 44(d), or 44(e) (see Step 5)
   - **Specimen** (1(a) basis only): Upload showing mark as used in commerce
   - **Declaration**: Verify right under penalty of perjury
4. Pay filing fee ($250 or $350 per class)
5. Save filing receipt with serial number and filing date

**Got:** USPTO app filed with serial number given. Filing receipt saved. Exam usually takes 8-12 months for first office action.

**If fail:** TEAS system rejects filing? Review error msgs — common issues are wrong entity type, missing specimen (for 1(a) filings), or goods descs not matching ID Manual terms (TEAS Plus). Foreign applicant files without US attorney? App will be rejected.

### Step 8: Madrid Protocol Extension

Extend protection internationally through WIPO Madrid System.

1. **Pre-reqs**:
   - Base mark (app or register) in office of origin
   - Applicant must be national of, based in, or have real and effective establishment in Madrid member country
   - Base mark must cover same or narrower goods/services
2. File through office of origin (not direct with WIPO):
   - **EUIPO as origin**: Use EUIPO Madrid e-filing tool
   - **USPTO as origin**: File via TEAS International Application form
3. Fill Madrid app (MM2 form):
   - **Applicant details**: Must match base mark holder exact
   - **Mark show**: Must be same as base mark
   - **Goods and services**: Pick from base mark spec (can narrow, not broaden)
   - **Designated Contracting Parties**: Pick target countries/regions
   - **Language**: English, French, or Spanish
4. Count fees:
   - Base fee: 653 CHF (black-and-white) or 903 CHF (color)
   - Extra fee: 100 CHF per class beyond first
   - Individual fees: Vary by designated country (check WIPO fee calculator)
   - Common individual fees: US ~$400+/class, Japan ~$500+/class, China ~$150+/class
5. **Central attack dep**:
   - For first 5 years, international register depends on base mark
   - If base mark cancelled (opposition, non-use), all designations fall
   - After 5 years, each designation becomes independent
   - Strategy: Guard base mark hard during dep period

**Got:** Madrid app filed through office of origin. Designated countries picked with fee counts logged. 5-year dep risk known and base mark guard plan in place.

**If fail:** Office of origin rejects Madrid app (e.g., mismatch with base mark)? Fix difference and refile. Designated country refuses protection? Respond through Madrid system within designated office deadline (usually 12-18 months).

### Step 9: Post-Filing Monitoring

Track app through exam and respond to actions.

1. **EUIPO monitoring**:
   - Publication in Part A of EU Trade Marks Bulletin
   - **Opposition period**: 3 months from publication (extendable by 1 month cooling-off)
   - If no opposition: register issues auto
   - Opposition defense: file observations within 2 months of notice
2. **USPTO monitoring**:
   - Check TSDR (Trademark Status and Document Retrieval) often
   - **Examining attorney review**: 8-12 months after filing
   - **Office actions**: Response deadline usually 3 months (extendable once for $125)
   - **Publication for opposition**: 30-day period in Official Gazette
   - **Statement of Use** (1(b) filings): Must be filed within 6 months of Notice of Allowance (extendable up to 36 months total, $125 per extension)
3. **Madrid monitoring**:
   - WIPO tells each designated office
   - Each office exams independently (12-18 month window)
   - Provisional refusals must be responded through local office procs
4. **Calendar all deadlines**:
   - Opposition response deadlines
   - Statement of Use deadlines (USPTO 1(b))
   - Renewal deadlines (10 years EUIPO, 10 years USPTO, 10 years Madrid)
   - USPTO Section 8/71 Declaration of Use: between 5th and 6th year
5. Watch for third-party filings of confusingly similar marks:
   - Set up TMview/TESS watch alerts for similar marks in your classes
   - Think pro trademark watch service for critical brands

**Got:** All deadlines calendared with reminders. App status watched through each office online system. Opposition or office action response strategies prepped in advance.

**If fail:** Missing deadline can be fatal — most trademark office deadlines not extendable. Deadline missed? Check whether revival or reinstatement open (USPTO lets petition to revive for unintentional delay). For EUIPO, missed opposition deadlines usually final.

### Step 10: Open-Source Trademark Policy

Draft trademark use policy if mark covers open-source project.

1. Study set models:
   - **Linux Foundation**: Lets project name use in factual refs; limits logos to licensees
   - **Mozilla**: Detailed rules splitting unmodified distributions from modified builds
   - **Rust Foundation**: Broad permission for community use with specific limits on commercial products
   - **Apache Software Foundation**: Permissive naming policy with limits on implying endorsement
2. Set use categories:
   - **Fair use** (always OK): Ref-ing project by name in articles, reviews, compares, academic papers
   - **Community/contributor use** (broadly OK): User groups, conferences, education stuff, unmodified distributions
   - **Commercial use** (needs license or limits): Products holding the software, services based on project, certification/compatibility claims
   - **Blocked use**: Imply official endorsement, use on substantially modified versions with no disclosure, domain names that cause confusion
3. Draft trademark policy doc:
   - Clear statement of trademark ownership
   - What uses allowed without permission
   - What uses need written permission
   - How to ask permission (contact, process)
   - Consequences of misuse
4. Place policy file in project repo:
   - Common spots: `TRADEMARKS.md`, `TRADEMARK-POLICY.md`, or section in `CONTRIBUTING.md`
   - Link from `README.md` and project site
5. Register mark before publishing policy:
   - Trademark policy with no register is unenforceable in most cases
   - At min, file app before publish — "TM" can be used right away, "(R)" only after register

**Got:** Clear, fair trademark policy that guards brand while letting healthy community use. Policy follows set open-source foundation models and is open from project main docs.

**If fail:** Project has no trademark register or app? File first (Steps 6-8) before drafting policy. Unregistered mark has limited enforce. Community pushes back on policy? Study Rust Foundation way — it was revised after community feedback and counted good model for balance guard with openness.

## Validation Checklist

- [ ] Pre-filing conflict checks done and logged (Step 1)
- [ ] Nice classes picked with pre-approved goods and services descs (Step 2)
- [ ] Descriptiveness checked on Abercrombie spectrum (Step 3)
- [ ] Mark type picked with strategy reason (Step 4)
- [ ] Filing basis picked with timeline and specimen needs logged (Step 5)
- [ ] App filed in at least one target jurisdiction (Steps 6-8)
- [ ] Filing receipt saved with app number and filing date
- [ ] All post-filing deadlines calendared with reminders (Step 9)
- [ ] Trademark watch alerts set up for confusingly similar marks (Step 9)
- [ ] Open-source trademark policy drafted if apply (Step 10)

## Pitfalls

- **File without screen**: Skip `screen-trademark` and jump straight to filing wastes fees if clashing mark exists. Always screen first
- **Wrong filing basis**: Claim use in commerce (1(a)) when mark not yet in use gives fraudulent filing. Use intent-to-use (1(b)) if launch not happened
- **Over-broad goods descs**: Claim goods and services you do not use or plan to use invites cancellation for non-use (especially in EU after 5 years)
- **Miss priority window**: Foreign priority under Section 44(d) must be claimed within 6 months of first filing. Miss this window means lose earlier priority date
- **Ignore foreign attorney rule**: Non-US applicants filing at USPTO without US-licensed attorney will have app rejected — this is hard rule since 2019
- **Madrid central attack exposure**: Leaning only on Madrid designations without knowing 5-year dep on base mark. Base mark falls? All designations fall with it
- **No post-filing monitoring**: File app and forget about it. Office actions and opposition deadlines pass, and app goes abandoned
- **Trademark policy before register**: Publish trademark policy with no app pending cuts enforce. File first, then draft policy

## See Also

- `screen-trademark` — Conflict screen that must come before this filing proc
- `assess-ip-landscape` — Broader IP landscape analysis with trademark landscape map
- `search-prior-art` — Prior art search method for trademark distinctiveness research
