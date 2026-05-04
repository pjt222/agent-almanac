use agent_almanac_rs::adapters;
use agent_almanac_rs::content::registry;

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
