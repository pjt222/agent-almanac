---
name: plan-eu-relocation
description: >
  Plan a complete EU/DACH relocation timeline with dependency mapping between
  bureaucratic steps, deadline tracking, and country-specific procedure
  identification. Use when planning a move between EU/DACH countries, relocating
  from a non-EU country to an EU/DACH destination, coordinating employment-based
  relocation with employer HR, managing a relocation with tight deadlines, or
  when needing a single document that maps the entire relocation process end-to-end.
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

Create a structured, dependency-aware relocation plan for moving within or to the EU/DACH region, covering bureaucratic steps, deadlines, and country-specific requirements.

## When to Use

- Planning a move from one EU/DACH country to another
- Relocating from a non-EU country to an EU/DACH destination
- Needing to understand which bureaucratic steps depend on which before starting
- Coordinating employment-based relocation with employer HR
- Managing a relocation with tight deadlines (job start date, lease start, school enrollment)
- Wanting a single document that maps the entire relocation process end-to-end

## Inputs

### Required

- **Origin country**: Current country of residence
- **Destination country**: Target country (Germany, Austria, or Switzerland primarily; other EU supported)
- **Nationality/nationalities**: Citizenship(s) held, including EU/non-EU distinction
- **Employment type**: Employed (local contract), posted worker, self-employed, freelance, unemployed, student, or retired
- **Target move date**: Approximate date of physical relocation
- **Household composition**: Single, couple, family with children (ages), pets

### Optional

- **Job start date**: First day of employment in destination country
- **Housing status**: Already secured, searching, employer-provided
- **Current insurance coverage**: Health, liability, household
- **Language proficiency**: Destination country language level (A1-C2 or none)
- **Special circumstances**: Disability, pregnancy, military service obligations, ongoing legal matters, custody arrangements
- **Prior EU registrations**: Previous Anmeldung or equivalent in other EU countries

## Procedure

### Step 1: Assess Situation

Gather all relevant personal, professional, and legal context to determine which bureaucratic tracks apply.

1. Confirm EU vs. non-EU nationality status for all household members
2. Determine if a visa or residence permit is required (non-EU nationals, non-EEA family members)
3. Classify employment type and check if a work permit is needed separately from a residence permit
4. Note any bilateral agreements between origin and destination countries (social security, tax treaties, recognition of qualifications)
5. Identify whether the move is permanent, temporary (under or over 183 days), or cross-border commuting
6. Record all fixed dates: job start, lease start, school year start, notice periods at current residence

**Expected:** A structured profile document containing nationality status, employment classification, move type, and all fixed dates.

**On failure:** If nationality or employment status is ambiguous (e.g., dual nationality with one non-EU, or contractor vs. employee distinction unclear), escalate to a legal advisor or the destination country's embassy before proceeding. Do not guess visa requirements.

### Step 2: Map Dependency Chain

Identify all bureaucratic steps and their prerequisites to establish the correct execution order.

1. List all required registrations for the destination country:
   - Residence registration (Anmeldung / Meldezettel / Anmeldung bei der Gemeinde)
   - Tax registration or number assignment
   - Health insurance enrollment
   - Social security registration
   - Bank account opening
   - Vehicle re-registration (if applicable)
   - School/childcare enrollment (if applicable)
   - Pet import procedures (if applicable)
2. List all deregistration steps for the origin country:
   - Residence deregistration (Abmeldung or equivalent)
   - Tax office notification
   - Insurance cancellations or transfers
   - Utility cancellations
   - Mail forwarding
3. Map dependencies as a directed acyclic graph (DAG):
   - Residence registration typically depends on having a signed lease
   - Tax number depends on residence registration
   - Bank account may depend on residence registration and tax number
   - Health insurance enrollment may depend on employment contract or residence registration
   - Social security coordination depends on employment classification
4. Identify parallel tracks: steps that can proceed simultaneously
5. Mark steps that require in-person appointments vs. those that can be done online or by mail

**Expected:** A dependency graph (textual or visual) showing all steps, their prerequisites, and which can run in parallel.

**On failure:** If dependencies are unclear for a specific country, search for official government sources (e.g., Germany: bmi.bund.de, Austria: oesterreich.gv.at, Switzerland: ch.ch). Do not assume dependencies transfer between countries.

### Step 3: Create Timeline with Deadlines

Convert the dependency graph into a calendar-based timeline aligned with the target move date.

1. Work backwards from the move date and any fixed deadlines (job start, school year)
2. For each step, estimate:
   - Lead time (how early it can be started)
   - Processing time (how long the authority takes)
   - Buffer time (recommended slack for delays)
3. Assign calendar windows to each step:
   - Pre-move actions (can be done from origin country): visa application, insurance research, document preparation
   - Move-week actions: Anmeldung, bank account, SIM card
   - Post-move actions (within legal deadlines): tax registration, vehicle re-registration, deregistration at origin
4. Note statutory deadlines with penalties:
   - Germany: Anmeldung within 14 days of moving in
   - Austria: Meldezettel within 3 days
   - Switzerland: Anmeldung within 14 days (varies by canton)
   - Tax registration deadlines vary
5. Add appointment booking lead times (some Buergeramt offices require 2-6 weeks advance booking)

**Expected:** A week-by-week timeline spanning from 8-12 weeks before the move to 4-8 weeks after, with each bureaucratic step placed in its execution window.

**On failure:** If appointment availability is unpredictable (common in large German cities), build in a 2-week buffer and identify alternative offices or early-morning walk-in options.

### Step 4: Identify Country-Specific Procedures

Tailor the generic plan to the specific destination country's requirements and conventions.

1. For Germany:
   - Buergeramt Anmeldung (requires Wohnungsgeberbestaetigung from landlord)
   - Finanzamt tax ID assignment (Steueridentifikationsnummer arrives by mail in 2-4 weeks)
   - Gesetzliche or private Krankenversicherung enrollment
   - Rentenversicherung coordination
   - Rundfunkbeitrag (GEZ) registration
   - Elterngeld/Kindergeld applications if applicable
2. For Austria:
   - Meldezettel at Meldeamt (within 3 days)
   - Finanzamt registration for Steuernummer
   - e-card for health insurance (through employer or self-registration with OeGK)
   - Sozialversicherung coordination
3. For Switzerland:
   - Einwohnerkontrolle registration (within 14 days, canton-dependent)
   - AHV/IV/EO social insurance registration
   - Mandatory health insurance (Grundversicherung) within 3 months
   - Quellensteuer or regular tax depending on permit type
   - Residence permit (B or L) application through employer or canton
4. Cross-reference each procedure with the documents required (see check-relocation-documents skill)

**Expected:** A country-specific procedure list with exact office names, required forms, and typical processing times.

**On failure:** If destination is a smaller municipality, procedures may differ from the national standard. Check the specific Gemeinde/Kommune website or call their Buergerservice directly.

### Step 5: Flag High-Risk Items

Identify steps where missed deadlines carry financial penalties, legal consequences, or cascading delays.

1. Mark all steps with statutory deadlines (Anmeldung, tax registration, insurance enrollment)
2. Calculate the penalty for missing each deadline:
   - Late Anmeldung in Germany: fine up to 1,000 EUR
   - Late Meldezettel in Austria: fine up to 726 EUR
   - Late health insurance in Switzerland: retroactive premiums plus surcharge
3. Identify bottleneck steps that block multiple downstream actions:
   - No Anmeldung = no tax ID = no proper payroll = no bank account (in some cases)
4. Flag items requiring original documents that are hard to replace if lost (birth certificates, marriage certificates, degree attestations)
5. Note seasonal risks: end-of-year moves conflict with office closures; September moves coincide with school enrollment pressure
6. Identify steps where the origin country has a deadline too (deregistration, tax year coordination, insurance notice periods)

**Expected:** A risk register with each high-risk item, its deadline, penalty, and mitigation strategy.

**On failure:** If penalty amounts or deadlines cannot be confirmed through official sources, mark them as "unconfirmed" and recommend direct inquiry with the relevant authority. Do not invent penalty amounts.

### Step 6: Generate Relocation Plan Document

Compile all findings into a single actionable relocation plan.

1. Structure the document with these sections:
   - Executive summary (move type, key dates, household composition)
   - Dependency graph (visual or textual)
   - Timeline (week-by-week checklist)
   - Country-specific procedures (destination)
   - Deregistration procedures (origin)
   - Risk register (high-priority items highlighted)
   - Document checklist (cross-reference to check-relocation-documents)
   - Contact list (relevant offices, phone numbers, appointment URLs)
2. Format each checklist item with:
   - Status indicator (not started / in progress / done / blocked)
   - Deadline
   - Dependencies
   - Notes or tips
3. Include a "first 48 hours" quick-reference card for the most time-critical steps after arrival
4. Add a "what-if" section for common disruptions: apartment falls through, job start date changes, documents delayed in mail

**Expected:** A complete, structured relocation plan document ready for execution, with all items traceable back to the dependency graph and risk register.

**On failure:** If the plan is too complex for a single document (e.g., multi-country move with dependents requiring separate visa tracks), split into a master timeline and per-person sub-plans.

## Validation

- Every bureaucratic step in the dependency graph has at least one source (official government website, embassy, or legal reference)
- All statutory deadlines are noted with their legal basis
- The timeline accounts for weekends, public holidays, and office closure periods
- No step appears before its dependencies in the timeline
- The risk register covers at minimum: Anmeldung, tax registration, health insurance, and social security
- The document checklist cross-references the check-relocation-documents skill output
- Fixed dates (job start, lease start) are reflected in the timeline without conflicts

## Common Pitfalls

- **Assuming all EU countries have the same procedures**: Registration deadlines, required documents, and office structures vary significantly even within DACH
- **Underestimating appointment lead times**: In Berlin, Hamburg, and Munich, Buergeramt appointments can be booked out 4-6 weeks; plan accordingly or use walk-in slots
- **Forgetting the origin country**: Deregistration, tax notifications, and insurance cancellation periods at the origin are just as important as destination registrations
- **Ignoring the 183-day tax rule**: Spending more than 183 days in a country in a calendar year typically triggers full tax residency; coordinate the move date carefully
- **Not bringing originals**: Many DACH offices require original documents (not copies) and some require certified translations; digital copies are often not accepted
- **Treating Switzerland like an EU country**: Switzerland is not in the EU; different rules apply for residence permits, health insurance, and social security, even for EU nationals
- **Missing the health insurance gap**: Between leaving origin country insurance and enrolling in destination country insurance, there may be an uncovered period; arrange travel or international health insurance to bridge it
- **Overlooking pet regulations**: Pet passports, rabies titers, and breed-specific import rules can add weeks to the timeline

## Related Skills

- [check-relocation-documents](../check-relocation-documents/SKILL.md) -- Verify document completeness for each bureaucratic step
- [navigate-dach-bureaucracy](../navigate-dach-bureaucracy/SKILL.md) -- Detailed guidance for specific DACH governmental procedures
