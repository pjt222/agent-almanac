---
name: assess-ip-landscape
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Map the intellectual property landscape for a technology domain or product
  area. Covers patent cluster analysis, white space identification, competitor
  IP portfolio assessment, freedom-to-operate preliminary screening, and
  strategic IP positioning recommendations. Use before starting R&D in a new
  technology area, when evaluating market entry against incumbents with strong
  patent portfolios, preparing for investment due diligence, informing a patent
  filing strategy, or assessing freedom-to-operate risk for a new product.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: intellectual-property
  complexity: advanced
  language: natural
  tags: intellectual-property, patents, landscape, fto, trademark, ip-strategy, prior-art
---

# Assess IP Landscape

Map IP landscape for tech domain — ID patent clusters, white spaces, key players, FTO risks. Produces strategic assessment → R&D direction, licensing, IP filing strategy.

## Use When

- Before R&D in new tech area (what's claimed?)
- Market entry vs incumbents w/ strong portfolios
- Investment due diligence (IP asset assessment)
- Inform patent filing strategy (where, what to claim)
- FTO risk for new product/feature
- Monitor competitor IP for strategic positioning

## In

- **Required**: Tech domain/product area
- **Required**: Geographic scope (US, EU, global)
- **Optional**: Specific competitors
- **Optional**: Own patent portfolio (gap analysis + FTO)
- **Optional**: Time horizon (5 years, 10 years, all)
- **Optional**: Classification codes (IPC, CPC)

## Do

### Step 1: Define Search Scope

Establish analysis boundaries.

1. Tech domain precisely:
   - Core (e.g., "transformer-based language models" not "AI")
   - Adjacent (e.g., "attention mechanisms, tokenization, inference optimization")
   - Exclude (e.g., "computer vision transformers" if focusing on NLP)
2. Relevant classification codes:
   - IPC (International Patent Classification) — broad, worldwide
   - CPC (Cooperative Patent Classification) — more specific, US/EU std
   - Search WIPO's IPC publication or USPTO's CPC browser
3. Geographic scope:
   - US (USPTO), EU (EPO), WIPO (PCT), specific national offices
   - Most analyses start US + EU + PCT → broad coverage
4. Time window:
   - Recent: 3-5 years (current competitive)
   - Full history: 10-20 years (mature areas)
   - Watch expired patents opening design space
5. Doc scope as **Landscape Charter**

**→** Clear bounded scope specific enough actionable + broad enough captures competitive. Classification codes ID'd for systematic search.

**If err:** Too broad (thousands of results) → narrow via technical specificity or focus application area. Too narrow (few) → broaden adjacent tech. Right scope typically 100-1000 families.

### Step 2: Harvest Patent Data

Collect data within scope.

1. Query databases via Charter:
   - **Free**: Google Patents, USPTO PatFT/AppFT, Espacenet, WIPO Patentscope
   - **Commercial**: Orbit, PatSnap, Derwent, Lens.org (freemium)
   - Combine keyword + classification codes → best coverage
2. Build queries systematically:

```
Query Construction:
+-------------------+------------------------------------------+
| Component         | Example                                  |
+-------------------+------------------------------------------+
| Core keywords     | "language model" OR "LLM" OR "GPT"       |
| Technical terms   | "attention mechanism" OR "transformer"    |
| Classification    | CPC: G06F40/*, G06N3/08                  |
| Date range        | filed:2019-2024                          |
| Assignee filter   | (optional) specific companies            |
+-------------------+------------------------------------------+
```

3. Download structured (CSV, JSON):
   - Patent/app num, title, abstract, filing date
   - Assignee/applicant, inventor(s)
   - Classification codes, citation data
   - Legal status (granted, pending, expired, abandoned)
4. Dedup by family (group national filings of same invention)
5. Record total family count + src databases

**→** Structured dataset of families within scope, deduped + timestamped. Foundation for all subsequent.

**If err:** DB access limited → Google Patents + Lens.org (free) good coverage. Query returns too many (>5000) → add technical specificity. Too few (<50) → broaden keywords or add classification.

### Step 3: Analyze Landscape

Map clusters, key players, trends.

1. **Cluster analysis**: Group by sub-tech:
   - Classification codes or keyword clustering → 5-10 sub-areas
   - Count families per cluster
   - ID growing (recent surges) vs mature (flat/declining)
2. **Key player analysis**: Top 10 assignees by:
   - Total family count (portfolio breadth)
   - Recent filing rate (last 3 years — current activity)
   - Avg citation count (quality proxy)
   - Geographic breadth (US-only vs global)
3. **Trend analysis**: Filing trends over window:
   - Overall volume by year
   - Volume by cluster by year
   - New entrants (assignees filing 1st time in domain)
4. **Citation network**: Most-cited patents (foundational):
   - High forward citations = heavily relied upon
   - Likely blocking patents or essential prior art
5. Produce **Landscape Map**: clusters, players, trends, key patents

**→** Clear picture: who owns what, where activity concentrated, how landscape evolving. Key blocking patents ID'd. White spaces visible.

**If err:** Dataset too small for meaningful clustering → combine into broader groups. 1 assignee dominates (>50%) → analyze portfolio as separate sub-landscape.

### Step 4: ID White Spaces + Risks

Strategic insights from landscape.

1. **White space analysis** (opportunities):
   - Areas within scope w/ few/no filings
   - Expired families → design space reopened
   - Active areas w/ only 1 player (first-mover but no competition)
   - White spaces adjacent to growing clusters (next frontier)
2. **FTO risk screening** (threats) — adapted from `heal` triage:
   - **Critical**: Granted directly covering planned product/feature
   - **High**: Pending apps likely to grant relevant claims
   - **Medium**: Granted in adjacent areas could be broadly interpreted
   - **Low**: Expired, narrow claims, geographically irrelevant
3. **Competitive positioning**:
   - Where portfolio sits rel to competitors?
   - Which competitors have blocking positions in target areas?
   - Which interested in cross-licensing?
4. Produce **Strategic Assessment**: white spaces, FTO risks, positioning, recs

**→** Actionable strategic recs: where to file, what to avoid, who to watch, what risks need detailed FTO.

**If err:** FTO risks ID'd — preliminary ONLY — does NOT replace formal FTO opinion from patent attorney. Flag critical for legal review. White spaces seem too good → verify search scope not accidentally excluded.

### Step 5: Doc + Recommend

Package assessment for decision-makers.

1. **Landscape Report** sections:
   - Exec summary (1 page: key findings, top risks, main recs)
   - Scope + methodology (search terms, DBs, date range)
   - Landscape overview (clusters, trends, key players + viz)
   - White space analysis (opportunities ranked by strategic value)
   - Risk assessment (FTO concerns ranked by severity)
   - Recs (filing strategy, licensing targets, monitoring alerts)
2. Supporting data:
   - Family list (structured, sortable)
   - Cluster map (visual)
   - Filing trend charts
   - Key patent summaries (top 10-20 most relevant)
3. Ongoing monitoring:
   - Alert queries for new filings in critical areas
   - Review cadence (quarterly active, annually stable)

**→** Complete landscape report → strategic IP decisions. Evidence-based, clearly scoped, actionable.

**If err:** Report too large → exec summary first + offer detailed sections on request. Exec summary always stands alone as decision doc.

## Check

- [ ] Landscape Charter defines scope, classification, geography, time window
- [ ] Patent dataset harvested from multi DBs + deduped
- [ ] Clusters ID'd w/ filing counts + trend direction
- [ ] Top 10 key players profiled w/ portfolio metrics
- [ ] White spaces ID'd + ranked by strategic value
- [ ] FTO risks screened + classified by severity
- [ ] Key blocking patents ID'd w/ citation analysis
- [ ] Recs specific + actionable
- [ ] Limitations acknowledged (screening vs formal FTO opinion)
- [ ] Monitoring alerts defined for ongoing tracking

## Traps

- **Too broad scope**: "AI patents" not landscape — ocean. Be specific about tech + app
- **Single-DB reliance**: No single DB complete coverage. ≥2 srcs
- **Ignore families**: Count individual filings vs families inflates. 1 invention in 10 countries = 1 family not 10
- **Confuse apps w/ grants**: Pending app not enforceable. Distinguish granted vs published apps
- **White space misinterp**: Empty area = "nobody tried" or "everybody tried + failed." Investigate before assuming opportunity
- **Landscape as legal opinion**: Strategic intelligence, not legal advice. FTO risks flagged need formal analysis by patent counsel

## →

- `search-prior-art` — detailed prior art search for specific inventions or patent validity
- `screen-trademark` — trademark conflict screening + distinctiveness analysis for trademark side
- `file-trademark` — trademark filing procedures EUIPO, USPTO, Madrid Protocol
- `security-audit-codebase` — risk assessment methodology parallels IP risk screening
- `review-research` — literature review skills apply to prior art analysis
