//! Right-page renderers — one layout per kind of catalogue entry.
//!
//! Skill → a *spell page* (the rendered SKILL.md, lightly framed).
//! Agent → a *character sheet* (prepared spells, provenance, lore, then body).
//! Team  → a *party roster* (members, a formation diagram, charter, then body).
//! Guide → a *tome page* (category, cross-references, then body).
//!
//! The themed chrome (headers, rules, labels, the formation art) is grimoire
//! voice; the entry's actual content — section headings and body text from the
//! markdown — is rendered verbatim by [`crate::content::markdown`].

use ratatui::style::{Color, Modifier, Style};
use ratatui::text::{Line, Span};
use serde_yaml::Value;

use crate::content::body::CachedBody;
use crate::content::registry::{AgentSummary, GuideSummary, SkillSummary, TeamSummary};
use crate::screens::spellbook::Entry;
use crate::theme;

/// Everything the renderers need besides the entry itself.
pub struct Ctx<'a> {
    /// The active volume's accent colour (used for headers and rules).
    pub accent: Color,
    /// Inner width of the page area, in columns.
    pub width: u16,
    /// Skills every agent inherits implicitly (the registry's `default_skills`).
    pub inherited_spells: &'a [String],
}

/// Render the open page for `entry`. `body` is the loaded markdown (only
/// available when an almanac `--root` was supplied).
pub fn render(entry: &Entry, body: Option<&CachedBody>, ctx: &Ctx<'_>) -> Vec<Line<'static>> {
    match entry {
        Entry::Skill(s) => spell_page(s, body, ctx),
        Entry::Agent(a) => character_sheet(a, body, ctx),
        Entry::Team(t) => party_roster(t, body, ctx),
        Entry::Guide(g) => tome_page(g, body, ctx),
    }
}

// ── shared building blocks ───────────────────────────────────────────────────

fn blank() -> Line<'static> {
    Line::default()
}

/// `Kind · subtitle` — the page's headline, in the volume accent.
fn headline(kind: &str, subtitle: &str, ctx: &Ctx<'_>) -> Line<'static> {
    Line::from(Span::styled(
        format!("{kind} · {subtitle}"),
        Style::default().fg(ctx.accent).add_modifier(Modifier::BOLD),
    ))
}

/// A dim line (used for tag lists, captions, the "sealed" hint).
fn dim_line(text: impl Into<String>) -> Line<'static> {
    Line::from(Span::styled(text.into(), theme::dim_text()))
}

/// `─ Title ───────────────` filling the page width, in the volume accent.
fn rule(title: &str, ctx: &Ctx<'_>) -> Line<'static> {
    let head = format!("─ {title} ");
    let used = head.chars().count();
    let fill = (ctx.width as usize).saturating_sub(used).min(72);
    Line::from(Span::styled(
        format!("{head}{}", "─".repeat(fill)),
        Style::default().fg(ctx.accent).add_modifier(Modifier::BOLD),
    ))
}

/// `key      value` — a labelled field, dim key + body value.
fn field(key: &str, value: impl Into<String>) -> Line<'static> {
    Line::from(vec![
        Span::styled(format!("{key:<9}"), theme::dim_text()),
        Span::styled(value.into(), theme::body()),
    ])
}

/// `  ▸ text` — an indented bullet with an accent marker.
fn bullet(text: impl Into<String>, ctx: &Ctx<'_>) -> Line<'static> {
    Line::from(vec![
        Span::styled("  ▸ ", Style::default().fg(ctx.accent)),
        Span::styled(text.into(), theme::body()),
    ])
}

/// The full markdown body if loaded, otherwise the description plus a hint that
/// the page is "sealed" without `--root`.
fn body_or_seal(description: &str, body: Option<&CachedBody>) -> Vec<Line<'static>> {
    match body {
        Some(b) => {
            let mut out = vec![blank()];
            out.extend(b.rendered.iter().cloned());
            out
        }
        None => vec![
            blank(),
            Line::from(Span::styled(description.to_string(), theme::body())),
            blank(),
            dim_line("— the full page is sealed; pass --root <agent-almanac> to break the wax —"),
        ],
    }
}

/// A non-empty scalar string from the body's frontmatter, if present.
fn front<'b>(body: Option<&'b CachedBody>, key: &str) -> Option<&'b str> {
    body.and_then(|b| b.front_str(key))
        .filter(|s| !s.is_empty())
}

fn join_dot(items: &[String]) -> String {
    items.join(" · ")
}

// ── spell page (skill) ───────────────────────────────────────────────────────

fn spell_page(s: &SkillSummary, body: Option<&CachedBody>, ctx: &Ctx<'_>) -> Vec<Line<'static>> {
    let mut out = vec![
        headline("Spell", &format!("School of {}", s.domain), ctx),
        dim_line(format!("skills/{}", s.path)),
    ];
    out.extend(body_or_seal(&s.description, body));
    out
}

// ── character sheet (agent) ──────────────────────────────────────────────────

fn character_sheet(
    a: &AgentSummary,
    body: Option<&CachedBody>,
    ctx: &Ctx<'_>,
) -> Vec<Line<'static>> {
    let subtitle = if a.priority.is_empty() {
        "companion".to_string()
    } else {
        format!("{} priority", a.priority)
    };
    let mut out = vec![headline("Companion", &subtitle, ctx)];
    if !a.tags.is_empty() {
        out.push(dim_line(join_dot(&a.tags)));
    }

    out.push(blank());
    out.push(rule("Prepared Spells", ctx));
    if a.core_skills.is_empty() {
        out.push(dim_line("  (none listed)"));
    } else {
        for skill in &a.core_skills {
            out.push(bullet(skill.clone(), ctx));
        }
    }
    if !ctx.inherited_spells.is_empty() {
        out.push(dim_line(format!(
            "  every companion also prepares {}",
            join_dot(ctx.inherited_spells)
        )));
    }

    let provenance: Vec<(&str, &str)> = [
        ("patron", front(body, "author")),
        ("model", front(body, "model")),
        ("level", front(body, "version")),
    ]
    .into_iter()
    .filter_map(|(k, v)| v.map(|v| (k, v)))
    .collect();
    if !provenance.is_empty() {
        out.push(blank());
        out.push(rule("Provenance", ctx));
        for (k, v) in provenance {
            out.push(field(k, v));
        }
    }

    out.push(blank());
    out.push(rule("Lore", ctx));
    out.extend(body_or_seal(&a.description, body));
    out
}

// ── party roster (team) ──────────────────────────────────────────────────────

fn party_roster(t: &TeamSummary, body: Option<&CachedBody>, ctx: &Ctx<'_>) -> Vec<Line<'static>> {
    let coordination = if t.coordination.is_empty() {
        "—".to_string()
    } else {
        t.coordination.clone()
    };
    let mut out = vec![headline(
        "Fellowship",
        &format!("{coordination} formation"),
        ctx,
    )];
    if !t.tags.is_empty() {
        out.push(dim_line(join_dot(&t.tags)));
    }

    let roles = team_member_roles(body);
    out.push(blank());
    out.push(rule("Members", ctx));
    if t.members.is_empty() {
        out.push(dim_line("  (none listed)"));
    } else {
        for (i, member) in t.members.iter().enumerate() {
            let mut label = format!("{} · {member}", i + 1);
            if member == &t.lead {
                label.push_str("  (lead)");
            }
            if let Some((_, role)) = roles.iter().find(|(id, _)| id == member) {
                if !role.is_empty() && role != "Lead" {
                    label.push_str(&format!("  — {role}"));
                }
            }
            out.push(bullet(label, ctx));
        }
    }

    out.push(blank());
    out.push(rule(&format!("Formation: {coordination}"), ctx));
    let (diagram, caption) = formation(&t.coordination, t.members.len());
    out.extend(diagram);
    if !caption.is_empty() {
        out.push(dim_line(format!("  {caption}")));
    }

    out.push(blank());
    out.push(rule("Charter", ctx));
    out.extend(body_or_seal(&t.description, body));
    out
}

/// Pull `[(id, role), …]` from a team file's frontmatter `members:` list (which
/// is richer than the registry's flat `members: [id, …]`).
fn team_member_roles(body: Option<&CachedBody>) -> Vec<(String, String)> {
    let Some(members) = body
        .and_then(|b| b.frontmatter.get("members"))
        .and_then(Value::as_sequence)
    else {
        return Vec::new();
    };
    members
        .iter()
        .filter_map(|m| {
            let map = m.as_mapping()?;
            let id = map.get("id").and_then(Value::as_str)?.to_string();
            let role = map
                .get("role")
                .and_then(Value::as_str)
                .unwrap_or_default()
                .to_string();
            Some((id, role))
        })
        .collect()
}

/// A small box-drawn motif for a coordination pattern, plus a one-line caption.
/// Node markers `(k)` index into the Members list shown above the diagram.
fn formation(coordination: &str, n: usize) -> (Vec<Line<'static>>, &'static str) {
    let n = n.max(1);
    let node = |k: usize| format!("({k})");
    let chain = |sep: &str| (1..=n).map(node).collect::<Vec<_>>().join(sep);
    let wrap = |rows: Vec<String>| -> Vec<Line<'static>> {
        rows.into_iter()
            .map(|r| Line::from(Span::styled(format!("  {r}"), theme::body())))
            .collect()
    };

    match coordination {
        "hub-and-spoke" if n >= 2 => {
            // (1) is the hub; (2..=n) hang below it off a ┌──┴──┐ bracket.
            let spokes: Vec<String> = (2..=n).map(node).collect();
            let row = spokes.join("  ");
            let span = row.chars().count(); // also the bracket's width
                                            // ┌ + L'─' + ┴ + R'─' + ┐  ==  span ; centre the ┴.
            let dashes = span.saturating_sub(3);
            let left = dashes / 2;
            let right = dashes - left;
            let bracket = format!("┌{}┴{}┐", "─".repeat(left), "─".repeat(right));
            let hub_pad = (1 + left).saturating_sub(1); // (1) centred over ┴
            (
                wrap(vec![
                    format!("{}{}", " ".repeat(hub_pad), node(1)),
                    format!("{}│", " ".repeat(1 + left)),
                    bracket,
                    row,
                ]),
                "the lead distributes work; members report back to it",
            )
        }
        "sequential" => (
            wrap(vec![chain(" → ")]),
            "each member's output feeds the next",
        ),
        "parallel" => {
            let cells: Vec<String> = (1..=n).map(node).collect();
            (
                wrap(vec![
                    cells.iter().map(|_| "┌───┐").collect::<Vec<_>>().join(" "),
                    cells
                        .iter()
                        .map(|c| format!("│{c}│"))
                        .collect::<Vec<_>>()
                        .join(" "),
                    cells.iter().map(|_| "└───┘").collect::<Vec<_>>().join(" "),
                ]),
                "members work simultaneously and independently",
            )
        }
        "wave-parallel" => (
            wrap(vec![format!("{}   ↻", chain(" "))]),
            "members advance together, wave after wave",
        ),
        "synoptic" => (
            wrap(vec![
                chain("  "),
                "  ╲   ╲  ╱   ╱".to_string(),
                "   [ shared field ]".to_string(),
            ]),
            "all members hold the whole field at once",
        ),
        "timeboxed" => (
            wrap(vec![
                format!("{} ─┐", chain(" → ")),
                " ↑           │".to_string(),
                " └───────────┘".to_string(),
            ]),
            "fixed-length sprints; the cycle repeats",
        ),
        "round-robin" => (
            wrap(vec![format!("{} → {}", chain(" → "), node(1))]),
            "the lead rotates each round",
        ),
        "reciprocal" => (
            wrap(vec![format!("{} ⇄ {}", node(1), node(2.min(n)))]),
            "the two trade roles back and forth",
        ),
        "adaptive" => (
            wrap(vec![format!("{{ {} }}", chain(" · "))]),
            "members self-organize into whatever roles the work needs",
        ),
        _ => (wrap(vec![chain(" · ")]), ""),
    }
}

// ── tome page (guide) ────────────────────────────────────────────────────────

fn tome_page(g: &GuideSummary, body: Option<&CachedBody>, ctx: &Ctx<'_>) -> Vec<Line<'static>> {
    let subtitle = if g.category.is_empty() {
        "tome".to_string()
    } else {
        format!("{} tome", g.category)
    };
    let mut out = vec![headline("Tome", &subtitle, ctx)];

    let refs: [(&str, &[String]); 3] = [
        ("agents", &g.agents),
        ("teams", &g.teams),
        ("skills", &g.skills),
    ];
    if refs.iter().any(|(_, v)| !v.is_empty()) {
        out.push(blank());
        out.push(rule("Cross-References", ctx));
        for (label, items) in refs {
            if !items.is_empty() {
                out.push(field(label, join_dot(items)));
            }
        }
    }

    out.push(blank());
    out.push(rule("Contents", ctx));
    out.extend(body_or_seal(&g.description, body));
    out
}
