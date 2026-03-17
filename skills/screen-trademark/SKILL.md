---
name: screen-trademark
description: >
  Screen a proposed trademark for conflicts and distinctiveness before filing.
  Covers trademark database searches (TMview, WIPO Global Brand Database, USPTO
  TESS), distinctiveness analysis using the Abercrombie spectrum, likelihood of
  confusion assessment using DuPont factors and EUIPO relative grounds, common
  law rights evaluation, and goods/services overlap analysis. Produces a conflict
  report with a risk matrix. Use before adopting a new brand name, logo, or
  slogan — distinct from patent prior art search, which uses different databases,
  legal frameworks, and analysis methods.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: intellectual-property
  complexity: intermediate
  language: natural
  tags: intellectual-property, trademark, screening, distinctiveness, conflict, likelihood-of-confusion
---

# Screen Trademark

Screen a proposed trademark for conflicts and assess its distinctiveness before filing. Searches trademark registries, evaluates the mark on the Abercrombie spectrum, analyzes likelihood of confusion with prior marks, and produces a conflict report with actionable risk ratings.

## When to Use

- Before adopting a new brand name, product name, or service mark
- When rebranding or expanding into new goods/services classes
- Before filing a trademark application (national, EU, or international)
- When evaluating acquisition targets with trademark portfolios
- Before launching a product in a new geographic market with existing branding
- When a cease-and-desist letter is received and you need to assess exposure

## Inputs

- **Required**: Proposed mark (word mark, figurative mark, or both)
- **Required**: Goods and/or services the mark will cover (plain language description)
- **Required**: Geographic scope (US, EU, specific countries, or global)
- **Optional**: Nice classification classes if already known
- **Optional**: Intended date of first use (relevant for US common law priority)
- **Optional**: Known competing marks or brands in the space
- **Optional**: Whether the mark is a word mark, figurative mark, or composite

## Procedure

### Step 1: Define the Mark and Goods/Services

Establish exactly what is being screened and in which classes.

1. Record the proposed mark precisely:
   - Word mark: the text as it will appear (case matters for figurative elements)
   - Figurative mark: describe the visual elements, colors, stylization
   - Composite mark: both the word and figurative elements together
2. Describe the goods and/or services in plain language
3. Identify the applicable Nice classification classes:
   - Use TMclass (https://tmclass.tmdn.org/) to look up classes
   - Search by keyword to find the correct class and acceptable terms
   - Most marks need 1-3 classes; identify all relevant ones
   - Adjacent classes where confusion could arise (e.g., Class 9 software and Class 42 SaaS)
4. Document the geographic scope:
   - US (USPTO), EU (EUIPO), international (WIPO Madrid), or specific national offices
   - Note jurisdictional differences: US is first-to-use; EU is first-to-file

**Expected:** A clear record of the mark, its goods/services description, Nice classes, and target jurisdictions. This defines the search scope for all subsequent steps.

**On failure:** If Nice classification is ambiguous (the goods/services span multiple classes or don't clearly fit one), err on the side of including more classes. Screening a broader scope is safer than missing a conflict in an adjacent class.

### Step 2: Search Trademark Databases

Search for identical and similar marks across registries.

1. Search for **identical marks** first (exact match):
   - **TMview** (https://www.tmdn.org/tmview/): EU and participating national offices
   - **WIPO Global Brand Database** (https://branddb.wipo.int/): international registrations
   - **USPTO TESS / Trademark Center** (https://tsdr.uspto.gov/): US registrations and applications
   - **National offices** as relevant: DPMAregister (Germany), UKIPO (UK), CIPO (Canada)
2. Search for **similar marks** — expand the search to find:
   - Phonetic equivalents: marks that sound alike ("Kool" vs. "Cool", "Lyft" vs. "Lift")
   - Visual equivalents: marks that look alike ("Adidaz" vs. "Adidas")
   - Transliterations and translations of the mark
   - Marks with common prefixes/suffixes added or removed
   - Plurals, possessives, and abbreviations
3. Filter results by:
   - Status: live/registered marks and pending applications (ignore dead/cancelled)
   - Goods/services: same or related Nice classes (from Step 1)
   - Geography: target jurisdictions
4. For each potential conflict, record:
   - Mark text and registration/application number
   - Owner name and jurisdiction
   - Nice classes and goods/services description
   - Status (registered, pending, opposed) and dates
   - Whether the mark is identical or similar (and how: phonetic, visual, conceptual)

**Expected:** A list of potentially conflicting marks from at least two databases, covering both identical and similar marks in the relevant classes and jurisdictions. Each result includes enough detail for the confusion analysis in Step 4.

**On failure:** If a database is temporarily unavailable, note the gap and proceed with available sources. If the proposed mark is a common word, expect a large result set — prioritize results in the same or closely related Nice classes before expanding.

### Step 3: Assess Distinctiveness

Evaluate where the proposed mark falls on the Abercrombie spectrum.

1. Apply the **Abercrombie spectrum** (weakest to strongest):
   - **Generic**: The common name for the goods/services ("Computer Software" for software). Unregistrable and unprotectable
   - **Descriptive**: Directly describes a quality, feature, or purpose ("Quick Print" for printing). Registrable only with evidence of secondary meaning (acquired distinctiveness)
   - **Suggestive**: Suggests a quality but requires imagination to connect ("Netflix" = internet + flicks). Inherently distinctive; registrable without secondary meaning
   - **Arbitrary**: A real word used in an unrelated context ("Apple" for computers). Strong inherent distinctiveness
   - **Fanciful**: A coined word with no prior meaning ("Xerox", "Kodak"). Strongest distinctiveness
2. Assess secondary meaning if the mark is descriptive:
   - Duration and extent of use in commerce
   - Advertising expenditures and consumer exposure
   - Consumer surveys or declarations
   - Media coverage and unsolicited recognition
3. Check for marks that have become generic through **genericide**:
   - Was the mark once distinctive but now used as a common term? (e.g., "escalator", "aspirin" in the US)
4. Document the distinctiveness assessment with reasoning

**Expected:** A clear classification of the mark on the Abercrombie spectrum with supporting rationale. If the mark is descriptive, an assessment of whether secondary meaning can be established. Suggestive, arbitrary, and fanciful marks proceed with confidence.

**On failure:** If the mark falls on the generic-descriptive boundary, this is a significant registration risk. Recommend modifying the mark to push it toward suggestive (add a twist, combine with an unrelated concept) or prepare a secondary meaning evidence strategy.

### Step 4: Analyze Likelihood of Confusion

Evaluate whether the proposed mark is likely to be confused with any prior marks found in Step 2.

1. For each potentially conflicting prior mark, assess the **DuPont factors** (US framework) or **EUIPO relative grounds**:
   - **Similarity of marks**:
     - Visual: side-by-side appearance, letter composition, length, structure
     - Phonetic: pronunciation, syllable count, stress patterns, vowel sounds
     - Conceptual: meaning, connotation, commercial impression
   - **Similarity of goods/services**:
     - Same Nice class is a strong indicator but not conclusive
     - Related goods/services in different classes can still conflict
     - Consider channels of trade and typical purchasers
   - **Strength of the prior mark**:
     - Famous marks get broader protection (dilution doctrine)
     - Weak/descriptive marks get narrower protection
     - Market presence, advertising spend, recognition surveys
   - **Evidence of actual confusion**:
     - Customer complaints, misdirected communications
     - Social media mentions confusing the two brands
     - Prior opposition or cancellation proceedings
2. Weigh the factors holistically:
   - No single factor is dispositive; the analysis is a balancing test
   - Strong similarity in marks can offset weak similarity in goods (and vice versa)
   - Famous marks tip the balance toward finding confusion more easily
3. Rate each potential conflict:
   - **Blocking**: Near-identical mark in same goods/services, strong prior mark
   - **High risk**: Similar mark in same/related goods, or identical mark in related goods
   - **Moderate risk**: Similar mark in related goods, or identical mark in distant goods
   - **Low risk**: Weak similarity, distant goods, or weak prior mark

**Expected:** A rated list of potential conflicts with analysis supporting each rating. The most serious conflicts (blocking and high risk) are identified with specific reasoning.

**On failure:** If the analysis is borderline (factors pointing in both directions), rate the conflict conservatively (higher risk). It is safer to flag a potential conflict that turns out to be manageable than to miss one that blocks registration or triggers litigation.

### Step 5: Assess Common Law Rights

Evaluate unregistered trademark rights that may not appear in database searches.

1. Search for prior use without registration:
   - Business name registries and state/provincial databases
   - Domain name registrations (WHOIS, domain search tools)
   - Social media handles and business profiles
   - Industry directories and trade publications
   - Google and general web search for commercial use of the mark
2. Consider jurisdictional rules:
   - **US**: First-to-use system — prior commercial use creates rights even without registration
   - **EU**: First-to-file system — registration takes priority, but prior use can create limited defenses
   - **UK**: Passing off doctrine protects unregistered marks with goodwill
3. Assess the scope of any common law rights found:
   - Geographic reach of the prior user's market
   - Duration and consistency of use
   - Whether the user has built goodwill in the mark
4. Document common law findings and their impact on the overall risk assessment

**Expected:** A supplementary list of unregistered uses of the mark (or similar marks) that could create conflicts not visible in trademark registry searches. Particularly important for US filings.

**On failure:** If common law searching yields overwhelming results (the mark is a common word), focus on uses in the same industry/goods category. Common law rights are typically narrow in scope — a local bakery named "Sunrise" doesn't block a software product named "Sunrise."

### Step 6: Evaluate Goods/Services Overlap

Analyze the competitive proximity of goods/services in detail.

1. Compare Nice classification of the proposed mark against each prior mark:
   - Same class: presumptive overlap (but not automatic — classes can be broad)
   - Adjacent classes: assess whether the goods/services are complementary or competitive
   - Distant classes: typically safe unless the prior mark is famous
2. Analyze channels of trade:
   - Are the goods sold through the same retailers or platforms?
   - Do they target the same consumer demographic?
   - Would a consumer encountering both marks assume a common source?
3. Assess expansion likelihood:
   - Is the prior mark owner likely to expand into the proposed mark's goods/services?
   - "Zone of natural expansion" doctrine (US)
4. Document the overlap analysis with supporting reasoning

**Expected:** A clear assessment of goods/services proximity for each potential conflict, strengthening or weakening the likelihood of confusion ratings from Step 4.

**On failure:** If the goods/services relationship is unclear (novel product categories, convergent industries), apply the reasonable consumer test: would a typical buyer seeing both marks in the marketplace assume they come from the same source?

### Step 7: Generate Conflict Report

Compile all findings into a structured, actionable report.

1. Write the **Trademark Conflict Report** with sections:
   - **Executive summary**: proposed mark, key findings, overall risk rating
   - **Mark and scope**: mark description, Nice classes, jurisdictions
   - **Distinctiveness assessment**: Abercrombie classification, registration implications
   - **Conflict matrix**: all identified conflicts with risk ratings

```
Conflict Risk Matrix:
+----+-------------------+----------+---------+-------+---------+
| #  | Prior Mark        | Classes  | Juris.  | Type  | Risk    |
+----+-------------------+----------+---------+-------+---------+
| 1  | ACMESOFT          | 9, 42    | US, EU  | Ident | BLOCK   |
| 2  | ACME SOLUTIONS    | 42       | US      | Sim   | HIGH    |
| 3  | ACMEX             | 35       | EU      | Phon  | MOD     |
| 4  | ACM               | 16       | US      | Vis   | LOW     |
+----+-------------------+----------+---------+-------+---------+
Risk: BLOCK = blocking | HIGH | MOD = moderate | LOW | CLEAR
Type: Ident = identical | Sim = similar | Phon = phonetic | Vis = visual
```

   - **Common law findings**: unregistered uses of relevance
   - **Goods/services analysis**: overlap assessment per conflict
   - **Recommendations**: one of the following overall conclusions:
     - **Clear**: No significant conflicts found — proceed to filing
     - **Low risk**: Minor conflicts unlikely to prevent registration — proceed with monitoring
     - **Moderate risk**: Conflicts exist but may be manageable — consider coexistence agreement, mark modification, or narrowing goods/services
     - **High risk**: Significant conflicts likely to trigger opposition or refusal — consider substantial mark modification or alternative marks
     - **Blocking**: Near-identical prior mark in same goods/services — do not proceed without legal counsel
2. Include limitations and caveats:
   - Screening is not a legal opinion; consult trademark counsel before filing
   - Common law rights may exist beyond what database searches reveal
   - Figurative similarity requires visual inspection (beyond text search capability)

**Expected:** A complete conflict report with risk ratings, distinctiveness assessment, and clear recommendations. The report enables a go/no-go decision on the proposed mark.

**On failure:** If the analysis is inconclusive (mixed signals across jurisdictions or classes), present the findings by jurisdiction and let the decision-maker weigh business considerations alongside legal risk. A qualified "proceed with caution" is a valid conclusion.

## Validation Checklist

- [ ] Mark and goods/services clearly documented with Nice classes
- [ ] At least two trademark databases searched (e.g., TMview + USPTO TESS)
- [ ] Both identical and similar marks searched (phonetic, visual, conceptual)
- [ ] Distinctiveness assessed on the Abercrombie spectrum with reasoning
- [ ] Likelihood of confusion analyzed using DuPont factors or EUIPO relative grounds
- [ ] Common law rights investigated (business names, domains, web presence)
- [ ] Goods/services overlap evaluated for each potential conflict
- [ ] Conflict matrix produced with risk ratings per mark
- [ ] Overall recommendation provided (clear / low / moderate / high / blocking)
- [ ] Limitations stated (screening vs. legal opinion, database coverage gaps)

## Common Pitfalls

- **Identical-only search**: Searching for exact matches misses the most dangerous conflicts — phonetically and visually similar marks that trigger likelihood of confusion. Always search for variants
- **Ignoring related classes**: A software mark (Class 9) can conflict with a SaaS mark (Class 42) or a consulting mark (Class 35). Nice classes are guidelines, not walls
- **Skipping common law search**: In the US, an unregistered mark with prior use trumps a later federal registration. Database searches alone are insufficient
- **Conflating distinctiveness with availability**: A mark can be highly distinctive (fanciful) yet still conflict with an existing identical registration. Distinctiveness and availability are separate questions
- **Single-jurisdiction bias**: A mark that is clear in the US may be blocked in the EU and vice versa. Always screen the jurisdictions where the mark will actually be used
- **Treating screening as legal opinion**: This skill produces a structured risk assessment, not legal advice. Blocking and high-risk findings warrant review by trademark counsel before making final decisions

## Related Skills

- `assess-ip-landscape` -- Broader IP landscape mapping that contextualizes trademark screening within a full IP strategy
- `search-prior-art` -- Patent-focused prior art search using different databases and legal standards (novelty/obviousness vs. likelihood of confusion)
- `file-trademark` -- Filing procedure that follows a successful screening (not yet available)
