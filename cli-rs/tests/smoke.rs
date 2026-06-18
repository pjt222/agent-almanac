use agent_almanac_rs::adapters;
use agent_almanac_rs::content::{markdown, registry};
use agent_almanac_rs::search::FuzzyIndex;

#[test]
fn cover_screen_emits_truecolor() {
    use agent_almanac_rs::app::{App, Screen};
    use agent_almanac_rs::screens::cover;
    use ratatui::backend::TestBackend;
    use ratatui::style::Color;
    use ratatui::Terminal;

    let mut app = App::new(None, false).expect("app");
    app.screen = Screen::Cover;
    let mut terminal = Terminal::new(TestBackend::new(100, 30)).expect("terminal");
    terminal.draw(|f| cover::draw(f, &app)).expect("draw");

    let rgb_cells = terminal
        .backend()
        .buffer()
        .content
        .iter()
        .filter(|cell| matches!(cell.style().fg, Some(Color::Rgb(..))))
        .count();
    assert!(
        rgb_cells > 0,
        "the firelit cover should paint truecolour cells, found {rgb_cells}"
    );
}

#[test]
fn embedded_registries_parse() {
    let r = registry::load(None).expect("embedded registries should parse");
    assert!(
        r.skills.total() > 0,
        "expected skills.total > 0, got {}",
        r.skills.total()
    );
    assert!(r.agents.total() > 0);
    assert!(r.teams.total() > 0);
    assert!(r.guides.total() > 0);
}

#[test]
fn skills_flat_non_empty() {
    let r = registry::load(None).expect("registries");
    let flat = r.skills.flat();
    assert!(!flat.is_empty());
    assert!(flat.iter().all(|s| !s.id.is_empty()));
}

#[test]
fn agents_teams_guides_flat_non_empty() {
    let r = registry::load(None).expect("registries");
    let agents = r.agents.flat();
    let teams = r.teams.flat();
    let guides = r.guides.flat();
    assert!(!agents.is_empty());
    assert_eq!(
        agents.len(),
        r.agents.total(),
        "agents flat() count vs total"
    );
    assert!(agents
        .iter()
        .all(|a| !a.id.is_empty() && a.path.starts_with("agents/")));
    assert!(!teams.is_empty());
    assert_eq!(teams.len(), r.teams.total(), "teams flat() count vs total");
    assert!(teams
        .iter()
        .all(|t| !t.id.is_empty() && !t.lead.is_empty() && !t.members.is_empty()));
    assert!(!guides.is_empty());
    assert_eq!(
        guides.len(),
        r.guides.total(),
        "guides flat() count vs total"
    );
    assert!(guides
        .iter()
        .all(|g| !g.id.is_empty() && !g.title.is_empty()));
    // r-developer is a stable fixture with five prepared spells.
    let rdev = agents
        .iter()
        .find(|a| a.id == "r-developer")
        .expect("r-developer agent");
    assert_eq!(rdev.core_skills.len(), 5);
    assert!(rdev.core_skills.contains(&"create-r-package".to_string()));
}

#[test]
fn body_cache_loads_agent_team_guide() {
    use agent_almanac_rs::content::body::BodyCache;
    let root = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .expect("repo root");
    let r = registry::load(None).expect("registries");
    let mut cache = BodyCache::new(Some(root));

    let agent = r.agents.flat().into_iter().next().expect("an agent");
    let ab = cache.get_agent(&agent.id, &agent.path).expect("agent body");
    assert!(!ab.raw.is_empty() && !ab.rendered.is_empty());
    assert!(
        ab.front_str("name").is_some(),
        "agent frontmatter should have a name"
    );

    let team = r.teams.flat().into_iter().next().expect("a team");
    let tb = cache.get_team(&team.id, &team.path).expect("team body");
    assert!(!tb.raw.is_empty() && !tb.rendered.is_empty());

    let guide = r.guides.flat().into_iter().next().expect("a guide");
    let gb = cache.get_guide(&guide.id, &guide.path).expect("guide body");
    assert!(!gb.raw.is_empty() && !gb.rendered.is_empty());
}

#[test]
fn adapters_registered() {
    let adapters = adapters::all();
    assert!(adapters.iter().any(|a| a.id() == "claude-code"));
    assert!(adapters.iter().any(|a| a.id() == "hermes"));
    assert!(adapters.iter().any(|a| a.id() == "codex"));
    assert!(adapters.iter().any(|a| a.id() == "pi"));
    assert!(adapters.iter().any(|a| a.id() == "gemini"));
    assert!(adapters.iter().any(|a| a.id() == "opencode"));
    assert!(adapters.iter().any(|a| a.id() == "copilot"));
}

#[test]
fn markdown_render_basic() {
    let lines = markdown::render(
        "# Title\n\nSome **bold** and *italic* text.\n\n- one\n- two\n\n```rust\nfn main() {}\n```\n",
    );
    assert!(!lines.is_empty(), "expected non-empty output");
    let flat: String = lines
        .iter()
        .flat_map(|l| l.spans.iter().map(|s| s.content.as_ref().to_string()))
        .collect::<Vec<_>>()
        .join(" ");
    assert!(flat.contains("Title"));
    assert!(flat.contains("bold"));
    assert!(flat.contains("one"));
    assert!(flat.contains("two"));
    assert!(flat.contains("fn main()"));
}

#[test]
fn markdown_renders_code_blocks_line_by_line_and_tables_aligned() {
    let src = "\
```rust
let a = 1;
let b = 2;
let c = 3;
```

| Level | What |
|-------|------|
| lite  | a    |
| full  | bb   |
";
    let lines = markdown::render(src);
    let text_of = |l: &ratatui::text::Line| -> String {
        l.spans.iter().map(|s| s.content.as_ref()).collect()
    };

    // Each code line is its own rendered line (not one mangled blob with \n).
    let code_lines: Vec<_> = lines
        .iter()
        .map(text_of)
        .filter(|t| t.contains("let "))
        .collect();
    assert_eq!(
        code_lines.len(),
        3,
        "expected 3 distinct code lines: {code_lines:?}"
    );
    assert!(
        lines
            .iter()
            .all(|l| l.spans.iter().all(|s| !s.content.contains('\n'))),
        "no rendered span should still contain a raw newline"
    );

    // The table is laid out with a column separator and a header rule.
    let table_lines: Vec<_> = lines
        .iter()
        .map(text_of)
        .filter(|t| t.contains('│') || t.contains('┼'))
        .collect();
    assert!(
        table_lines
            .iter()
            .any(|t| t.contains("Level") && t.contains("What") && t.contains('│')),
        "header row should use │ separators: {table_lines:?}"
    );
    assert!(
        table_lines.iter().any(|t| t.contains('┼')),
        "expected a ─┼─ rule under the table header: {table_lines:?}"
    );
    // Cells are padded so the separator lines up across rows.
    let body: Vec<_> = table_lines
        .iter()
        .filter(|t| t.contains("lite") || t.contains("full"))
        .collect();
    assert_eq!(body.len(), 2);
    let bar_at = |s: &str| s.char_indices().find(|&(_, c)| c == '│').map(|(i, _)| i);
    assert_eq!(
        bar_at(body[0]),
        bar_at(body[1]),
        "column separators should align"
    );
}

#[test]
fn markdown_fence_band_skips_text_tag() {
    // `text` is the styleguide fallback tag (#272 tagged ~5.8k fences with
    // it); it must not produce a `┌─ text ─` header band, while informative
    // tags keep theirs.
    let lines = markdown::render("```text\nplain stuff\n```\n\n```bash\nls\n```\n");
    let flat: Vec<String> = lines
        .iter()
        .map(|l| l.spans.iter().map(|s| s.content.as_ref()).collect())
        .collect();
    assert!(
        !flat.iter().any(|t| t.contains("┌─ text ─")),
        "no band for the text fallback tag: {flat:?}"
    );
    assert!(
        flat.iter().any(|t| t.contains("┌─ bash ─")),
        "informative tags keep their band: {flat:?}"
    );
    assert!(flat.iter().any(|t| t.contains("plain stuff")));
}

#[test]
fn body_cache_loads_from_root() {
    use agent_almanac_rs::content::body::BodyCache;
    let root = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .expect("repo root");
    let mut cache = BodyCache::new(Some(root));
    let r = registry::load(None).expect("registries");
    let first = r
        .skills
        .flat()
        .into_iter()
        .next()
        .expect("at least one skill");
    let body = cache.get_skill(&first.id, &first.path);
    assert!(
        body.is_some(),
        "expected to load skill body for {}",
        first.id
    );
    let body = body.unwrap();
    assert!(!body.raw.is_empty());
    assert!(!body.rendered.is_empty());
}

#[test]
fn pages_render_all_kinds() {
    use agent_almanac_rs::screens::pages::{render, Ctx};
    use agent_almanac_rs::screens::spellbook::Entry;

    let r = registry::load(None).expect("registries");
    let inherited = ["meditate".to_string(), "heal".to_string()];
    let ctx = Ctx {
        accent: ratatui::style::Color::Reset,
        width: 60,
        inherited_spells: &inherited,
    };

    let skill = Entry::Skill(r.skills.flat().into_iter().next().expect("a skill"));
    let agent = Entry::Agent(r.agents.flat().into_iter().next().expect("an agent"));
    let guide = Entry::Guide(r.guides.flat().into_iter().next().expect("a guide"));
    for e in [&skill, &agent, &guide] {
        assert!(!render(e, None, &ctx).is_empty());
    }

    // The character sheet lists the inherited spells.
    let agent_text: String = render(&agent, None, &ctx)
        .iter()
        .flat_map(|l| l.spans.iter().map(|s| s.content.as_ref().to_string()))
        .collect::<Vec<_>>()
        .join(" ");
    assert!(
        agent_text.contains("meditate") && agent_text.contains("heal"),
        "character sheet should list inherited spells, got: {agent_text}"
    );

    // Every team renders (exercises every coordination pattern + member count
    // through the formation-diagram code) without panicking.
    for t in r.teams.flat() {
        let coordination = t.coordination.clone();
        let lines = render(&Entry::Team(t), None, &ctx);
        assert!(
            lines.len() > 4,
            "team with coordination {coordination:?} produced too few lines"
        );
    }
}

#[test]
fn page_scroll_clamps_to_content() {
    use agent_almanac_rs::app::{App, Screen};
    use agent_almanac_rs::screens::spellbook::{self, Volume};
    use crossterm::event::{KeyCode, KeyModifiers};
    use ratatui::backend::TestBackend;
    use ratatui::Terminal;

    let root = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .expect("repo root");
    let mut app = App::new(Some(root), false).expect("app");
    app.screen = Screen::Spellbook;
    app.spellbook.volume = Volume::Spells;
    let mut term = Terminal::new(TestBackend::new(100, 24)).expect("term");

    // First draw loads the body and records the page viewport.
    term.draw(|f| spellbook::draw(f, &mut app)).expect("draw");
    // Scroll far past the end.
    for _ in 0..500 {
        spellbook::handle_key(&mut app, KeyCode::Char('J'), KeyModifiers::NONE);
    }
    let before = app.spellbook.volumes[0].scroll;
    // The next draw clamps the over-scroll to the rendered content height.
    term.draw(|f| spellbook::draw(f, &mut app)).expect("draw");
    let clamped = app.spellbook.volumes[0].scroll;
    assert!(
        clamped < before,
        "draw should clamp over-scroll: {before} -> {clamped}"
    );
    assert!(
        clamped > 0,
        "a long SKILL.md should still allow scrolling: {clamped}"
    );
    // Scrolling back up works from the clamped position.
    spellbook::handle_key(&mut app, KeyCode::Char('K'), KeyModifiers::NONE);
    assert!(app.spellbook.volumes[0].scroll < clamped);
    // Half-page scroll uses the recorded viewport.
    let here = app.spellbook.volumes[0].scroll;
    spellbook::handle_key(&mut app, KeyCode::Char('u'), KeyModifiers::CONTROL);
    assert!(
        app.spellbook.volumes[0].scroll < here,
        "Ctrl-u should scroll up by a half page"
    );
}

#[test]
fn fuzzy_filter_narrows_skills() {
    let r = registry::load(None).expect("registries");
    let flat = r.skills.flat();
    let mut idx = FuzzyIndex::default();
    let all = idx.filter(&flat, "", |s| &s.id);
    assert_eq!(all.len(), flat.len());
    let scoped = idx.filter(&flat, "git", |s| &s.id);
    assert!(!scoped.is_empty());
    assert!(scoped.len() < flat.len());
}
