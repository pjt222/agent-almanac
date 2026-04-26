---
name: plan-eu-relocation
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
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

Build structured, dependency-aware relocation plan for moving within or to EU/DACH region. Cover bureaucratic steps, deadlines, country-specific requirements.

## When Use

- Planning move between EU/DACH countries
- Moving from non-EU country to EU/DACH destination
- Need understand which bureaucratic steps depend on which before start
- Coordinating employment-based relocation with employer HR
- Managing relocation with tight deadlines (job start, lease start, school enrollment)
- Need single document that maps full relocation process end-to-end

## Inputs

### Required

- **Origin country**: Current country of residence
- **Destination country**: Target country (Germany, Austria, Switzerland mainly; other EU supported)
- **Nationality/nationalities**: Citizenship(s) held — EU/non-EU split
- **Employment type**: Employed (local contract), posted worker, self-employed, freelance, unemployed, student, retired
- **Target move date**: Approximate physical relocation date
- **Household composition**: Single, couple, family with children (ages), pets

### Optional

- **Job start date**: First day of employment in destination country
- **Housing status**: Already secured, searching, employer-provided
- **Current insurance coverage**: Health, liability, household
- **Language proficiency**: Destination language level (A1-C2 or none)
- **Special circumstances**: Disability, pregnancy, military service obligations, ongoing legal matters, custody arrangements
- **Prior EU registrations**: Previous Anmeldung or equivalent in other EU countries

## Steps

### Step 1: Assess Situation

Gather personal, professional, legal context. Determine which bureaucratic tracks apply.

1. Confirm EU vs non-EU nationality status for all household members
2. Determine if visa or residence permit needed (non-EU nationals, non-EEA family members)
3. Classify employment type. Check if work permit needed separately from residence permit
4. Note bilateral agreements between origin and destination (social security, tax treaties, recognition of qualifications)
5. Identify if move permanent, temporary (under or over 183 days), or cross-border commuting
6. Record all fixed dates: job start, lease start, school year start, notice periods at current residence

**Got:** Structured profile document — nationality status, employment classification, move type, all fixed dates.

**If fail:** Nationality or employment status ambiguous (e.g. dual nationality with one non-EU, or contractor vs employee unclear)? Escalate to legal advisor or destination embassy before proceeding. Don't guess visa requirements.

### Step 2: Map Dependency Chain

Identify all bureaucratic steps and prerequisites. Establish correct execution order.

1. List all required registrations for destination:
   - Residence registration (Anmeldung / Meldezettel / Anmeldung bei der Gemeinde)
   - Tax registration or number assignment
   - Health insurance enrollment
   - Social security registration
   - Bank account opening
   - Vehicle re-registration (if applicable)
   - School/childcare enrollment (if applicable)
   - Pet import procedures (if applicable)
2. List all deregistration steps for origin:
   - Residence deregistration (Abmeldung or equivalent)
   - Tax office notification
   - Insurance cancellations or transfers
   - Utility cancellations
   - Mail forwarding
3. Map dependencies as directed acyclic graph (DAG):
   - Residence registration depends on signed lease
   - Tax number depends on residence registration
   - Bank account may depend on residence registration and tax number
   - Health insurance enrollment may depend on employment contract or residence registration
   - Social security coordination depends on employment classification
4. Identify parallel tracks: steps that proceed simultaneously
5. Mark steps needing in-person appointments vs online/mail

**Got:** Dependency graph (text or visual) showing all steps, prerequisites, parallel tracks.

**If fail:** Dependencies unclear for specific country? Search official government sources (Germany: bmi.bund.de, Austria: oesterreich.gv.at, Switzerland: ch.ch). Don't assume dependencies transfer between countries.

### Step 3: Build Timeline with Deadlines

Convert dependency graph into calendar timeline aligned with target move date.

1. Work backwards from move date and fixed deadlines (job start, school year)
2. For each step, estimate:
   - Lead time (how early it can start)
   - Processing time (how long authority takes)
   - Buffer time (recommended slack for delays)
3. Assign calendar windows per step:
   - Pre-move actions (from origin country): visa application, insurance research, document prep
   - Move-week actions: Anmeldung, bank account, SIM card
   - Post-move actions (within legal deadlines): tax registration, vehicle re-registration, deregistration at origin
4. Note statutory deadlines with penalties:
   - Germany: Anmeldung within 14 days of moving in
   - Austria: Meldezettel within 3 days
   - Switzerland: Anmeldung within 14 days (varies by canton)
   - Tax registration deadlines vary
5. Add appointment booking lead times (some Buergeramt offices need 2-6 weeks advance)

**Got:** Week-by-week timeline from 8-12 weeks before move to 4-8 weeks after. Each step placed in its execution window.

**If fail:** Appointment availability unpredictable (common in large German cities)? Build 2-week buffer. Identify alternative offices or early-morning walk-in options.

### Step 4: Identify Country-Specific Procedures

Tailor generic plan to destination country's requirements and conventions.

1. For Germany:
   - Buergeramt Anmeldung (needs Wohnungsgeberbestaetigung from landlord)
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
4. Cross-reference each procedure with documents required (see check-relocation-documents skill)

**Got:** Country-specific procedure list with exact office names, required forms, typical processing times.

**If fail:** Destination is smaller municipality? Procedures may differ from national standard. Check specific Gemeinde/Kommune website or call Buergerservice direct.

### Step 5: Flag High-Risk Items

Identify steps where missed deadlines carry financial penalties, legal consequences, cascading delays.

1. Mark all steps with statutory deadlines (Anmeldung, tax registration, insurance enrollment)
2. Compute penalty for missing each deadline:
   - Late Anmeldung in Germany: fine up to 1,000 EUR
   - Late Meldezettel in Austria: fine up to 726 EUR
   - Late health insurance in Switzerland: retroactive premiums plus surcharge
3. Identify bottleneck steps that block multiple downstream actions:
   - No Anmeldung = no tax ID = no proper payroll = no bank account (in some cases)
4. Flag items needing original documents hard to replace if lost (birth certificates, marriage certificates, degree attestations)
5. Note seasonal risks: end-of-year moves conflict with office closures; September moves overlap school enrollment pressure
6. Identify steps where origin country has deadline too (deregistration, tax year coordination, insurance notice periods)

**Got:** Risk register — each high-risk item, deadline, penalty, mitigation strategy.

**If fail:** Penalty amounts or deadlines can't be confirmed via official sources? Mark as "unconfirmed". Recommend direct inquiry with relevant authority. Don't invent penalty amounts.

### Step 6: Generate Relocation Plan Document

Compile all findings into single actionable relocation plan.

1. Structure document with sections:
   - Executive summary (move type, key dates, household composition)
   - Dependency graph (visual or text)
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
3. Include "first 48 hours" quick-reference card for most time-critical steps after arrival
4. Add "what-if" section for common disruptions: apartment falls through, job start date changes, documents delayed in mail

**Got:** Complete, structured relocation plan ready for execution. All items traceable back to dependency graph and risk register.

**If fail:** Plan too complex for single document (e.g. multi-country move with dependents needing separate visa tracks)? Split into master timeline plus per-person sub-plans.

## Checks

- Every bureaucratic step in dependency graph has at least one source (official government website, embassy, legal reference)
- All statutory deadlines noted with legal basis
- Timeline accounts for weekends, public holidays, office closure periods
- No step appears before its dependencies in timeline
- Risk register covers minimum: Anmeldung, tax registration, health insurance, social security
- Document checklist cross-references check-relocation-documents skill output
- Fixed dates (job start, lease start) reflected in timeline without conflicts

## Pitfalls

- **Assume all EU countries have same procedures**: Registration deadlines, required documents, office structures vary significantly even within DACH
- **Underestimate appointment lead times**: In Berlin, Hamburg, Munich, Buergeramt appointments can book out 4-6 weeks. Plan accordingly or use walk-in slots
- **Forget origin country**: Deregistration, tax notifications, insurance cancellation periods at origin are just as important as destination registrations
- **Ignore 183-day tax rule**: Spending more than 183 days in country in calendar year usually triggers full tax residency. Coordinate move date carefully
- **Don't bring originals**: Many DACH offices require original documents (not copies). Some require certified translations. Digital copies often not accepted
- **Treat Switzerland like EU country**: Switzerland is not in EU. Different rules for residence permits, health insurance, social security — even for EU nationals
- **Miss health insurance gap**: Between leaving origin country insurance and enrolling in destination, may be uncovered period. Arrange travel or international health insurance to bridge
- **Overlook pet regulations**: Pet passports, rabies titers, breed-specific import rules can add weeks to timeline

## See Also

- [check-relocation-documents](../check-relocation-documents/SKILL.md) -- Verify document completeness for each bureaucratic step
- [navigate-dach-bureaucracy](../navigate-dach-bureaucracy/SKILL.md) -- Detailed guidance for specific DACH governmental procedures
