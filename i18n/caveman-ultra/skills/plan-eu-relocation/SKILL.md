---
name: plan-eu-relocation
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Plan EU/DACH relocation timeline w/ dependency mapping between bureaucratic
  steps, deadline tracking, country-specific procedures. Use → move between
  EU/DACH, non-EU → EU/DACH, employment HR coord, tight deadlines, single
  end-to-end doc.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: relocation
  complexity: advanced
  language: natural
  tags: relocation, eu, dach, timeline, dependencies, planning
---

# Plan EU Relocation

Structured, dependency-aware relocation plan for EU/DACH moves → bureaucratic steps, deadlines, country-specific reqs.

## Use When

- Move EU/DACH → EU/DACH
- Non-EU → EU/DACH
- Need step dependencies before start
- Coord employment relocation w/ employer HR
- Tight deadlines (job start, lease, school)
- Want single end-to-end doc

## In

### Required

- **Origin country**: Current residence
- **Destination**: Target (Germany, Austria, Switzerland primary; other EU OK)
- **Nationality**: Citizenship(s), EU/non-EU
- **Employment type**: Employed (local), posted, self-employed, freelance, unemployed, student, retired
- **Move date**: Approx physical move
- **Household**: Single, couple, family w/ kids (ages), pets

### Optional

- **Job start date**: First day in destination
- **Housing**: Secured, searching, employer-provided
- **Insurance**: Health, liability, household
- **Language**: Destination level (A1-C2 or none)
- **Special**: Disability, pregnancy, military, legal matters, custody
- **Prior EU regs**: Previous Anmeldung or equivalent

## Do

### Step 1: Assess Situation

Gather personal, professional, legal context → which bureaucratic tracks apply.

1. EU vs non-EU status, all members
2. Visa or residence permit needed? (non-EU, non-EEA family)
3. Employment type → work permit separate from residence permit?
4. Bilateral agreements (social security, tax treaties, qualification recognition)
5. Move type: permanent, temp (under/over 183 days), cross-border commute
6. Fixed dates: job start, lease start, school year, notice periods

→ Profile doc: nationality, employment, move type, fixed dates.

If err: nationality or employment ambiguous (dual w/ one non-EU, contractor vs employee unclear) → escalate to legal advisor or destination embassy. No guessing visa reqs.

### Step 2: Map Dependency Chain

Bureaucratic steps + prereqs → correct execution order.

1. Destination registrations:
   - Residence reg (Anmeldung / Meldezettel / Anmeldung bei der Gemeinde)
   - Tax reg or number assignment
   - Health insurance enroll
   - Social security reg
   - Bank account
   - Vehicle re-reg (if applicable)
   - School/childcare enroll (if applicable)
   - Pet import (if applicable)
2. Origin deregistration:
   - Residence dereg (Abmeldung or equivalent)
   - Tax office notif
   - Insurance cancel/transfer
   - Utility cancel
   - Mail forward
3. Map deps as DAG:
   - Residence reg → needs signed lease
   - Tax number → needs residence reg
   - Bank account → may need residence reg + tax number
   - Health insurance → may need employment contract or residence reg
   - Social security coord → depends on employment type
4. Find parallel tracks → simultaneous steps
5. Mark in-person vs online/mail steps

→ Dependency graph (textual or visual): all steps, prereqs, parallels.

If err: deps unclear for country → search official sources (Germany: bmi.bund.de, Austria: oesterreich.gv.at, Switzerland: ch.ch). Never assume cross-country transfer.

### Step 3: Create Timeline w/ Deadlines

Dependency graph → calendar timeline aligned w/ move date.

1. Backwards from move date + fixed deadlines (job, school)
2. Per step, estimate:
   - Lead time (earliest start)
   - Processing time (authority duration)
   - Buffer time (slack for delays)
3. Calendar windows:
   - Pre-move (from origin): visa, insurance research, doc prep
   - Move-week: Anmeldung, bank, SIM
   - Post-move (within legal deadlines): tax reg, vehicle re-reg, origin dereg
4. Statutory deadlines + penalties:
   - Germany: Anmeldung within 14 days
   - Austria: Meldezettel within 3 days
   - Switzerland: Anmeldung within 14 days (canton varies)
   - Tax reg deadlines vary
5. Appointment lead times (some Buergeramt → 2-6 weeks advance)

→ Week-by-week timeline 8-12 wks pre-move to 4-8 wks post, each step in its window.

If err: appointment availability unpredictable (big German cities) → 2-week buffer, alt offices or early-morning walk-ins.

### Step 4: Identify Country-Specific Procedures

Tailor generic plan to destination's reqs + conventions.

1. Germany:
   - Buergeramt Anmeldung (needs Wohnungsgeberbestaetigung from landlord)
   - Finanzamt tax ID (Steueridentifikationsnummer by mail in 2-4 wks)
   - Gesetzliche or private Krankenversicherung enroll
   - Rentenversicherung coord
   - Rundfunkbeitrag (GEZ) reg
   - Elterngeld/Kindergeld if applicable
2. Austria:
   - Meldezettel at Meldeamt (within 3 days)
   - Finanzamt → Steuernummer
   - e-card health insurance (employer or self-reg w/ OeGK)
   - Sozialversicherung coord
3. Switzerland:
   - Einwohnerkontrolle reg (within 14 days, canton-dependent)
   - AHV/IV/EO social insurance reg
   - Mandatory health insurance (Grundversicherung) within 3 mo
   - Quellensteuer or regular tax (permit-dependent)
   - Residence permit (B or L) via employer or canton
4. Cross-ref each procedure w/ docs needed (see check-relocation-documents)

→ Country-specific list: exact office names, forms, processing times.

If err: smaller municipality → procedures may differ from national standard. Check Gemeinde/Kommune website or call Buergerservice direct.

### Step 5: Flag High-Risk Items

Steps where missed deadlines → fines, legal consequences, cascading delays.

1. Mark all w/ statutory deadlines (Anmeldung, tax reg, insurance enroll)
2. Penalty per missed deadline:
   - Late Anmeldung Germany: fine up to 1,000 EUR
   - Late Meldezettel Austria: fine up to 726 EUR
   - Late health insurance Switzerland: retroactive premiums + surcharge
3. Bottleneck steps blocking downstream:
   - No Anmeldung = no tax ID = no payroll = no bank account (sometimes)
4. Flag items needing originals hard to replace (birth, marriage, degree)
5. Seasonal risks: end-of-year → office closures; September → school enrollment pressure
6. Origin deadlines (dereg, tax year coord, insurance notice periods)

→ Risk register: each item, deadline, penalty, mitigation.

If err: penalty/deadlines unconfirmable from official sources → mark "unconfirmed", recommend direct inquiry. No invented penalties.

### Step 6: Generate Relocation Plan Doc

Compile findings → single actionable plan.

1. Sections:
   - Exec summary (move type, dates, household)
   - Dependency graph (visual or textual)
   - Timeline (week-by-week checklist)
   - Country-specific procedures (destination)
   - Dereg procedures (origin)
   - Risk register (high-pri highlighted)
   - Doc checklist (cross-ref check-relocation-documents)
   - Contact list (offices, phones, appointment URLs)
2. Per checklist item:
   - Status (not started / in progress / done / blocked)
   - Deadline
   - Deps
   - Notes/tips
3. "First 48 hours" quick-ref card → most time-critical post-arrival
4. "What-if" section: common disruptions (apt falls through, job date changes, mail delays)

→ Complete plan doc ready to execute, all items traceable to graph + risk register.

If err: too complex for single doc (multi-country w/ separate visa tracks per dependent) → master timeline + per-person sub-plans.

## Check

- Every step in graph has source (official site, embassy, legal ref)
- All statutory deadlines noted w/ legal basis
- Timeline accounts for weekends, holidays, closures
- No step before its deps
- Risk register covers min: Anmeldung, tax reg, health insurance, social security
- Doc checklist cross-refs check-relocation-documents
- Fixed dates (job, lease) in timeline w/o conflicts

## Traps

- **Assume all EU same procedures**: Deadlines, docs, office structures vary even within DACH
- **Underestimate appointment leads**: Berlin/Hamburg/Munich Buergeramt → 4-6 wks booking; plan or use walk-ins
- **Forget origin country**: Dereg, tax notifs, insurance cancel periods at origin = as important as destination
- **Ignore 183-day tax rule**: >183 days in country/yr → full tax residency. Coord move date.
- **No originals**: DACH offices need originals (not copies), some need certified translations. Digital often not accepted.
- **Treat Switzerland like EU**: Not in EU. Different rules for residence permits, health, social — even for EU nationals.
- **Health insurance gap**: Between origin cancel + destination enroll → uncovered period. Travel/international insurance to bridge.
- **Overlook pet rules**: Pet passports, rabies titers, breed-specific import → adds weeks.

## →

- [check-relocation-documents](../check-relocation-documents/SKILL.md) — verify doc completeness per step
- [navigate-dach-bureaucracy](../navigate-dach-bureaucracy/SKILL.md) — detailed DACH gov procedures
