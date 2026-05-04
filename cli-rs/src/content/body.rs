use std::collections::HashMap;
use std::path::{Path, PathBuf};

use ratatui::text::Line;

use super::markdown;
use crate::error::Result;

pub struct BodyCache {
    root: Option<PathBuf>,
    cache: HashMap<String, CachedBody>,
}

pub struct CachedBody {
    pub raw: String,
    pub rendered: Vec<Line<'static>>,
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

    pub fn get_skill(&mut self, id: &str, relative_path: &str) -> Option<&CachedBody> {
        let root = self.root.clone()?;
        let key = format!("skill::{id}");
        if !self.cache.contains_key(&key) {
            let path = root.join("skills").join(relative_path);
            if let Ok(loaded) = load_and_render(&path) {
                self.cache.insert(key.clone(), loaded);
            } else {
                return None;
            }
        }
        self.cache.get(&key)
    }
}

fn load_and_render(path: &Path) -> Result<CachedBody> {
    let raw = std::fs::read_to_string(path)?;
    let stripped = strip_frontmatter(&raw);
    let rendered = markdown::render(stripped);
    Ok(CachedBody {
        raw,
        rendered,
    })
}

fn strip_frontmatter(source: &str) -> &str {
    let trimmed = source.trim_start_matches('\u{feff}');
    if !trimmed.starts_with("---") {
        return source;
    }
    let after_first = &trimmed[3..];
    let Some(end_offset) = after_first.find("\n---") else {
        return source;
    };
    let body_start = end_offset + 3 + 4;
    if body_start >= trimmed.len() {
        return "";
    }
    trimmed[body_start..].trim_start_matches('\n')
}
