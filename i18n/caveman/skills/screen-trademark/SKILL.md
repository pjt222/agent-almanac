---
name: screen-trademark
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
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

Screen proposed trademark for conflicts. Judge distinctiveness before filing. Search trademark registries, evaluate mark on Abercrombie spectrum, analyze likelihood of confusion with prior marks, produce conflict report with risk ratings.

## When Use

- Before adopting new brand name, product name, service mark
- Rebranding or expanding into new goods/services classes
- Before filing trademark app (national, EU, international)
- Evaluating acquisition targets with trademark portfolios
- Before launching product in new geo with existing branding
- Cease-and-desist letter received, need assess exposure

## Inputs

- **Required**: Proposed mark (word mark, figurative, both)
- **Required**: Goods and/or services mark covers (plain language)
- **Required**: Geo scope (US, EU, specific countries, global)
- **Optional**: Nice classification classes if known
- **Optional**: Date of first use (relevant for US common law priority)
- **Optional**: Known competing marks or brands in space
- **Optional**: Whether mark is word, figurative, or composite

## Steps

### Step 1: Define Mark and Goods/Services

Establish what is being screened, in which classes.

1. Record proposed mark.
   - Word mark: text as it will appear (case matters for figurative elements)
   - Figurative mark: describe visual elements, colors, stylization
   - Composite mark: both word + figurative elements together
2. Describe goods and/or services in plain language
3. Identify applicable Nice classification classes.
   - Use TMclass (https://tmclass.tmdn.org/) to look up classes
   - Search by keyword to find correct class + acceptable terms
   - Most marks need 1-3 classes; identify all relevant
   - Adjacent classes where confusion could arise (e.g., Class 9 software, Class 42 SaaS)
4. Document geo scope.
   - US (USPTO), EU (EUIPO), international (WIPO Madrid), specific national offices
   - Note jurisdictional differences: US is first-to-use; EU is first-to-file

**Got:** Clear record of mark, goods/services description, Nice classes, target jurisdictions. Defines search scope for all subsequent steps.

**If fail:** Nice classification ambiguous (goods/services span multiple classes or do not fit one)? Err on side of including more. Screening broader scope safer than missing conflict in adjacent class.

### Step 2: Search Trademark Databases

Search for identical and similar marks across registries.

1. Search **identical marks** first (exact match).
   - **TMview** (https://www.tmdn.org/tmview/): EU + participating national offices
   - **WIPO Global Brand Database** (https://branddb.wipo.int/): international registrations
   - **USPTO TESS / Trademark Center** (https://tsdr.uspto.gov/): US registrations + applications
   - **National offices** as relevant: DPMAregister (Germany), UKIPO (UK), CIPO (Canada)
2. Search **similar marks** — expand to find.
   - Phonetic equivalents: marks that sound alike ("Kool" vs "Cool", "Lyft" vs "Lift")
   - Visual equivalents: marks that look alike ("Adidaz" vs "Adidas")
   - Transliterations + translations of mark
   - Marks with common prefixes/suffixes added or removed
   - Plurals, possessives, abbreviations
3. Filter results by.
   - Status: live/registered marks + pending applications (ignore dead/cancelled)
   - Goods/services: same or related Nice classes (from Step 1)
   - Geo: target jurisdictions
4. For each potential conflict, record.
   - Mark text + registration/application number
   - Owner name + jurisdiction
   - Nice classes + goods/services description
   - Status (registered, pending, opposed) + dates
   - Whether identical or similar (and how: phonetic, visual, conceptual)

**Got:** List of potentially conflicting marks from at least two databases, covering identical + similar marks in relevant classes + jurisdictions. Each result has enough detail for confusion analysis in Step 4.

**If fail:** Database temporarily unavailable? Note gap, proceed with available sources. Mark is common word? Expect large result set — prioritize results in same or related Nice classes before expanding.

### Step 3: Assess Distinctiveness

Evaluate where proposed mark falls on Abercrombie spectrum.

1. Apply **Abercrombie spectrum** (weakest to strongest).
   - **Generic**: Common name for goods/services ("Computer Software" for software). Unregistrable, unprotectable
   - **Descriptive**: Directly describes quality, feature, purpose ("Quick Print" for printing). Registrable only with secondary meaning (acquired distinctiveness)
   - **Suggestive**: Suggests quality but needs imagination to connect ("Netflix" = internet + flicks). Inherently distinctive; registrable without secondary meaning
   - **Arbitrary**: Real word in unrelated context ("Apple" for computers). Strong inherent distinctiveness
   - **Fanciful**: Coined word with no prior meaning ("Xerox", "Kodak"). Strongest distinctiveness
2. Assess secondary meaning if mark descriptive.
   - Duration + extent of use in commerce
   - Advertising spend + consumer exposure
   - Consumer surveys or declarations
   - Media coverage + unsolicited recognition
3. Check for marks gone generic through **genericide**.
   - Was mark once distinctive, now used as common term? (e.g., "escalator", "aspirin" in US)
4. Document distinctiveness assessment with reasoning

**Got:** Clear classification of mark on Abercrombie spectrum with rationale. If descriptive, assessment of whether secondary meaning can be established. Suggestive, arbitrary, fanciful proceed with confidence.

**If fail:** Mark on generic-descriptive boundary? Significant registration risk. Recommend modifying mark to push toward suggestive (add twist, combine with unrelated concept) or prep secondary meaning evidence strategy.

### Step 4: Analyze Likelihood of Confusion

Evaluate whether proposed mark likely confused with prior marks from Step 2.

1. For each potentially conflicting prior mark, assess **DuPont factors** (US framework) or **EUIPO relative grounds**.
   - **Similarity of marks**.
     - Visual: side-by-side appearance, letter composition, length, structure
     - Phonetic: pronunciation, syllable count, stress patterns, vowel sounds
     - Conceptual: meaning, connotation, commercial impression
   - **Similarity of goods/services**.
     - Same Nice class strong indicator but not conclusive
     - Related goods/services in different classes can still conflict
     - Consider channels of trade + typical purchasers
   - **Strength of prior mark**.
     - Famous marks get broader protection (dilution doctrine)
     - Weak/descriptive marks get narrower protection
     - Market presence, ad spend, recognition surveys
   - **Evidence of actual confusion**.
     - Customer complaints, misdirected communications
     - Social media mentions confusing two brands
     - Prior opposition or cancellation proceedings
2. Weigh factors holistically.
   - No single factor dispositive; analysis = balancing test
   - Strong similarity in marks can offset weak similarity in goods (and vice versa)
   - Famous marks tip balance toward finding confusion more easily
3. Rate each potential conflict.
   - **Blocking**: Near-identical mark in same goods/services, strong prior mark
   - **High risk**: Similar mark in same/related goods, or identical mark in related goods
   - **Moderate risk**: Similar mark in related goods, or identical mark in distant goods
   - **Low risk**: Weak similarity, distant goods, weak prior mark

**Got:** Rated list of potential conflicts with analysis supporting each rating. Most serious (blocking + high risk) identified with specific reasoning.

**If fail:** Analysis borderline (factors point both ways)? Rate conservatively (higher risk). Safer to flag potential conflict that turns out manageable than miss one that blocks registration or triggers litigation.

### Step 5: Assess Common Law Rights

Evaluate unregistered trademark rights that may not appear in database searches.

1. Search prior use without registration.
   - Business name registries + state/provincial databases
   - Domain name registrations (WHOIS, domain search tools)
   - Social media handles + business profiles
   - Industry directories + trade publications
   - Google + general web search for commercial use of mark
2. Consider jurisdictional rules.
   - **US**: First-to-use system — prior commercial use creates rights even without registration
   - **EU**: First-to-file — registration takes priority, but prior use can create limited defenses
   - **UK**: Passing off doctrine protects unregistered marks with goodwill
3. Assess scope of any common law rights found.
   - Geo reach of prior user's market
   - Duration + consistency of use
   - Whether user built goodwill in mark
4. Document common law findings + impact on overall risk

**Got:** Supplementary list of unregistered uses of mark (or similar) that could create conflicts not visible in registry searches. Especially important for US filings.

**If fail:** Common law searching yields overwhelming results (mark is common word)? Focus on uses in same industry/goods category. Common law rights typically narrow in scope — local bakery "Sunrise" does not block software product "Sunrise."

### Step 6: Evaluate Goods/Services Overlap

Analyze competitive proximity of goods/services in detail.

1. Compare Nice classification of proposed mark vs each prior mark.
   - Same class: presumptive overlap (but not automatic — classes can be broad)
   - Adjacent classes: assess complementary or competitive
   - Distant classes: typically safe unless prior mark famous
2. Analyze channels of trade.
   - Goods sold through same retailers or platforms?
   - Target same consumer demographic?
   - Would consumer encountering both marks assume common source?
3. Assess expansion likelihood.
   - Is prior mark owner likely to expand into proposed mark's goods/services?
   - "Zone of natural expansion" doctrine (US)
4. Document overlap analysis with reasoning

**Got:** Clear assessment of goods/services proximity per potential conflict, strengthening or weakening likelihood of confusion ratings from Step 4.

**If fail:** Goods/services relationship unclear (novel categories, convergent industries)? Apply reasonable consumer test: would typical buyer seeing both marks in marketplace assume same source?

### Step 7: Generate Conflict Report

Compile all findings into structured, actionable report.

1. Write **Trademark Conflict Report** with sections.
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
   - **Recommendations**: one of overall conclusions.
     - **Clear**: No significant conflicts found — proceed to filing
     - **Low risk**: Minor conflicts unlikely to prevent registration — proceed with monitoring
     - **Moderate risk**: Conflicts exist but may be manageable — consider coexistence agreement, mark modification, narrow goods/services
     - **High risk**: Significant conflicts likely to trigger opposition or refusal — consider substantial mark modification or alternatives
     - **Blocking**: Near-identical prior mark in same goods/services — do not proceed without legal counsel
2. Include limitations + caveats.
   - Screening not legal opinion; consult trademark counsel before filing
   - Common law rights may exist beyond what database searches reveal
   - Figurative similarity needs visual inspection (beyond text search capability)

**Got:** Complete conflict report with risk ratings, distinctiveness assessment, clear recommendations. Report enables go/no-go decision on proposed mark.

**If fail:** Analysis inconclusive (mixed signals across jurisdictions or classes)? Present findings by jurisdiction, let decision-maker weigh business considerations alongside legal risk. Qualified "proceed with caution" valid conclusion.

## Checks

- [ ] Mark + goods/services clearly documented with Nice classes
- [ ] At least two trademark databases searched (e.g., TMview + USPTO TESS)
- [ ] Both identical + similar marks searched (phonetic, visual, conceptual)
- [ ] Distinctiveness assessed on Abercrombie spectrum with reasoning
- [ ] Likelihood of confusion analyzed using DuPont factors or EUIPO relative grounds
- [ ] Common law rights investigated (business names, domains, web presence)
- [ ] Goods/services overlap evaluated per potential conflict
- [ ] Conflict matrix produced with risk ratings per mark
- [ ] Overall recommendation provided (clear / low / moderate / high / blocking)
- [ ] Limitations stated (screening vs legal opinion, database coverage gaps)

## Pitfalls

- **Identical-only search**: Searching for exact matches misses most dangerous conflicts — phonetically + visually similar marks that trigger likelihood of confusion. Always search variants
- **Ignore related classes**: Software mark (Class 9) can conflict with SaaS mark (Class 42) or consulting mark (Class 35). Nice classes guidelines, not walls
- **Skip common law search**: In US, unregistered mark with prior use trumps later federal registration. Database searches alone insufficient
- **Conflate distinctiveness with availability**: Mark can be highly distinctive (fanciful) yet still conflict with existing identical registration. Distinctiveness + availability separate questions
- **Single-jurisdiction bias**: Mark clear in US may be blocked in EU + vice versa. Always screen jurisdictions where mark will be used
- **Treat screening as legal opinion**: Skill produces structured risk assessment, not legal advice. Blocking + high-risk findings warrant review by trademark counsel before final decisions

## See Also

- `assess-ip-landscape` -- Broader IP landscape mapping that contextualizes trademark screening within full IP strategy
- `search-prior-art` -- Patent-focused prior art search using different databases + legal standards (novelty/obviousness vs likelihood of confusion)
- `file-trademark` -- Filing procedure that follows successful screening (not yet available)
