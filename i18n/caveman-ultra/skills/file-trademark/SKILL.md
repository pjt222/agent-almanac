---
name: file-trademark
locale: caveman-ultra
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

File trademark app EUIPO (EU), USPTO (US), or WIPO Madrid (intl). Covers filing — pre-filing verify → post-registration monitoring + open-source policy. Assumes conflict screening done via `screen-trademark`.

## Use When

- Ready to file after conflict screening clear
- Choose between EU/US/intl strategies
- File EU + claim priority for US
- Extend national mark intl via Madrid
- Draft open-source trademark policy post-registration
- Respond to office actions/opposition during exam

## In

- **Required**: Mark (word, logo, combined)
- **Required**: Goods + services description
- **Required**: Target jurisdictions (EU, US, intl, combo)
- **Required**: Applicant name + address
- **Optional**: Screen-trademark results
- **Optional**: Logo files (figurative/combined)
- **Optional**: Priority claim (earlier filing, w/in 6mo)
- **Optional**: Proof of use in commerce (USPTO 1(a))
- **Optional**: Open-source project context (Step 10)

## Filing Cost Reference

| Office | Base Fee | Per Class | Notes |
|--------|----------|-----------|-------|
| EUIPO | 850 EUR | +50 EUR (2nd), +150 EUR (3rd+) | SME Fund: 75% rebate |
| USPTO (TEAS Plus) | $250 | per class | Foreign applicants need US attorney |
| USPTO (TEAS Standard) | $350 | per class | More flexible goods description |
| Madrid Protocol | 653 CHF | varies by country | Depends on base mark for 5 years |

## Do

### Step 1: Pre-Filing Checks

Verify clear before invest fees.

1. Confirm `screen-trademark` ran:
   - Review conflict report identical/similar marks
   - All target jurisdictions covered
   - Recent (ideally ≤30 days)
2. Final checks vs official DBs:
   - **EUIPO TMview**: EU member state registers
   - **WIPO Global Brand Database**: Intl registrations
   - **USPTO TESS**: US federal (use: `"mark text"[BI]`)
   - **DPMAregister**: German national (if EU, largest market)
3. Verify domain + social handles:
   - Domain reinforces distinctiveness
   - Matching handles reduce confusion
4. Document as **Pre-Filing Clearance Record**

→ No blocking marks in targets. Record documents diligence + supports opposition defense.

If err: conflicts → severity: identical mark + identical goods → don't file. Similar + related → legal counsel on confusion likelihood. Limited to 1 jurisdiction → file only clear ones.

### Step 2: Nice Classification

Identify correct goods/services classes.

1. Consult TMclass (tmclass.tmdn.org):
   - Enter goods/services
   - Suggests harmonized terms accepted by most offices
   - Pre-approved terms → reduce exam delays
2. Common classes tech/software:
   - **Class 9**: Downloadable software, mobile apps, hardware
   - **Class 35**: Advertising, business mgmt, SaaS admin
   - **Class 42**: SaaS, cloud, software dev services
   - **Class 38**: Telecom, online platforms, messaging
3. Draft description:
   - Specific enough for actual use, broad enough for expansion
   - TEAS Plus (USPTO) → ID Manual pre-approved
   - EUIPO → TMclass harmonized directly
4. Balance cost vs coverage:
   - Each class adds fees
   - File where use or intend to use
   - Overly broad w/o use → challenged (esp US)

→ Finalized list Nice classes w/ specific pre-approved descriptions. Matches actual use.

If err: no TMclass match → Nice Classification explanatory notes (WIPO). Ambiguous goods span classes → file all relevant.

### Step 3: Descriptiveness

Evaluate registrable or faces objections.

1. Abercrombie spectrum (US standard):
   - **Generic**: Common name ("Computer" for computers) — never registrable
   - **Descriptive**: Directly describes ("QuickBooks") — only w/ secondary meaning
   - **Suggestive**: Suggests not describes ("Netflix") — registrable w/o
   - **Arbitrary**: Real word unrelated context ("Apple" for electronics) — strong
   - **Fanciful**: Invented ("Xerox") — strongest
2. EUTMR absolute grounds (Art 7(1)):
   - Art 7(1)(b): Devoid distinctive character
   - Art 7(1)(c): Descriptive of characteristics
   - Art 7(1)(d): Customary in trade
3. Borderline descriptive:
   - Evidence of acquired distinctiveness (advertising, sales, surveys)
   - Add distinctive element (logo, stylization)
   - Modify → suggestive/arbitrary
4. Document assessment

→ Classified suggestive/arbitrary/fanciful — registrable w/o secondary meaning. Borderline flagged w/ mitigation.

If err: descriptive/generic → don't file → refused. Redesign up spectrum. Significant use history → Section 2(f) claim (US) or Art 7(3) EUTMR (EU).

### Step 4: Mark Type

Registration type best protects.

1. **Word mark** (standard chars):
   - Protects word regardless font/color/style
   - Broadest — covers any visual
   - No design
   - Brand value in name not logo
2. **Figurative** (logo):
   - Protects specific visual
   - Narrower — no word in other styles
   - Required when logo = primary identifier
   - Clear image (JPG/PNG, EUIPO: max 2MB, min 945x945)
3. **Combined** (word + logo):
   - Protects specific combination
   - Narrower than word alone
   - Common but suboptimal: logo changes → registration may not cover new
4. **Strategic**:
   - Word first (broadest, cost-effective)
   - Separate figurative if logo has standalone value
   - Avoid combined unless budget

→ Clear decision + reasoning. Word default unless logo independent brand value.

If err: unsure name distinctive enough → ask "Would consumers recognize in plain text w/o logo?" Yes → word mark. Logo inseparable → both word + figurative separately.

### Step 5: Filing Basis

Legal basis (primarily USPTO).

1. **Use — Section 1(a)**:
   - Already in interstate commerce (US) or genuine use (EU)
   - Submit specimen showing use (screenshot, packaging, ads)
   - Fastest
2. **Intent to use — Section 1(b)**:
   - Not yet in use but bona fide intent
   - Statement of Use before registration (fees, deadlines)
   - Secure priority before launch
   - Extensions (up to 36mo total)
3. **Foreign priority — Section 44(d)**:
   - Claim priority from foreign filing w/in last 6mo
   - **Strategy**: File EUIPO first (lower, faster), then claim 44(d) priority USPTO
   - US filing same priority date as EU
   - Certified copy of foreign app
4. **Foreign registration — Section 44(e)**:
   - Based on foreign registration (not just app)
   - No US commerce at filing (but must eventually)
5. **Madrid Protocol — Section 66(a)**:
   - Designate US through Madrid
   - See Step 8

→ Basis selected + timeline + specimen requirements. EU-first strategy → 6mo priority window calendared.

If err: no use + no foreign pending → Section 1(b) only for USPTO. Factor Statement of Use costs + deadlines. EUIPO → no use at filing, declaration sufficient.

### Step 6: EUIPO E-Filing

File EU online.

1. EUIPO e-filing portal (euipo.europa.eu):
   - Create user account
   - "Fast Track" for pre-approved TMclass (faster exam)
2. Complete form:
   - **Applicant**: Name, address, legal form, nationality
   - **Representative**: Optional EU-based; required non-EU
   - **Mark**: Word text or upload figurative
   - **Goods + services**: TMclass terms or custom
   - **Filing language**: EN/FR/DE/ES/IT (2nd required)
   - **Priority claim**: Foreign app # + date
3. Fee summary:
   - 1 class: 850 EUR
   - 2 classes: 900 EUR (+50)
   - 3+: 900 EUR + 150 EUR per additional
   - **SME Fund (EUIPOIdeaforIP)**: 75% rebate
4. Pay (credit, bank transfer, EUIPO account)
5. Save receipt w/ app # + filing date

→ Filed w/ confirmation. App # + date recorded. Fast Track → exam typically 1mo.

If err: portal rejects (technical) → screenshot + retry. Goods/services rejected → pre-approved TMclass. Payment fails → draft saved 30d.

### Step 7: USPTO Filing

File US federal online.

1. USPTO TEAS:
   - TEAS Plus ($250/class) or TEAS Standard ($350/class)
   - Plus = pre-approved ID Manual; Standard = free-form
2. **Foreign applicant requirement**:
   - Non-US domiciled MUST appoint US-licensed attorney
   - Member good standing US state bar
   - Applies even Madrid Protocol
3. Complete form:
   - **Applicant**: Name, address, entity, citizenship/state
   - **Attorney**: Name, bar, email
   - **Mark**: Word standard chars or design image
   - **Goods + services**: ID Manual (Plus) or custom (Standard)
   - **Filing basis**: 1(a), 1(b), 44(d), 44(e)
   - **Specimen** (1(a) only): Show mark as used
   - **Declaration**: Under penalty of perjury
4. Pay ($250 or $350/class)
5. Save receipt w/ serial # + filing date

→ Filed w/ serial # assigned. Receipt saved. Exam typ 8-12mo first office action.

If err: TEAS rejects → review errs — common: wrong entity type, missing specimen (1(a)), goods not matching ID Manual (Plus). Foreign applicant no US attorney → rejected.

### Step 8: Madrid Protocol

Extend intl via WIPO Madrid.

1. **Prereqs**:
   - Base mark (app or registration) in origin office
   - Applicant national/domiciled/real establishment Madrid member
   - Base covers same/narrower goods/services
2. File through origin (not directly WIPO):
   - **EUIPO origin**: EUIPO Madrid e-filing
   - **USPTO origin**: TEAS International Application
3. Complete Madrid (MM2):
   - **Applicant**: Match base mark holder exactly
   - **Mark**: Identical to base
   - **Goods + services**: From base (narrow OK, not broaden)
   - **Designated Contracting Parties**: Target countries/regions
   - **Language**: EN, FR, ES
4. Fees:
   - Base: 653 CHF (B&W) or 903 CHF (color)
   - Supplementary: 100 CHF per class beyond first
   - Individual: Vary by country (WIPO fee calc)
   - Common: US ~$400+/class, Japan ~$500+/class, China ~$150+/class
5. **Central attack dependency**:
   - First 5yr intl registration depends on base
   - Base cancelled → all designations fall
   - After 5yr → each designation indep
   - Strategy: Protect base vigorously dependency period

→ Filed through origin. Countries + fees documented. 5yr dependency risk acknowledged + base protection plan.

If err: origin rejects (mismatch w/ base) → correct + refile. Country refuses → respond through Madrid w/in designated office deadline (typ 12-18mo).

### Step 9: Post-Filing Monitoring

Track through exam + respond.

1. **EUIPO**:
   - Publication Part A EU Trade Marks Bulletin
   - **Opposition period**: 3mo (extendable 1mo cooling-off)
   - No opposition → registration auto
   - Opposition defense: file observations w/in 2mo notification
2. **USPTO**:
   - Check TSDR regularly
   - **Examining attorney**: 8-12mo after filing
   - **Office actions**: 3mo response (extendable once $125)
   - **Publication for opposition**: 30-day Official Gazette
   - **Statement of Use** (1(b)): w/in 6mo Notice of Allowance (extendable up to 36mo total, $125/ext)
3. **Madrid**:
   - WIPO notifies each office
   - Each exams indep (12-18mo)
   - Provisional refusals → respond through local office
4. **Calendar deadlines**:
   - Opposition response
   - Statement of Use (USPTO 1(b))
   - Renewal (10yr EUIPO, 10yr USPTO, 10yr Madrid)
   - USPTO Section 8/71 Declaration of Use: between 5th-6th yr
5. Monitor third-party filings similar:
   - TMview/TESS watch alerts similar marks in classes
   - Professional watch service for critical brands

→ Deadlines calendared w/ reminders. Status monitored via office systems. Response strategies prepared.

If err: missed deadline fatal — most not extendable. Check revival/reinstatement (USPTO petition to revive for unintentional). EUIPO missed opposition → generally final.

### Step 10: Open-Source Trademark Policy

Draft usage policy if mark covers OS project.

1. Study established:
   - **Linux Foundation**: Factual references OK; logos restricted to licensees
   - **Mozilla**: Guidelines distinguishing unmodified distributions from modified
   - **Rust Foundation**: Broad community use w/ commercial restrictions
   - **Apache Software Foundation**: Permissive naming w/ endorsement restrictions
2. Usage categories:
   - **Fair use** (always): Articles, reviews, comparisons, academic
   - **Community/contributor** (broadly): User groups, conferences, education, unmodified distributions
   - **Commercial** (license/restrictions): Products, services, certification/compatibility
   - **Prohibited**: Implying endorsement, modified versions w/o disclosure, confusing domains
3. Draft policy doc:
   - Ownership statement
   - What allowed w/o permission
   - What requires written permission
   - How to request (contact, process)
   - Consequences misuse
4. Place in repo:
   - Common: `TRADEMARKS.md`, `TRADEMARK-POLICY.md`, or section in `CONTRIBUTING.md`
   - Link from `README.md` + website
5. Register before publishing:
   - Policy w/o registration unenforceable most cases
   - At min → file app before publishing — "TM" immediate, "(R)" only after

→ Clear fair policy protecting brand + enabling healthy community. Follows OS foundation models + accessible from main docs.

If err: no registration/app → file first (Steps 6-8) before drafting. Unregistered limited enforceability. Community pushback → study Rust Foundation — revised after feedback, good model.

## Check

- [ ] Pre-filing conflict checks documented (Step 1)
- [ ] Nice classes w/ pre-approved descriptions (Step 2)
- [ ] Descriptiveness on Abercrombie (Step 3)
- [ ] Mark type w/ reasoning (Step 4)
- [ ] Filing basis + timeline + specimen (Step 5)
- [ ] Filed ≥1 target (Steps 6-8)
- [ ] Receipt saved w/ app # + date
- [ ] Post-filing deadlines calendared (Step 9)
- [ ] Watch alerts configured (Step 9)
- [ ] OS policy drafted if applicable (Step 10)

## Traps

- **File w/o screen**: Skip `screen-trademark` → waste fees if conflict. Always screen first.
- **Wrong basis**: Claim 1(a) when not in use = fraudulent. Use 1(b) intent-to-use if no launch.
- **Overly broad goods**: Claim you don't use/intend → cancellation for non-use (esp EU after 5yr).
- **Miss priority window**: 44(d) priority must be claimed w/in 6mo of first filing. Miss → lose earlier date.
- **Foreign attorney req**: Non-US applicants at USPTO w/o US attorney → rejected. Hard rule since 2019.
- **Madrid central attack exposure**: Rely solely on Madrid w/o understanding 5yr dependency. Base falls → all fall.
- **No monitoring**: File + forget. Office actions + opposition deadlines pass → abandoned.
- **Policy before registration**: Publish policy w/o ≥app pending → undermines enforceability. File first.

## →

- `screen-trademark` — Conflict screening preceding this
- `assess-ip-landscape` — Broader IP landscape incl trademark mapping
- `search-prior-art` — Prior art methodology applicable to distinctiveness
