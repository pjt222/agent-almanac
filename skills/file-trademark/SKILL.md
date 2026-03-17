---
name: file-trademark
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

File a trademark application with EUIPO (EU), USPTO (US), or WIPO Madrid Protocol (international). This skill covers the actual filing procedure — from pre-filing verification through post-registration monitoring and open-source trademark policy. It assumes conflict screening has already been completed via `screen-trademark`.

## When to Use

- Ready to file a trademark application after conflict screening is clear
- Choosing between EU, US, or international filing strategies
- Filing an EU trademark and claiming priority for a subsequent US filing
- Extending an existing national mark internationally via Madrid Protocol
- Drafting an open-source trademark usage policy after registration
- Responding to office actions or opposition proceedings during examination

## Inputs

- **Required**: Mark to be filed (word, logo, or combined)
- **Required**: Goods and services description
- **Required**: Target jurisdictions (EU, US, international, or combination)
- **Required**: Applicant name and address
- **Optional**: Screen-trademark results (conflict search report)
- **Optional**: Logo files (if filing a figurative or combined mark)
- **Optional**: Priority claim (earlier filing in another jurisdiction, within 6 months)
- **Optional**: Proof of use in commerce (required for USPTO 1(a) basis)
- **Optional**: Open-source project context (for trademark policy in Step 10)

## Filing Cost Reference

| Office | Base Fee | Per Class | Notes |
|--------|----------|-----------|-------|
| EUIPO | 850 EUR | +50 EUR (2nd), +150 EUR (3rd+) | SME Fund: 75% rebate |
| USPTO (TEAS Plus) | $250 | per class | Foreign applicants need US attorney |
| USPTO (TEAS Standard) | $350 | per class | More flexible goods description |
| Madrid Protocol | 653 CHF | varies by country | Depends on base mark for 5 years |

## Procedure

### Step 1: Pre-Filing Checks

Verify the mark is clear for filing before investing in application fees.

1. Confirm `screen-trademark` has been run:
   - Review the conflict search report for identical or confusingly similar marks
   - Verify all target jurisdictions were covered in the screening
   - Check that the screening is recent (ideally within the last 30 days)
2. Run final conflict checks against official databases:
   - **EUIPO TMview**: Search across all EU member state registers
   - **WIPO Global Brand Database**: International registrations
   - **USPTO TESS**: US federal register (use structured search: `"mark text"[BI]`)
   - **DPMAregister**: German national register (if filing EU, covers the largest EU market)
3. Verify the domain name and social media handles are available or secured:
   - Domain availability reinforces distinctiveness arguments if challenged
   - Matching handles reduce consumer confusion risk
4. Document the search results as the **Pre-Filing Clearance Record**

**Expected:** Confirmation that no blocking marks exist in the target jurisdictions. The Pre-Filing Clearance Record documents diligence and supports any future opposition defense.

**On failure:** If conflicting marks are found, assess the severity: identical mark + identical goods = do not file. Similar mark + related goods = seek legal counsel on likelihood of confusion. If conflicts are limited to a single jurisdiction, consider filing only in clear jurisdictions.

### Step 2: Nice Classification Selection

Identify the correct goods and services classes under the Nice Classification system.

1. Consult the TMclass tool (tmclass.tmdn.org) for class identification:
   - Enter the goods/services description
   - TMclass suggests harmonized terms accepted by most offices
   - Using pre-approved terms from the TMclass database reduces examination delays
2. Common classes for technology and software:
   - **Class 9**: Downloadable software, mobile apps, computer hardware
   - **Class 35**: Advertising, business management, SaaS platform administration
   - **Class 42**: SaaS, cloud computing, software development services
   - **Class 38**: Telecommunications, online platforms, messaging services
3. Draft the goods and services description:
   - Be specific enough to define your actual use but broad enough for future expansion
   - TEAS Plus (USPTO) requires terms from the ID Manual — use pre-approved terms
   - EUIPO accepts TMclass harmonized terms directly
4. Balance cost against coverage:
   - Each additional class adds fees (see cost table above)
   - File in classes where you currently use or intend to use the mark
   - Overly broad filings without use may be challenged (especially in the US)

**Expected:** A finalized list of Nice classes with specific, pre-approved goods and services descriptions for each class. Descriptions match the actual business use.

**On failure:** If TMclass does not suggest a clear match, consult the Nice Classification explanatory notes (WIPO Nice page). Ambiguous goods sometimes span multiple classes — file in all relevant classes rather than risk exclusion.

### Step 3: Descriptiveness Assessment

Evaluate whether the mark is registrable or likely to face descriptiveness objections.

1. Assess the mark on the **Abercrombie spectrum** (US standard, widely applied):
   - **Generic**: The common name for the product (e.g., "Computer" for computers) — never registrable
   - **Descriptive**: Directly describes a quality or feature (e.g., "QuickBooks") — registrable only with secondary meaning
   - **Suggestive**: Suggests but does not directly describe (e.g., "Netflix") — registrable without secondary meaning
   - **Arbitrary**: A real word used in an unrelated context (e.g., "Apple" for electronics) — strong protection
   - **Fanciful**: An invented word (e.g., "Xerox") — strongest protection
2. Check against EUTMR absolute grounds (Article 7(1)):
   - Art. 7(1)(b): Devoid of distinctive character
   - Art. 7(1)(c): Descriptive of characteristics of the goods/services
   - Art. 7(1)(d): Customary in the trade (generic in the relevant sector)
3. If the mark is borderline descriptive:
   - Gather evidence of acquired distinctiveness (advertising spend, sales figures, consumer surveys)
   - Consider adding a distinctive element (logo, stylization)
   - Modify the word mark to move it toward suggestive or arbitrary
4. Document the assessment with reasoning

**Expected:** The mark is classified on the Abercrombie spectrum as suggestive, arbitrary, or fanciful — all registrable without secondary meaning. Borderline cases are flagged with a mitigation strategy.

**On failure:** If the mark is descriptive or generic, do not file — it will be refused. Redesign the mark to move up the distinctiveness spectrum. If significant use history exists, consider a Section 2(f) claim (acquired distinctiveness) for the US or a similar claim under Art. 7(3) EUTMR for the EU.

### Step 4: Mark Type Decision

Choose the registration type that best protects the brand.

1. **Word mark** (standard characters):
   - Protects the word itself regardless of font, color, or style
   - Broadest protection — covers any visual representation
   - Cannot include design elements
   - Best choice when the brand value is in the name, not the logo
2. **Figurative mark** (logo or design):
   - Protects the specific visual representation
   - Narrower protection — does not cover the word in other styles
   - Required when the logo itself is the primary brand identifier
   - Must submit a clear image file (JPG/PNG, EUIPO: max 2 MB, min 945x945 px)
3. **Combined mark** (word + logo together):
   - Protects the specific combination as filed
   - Narrower than a word mark alone — limited to the specific combination
   - Common but strategically suboptimal: if the logo changes, the registration may not cover the new version
4. **Strategic recommendation**:
   - File a word mark first (broadest protection, most cost-effective)
   - File a separate figurative mark for the logo only if the logo has significant standalone brand value
   - Avoid combined marks unless budget constraints prevent separate filings

**Expected:** A clear mark type decision with strategic reasoning. Word mark is the default recommendation unless the logo carries independent brand value.

**On failure:** If unsure whether the name alone is distinctive enough, test by asking: "Would consumers recognize this name in plain text, without the logo?" If yes, file the word mark. If the logo is inseparable from the brand identity, consider filing both word and figurative marks separately.

### Step 5: Filing Basis Selection

Determine the legal basis for the application (primarily relevant for USPTO).

1. **Use in commerce — Section 1(a)**:
   - The mark is already in use in interstate commerce (US) or genuine use (EU)
   - Must submit a specimen showing the mark as used (screenshot, packaging, advertising)
   - Fastest path to registration
2. **Intent to use — Section 1(b)**:
   - The mark is not yet in use but the applicant has a bona fide intent to use
   - Requires a Statement of Use before registration (additional fees, deadlines)
   - Allows securing priority before launch
   - Extensions of time available (up to 36 months total)
3. **Foreign priority — Section 44(d)**:
   - Claim priority from a foreign filing made within the last 6 months
   - **Strategy**: File EUIPO first (lower cost, faster), then claim 44(d) priority for USPTO
   - This gives the US filing the same priority date as the EU filing
   - Requires a certified copy of the foreign application
4. **Foreign registration — Section 44(e)**:
   - Based on a foreign registration (not just an application)
   - No use in US commerce required at filing (but must eventually use)
5. **Madrid Protocol extension — Section 66(a)**:
   - Designating the US through the Madrid system
   - See Step 8 for Madrid details

**Expected:** Filing basis selected with timeline and specimen requirements documented. If using the EU-first strategy (EUIPO then 44(d) to USPTO), the 6-month priority window is calendared.

**On failure:** If no use in commerce exists and no foreign filing is pending, Section 1(b) (intent to use) is the only option for USPTO. Factor in the additional Statement of Use costs and deadlines. For EUIPO, no use is required at filing — declaration of intent is sufficient.

### Step 6: EUIPO E-Filing Procedure

File the EU trademark application online.

1. Navigate to the EUIPO e-filing portal (euipo.europa.eu):
   - Create an EUIPO user account if not already registered
   - Use the "Fast Track" filing for pre-approved TMclass terms (faster examination)
2. Complete the application form:
   - **Applicant details**: Name, address, legal form, nationality
   - **Representative**: Optional for EU-based applicants; required for non-EU applicants
   - **Mark**: Enter word mark text or upload figurative mark image
   - **Goods and services**: Select TMclass terms or enter custom descriptions
   - **Filing language**: Choose from EN, FR, DE, ES, IT (second language required)
   - **Priority claim**: Enter foreign application number and date if claiming priority
3. Review the fee summary:
   - 1 class: 850 EUR
   - 2 classes: 900 EUR (+50 EUR)
   - 3+ classes: 900 EUR + 150 EUR per additional class
   - **SME Fund (EUIPOIdeaforIP)**: Small and medium enterprises can claim 75% reimbursement
4. Pay online (credit card, bank transfer, or EUIPO current account)
5. Save the filing receipt with application number and filing date

**Expected:** EUIPO application filed with confirmation receipt. Application number and filing date recorded. If using Fast Track, examination typically completes within 1 month.

**On failure:** If the online portal rejects the filing (technical error), save a screenshot and try again. If the goods/services description is rejected, switch to pre-approved TMclass terms. If payment fails, the application is saved as a draft for 30 days.

### Step 7: USPTO Filing Procedure

File the US federal trademark application online.

1. Navigate to USPTO TEAS (Trademark Electronic Application System):
   - Choose TEAS Plus ($250/class) or TEAS Standard ($350/class)
   - TEAS Plus requires pre-approved ID Manual terms; TEAS Standard allows free-form descriptions
2. **Foreign applicant requirement**:
   - Applicants domiciled outside the US MUST appoint a US-licensed attorney
   - The attorney must be a member in good standing of a US state bar
   - This requirement applies even if filing through Madrid Protocol
3. Complete the application form:
   - **Applicant information**: Name, address, entity type, citizenship/state of organization
   - **Attorney information**: Name, bar membership, correspondence email
   - **Mark**: Enter word mark in standard characters or upload design mark image
   - **Goods and services**: Select from ID Manual (TEAS Plus) or draft custom (TEAS Standard)
   - **Filing basis**: Select Section 1(a), 1(b), 44(d), or 44(e) (see Step 5)
   - **Specimen** (1(a) basis only): Upload showing the mark as used in commerce
   - **Declaration**: Verify accuracy under penalty of perjury
4. Pay the filing fee ($250 or $350 per class)
5. Save the filing receipt with serial number and filing date

**Expected:** USPTO application filed with serial number assigned. Filing receipt saved. Examination typically takes 8-12 months for the first office action.

**On failure:** If the TEAS system rejects the filing, review the error messages — common issues include incorrect entity type, missing specimen (for 1(a) filings), or goods descriptions not matching ID Manual terms (TEAS Plus). If a foreign applicant files without a US attorney, the application will be rejected.

### Step 8: Madrid Protocol Extension

Extend protection internationally through the WIPO Madrid System.

1. **Prerequisites**:
   - A base mark (application or registration) in the office of origin
   - The applicant must be a national of, domiciled in, or have a real and effective establishment in a Madrid member country
   - The base mark must cover the same or narrower goods/services
2. File through the office of origin (not directly with WIPO):
   - **EUIPO as origin**: Use the EUIPO Madrid e-filing tool
   - **USPTO as origin**: File via TEAS International Application form
3. Complete the Madrid application (MM2 form):
   - **Applicant details**: Must match the base mark holder exactly
   - **Mark representation**: Must be identical to the base mark
   - **Goods and services**: Select from the base mark's specification (can narrow, not broaden)
   - **Designated Contracting Parties**: Select target countries/regions
   - **Language**: English, French, or Spanish
4. Calculate fees:
   - Base fee: 653 CHF (black-and-white) or 903 CHF (color)
   - Supplementary fee: 100 CHF per class beyond the first
   - Individual fees: Vary by designated country (check WIPO fee calculator)
   - Common individual fees: US ~$400+/class, Japan ~$500+/class, China ~$150+/class
5. **Central attack dependency**:
   - For the first 5 years, the international registration depends on the base mark
   - If the base mark is cancelled (opposition, non-use), all designations fall
   - After 5 years, each designation becomes independent
   - Strategy: Protect the base mark vigorously during the dependency period

**Expected:** Madrid application filed through the office of origin. Designated countries selected with fee calculations documented. The 5-year dependency risk is acknowledged and the base mark protection plan is in place.

**On failure:** If the office of origin rejects the Madrid application (e.g., mismatch with base mark), correct the discrepancy and refile. If a designated country refuses protection, respond through the Madrid system within the designated office's deadline (typically 12-18 months).

### Step 9: Post-Filing Monitoring

Track the application through examination and respond to actions.

1. **EUIPO monitoring**:
   - Publication in Part A of the EU Trade Marks Bulletin
   - **Opposition period**: 3 months from publication (extendable by 1 month cooling-off)
   - If no opposition: registration issues automatically
   - Opposition defense: file observations within 2 months of notification
2. **USPTO monitoring**:
   - Check TSDR (Trademark Status and Document Retrieval) regularly
   - **Examining attorney review**: 8-12 months after filing
   - **Office actions**: Response deadline is typically 3 months (extendable once for $125)
   - **Publication for opposition**: 30-day period in the Official Gazette
   - **Statement of Use** (1(b) filings): Must be filed within 6 months of Notice of Allowance (extendable up to 36 months total, $125 per extension)
3. **Madrid monitoring**:
   - WIPO notifies each designated office
   - Each office examines independently (12-18 month window)
   - Provisional refusals must be responded to through the local office's procedures
4. **Calendar all deadlines**:
   - Opposition response deadlines
   - Statement of Use deadlines (USPTO 1(b))
   - Renewal deadlines (10 years EUIPO, 10 years USPTO, 10 years Madrid)
   - USPTO Section 8/71 Declaration of Use: between 5th and 6th year
5. Monitor for third-party filings of confusingly similar marks:
   - Set up TMview/TESS watch alerts for similar marks in your classes
   - Consider a professional trademark watch service for critical brands

**Expected:** All deadlines are calendared with reminders. Application status is monitored through each office's online system. Opposition or office action response strategies are prepared in advance.

**On failure:** Missing a deadline can be fatal — most trademark office deadlines are not extendable. If a deadline is missed, check whether revival or reinstatement is available (USPTO allows petition to revive for unintentional delay). For EUIPO, missed opposition deadlines are generally final.

### Step 10: Open-Source Trademark Policy

Draft a trademark usage policy if the mark covers an open-source project.

1. Study established models:
   - **Linux Foundation**: Permits project name use in factual references; restricts logos to licensees
   - **Mozilla**: Detailed guidelines distinguishing unmodified distributions from modified builds
   - **Rust Foundation**: Broad permission for community use with specific restrictions on commercial products
   - **Apache Software Foundation**: Permissive naming policy with restrictions on implying endorsement
2. Define usage categories:
   - **Fair use** (always permitted): Referring to the project by name in articles, reviews, comparisons, academic papers
   - **Community/contributor use** (broadly permitted): User groups, conferences, educational materials, unmodified distributions
   - **Commercial use** (requires license or restrictions): Products incorporating the software, services based on the project, certification/compatibility claims
   - **Prohibited use**: Implying official endorsement, use on substantially modified versions without disclosure, domain names that cause confusion
3. Draft the trademark policy document:
   - Clear statement of trademark ownership
   - What uses are allowed without permission
   - What uses require written permission
   - How to request permission (contact, process)
   - Consequences of misuse
4. Place the policy file in the project repository:
   - Common locations: `TRADEMARKS.md`, `TRADEMARK-POLICY.md`, or a section in `CONTRIBUTING.md`
   - Link from `README.md` and the project website
5. Register the mark before publishing the policy:
   - A trademark policy without a registration is unenforceable in most cases
   - At minimum, file the application before publishing — "TM" can be used immediately, "(R)" only after registration

**Expected:** A clear, fair trademark policy that protects the brand while enabling healthy community use. The policy follows established open-source foundation models and is accessible from the project's main documentation.

**On failure:** If the project has no trademark registration or application, file first (Steps 6-8) before drafting the policy. An unregistered mark has limited enforceability. If the community pushes back on the policy, study the Rust Foundation's approach — it was revised after community feedback and is considered a good model for balancing protection with openness.

## Validation Checklist

- [ ] Pre-filing conflict checks completed and documented (Step 1)
- [ ] Nice classes selected with pre-approved goods and services descriptions (Step 2)
- [ ] Descriptiveness assessed on the Abercrombie spectrum (Step 3)
- [ ] Mark type decided with strategic reasoning (Step 4)
- [ ] Filing basis selected with timeline and specimen requirements documented (Step 5)
- [ ] Application filed in at least one target jurisdiction (Steps 6-8)
- [ ] Filing receipt saved with application number and filing date
- [ ] All post-filing deadlines calendared with reminders (Step 9)
- [ ] Trademark watch alerts configured for confusingly similar marks (Step 9)
- [ ] Open-source trademark policy drafted if applicable (Step 10)

## Common Pitfalls

- **Filing without screening**: Skipping `screen-trademark` and going straight to filing wastes fees if a conflicting mark exists. Always screen first
- **Wrong filing basis**: Claiming use in commerce (1(a)) when the mark is not yet in use results in a fraudulent filing. Use intent-to-use (1(b)) if launch has not occurred
- **Overly broad goods descriptions**: Claiming goods and services you do not use or intend to use invites cancellation for non-use (especially in the EU after 5 years)
- **Missing the priority window**: Foreign priority under Section 44(d) must be claimed within 6 months of the first filing. Missing this window means losing the earlier priority date
- **Ignoring the foreign attorney requirement**: Non-US applicants filing at the USPTO without a US-licensed attorney will have their application rejected — this is a hard rule since 2019
- **Madrid central attack exposure**: Relying solely on Madrid designations without understanding the 5-year dependency on the base mark. If the base mark falls, all designations fall with it
- **No post-filing monitoring**: Filing the application and forgetting about it. Office actions and opposition deadlines pass, and the application goes abandoned
- **Trademark policy before registration**: Publishing a trademark policy without having at least an application pending undermines enforceability. File first, then draft the policy

## Related Skills

- `screen-trademark` — Conflict screening that must precede this filing procedure
- `assess-ip-landscape` — Broader IP landscape analysis including trademark landscape mapping
- `search-prior-art` — Prior art search methodology applicable to trademark distinctiveness research
