---
name: analytical-chemistry
description: Multi-agent analytical chemistry team for spectroscopic and chromatographic analysis with research synthesis
lead: spectroscopist
version: "1.0.0"
author: Philipp Thoss
created: 2026-03-02
updated: 2026-03-02
tags: [analytical-chemistry, spectroscopy, chromatography, method-development, structure-elucidation]
coordination: hub-and-spoke
members:
  - id: spectroscopist
    role: Lead
    responsibilities: Receives requests, plans analytical strategy, performs spectroscopic interpretation, synthesizes all findings into structural or analytical conclusions
  - id: chromatographer
    role: Separation Specialist
    responsibilities: Develops chromatographic methods, interprets chromatograms, troubleshoots separations, validates methods per ICH Q2
  - id: senior-researcher
    role: Research Advisor
    responsibilities: Reviews analytical strategy, evaluates data quality and statistical rigor, provides literature context and methodology critique
---

# Analytical Chemistry Team

A three-agent team combining spectroscopic expertise, chromatographic method development, and research methodology review for comprehensive analytical chemistry workflows. The lead (spectroscopist) orchestrates technique selection and data interpretation, the chromatographer handles separation and method validation, and the senior researcher ensures scientific rigor and proper experimental design.

## Purpose

Analytical chemistry problems frequently span both spectroscopic identification and chromatographic separation. Structure elucidation requires correlated NMR, IR, and MS data; quantitative analysis requires validated chromatographic methods; and both require sound experimental methodology. No single agent covers this full scope.

This team ensures that every analytical workflow considers three dimensions:

- **Spectroscopic interpretation**: functional group identification, molecular connectivity, structural confirmation across multiple techniques
- **Chromatographic performance**: method development, separation optimization, system suitability, ICH Q2 validation
- **Scientific rigor**: experimental design review, statistical validity, literature context, methodology critique

By coordinating these perspectives, the team delivers comprehensive analytical results that are structurally sound, chromatographically validated, and scientifically defensible.

## Team Composition

| Member | Agent | Role | Focus Areas |
|---|---|---|---|
| Lead | `spectroscopist` | Lead | Analysis planning, spectroscopic interpretation, final synthesis |
| Separation | `chromatographer` | Separation Specialist | GC/HPLC method development, chromatogram analysis, method validation |
| Advisor | `senior-researcher` | Research Advisor | Methodology review, statistical evaluation, literature context |

## Coordination Pattern

Hub-and-spoke: the spectroscopist lead distributes tasks, each specialist works independently, and the lead collects and synthesizes all findings.

```
            spectroscopist (Lead)
               /              \
              /                \
    chromatographer       senior-researcher
```

**Flow:**

1. Lead analyzes request and determines scope (identification, quantitation, validation, or mixed)
2. Lead and chromatographer work in parallel on their respective domains
3. Senior researcher reviews approach and data quality
4. Lead synthesizes all findings into a unified analytical report

## Task Decomposition

### Phase 1: Planning (Lead)
The spectroscopist lead examines the request and creates targeted tasks:

- Determine request type: structure elucidation, quantitative analysis, method validation, or troubleshooting
- Assess available data: which spectra and chromatograms are provided or needed
- Create scoped tasks for each specialist based on what the request requires

### Phase 2: Parallel Specialist Work

**spectroscopist** tasks:
- Plan the spectroscopic technique sequence (non-destructive first)
- Interpret each spectrum (NMR, IR, MS, UV-Vis, Raman as applicable)
- Correlate findings across techniques to build structural picture
- Flag ambiguities that require additional experiments

**chromatographer** tasks:
- Develop or evaluate chromatographic separation methods
- Interpret chromatograms for peak identification and system suitability
- Troubleshoot separation problems if present
- Validate methods per ICH Q2 if regulatory context applies

**senior-researcher** tasks:
- Review the analytical strategy for completeness and scientific soundness
- Evaluate statistical aspects of quantitative results (calibration, uncertainty)
- Provide literature context for unusual findings or novel compounds
- Assess whether conclusions are supported by the data

### Phase 3: Synthesis (Lead)
The spectroscopist lead:
- Collects specialist findings into a unified report
- Cross-validates spectroscopic and chromatographic results
- Resolves any conflicts between different data sources
- Produces a final assessment with structure, purity, and confidence levels

## Configuration

Machine-readable configuration block for tooling that auto-creates this team.

<!-- CONFIG:START -->
```yaml
team:
  name: analytical-chemistry
  lead: spectroscopist
  coordination: hub-and-spoke
  members:
    - agent: spectroscopist
      role: Lead
      subagent_type: spectroscopist
    - agent: chromatographer
      role: Separation Specialist
      subagent_type: chromatographer
    - agent: senior-researcher
      role: Research Advisor
      subagent_type: senior-researcher
  tasks:
    - name: plan-analytical-strategy
      assignee: spectroscopist
      description: Determine technique selection, analysis sequence, and success criteria
    - name: interpret-spectra
      assignee: spectroscopist
      description: Interpret all spectroscopic data and correlate findings across techniques
    - name: develop-separation-method
      assignee: chromatographer
      description: Develop or evaluate chromatographic methods and interpret chromatograms
    - name: review-methodology
      assignee: senior-researcher
      description: Review analytical approach, statistical validity, and provide literature context
    - name: synthesize-report
      assignee: spectroscopist
      description: Collect all findings and produce unified analytical report with structural and quantitative conclusions
      blocked_by: [interpret-spectra, develop-separation-method, review-methodology]
```
<!-- CONFIG:END -->

## Usage Scenarios

### Scenario 1: Unknown Compound Identification
A researcher isolates an unknown compound and needs full characterization:

```
User: I isolated a new compound from a natural product extraction. I have HPLC purity data, HRMS, 1H/13C NMR, and IR.
```

The spectroscopist lead plans the interpretation order (MS for formula, IR for functional groups, NMR for connectivity), the chromatographer evaluates the HPLC purity data and recommends additional runs if needed, and the senior researcher assesses whether the characterization data is sufficient for publication. The lead synthesizes everything into a complete structural proposal with confidence assessment.

### Scenario 2: Pharmaceutical Method Development and Validation
A QC lab needs a validated method for a new drug product:

```
User: We need a validated HPLC method for assay and impurity profiling of our new API
```

The chromatographer develops the separation method, the spectroscopist characterizes impurities by LC-MS and UV spectra, and the senior researcher reviews the validation protocol design. The chromatographer then executes ICH Q2 validation while the senior researcher evaluates the statistical treatment of results.

### Scenario 3: Troubleshooting Analytical Discrepancy
Routine testing produces results inconsistent with previous data:

```
User: Our assay results dropped 5% from last month but the reference standard checks out fine
```

The chromatographer investigates system suitability trends and method performance, the spectroscopist checks whether degradation products might be interfering, and the senior researcher evaluates whether the discrepancy is statistically significant and reviews the investigation design.

## Limitations

- Does not replace physical laboratory work -- provides method parameters and data interpretation, not hands-on analysis
- Spectroscopic interpretation quality depends on the quality of input data descriptions
- Method validation follows general ICH Q2 guidance; specific pharmacopeial requirements (USP, EP, JP) may have additional stipulations
- Best suited for small molecule organic chemistry; biomolecule characterization (proteins, antibodies) falls outside core expertise
- Does not perform computational chemistry predictions (DFT-calculated spectra, molecular dynamics)

## See Also

- [spectroscopist](../agents/spectroscopist.md) -- Lead agent with spectroscopic interpretation expertise
- [chromatographer](../agents/chromatographer.md) -- Chromatographic method development and validation specialist
- [senior-researcher](../agents/senior-researcher.md) -- Research methodology and statistical review
- [gxp-compliance-validation](gxp-compliance-validation.md) -- For broader GxP compliance needs beyond method validation
- [interpret-nmr-spectrum](../skills/interpret-nmr-spectrum/SKILL.md) -- NMR interpretation skill
- [develop-hplc-method](../skills/develop-hplc-method/SKILL.md) -- HPLC method development skill
- [validate-analytical-method](../skills/validate-analytical-method/SKILL.md) -- ICH Q2 method validation skill

---

**Author**: Philipp Thoss
**Version**: 1.0.0
**Last Updated**: 2026-03-02
