use agent_almanac_rs::adapters;
use agent_almanac_rs::content::{markdown, registry};
use agent_almanac_rs::search::FuzzyIndex;

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
fn claude_code_adapter_registered() {
    let adapters = adapters::all();
    assert!(adapters.iter().any(|a| a.id() == "claude-code"));
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
    assert!(body.is_some(), "expected to load skill body for {}", first.id);
    let body = body.unwrap();
    assert!(!body.raw.is_empty());
    assert!(!body.rendered.is_empty());
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
