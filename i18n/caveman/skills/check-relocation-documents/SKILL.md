---
name: check-relocation-documents
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Verify document completeness for each bureaucratic step of an EU/DACH
  relocation, flagging missing items and translation requirements. Use after
  creating a relocation plan and before beginning bureaucratic procedures, when
  preparing for a specific appointment (Buergeramt, Finanzamt), when unsure
  which documents need certified translation or apostille, after receiving a
  rejection or request for additional documents, or as a periodic check during
  the relocation process to ensure nothing has been overlooked.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: relocation
  complexity: intermediate
  language: natural
  tags: relocation, documents, checklist, verification, translation
---

# Check Relocation Documents

Verify docs present, valid, prepared for each bureaucratic step of EU/DACH relocation. Output: list of missing items and translation needs.

## When Use

- After relocation plan made, before bureaucratic steps begin
- Prep for specific appointment (Buergeramt, Finanzamt, insurance office)
- Unsure which docs need certified translation or apostille
- After authority rejects or requests more docs
- Household member different nationality → separate doc track
- Periodic check during relocation, catch missed items

## Inputs

### Required

- **Relocation plan**: Output from plan-eu-relocation skill or equivalent. Lists bureaucratic steps.
- **Destination country**: Germany, Austria, Switzerland, other EU country
- **Nationality/nationalities**: All household members
- **Document inventory**: Docs in hand (originals and copies)

### Optional

- **Origin country**: Determines apostille or Hague legalization
- **Employment contract**: Reveals employer docs (Arbeitgeberbescheinigung)
- **Language of existing documents**: Shows translation needs
- **Previous relocation experience**: Prior EU registrations may simplify
- **Special circumstances**: Recognized refugees, EU Blue Card, posted workers — different rules

## Steps

### Step 1: List All Bureaucratic Steps

Pull every registration, application, notification from relocation plan.

1. Parse plan. Extract action items needing document submission.
2. Categorize steps by authority:
   - Municipal registration (Buergeramt, Meldeamt, Einwohnerkontrolle)
   - Tax (Finanzamt)
   - Health insurance (Krankenkasse, OeGK, Swiss insurer)
   - Social security (Rentenversicherung, Sozialversicherung, AHV)
   - Immigration (Auslaenderbehorde) if applicable
   - Banks
   - Schools, childcare
   - Vehicle registration (Kfz-Zulassungsstelle)
   - Other (pet import, license recognition)
3. Order steps by dependency chain from plan.
4. Note shared docs across steps. Avoid redundant prep.

**Got:** Numbered list of bureaucratic steps. Categorized, ordered. Notes on shared docs.

**If fail:** Plan incomplete or missing? Build step list from official source. Germany: make-it-in-germany.com. Austria: migration.gv.at. Switzerland: ch.ch/en/moving-switzerland.

### Step 2: Map Required Documents per Step

For each step, identify every doc authority requires.

1. Municipal registration (Anmeldung/Meldezettel):
   - Valid passport or national ID (all household members)
   - Wohnungsgeberbestaetigung / rental contract / property deed
   - Marriage certificate (if registering as couple)
   - Birth certificates (children)
   - Previous registration confirmation (intra-country move)
2. Tax registration:
   - Meldebestaetigung/Meldezettel
   - Employment contract or business registration
   - Tax ID from origin country (cross-border coordination)
   - Marriage certificate (tax class assignment in Germany)
3. Health insurance enrollment:
   - Employment contract or self-employment proof
   - Previous insurance confirmation or EHIC
   - S1 form (posted workers, cross-border)
   - Residence registration confirmation
4. Social security coordination:
   - A1 portable document (posted workers)
   - E-forms or S-forms (benefit transfers)
   - Employment history
   - Social security number from origin country
5. Bank account opening:
   - Valid passport or national ID
   - Residence registration confirmation
   - Proof of income (contract or recent payslips)
   - Tax ID or Steueridentifikationsnummer (Germany)
6. Immigration/residence permits (non-EU nationals):
   - Passport with 6+ months remaining validity
   - Biometric photos (per-country format)
   - Employment contract or offer letter
   - Proof of financial means
   - Health insurance confirmation
   - University degree with recognition (EU Blue Card)
   - Criminal background check (may need apostille)
7. Vehicle re-registration:
   - Vehicle registration doc (Fahrzeugbrief/Zulassungsbescheinigung Teil II)
   - Insurance proof (eVB number in Germany)
   - TUeV/Pickerl/MFK inspection cert
   - Residence registration confirmation
8. School/childcare enrollment:
   - Birth certificates
   - Vaccination records (Impfpass)
   - Previous school reports + translations
   - Residence registration confirmation

**Got:** Matrix: each step → required docs. Specs noted (original, copy OK, certified translation).

**If fail:** Requirements unclear? Check authority website direct or call service line. Rules change. Third-party guides older than 12 months unreliable.

### Step 3: Check Current Document Status

Compare required docs vs inventory. Find gaps.

1. For each required doc, mark:
   - **Have (original)**: Original in hand, accessible
   - **Have (copy only)**: Copy only. Order original?
   - **Expired**: Exists but validity passed
   - **Missing**: Does not exist. Must obtain.
   - **Not applicable**: Not needed for this case
2. For "Have (original)", verify:
   - Not damaged or illegible
   - Names match across all docs. Watch transliteration, maiden names, middle names.
   - Valid at time of use (passports, IDs, insurance cards)
3. For expired docs, determine:
   - Renewal processing time at issuing authority
   - Expired doc accepted temporarily? (Rarely.)
   - Renewal cost
4. For missing docs, determine:
   - Issuing authority + processing time
   - Supporting docs needed to obtain it (recursive check)
   - Cost + payment method
   - Remote order OR in-person required?
5. Flag name mismatches. Passport = maiden name, marriage cert = married name → likely needs explanation or name-change proof.

**Got:** Status table. Every required doc: status (have/copy-only/expired/missing/N-A), validity date, issue notes.

**If fail:** Status unconfirmed (docs in storage, with another party)? Mark "unconfirmed". Treat as potentially missing for planning.

### Step 4: Identify Translation and Apostille Requirements

Find which docs need certified translation, apostille, other legalization.

1. Destination country language rules:
   - Germany: Docs in German OR certified translation required
   - Austria: Same as Germany. Some offices accept English for EU docs.
   - Switzerland: Depends on canton (German, French, Italian, Romansh)
2. Translation-exempt docs:
   - EU multilingual standard forms (Regulation 2016/1191) — civil status between EU states
   - Passports, national IDs (accepted without translation)
   - EHIC
3. Docs needing translation:
   - Must be sworn/certified translator (beeidigter Uebersetzer)
   - Translator certified in destination country, not origin
   - Turnaround: 3-10 business days
   - Cost: 30-80 EUR per page, varies by language pair
4. Apostille/legalization rules:
   - Hague Convention countries: apostille from issuing country's competent authority
   - Non-Hague: full legalization chain (local notary, foreign ministry, embassy)
   - EU-internal docs: often exempt under EU regulations. Verify per doc type.
   - Switzerland: Hague member, not EU. Rules differ.
5. Check if destination accepts digital/electronic apostilles.
6. Some docs need apostille AND translation. Apostille itself may need translation.

**Got:** Matrix per doc: translation needed (y/n), apostille needed (y/n), estimated cost, estimated processing time.

**If fail:** Apostille need unclear? Contact destination authority direct. Over-prep beats under-prep. Turned away at appointment wastes days.

### Step 5: Generate Action List

Merge findings into prioritized, deadline-aware action list.

1. Merge gaps (missing, expired, translation, apostille) → single list.
2. Per action item, include:
   - Document name
   - Action (obtain, renew, translate, apostille, replace)
   - Issuing authority or service provider
   - Processing time
   - Cost
   - Deadline (from timeline — when doc first needed)
   - Priority (critical / high / medium / low)
3. Priority rules:
   - **Critical**: Blocks first bureaucratic step (e.g., passport for Anmeldung). Or non-negotiable deadline.
   - **High**: Needed within 2 weeks after arrival. Long processing time.
   - **Medium**: Needed within 1 month. Reasonable processing.
   - **Low**: Needed eventually. No pressure.
4. Order:
   - Critical first. Sort by longest processing time (start these first).
   - High next. Sort by deadline.
   - Medium, low after.
5. Calculate total estimated cost for all prep.
6. Add per-appointment "document folder" checklist. List originals, copies, translations to bring.

**Got:** Prioritized action list. Deadlines, costs, processing times. Per-appointment packing lists.

**If fail:** Processing times uncertain (common with slow bureaucracies)? Use worst case. Start early. Flag items where expedited processing available at extra cost.

## Checks

- Every step from plan has at least one doc mapped
- No doc "status unknown" — all confirmed as have/missing/expired/N-A
- Translation reqs reference destination's official language rules
- Apostille reqs verified against Hague membership of issuing country
- Deadlines align with relocation timeline from plan-eu-relocation
- Priorities consistent (no "low" item blocking "critical" step)
- Total cost calculated
- Per-appointment checklists generated for first 3 steps minimum

## Pitfalls

- **Assuming EU docs need no prep**: EU regulations simplify cross-border acceptance. Most offices still require translations. Some require apostilles even between EU states.
- **Name mismatches across docs**: Transliteration from non-Latin scripts, maiden vs married names, middle name differences → most common rejection cause.
- **Relying on photocopies**: DACH authorities require originals for inspection, keep certified copies. Bring originals.
- **Ordering translations too late**: Sworn translators have 1-2 week backlogs. Peak season (Aug-Sep) extends this.
- **Forgetting apostille on translation**: Some authorities require apostille on original AND certified translation of apostilled doc.
- **Not checking validity periods**: Passport valid 2 more months may be rejected if authority requires 6 months remaining.
- **Ignoring multilingual EU forms**: For civil status docs between EU countries, multilingual forms eliminate translation. Must request explicitly.
- **Assuming digital docs accepted**: Most DACH offices require physical docs. PDF printouts of digital-only docs may need extra verification.

## See Also

- [plan-eu-relocation](../plan-eu-relocation/SKILL.md) -- Create plan that feeds this check
- [navigate-dach-bureaucracy](../navigate-dach-bureaucracy/SKILL.md) -- Detailed procedure guidance
