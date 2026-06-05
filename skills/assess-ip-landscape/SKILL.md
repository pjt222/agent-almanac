---
name: assess-ip-landscape
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

Map the intellectual property landscape for a technology area — identify patent clusters, white spaces, key players, and freedom-to-operate risks. Produces a strategic assessment that informs R&D direction, licensing decisions, and IP filing strategy.

## When to Use

- Before starting R&D in a new technology area (what's already claimed?)
- Evaluating a market entry where incumbents have strong patent portfolios
- Preparing for investment due diligence (IP asset assessment)
- Informing a patent filing strategy (where to file, what to claim)
- Assessing freedom-to-operate risk for a new product or feature
- Monitoring competitor IP activity for strategic positioning

## Inputs

- **Required**: Technology domain or product area to assess
- **Required**: Geographic scope (US, EU, global)
- **Optional**: Specific competitors to focus on
- **Optional**: Own patent portfolio (for gap analysis and FTO)
- **Optional**: Time horizon (last 5 years, last 10 years, all time)
- **Optional**: Classification codes (IPC, CPC) if known

## Procedure

### Step 1: Define the Search Scope

Establish the boundaries of the landscape analysis.

1. Define the technology domain precisely:
   - Core technology area (e.g., "transformer-based language models" not "AI")
   - Adjacent areas to include (e.g., "attention mechanisms, tokenization, inference optimization")
   - Areas to explicitly exclude (e.g., "computer vision transformers" if focusing on NLP)
2. Identify relevant classification codes:
   - IPC (International Patent Classification) — broad, used worldwide
   - CPC (Cooperative Patent Classification) — more specific, US/EU standard
   - Search WIPO's IPC publication or USPTO's CPC browser
3. Define the geographic scope:
   - US (USPTO), EU (EPO), WIPO (PCT), specific national offices
   - Most analyses start with US + EU + PCT for broad coverage
4. Set the time window:
   - Recent activity: last 3-5 years (current competitive landscape)
   - Full history: 10-20 years (mature technology areas)
   - Watch for expired patents that open up design space
5. Document the scope as the **Landscape Charter**

**Expected:** A clear, bounded scope that is specific enough to produce actionable results but broad enough to capture the relevant competitive landscape. Classification codes identified for systematic search.

**On failure:** If the technology domain is too broad (thousands of results), narrow by adding technical specificity or focusing on a specific application area. If too narrow (few results), broaden to adjacent technologies. The right scope typically yields 100-1000 patent families.

### Step 2: Harvest Patent Data

Collect the patent data within the defined scope.

1. Query patent databases using the Landscape Charter:
   - **Free databases**: Google Patents, USPTO PatFT/AppFT, Espacenet, WIPO Patentscope
   - **Commercial databases**: Orbit, PatSnap, Derwent, Lens.org (freemium)
   - Combine keyword search + classification codes for best coverage
2. Build search queries systematically:

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

3. Download results in structured format (CSV, JSON) including:
   - Patent/application number, title, abstract, filing date
   - Assignee/applicant, inventor(s)
   - Classification codes, citation data
   - Legal status (granted, pending, expired, abandoned)
4. Deduplicate by patent family (group national filings of the same invention)
5. Record the total patent family count and source databases

**Expected:** A structured dataset of patent families within scope, deduplicated and timestamped. The dataset is the foundation for all subsequent analysis.

**On failure:** If database access is limited, Google Patents + Lens.org (free) provide good coverage. If the query returns too many results (>5000), add technical specificity. If too few (<50), broaden keywords or add classification codes.

### Step 3: Analyze the Landscape

Map the patent clusters, key players, and trends.

1. **Cluster analysis**: Group patents by sub-technology:
   - Use classification codes or keyword clustering to identify 5-10 sub-areas
   - Count patent families per cluster
   - Identify which clusters are growing (recent filing surges) vs. mature (flat or declining)
2. **Key player analysis**: Identify the top 10 assignees by:
   - Total patent family count (portfolio breadth)
   - Recent filing rate (last 3 years — current activity)
   - Average citation count (patent quality proxy)
   - Geographic filing breadth (US-only vs. global filings)
3. **Trend analysis**: Chart filing trends over the time window:
   - Overall filing volume by year
   - Filing volume by cluster by year
   - New entrants (assignees filing for the first time in the domain)
4. **Citation network**: Identify the most-cited patents (foundational IP):
   - High forward citations = heavily relied upon by subsequent filings
   - These are likely blocking patents or essential prior art
5. Produce the **Landscape Map**: clusters, players, trends, and key patents

**Expected:** A clear picture of who owns what, where the activity is concentrated, and how the landscape is evolving. Key blocking patents identified. White spaces (areas with few filings) visible.

**On failure:** If the dataset is too small for meaningful clustering, combine clusters into broader groups. If one assignee dominates (>50% of filings), analyze their portfolio as a separate sub-landscape.

### Step 4: Identify White Spaces and Risks

Extract strategic insights from the landscape.

1. **White space analysis** (opportunities):
   - Technology areas within scope with few or no patent filings
   - Expired patent families where the design space has reopened
   - Active areas where only one player has filed (first-mover but no competition)
   - White spaces adjacent to growing clusters (next frontier)
2. **FTO risk screening** (threats) — adapted from `heal` triage matrix:
   - **Critical**: Granted patents directly covering your planned product/feature
   - **High**: Pending applications likely to grant with relevant claims
   - **Medium**: Granted patents in adjacent areas that could be broadly interpreted
   - **Low**: Expired patents, narrow claims, or geographically irrelevant filings
3. **Competitive positioning**:
   - Where does your portfolio (if any) sit relative to competitors?
   - Which competitors have blocking positions in your target areas?
   - Which competitors might be interested in cross-licensing?
4. Produce the **Strategic Assessment**: white spaces, FTO risks, positioning, and recommendations

**Expected:** Actionable strategic recommendations: where to file, what to avoid, who to watch, and what risks need detailed FTO analysis.

**On failure:** If FTO risks are identified, this screening is preliminary — it does NOT replace a formal FTO opinion from a patent attorney. Flag critical risks for legal review. If white spaces seem too good (a valuable area with no filings), verify the search scope didn't accidentally exclude relevant filings.

### Step 5: Document and Recommend

Package the landscape assessment for decision-makers.

1. Write the **Landscape Report** with sections:
   - Executive summary (1 page: key findings, top risks, main recommendations)
   - Scope and methodology (search terms, databases, date range)
   - Landscape overview (clusters, trends, key players with visualizations)
   - White space analysis (opportunities ranked by strategic value)
   - Risk assessment (FTO concerns ranked by severity)
   - Recommendations (filing strategy, licensing targets, monitoring alerts)
2. Include supporting data:
   - Patent family list (structured, sortable)
   - Cluster map (visual)
   - Filing trend charts
   - Key patent summaries (top 10-20 most relevant patents)
3. Set up ongoing monitoring:
   - Define alert queries for new filings in critical areas
   - Set review cadence (quarterly for active areas, annually for stable ones)

**Expected:** A complete landscape report that enables strategic IP decisions. The report is evidence-based, clearly scoped, and actionable.

**On failure:** If the report is too large, produce the executive summary first and offer detailed sections on request. The executive summary should always stand alone as a decision document.

## Validation Checklist

- [ ] Landscape Charter defines scope, classification, geography, and time window
- [ ] Patent dataset harvested from multiple databases and deduplicated
- [ ] Clusters identified with filing counts and trend direction
- [ ] Top 10 key players profiled with portfolio metrics
- [ ] White spaces identified and ranked by strategic value
- [ ] FTO risks screened and classified by severity
- [ ] Key blocking patents identified with citation analysis
- [ ] Recommendations are specific and actionable
- [ ] Limitations acknowledged (screening vs. formal FTO opinion)
- [ ] Monitoring alerts defined for ongoing landscape tracking

## Common Pitfalls

- **Too broad a scope**: "AI patents" is not a landscape — it's an ocean. Be specific about the technology and application
- **Single-database reliance**: No single patent database has complete coverage. Use at least two sources
- **Ignoring patent families**: Counting individual filings instead of families inflates the numbers. One invention filed in 10 countries is one patent family, not ten
- **Confusing applications with grants**: A pending application is not an enforceable right. Distinguish between granted patents and published applications
- **White space misinterpretation**: An empty area might mean "nobody tried" or "everybody tried and failed." Investigate before assuming opportunity
- **Landscape as legal opinion**: This skill produces strategic intelligence, not legal advice. FTO risks flagged here need formal analysis by patent counsel

## Related Skills

- `search-prior-art` — Detailed prior art search for specific inventions or patent validity challenges
- `screen-trademark` — Trademark conflict screening and distinctiveness analysis for the trademark side of IP landscapes
- `file-trademark` — Trademark filing procedures for EUIPO, USPTO, and Madrid Protocol
- `security-audit-codebase` — Risk assessment methodology parallels IP risk screening
- `review-research` — Literature review skills apply to prior art analysis
