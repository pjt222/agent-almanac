pub mod base;
pub mod claude_code;

use std::path::Path;

use base::FrameworkAdapter;

use crate::error::Result;

pub fn all() -> Vec<Box<dyn FrameworkAdapter>> {
    vec![Box::new(claude_code::ClaudeCode)]
}

pub fn detect_all(project_dir: &Path) -> Result<Vec<&'static str>> {
    let mut found = Vec::new();
    for adapter in all() {
        if adapter.detect(project_dir)? {
            found.push(adapter.id());
        }
    }
    Ok(found)
}
