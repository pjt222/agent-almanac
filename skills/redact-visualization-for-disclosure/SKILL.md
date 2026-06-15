---
name: redact-visualization-for-disclosure
description: >
  Redact rendered visual artifacts — Mermaid diagrams, SVGs, and HTML
  dashboards — before public disclosure, using an ordered longest-first
  mapping table (specific label, then namespace label, then catch-all
  placeholder) that swaps sensitive identifiers for descriptive stand-ins while
  preserving structure, node ids, and teaching value. Covers whole-word
  identifier replacement, node-label-vs-node-id discrimination, re-rendering
  the derived image from the redacted source, and verifying the result through
  the redaction gate. Use when a diagram or dashboard built from internal
  findings must ship to a public mirror without leaking the names behind it.
license: MIT
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: investigation
  complexity: intermediate
  language: multi
  tags: redaction, visualization, mermaid, svg, disclosure, mapping-table
---

# Redact Visualization for Disclosure

A diagram leaks differently than prose: the sensitive names sit in node labels, tooltip text, and embedded `<text>` nodes, while the *shape* of the graph is exactly the generalizable insight worth publishing. This skill redacts the labels and keeps the structure — replacing each internal identifier with a descriptive stand-in through an ordered mapping table, re-rendering the image from the redacted source, and then verifying the output through `enforce-redaction-gate` so nothing slips through.

## When to Use

- Publishing an architecture/flow diagram (Mermaid `.mmd`, rendered `.svg`) built from internal findings
- Shipping an HTML dashboard whose cells/tooltips name internal flags, functions, or endpoints
- Promoting an investigation visualization into a public guide while keeping the named internals private
- Re-deriving a public image after the private source diagram changed (redaction must re-run, not be hand-patched)

## Inputs

- **Required**: The source visual artifact (`.mmd`, `.svg`, `.html`) in the private repo
- **Required**: A mapping table — sensitive identifier → descriptive stand-in — derived from the deny-list shapes (see `enforce-redaction-gate` Step 1)
- **Optional**: The render toolchain (e.g. a Mermaid CLI) to regenerate the image from the redacted source
- **Optional**: A target path in the public mirror for the redacted output

## Procedure

### Step 1: Separate Structure from Labels

Decide, per artifact, what carries the leak and what carries the insight. In every diagram format the *structure* (which node connects to which) is the shareable pattern; the *labels* are the sensitive part.

| Format | Sensitive (redact) | Structural (preserve) |
|---|---|---|
| Mermaid | node labels, edge labels, subgraph titles | node ids, edge directions, layout |
| SVG | `<text>`, `<title>`, `id`/`data-*` attrs | path geometry, viewBox, styles |
| HTML | cell text, tooltips, captions | table shape, headings, layout |

The rule that prevents the most damage: **redact labels, preserve ids.** A Mermaid `A1[acme_widget_gate]` becomes `A1[widget-gate]` — the id `A1` is structural and carries nothing; the label is the leak.

**Expected:** A per-format list of which token positions get rewritten and which are left untouched.

**On failure:** If a node id itself encodes a sensitive name (rare), treat it as a label and remap it consistently across every edge that references it.

### Step 2: Build the Ordered Mapping Table

Map each sensitive identifier to a descriptive stand-in. Order matters: **longest/most-specific first**, so a precise label wins before a namespace label before the catch-all. Otherwise a generic prefix rewrite eats the specific case.

```python
# Ordered tiers. Within each dict, apply longest-key-first.
SPECIFIC = {                       # exact internal name -> descriptive stand-in
    "acme_widget_autoinstall_gate": "[autoinstall-gate]",
    "acme_relay_chain_v1":          "[relay-chain-gate]",
}
NAMESPACE = {                      # family prefix -> namespace label
    "acme_widget_": "[widget-namespace]",
}
FUNCTIONS = {                      # minified identifier (whole-word) -> role name
    r"\bQ3\(\)": "resolveProvider()",
    r"\bAb\b":   "flagResolver",
}
def redact(text):
    for src in sorted(SPECIFIC,  key=len, reverse=True): text = text.replace(src, SPECIFIC[src])
    for src in sorted(NAMESPACE, key=len, reverse=True): text = text.replace(src, NAMESPACE[src])
    for pat, repl in FUNCTIONS.items():                  text = re.sub(pat, repl, text)
    text = re.sub(r"acme_[A-Za-z0-9_]+", "[feature-flag]", text)   # catch-all, last
    text = re.sub(r"\b(\w+(?:\(\))?) \1\b", r"\1", text)           # collapse "name name" pairs
    return text
```

Two non-obvious rules baked in above: **whole-word boundaries** for minified identifiers (so `Ab` does not match inside `Abstract`), and a **collapse pass** that removes adjacent duplicate stand-ins left when an original label paired a name with its minified twin (`scheduleWakeup Y8z` → both map to `scheduleWakeup` → collapse to one).

**Expected:** Every sensitive identifier in the source maps to a descriptive stand-in; the catch-all only ever fires on tokens the specific/namespace tiers missed.

**On failure:** If the catch-all fires often, a real identifier family is unmapped — add a specific or namespace entry rather than relying on the generic placeholder, which erases teaching value.

### Step 3: Apply to the Source, Write to the Public Path

Run the mapping over the source text and write the redacted artifact to the public-mirror path. Never edit the public copy by hand — it must be a pure function of the private source so re-runs are deterministic.

```bash
python3 tools/redact-visualization.py docs/flow.mmd publish/docs/flow.mmd
```

For SVG/HTML, apply the same mapping but scope replacements to text-bearing nodes (parse the DOM rather than regexing the whole file) so you do not rewrite an attribute that happens to contain a matching substring.

**Expected:** The redacted artifact has identical structure to the source and descriptive stand-ins in every label position.

**On failure:** If a diff shows a structural change (a dropped edge, a renamed id), the mapping over-matched — scope it to label positions and re-run.

### Step 4: Re-render the Derived Image

If the artifact has a rendered form (an `.svg`/`.png` generated from the `.mmd`), regenerate it from the *redacted* source. A stale rendered image is the classic leak: the source got redacted, the image did not.

```bash
mmdc -i publish/docs/flow.mmd -o publish/docs/flow.svg
```

**Expected:** The rendered image is regenerated from the redacted source and shows only stand-in labels.

**On failure:** If the render tool is unavailable, do not ship the old image — remove it from the publish set until it can be regenerated, and note the gap.

### Step 5: Verify Through the Redaction Gate

Run `enforce-redaction-gate` over the redacted artifact *and* its rendered image. The transform is not done until the gate exits 0 — including the structure-aware tier, which catches a sensitive token hiding in an SVG `<text>` node that a label-position rewrite missed.

```bash
bash tools/enforce-redaction-gate.sh publish/docs/ || {
  echo "visualization still leaks; extend the mapping table"; exit 1; }
```

**Expected:** The gate exits 0 on both the source and the rendered image.

**On failure:** A gate hit means the mapping table is incomplete — add the missing shape to the mapping (Step 2) and the deny-list, then re-run from Step 3. Do not hand-edit the public file to silence the gate.

## Validation

- [ ] The redacted artifact has byte-identical structure to the source (only labels changed)
- [ ] Node ids/edges are preserved; only labels/text nodes are rewritten
- [ ] The rendered image was regenerated from the redacted source, not carried over
- [ ] The mapping is ordered longest-first; the catch-all only fires on genuinely unmapped tokens
- [ ] `enforce-redaction-gate` exits 0 on both the source and the rendered image
- [ ] The public artifact is a pure function of the private source (re-running is deterministic)

## Common Pitfalls

- **Stale rendered image.** Redacting the `.mmd` but shipping the old `.svg` publishes everything you just removed. Always regenerate.
- **Hand-editing the public copy.** Once the public file diverges from the source mapping, the next re-run either reverts your edit or, worse, re-introduces the leak. Fix the mapping, not the output.
- **Catch-all over-reliance.** Replacing every internal name with `[feature-flag]` strips the teaching value that justified publishing the diagram. Map families to descriptive namespaces.
- **Unscoped substring rewrite.** Regexing the whole SVG/HTML can rewrite an attribute or a path id that merely contains a matching substring. Parse and scope to text nodes.
- **Wrong mapping order.** Applying the namespace tier before the specific tier erases the precise stand-in. Longest/most-specific first, always.
- **Redacting ids that other edges reference.** If you must remap an id, remap it everywhere it is referenced, or the graph breaks.

## Related Skills

- `enforce-redaction-gate` — the verification step every redaction transform ends on; also defines the shape deny-list the mapping table derives from
- `redact-for-public-disclosure` — the methodology umbrella that decides *what* is publishable before this skill decides *how* to scrub the diagram
- `redact-wire-capture` — the sibling transform for network/MITM captures rather than rendered artifacts
- `generate-workflow-diagram` — produces the kind of Mermaid diagram this skill redacts for publication
- `annotate-source-files` — upstream annotation step whose output diagrams may carry internal identifiers into the visual
