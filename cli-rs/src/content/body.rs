//! On-demand loader + renderer for the full markdown body of a skill, agent,
//! team, or guide. Only active when an almanac `--root` was supplied; with the
//! embedded registries alone we have descriptions but not bodies.
//!
//! Each loaded file is split into YAML frontmatter (parsed into a [`Mapping`]
//! so page renderers can read e.g. `version:`) and a markdown body (rendered to
//! ratatui [`Line`]s). Results are cached by a `kind::id` key.

use std::collections::HashMap;
use std::path::{Path, PathBuf};

use ratatui::text::Line;
use serde_yaml::Mapping;

use super::markdown;
use crate::error::Result;

pub struct BodyCache {
    root: Option<PathBuf>,
    cache: HashMap<String, CachedBody>,
}

pub struct CachedBody {
    /// The file as read, including frontmatter.
    pub raw: String,
    /// Parsed YAML frontmatter (empty if the file had none).
    pub frontmatter: Mapping,
    /// The markdown body, rendered to styled lines.
    pub rendered: Vec<Line<'static>>,
}

impl CachedBody {
    /// Convenience: read a scalar string field from the frontmatter.
    pub fn front_str(&self, key: &str) -> Option<&str> {
        self.frontmatter.get(key).and_then(|v| v.as_str())
    }
}

impl BodyCache {
    pub fn new(root: Option<&Path>) -> Self {
        Self {
            root: root.map(Path::to_path_buf),
            cache: HashMap::new(),
        }
    }

    pub fn root(&self) -> Option<&Path> {
        self.root.as_deref()
    }

    /// Skill bodies live under `skills/<relative_path>`.
    pub fn get_skill(&mut self, id: &str, relative_path: &str) -> Option<&CachedBody> {
        let rel = Path::new("skills").join(relative_path);
        self.get_relative(&format!("skill::{id}"), &rel)
    }

    /// Agent / team / guide registry paths already include their subdirectory
    /// (e.g. `agents/r-developer.md`), so they are relative to the root as-is.
    pub fn get_agent(&mut self, id: &str, relative_path: &str) -> Option<&CachedBody> {
        self.get_relative(&format!("agent::{id}"), Path::new(relative_path))
    }

    pub fn get_team(&mut self, id: &str, relative_path: &str) -> Option<&CachedBody> {
        self.get_relative(&format!("team::{id}"), Path::new(relative_path))
    }

    pub fn get_guide(&mut self, id: &str, relative_path: &str) -> Option<&CachedBody> {
        self.get_relative(&format!("guide::{id}"), Path::new(relative_path))
    }

    fn get_relative(&mut self, key: &str, relative: &Path) -> Option<&CachedBody> {
        let root = self.root.clone()?;
        if !self.cache.contains_key(key) {
            let path = root.join(relative);
            match load_and_render(&path) {
                Ok(loaded) => {
                    self.cache.insert(key.to_string(), loaded);
                }
                Err(_) => return None,
            }
        }
        self.cache.get(key)
    }
}

fn load_and_render(path: &Path) -> Result<CachedBody> {
    let raw = std::fs::read_to_string(path)?;
    let (frontmatter_src, body) = split_frontmatter(&raw);
    let frontmatter = frontmatter_src
        .and_then(|src| serde_yaml::from_str::<Mapping>(src).ok())
        .unwrap_or_default();
    let rendered = markdown::render(body);
    Ok(CachedBody {
        raw,
        frontmatter,
        rendered,
    })
}

/// Split a source file into `(frontmatter_yaml, markdown_body)`. The
/// frontmatter is the text between a leading `---` line and the next `---`
/// line; if there is none, `(None, source)` is returned.
fn split_frontmatter(source: &str) -> (Option<&str>, &str) {
    let trimmed = source.trim_start_matches('\u{feff}');
    if !trimmed.starts_with("---") {
        return (None, source);
    }
    let after_first = &trimmed[3..];
    let Some(end_offset) = after_first.find("\n---") else {
        return (None, source);
    };
    let frontmatter = &after_first[..end_offset];
    let body_start = end_offset + 3 + 4; // index in `trimmed`, past "\n---"
    let body = if body_start >= trimmed.len() {
        ""
    } else {
        trimmed[body_start..].trim_start_matches('\n')
    };
    (Some(frontmatter), body)
}
