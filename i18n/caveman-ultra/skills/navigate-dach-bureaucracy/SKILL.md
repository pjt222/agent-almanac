---
name: navigate-dach-bureaucracy
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Step-by-step guidance for DACH-specific governmental procedures including
  Anmeldung, Finanzamt registration, health insurance enrollment, and social
  security coordination. Use after arriving in a DACH country and needing to
  complete mandatory registrations, before a specific appointment to understand
  what to expect, when an initial registration attempt was rejected, when
  transitioning between DACH countries, or when handling registrations for
  dependents alongside your own.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: relocation
  complexity: advanced
  language: natural
  tags: relocation, dach, germany, austria, switzerland, anmeldung, finanzamt
---

# Navigate DACH Bureaucracy

DE/AT/CH gov procs: residence reg, tax, health ins, social sec, extras.

## Use When

- Arrived DACH → mandatory regs
- Pre-appointment prep
- Reg rejected → fix
- DACH-to-DACH transition (e.g., DE→CH)
- HR guidance incomplete
- Dependents (spouse/kids) reg

## In

### Required

- **Country**: DE / AT / CH
- **City/municipality**: procs vary, esp. CH by canton
- **Nationality**: EU/EEA / CH / non-EU → permit reqs
- **Employment**: emp / self-emp / freelance / student / retired / unemp
- **Housing**: signed lease / sublease / ownership

### Optional

- **Relocation plan**: from plan-eu-relocation
- **Doc checklist**: from check-relocation-documents
- **HR contact**: emp-assisted reg
- **Lang level** DE/FR/IT: channels + forms
- **Prev DACH residence**: simplifies
- **Canton (CH)**: required, sets details
- **Appointment date**: tailor prep

## Do

### Step 1: ID applicable procs

Match by country + nat + situation.

1. **DE** standard:
   - Anmeldung @ Buergeramt/Einwohnermeldeamt — mandatory
   - Steueridentifikationsnummer — auto post-Anmeldung
   - Steuerklasse — if married, else auto
   - Krankenversicherung — mandatory
   - Sozialversicherung — via emp or self
   - Rundfunkbeitrag — mandatory per household
   - Bank acct — practically mandatory
2. **AT** standard:
   - Meldezettel @ Meldeamt — mandatory <3 days
   - Anmeldebescheinigung (EU) / Aufenthaltstitel (non-EU) — <4mo
   - Steuernummer @ Finanzamt — emp/self-emp
   - e-card via Sozialversicherung — emp or self
   - GIS — mandatory per household
   - Bank acct
3. **CH** standard:
   - Anmeldung @ Einwohnerkontrolle/Kreisbuero — mandatory <14d
   - Aufenthaltsbewilligung (B/L) — emp or canton
   - AHV-Nummer — auto
   - Krankenversicherung (basic) — mandatory <3mo
   - Quellensteuer / regular tax — by permit + income
   - Bank/PostFinance
   - Serafe — mandatory per household
4. Conditionals:
   - Vehicle: Kfz-Zulassungsstelle / Strassenverkehrsamt
   - Pets: local + vet
   - Family: Kindergeld / Familienbeihilfe / Kinderzulage
   - Freelance: Gewerbeanmeldung / trade
   - Non-EU: Aufenthaltstitel / Niederlassungsbewilligung
5. Make checklist + statutory deadlines.

→ Personalized checklist for country/city/nat/emp + deadlines.

If err: weird combo (self-emp non-EU in CH canton w/ bilateral) → cantonal migration office or Auslaenderbehorde first.

### Step 2: Anmeldung / Meldeamt prep

Foundation step → unlocks rest.

1. **DE (Anmeldung @ Buergeramt)**:
   - Book online (Berlin: service.berlin.de; Munich: muenchen.de/rathaus; else: city site)
   - No slots → walk-in (Buergeramt ohne Termin) or smaller satellites
   - Docs:
     - Passport / national ID (original)
     - Wohnungsgeberbestaetigung (landlord signs)
     - Anmeldeformular (online or office)
     - Marriage cert if spouse (certified DE translation)
     - Birth certs for kids (certified DE translation)
   - At appt:
     - Arrive 10min early w/ originals
     - Clerk → Meldebestaetigung
     - Get extra certified copies (bank, ins, etc.)
     - Steuer-ID mailed in 2-4w
   - Deadline: <14d from move-in (Einzugsdatum, not arrival)

2. **AT (Meldezettel @ Meldeamt)**:
   - No appt mostly; walk in
   - Docs:
     - Passport / national ID (original)
     - Meldezettel form (help.gv.at or office)
     - Landlord (Unterkunftgeber) signs
   - At office:
     - Submit; immediate
     - Stamped Meldebestaetigung
   - Deadline: <3d move-in
   - EU: Anmeldebescheinigung <4mo @ MA 35 (Vienna) or BH (else)

3. **CH (Anmeldung @ Einwohnerkontrolle)**:
   - Check Gemeinde site for hours + appt
   - Docs:
     - Passport (original)
     - Lease / housing proof
     - Emp contract / financial proof
     - Biometric photos (residence permit)
     - Marriage/birth certs if applicable
     - Health ins confirmation if enrolled
   - At office:
     - Reg + Aufenthaltsbewilligung simultaneous
     - EU/EFTA: typically B for emp
     - Confirmation + AHV info
   - Deadline: <14d (varies by canton; some: before work)

→ Reg done, Meldebestaetigung/Meldezettel in hand, tax-ID started.

If err: rejection fixes:
- No Wohnungsgeberbestaetigung → contact landlord; some offices give form on-site (rare)
- Landlord refuses → illegal in DE (§19 BMG); cite, demand; last resort → tell Buergeramt
- No appts → neighbor districts, early walk-in queues, cancellation waitlists
- Name mismatch passport↔lease → bring extra ID + declaration

### Step 3: Tax reg

Tax-ID + (where) tax class / withholding.

1. **DE (Finanzamt / Steuer-ID)**:
   - Post-Anmeldung Steuer-ID auto-mailed 2-4w
   - No arrival → BZSt online/phone
   - Emp: give Steuer-ID for Lohnsteuer
   - Married: visit Finanzamt → Steuerklasse III/V or IV/IV
   - Self-emp: Fragebogen zur steuerlichen Erfassung via ELSTER
   - Timeline: emp emergency Pauschalbesteuerung until ID arrives

2. **AT (Finanzamt / Steuernummer)**:
   - Emp: emp handles via payroll
   - Self-emp: Erklaerung zur Vergabe einer Steuernummer @ Finanzamt
   - Steuernummer ≠ Sozialversicherungsnummer
   - FinanzOnline portal post-reg

3. **CH (Quellensteuer / ordentliche Besteuerung)**:
   - B-permit <CHF 120k → Quellensteuer (withhold @ source)
   - B-permit >CHF 120k or C-permit → ordentliche Besteuerung
   - Emp withholds Quellensteuer auto
   - May file Steuererklaerung (canton+income dep)
   - Self-emp → cantonal Steueramt
   - Cross-border: special rules per bilateral (FR, DE borders)

4. All: notify origin tax authority of departure → avoid double tax.

→ Tax-ID got/started, emp notified, office regs done.

If err: Steuer-ID delayed (DE) + emp blocked → contact Finanzamt/BZSt expedite. Emergency withholding = higher initial deductions, corrected later.

### Step 4: Health ins

Mandatory enrollment.

1. **DE (Krankenversicherung)**:
   - Mandatory day 1
   - GKV (public) or PKV (private)
   - GKV: pick Krankenkasse (TK, AOK, Barmer, DAK); easy w/ contract
   - PKV: only above Versicherungspflichtgrenze (~69,300 EUR/yr 2025) or self-emp/civil
   - Docs: contract, passport, Meldebestaetigung, S1/EHIC if EU
   - eGK in 2-4w; interim immediate
   - Family no income → Familienversicherung free in GKV

2. **AT (Krankenversicherung / e-card)**:
   - Emp: auto via Sozialversicherung
   - Emp registers w/ OeGK (or sim)
   - e-card by mail 2-3w
   - Self-emp → SVS
   - Non-emp EU: must show coverage for Anmeldebescheinigung

3. **CH (obligatorische Krankenversicherung)**:
   - Basic (Grundversicherung/OKP) mandatory all residents
   - 3mo from reg → pick insurer; retroactive coverage
   - Compare @ priminfo.admin.ch
   - Franchise: CHF 300-2,500; higher = lower premium
   - Basic identical by law; only premium + service differ
   - Optional Zusatzversicherung (dental, alt med, private rooms)
   - Docs: residence permit, maybe medical Q for supplementary

4. All: S1 from origin (e.g., posted) → present to dest insurer.

→ Enrollment confirmed, interim docs in hand, card ordered/got.

If err:
- Gap → EHIC origin or short-term intl
- PKV rejection (DE) → GKV cannot reject
- Late (CH) → retroactive premiums + Praemienzuschlag up to 50% for 3y; enroll anyway

### Step 5: Social sec coord

Coord origin↔destination.

1. **Determine system**:
   - EU 883/2004 governs EU/EEA/CH
   - Rule: insured where work (lex loci laboris)
   - Exceptions: posted (A1), multi-state, frontier
   - CH: bilateral

2. **Standard emp dest country**:
   - Auto via emp payroll
   - DE: Renten, Arbeitslosen, Pflege, Krankenversicherung
   - AT: Pensions, Arbeitslosen, Kranken, Unfallversicherung
   - CH: AHV/IV/EO (1st pillar), BVG (2nd pillar), ALV

3. **Posted (origin system)**:
   - Get A1 from origin BEFORE work
   - Show emp + dest authorities
   - A1 valid up to 24mo; extensions exceptional
   - No A1 → dest may require full contributions

4. **Aggregating periods**:
   - Get period statement origin (P1/E205)
   - Counts toward dest pension
   - Each country pays pro-rata

5. **Self-emp**:
   - DE: voluntary Renten or mandatory for some; private alternatives
   - AT: SVS mandatory → pension+health+accident
   - CH: AHV mandatory; BVG voluntary

6. **Cross-border contact**:
   - DE: Deutsche Rentenversicherung (DRV) intl dept
   - AT: Dachverband der Sozialversicherungstraeger
   - CH: Zentrale Ausgleichsstelle (ZAS) Geneva
   - Origin: competent institution

→ Reg confirmed, A1 if needed, prior periods documented.

If err: A1 not got pre-work → retroactive (possible, complicated). Multi-state unclear → Article 16 of 883/2004 formal determination.

### Step 6: Extras

Mandatory + practical for daily life.

1. **Bank acct**:
   - DE: traditional req Meldebestaetigung; online (N26, Vivid) may not
   - AT: similar; Erste, Raiffeisen → Meldezettel
   - CH: PostFinance accessible; traditional → permit
   - All: passport, Meldebestaetigung, contract, tax-ID
   - English-support bank if lang barrier

2. **Broadcasting fee (Rundfunkbeitrag / GIS / Serafe)**:
   - DE: rundfunkbeitrag.de; 18.36 EUR/mo per household; mandatory regardless
   - AT: GIS (gis.at); varies Bundesland; if device
   - CH: Serafe (serafe.ch); per household regardless
   - Auto-triggered by residence reg, but verify

3. **Mobile / internet**:
   - Prepaid SIM: immediate at electronics/super; passport (EU rule)
   - Contract: bank acct + Meldebestaetigung; better rates, 12-24mo
   - Internet: order early, install 2-6w

4. **Driving license**:
   - EU: valid no convert in DE+AT; CH convert <12mo
   - Non-EU: DE 6mo then convert/exam; AT+CH similar varies
   - Convert: theory/practical exam by bilateral
   - @ Fuehrerscheinstelle / Strassenverkehrsamt

5. **Pets**:
   - DE: dogs @ Steueramt (Hundesteuer); rates by city; some breeds restricted
   - AT: dogs @ Magistrat; rules by Bundesland
   - CH: dogs @ cantonal vet; mandatory training course first-time

6. **Church tax (DE + parts CH)**:
   - DE: declared Cath/Prot/Jewish → Kirchensteuer (8-9% of income tax) auto
   - Avoid → Kirchenaustritt @ Amtsgericht/Standesamt (20-35 EUR)
   - AT: collected by church separately

7. **Kindergeld / Familienbeihilfe / Kinderzulage**:
   - DE: Familienkasse (Bundesagentur fuer Arbeit); 250 EUR/kid/mo
   - AT: Finanzamt; varies by age
   - CH: via emp; varies canton (min CHF 200/mo)

→ Extras done/started, confirmations filed, follow-ups dated.

If err: extras not time-critical (except broadcast → backdated). Priority: bank + mobile. Rest <1-3mo.

## Check

- Anmeldung/Meldezettel done in statutory deadline
- Meldebestaetigung in hand
- Tax reg started (DE auto, AT emp, CH canton)
- Health ins confirmed w/ interim docs
- Social sec status clear (dest or A1)
- Mandatory household (broadcast) done/scheduled
- Each step → dated confirmation in dedicated folder
- Rejected/incomplete → follow-up plan w/ next action + date

## Traps

- **No DE appt**: Buergeraemter often appt-only; check + book
- **Miss AT 3-day**: tight; submit move-in day
- **Rushed health ins**: DE Krankenkasse benefits vary; CH premiums vary widely; compare
- **CH Quellensteuer/ordentliche confusion**: affects filing → over/underpay
- **No docs first weeks**: keep originals (passport, Meldebestaetigung, contract, ins) on you 1mo
- **Assume emp does all**: emp = payroll/social/sometimes health; rest = you
- **DE church tax surprise**: declaring religion @ Anmeldung → auto Kirchensteuer 8-9% income tax
- **Late bank acct**: salary, rent debit, ins premium all blocked → open week 1
- **No reference numbers**: every interaction → Aktenzeichen/Geschaeftszahl/Dossiernummer; record now
- **Mix DACH rules**: 3 countries = fundamentally different health systems; not transferable

## →

- [plan-eu-relocation](../plan-eu-relocation/SKILL.md) — overall relocation plan + timeline
- [check-relocation-documents](../check-relocation-documents/SKILL.md) — verify docs ready
