---
name: check-relocation-documents
locale: caveman-ultra
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

Docs present + valid + ready → each bureau step of EU/DACH relocation. → action list: missing items + translation needs.

## Use When

- Relocation plan done → before bureau procs start
- Prep for specific appt (Buergeramt, Finanzamt, insurance)
- Unsure: certified translation/apostille needed?
- Authority rejected/asked for more docs
- Household member diff nationality → separate doc tracks
- Periodic check during relocation

## In

### Required

- **Relocation plan**: From plan-eu-relocation skill → lists all bureau steps
- **Dest country**: DE, AT, CH, or other EU
- **Nationality(s)**: All household members
- **Doc inventory**: Docs held (originals + copies)

### Optional

- **Origin country**: → determines apostille/Hague Convention needs
- **Employment contract**: → employer-issued docs (Arbeitgeberbescheinigung)
- **Lang of existing docs**: → translation needs
- **Prior EU registrations**: → simplify reqs
- **Special**: Refugees, EU Blue Card, posted workers → diff doc reqs

## Do

### Step 1: List All Bureau Steps

Extract every registration/app/notification step from relocation plan.

1. Parse plan → all action items needing doc submission
2. Categorize by authority:
   - Municipal (Buergeramt, Meldeamt, Einwohnerkontrolle)
   - Tax (Finanzamt)
   - Health insurance (Krankenkasse, OeGK, Swiss insurer)
   - Social security (Rentenversicherung, Sozialversicherung, AHV)
   - Immigration (Auslaenderbehorde) if applies
   - Banks
   - Schools/childcare
   - Vehicle (Kfz-Zulassungsstelle)
   - Other (pet import, license recognition)
3. Order by dep chain from plan
4. Note steps sharing docs → avoid redundant prep

**→** Numbered step list, categorized + ordered, shared-doc notes.

**If err:** Plan incomplete/missing → build from official checklist (DE: make-it-in-germany.com, AT: migration.gv.at, CH: ch.ch/en/moving-switzerland).

### Step 2: Map Required Docs per Step

Each bureau step → every doc authority wants.

1. Municipal reg (Anmeldung/Meldezettel):
   - Passport/ID (all members)
   - Wohnungsgeberbestaetigung / rental contract / deed
   - Marriage cert (if couple)
   - Birth certs (kids)
   - Prev registration (if moving in-country)
2. Tax reg:
   - Meldebestaetigung/Meldezettel
   - Employment contract / biz reg
   - Tax ID from origin (cross-border coord)
   - Marriage cert (DE tax class)
3. Health insurance:
   - Employment contract / self-emp proof
   - Prev insurance / EHIC
   - S1 form (posted workers/cross-border)
   - Meldebestaetigung
4. Social security coord:
   - A1 portable doc (posted workers)
   - E-forms/S-forms for benefits
   - Employment history
   - Origin SS number
5. Bank acct:
   - Passport/ID
   - Meldebestaetigung
   - Income proof (contract/payslips)
   - Tax ID / Steueridentifikationsnummer (DE)
6. Immigration/residence (non-EU):
   - Passport ≥6 months validity
   - Biometric photos (per country format)
   - Employment contract/offer
   - Financial means proof
   - Health insurance
   - Recognized degree (EU Blue Card)
   - Criminal check (may need apostille)
7. Vehicle re-reg:
   - Fahrzeugbrief/Zulassungsbescheinigung Teil II
   - Insurance proof (eVB in DE)
   - TUeV/Pickerl/MFK cert
   - Meldebestaetigung
8. School/childcare:
   - Birth certs
   - Vaccination (Impfpass)
   - Prev school reports + translations
   - Meldebestaetigung

**→** Matrix: step → docs + specs (original req, copy OK, certified translation needed).

**If err:** Reqs unclear → authority site/phone. Reqs change → no 3rd-party guides >12 months old.

### Step 3: Check Current Doc Status

Req docs vs. inventory → find gaps.

1. Each req doc:
   - **Have (original)**: Held + accessible
   - **Have (copy only)**: Copy only → may need order original
   - **Expired**: Exists but validity passed
   - **Missing**: No exist → must obtain
   - **N/A**: Not needed here
2. For "Have (original)":
   - Not damaged/illegible
   - Names match across docs (watch transliteration, maiden, middle)
   - Still valid when used (passports, IDs, insurance)
3. Expired:
   - Renewal time at issuer
   - Temporarily accepted? (mostly no)
   - Cost
4. Missing:
   - Issuer + proc time
   - Supporting docs to obtain (recursive)
   - Cost + payment
   - Remote or in-person?
5. Flag name mismatches (passport maiden vs. marriage cert married) → likely need proof of name change

**→** Status table per doc: status, validity date, issue notes.

**If err:** Status unconfirmable (in storage/elsewhere) → mark "unconfirmed" + treat as missing.

### Step 4: Identify Translation + Apostille Reqs

Which docs need certified translation, apostille, or legalization.

1. Dest country lang:
   - DE: German or certified translation
   - AT: Same as DE; some offices OK w/ English for EU docs
   - CH: Depends on canton (DE/FR/IT/Romansh)
2. Translation-exempt:
   - EU multilingual forms (Reg 2016/1191) for civil status between EU states
   - Passports/IDs
   - EHIC
3. Translation needed:
   - Sworn/certified translator (beeidigter Uebersetzer)
   - Certified in dest country (not origin)
   - Turnaround: 3-10 biz days
   - Cost: 30-80 EUR/page
4. Apostille/legalization:
   - Hague countries: apostille from issuer authority
   - Non-Hague: full legalization chain (notary → foreign ministry → embassy)
   - EU-internal: often exempt, verify per type
   - CH: Hague member, not EU → rules differ
5. Digital/e-apostilles accepted?
6. Some docs need BOTH apostille + translation (apostille itself may need translation)

**→** Translation/legalization matrix per doc: translation y/n, apostille y/n, cost, proc time.

**If err:** Unsure on apostille → contact dest authority directly. Over-prep > under-prep.

### Step 5: Generate Action List

All findings → prioritized deadline-aware list.

1. Merge gaps (missing, expired, translation, apostille) → single list
2. Per item:
   - Doc name
   - Action (obtain/renew/translate/apostille/replace)
   - Authority/provider
   - Proc time
   - Cost
   - Deadline (from timeline)
   - Priority (critical/high/medium/low)
3. Priority:
   - **Critical**: Blocks first bureau step (passport for Anmeldung) or hard deadline
   - **High**: Needed first 2 weeks; long proc
   - **Medium**: First month; reasonable proc
   - **Low**: Eventually, no pressure
4. Order:
   - Critical by longest proc first
   - High by deadline
   - Medium + low
5. Total cost estimate
6. "Doc folder" checklist per appt → exactly which originals/copies/translations to bring

**→** Prioritized list w/ deadlines + costs + proc times + per-appt packing lists.

**If err:** Uncertain proc times → worst-case, start early. Flag expedited options.

## Check

- Every bureau step has ≥1 doc mapped
- No "status unknown" → all have/missing/expired/N/A
- Translation reqs reference dest country official lang
- Apostille reqs verified vs. Hague membership of issuer
- Deadlines align w/ plan-eu-relocation timeline
- Priority consistent (no "low" that blocks "critical")
- Total cost calculated + presented
- Per-appt checklists for ≥ first 3 steps

## Traps

- **Assuming EU docs need no prep**: EU rules simplify but most offices still want translations + apostilles
- **Name mismatches**: Transliteration, maiden/married, middle names → #1 rejection cause
- **Relying on photocopies**: DACH authorities want originals + keep certified copies → bring originals
- **Translations ordered late**: Sworn translators backlog 1-2 weeks, worse Aug-Sep
- **Forgetting apostille on translation**: Some want apostille on original AND separate certified translation of apostilled doc
- **Not checking validity**: Passport w/ 2 months may be rejected if 6 months req
- **Ignoring multilingual EU forms**: Civil status between EU → multilingual forms eliminate translation → must request explicitly
- **Assuming digital docs accepted**: DACH offices want physical; PDF printouts may need extra verification

## →

- [plan-eu-relocation](../plan-eu-relocation/SKILL.md) -- Creates plan feeding this check
- [navigate-dach-bureaucracy](../navigate-dach-bureaucracy/SKILL.md) -- Detailed proc guidance
