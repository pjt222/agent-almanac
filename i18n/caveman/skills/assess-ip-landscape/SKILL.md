---
name: assess-ip-landscape
locale: caveman
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

Map intellectual property landscape for technology area — identify patent clusters, white spaces, key players, freedom-to-operate risks. Produces strategic assessment that informs R&D direction, licensing decisions, IP filing strategy.

## When Use

- Before starting R&D in new technology area (what's already claimed?)
- Evaluating market entry where incumbents have strong patent portfolios
- Preparing for investment due diligence (IP asset assessment)
- Informing patent filing strategy (where to file, what to claim)
- Assessing freedom-to-operate risk for new product or feature
- Monitoring competitor IP activity for strategic positioning

## Inputs

- **Required**: Technology domain or product area to assess
- **Required**: Geographic scope (US, EU, global)
- **Optional**: Specific competitors to focus on
- **Optional**: Own patent portfolio (for gap analysis and FTO)
- **Optional**: Time horizon (last 5 years, last 10 years, all time)
- **Optional**: Classification codes (IPC, CPC) if known

## Steps

### Step 1: Define Search Scope

Establish boundaries of landscape analysis.

1. Define technology domain precisely:
   - Core technology area (e.g., "transformer-based language models" not "AI")
   - Adjacent areas to include (e.g., "attention mechanisms, tokenization, inference optimization")
   - Areas to explicitly exclude (e.g., "computer vision transformers" if focusing on NLP)
2. Identify relevant classification codes:
   - IPC (International Patent Classification) — broad, used worldwide
   - CPC (Cooperative Patent Classification) — more specific, US/EU standard
   - Search WIPO's IPC publication or USPTO's CPC browser
3. Define geographic scope:
   - US (USPTO), EU (EPO), WIPO (PCT), specific national offices
   - Most analyses start with US + EU + PCT for broad coverage
4. Set time window:
   - Recent activity: last 3-5 years (current competitive landscape)
   - Full history: 10-20 years (mature technology areas)
   - Watch for expired patents that open up design space
5. Document scope as **Landscape Charter**

**Got:** Clear, bounded scope that is specific enough to produce actionable results but broad enough to capture relevant competitive landscape. Classification codes identified for systematic search.

**If fail:** Technology domain too broad (thousands of results)? Narrow by adding technical specificity or focusing on specific application area. Too narrow (few results)? Broaden to adjacent technologies. Right scope typically yields 100-1000 patent families.

### Step 2: Harvest Patent Data

Collect patent data within defined scope.

1. Query patent databases using Landscape Charter:
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
4. Deduplicate by patent family (group national filings of same invention)
5. Record total patent family count and source databases

**Got:** Structured dataset of patent families within scope, deduplicated and timestamped. Dataset is foundation for all subsequent analysis.

**If fail:** Database access limited? Google Patents + Lens.org (free) provide good coverage. Query returns too many results (>5000)? Add technical specificity. Too few (<50)? Broaden keywords or add classification codes.

### Step 3: Analyze Landscape

Map patent clusters, key players, trends.

1. **Cluster analysis**: Group patents by sub-technology:
   - Use classification codes or keyword clustering to identify 5-10 sub-areas
   - Count patent families per cluster
   - Identify which clusters growing (recent filing surges) vs. mature (flat or declining)
2. **Key player analysis**: Identify top 10 assignees by:
   - Total patent family count (portfolio breadth)
   - Recent filing rate (last 3 years — current activity)
   - Average citation count (patent quality proxy)
   - Geographic filing breadth (US-only vs. global filings)
3. **Trend analysis**: Chart filing trends over time window:
   - Overall filing volume by year
   - Filing volume by cluster by year
   - New entrants (assignees filing for first time in domain)
4. **Citation network**: Identify most-cited patents (foundational IP):
   - High forward citations = heavily relied upon by subsequent filings
   - These are likely blocking patents or essential prior art
5. Produce **Landscape Map**: clusters, players, trends, key patents

**Got:** Clear picture of who owns what, where activity concentrated, how landscape evolving. Key blocking patents identified. White spaces (areas with few filings) visible.

**If fail:** Dataset too small for meaningful clustering? Combine clusters into broader groups. One assignee dominates (>50% of filings)? Analyze their portfolio as separate sub-landscape.

### Step 4: Identify White Spaces and Risks

Extract strategic insights from landscape.

1. **White space analysis** (opportunities):
   - Technology areas within scope with few or no patent filings
   - Expired patent families where design space has reopened
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
4. Produce **Strategic Assessment**: white spaces, FTO risks, positioning, recommendations

**Got:** Actionable strategic recommendations: where to file, what to avoid, who to watch, what risks need detailed FTO analysis.

**If fail:** FTO risks identified? This screening is preliminary — does NOT replace formal FTO opinion from patent attorney. Flag critical risks for legal review. White spaces seem too good (valuable area with no filings)? Verify search scope didn't accidentally exclude relevant filings.

### Step 5: Document and Recommend

Package landscape assessment for decision-makers.

1. Write **Landscape Report** with sections:
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

**Got:** Complete landscape report that enables strategic IP decisions. Report evidence-based, clearly scoped, actionable.

**If fail:** Report too large? Produce executive summary first and offer detailed sections on request. Executive summary should always stand alone as decision document.

## Validation Checklist

- [ ] Landscape Charter defines scope, classification, geography, time window
- [ ] Patent dataset harvested from multiple databases and deduplicated
- [ ] Clusters identified with filing counts and trend direction
- [ ] Top 10 key players profiled with portfolio metrics
- [ ] White spaces identified and ranked by strategic value
- [ ] FTO risks screened and classified by severity
- [ ] Key blocking patents identified with citation analysis
- [ ] Recommendations specific and actionable
- [ ] Limitations acknowledged (screening vs. formal FTO opinion)
- [ ] Monitoring alerts defined for ongoing landscape tracking

## Pitfalls

- **Too broad a scope**: "AI patents" is not landscape — it's ocean. Be specific about technology and application
- **Single-database reliance**: No single patent database has complete coverage. Use at least two sources
- **Ignoring patent families**: Counting individual filings instead of families inflates numbers. One invention filed in 10 countries is one patent family, not ten
- **Confusing applications with grants**: Pending application is not enforceable right. Distinguish between granted patents and published applications
- **White space misinterpretation**: Empty area might mean "nobody tried" or "everybody tried and failed." Investigate before assuming opportunity
- **Landscape as legal opinion**: This skill produces strategic intelligence, not legal advice. FTO risks flagged here need formal analysis by patent counsel

## See Also

- `search-prior-art` — Detailed prior art search for specific inventions or patent validity challenges
- `screen-trademark` — Trademark conflict screening and distinctiveness analysis for trademark side of IP landscapes
- `file-trademark` — Trademark filing procedures for EUIPO, USPTO, Madrid Protocol
- `security-audit-codebase` — Risk assessment methodology parallels IP risk screening
- `review-research` — Literature review skills apply to prior art analysis
