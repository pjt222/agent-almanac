//! Content transforms for append-to-file adapters.
//!
//! Most adapters consume `SKILL.md` / agent files verbatim via symlinks. The
//! append-to-file family (Codex, later Copilot and Aider) instead splices a
//! *condensed* section into a shared file (`AGENTS.md`), wrapped in HTML-comment
//! markers so it can be found, replaced, and removed idempotently.
//!
//! Ported from the Node CLI's `cli/lib/transformer.js`. `wrap_as_mdc` lands
//! with the Cursor adapter (it is the only consumer).

use std::path::Path;

use crate::error::Result;

/// Condense an agent definition for append-to-file frameworks: keep the
/// frontmatter and the `Purpose`, `Capabilities`, and `Available Skills`
/// sections; drop everything else. Mirrors `condenseAgent` in transformer.js.
pub fn condense_agent(path: &Path) -> Result<String> {
    let raw = std::fs::read_to_string(path)?;
    let include_sections = ["Purpose", "Capabilities", "Available Skills"];

    let mut result: Vec<&str> = Vec::new();
    let mut in_frontmatter = false;
    let mut frontmatter_count = 0u32;
    let mut include_section = true;

    for line in raw.lines() {
        if line.trim() == "---" {
            frontmatter_count += 1;
            result.push(line);
            in_frontmatter = frontmatter_count == 1;
            continue;
        }
        if in_frontmatter {
            result.push(line);
            continue;
        }
        if let Some(rest) = line.strip_prefix("## ") {
            include_section = include_sections.iter().any(|s| rest.trim().starts_with(s));
            if include_section {
                result.push(line);
            }
            continue;
        }
        if include_section {
            result.push(line);
        }
    }

    while result.last().is_some_and(|l| l.trim().is_empty()) {
        result.pop();
    }
    Ok(result.join("\n"))
}

/// Condense a SKILL.md for append-to-file frameworks: keep frontmatter, `When
/// to Use`, the procedure step headings + `Expected:` blocks, and `Validation`.
/// Drop `On failure:` blocks, `Common Pitfalls`, `Related Skills`, and code
/// blocks longer than 10 lines. Mirrors `condenseSkill` in transformer.js.
pub fn condense_skill(path: &Path) -> Result<String> {
    let raw = std::fs::read_to_string(path)?;

    let mut result: Vec<&str> = Vec::new();
    let mut in_frontmatter = false;
    let mut frontmatter_count = 0u32;
    let mut skip_block = false;
    let mut code_block_depth = 0u32;
    let mut code_block_lines = 0u32;

    for line in raw.lines() {
        if line.trim() == "---" {
            frontmatter_count += 1;
            if frontmatter_count <= 2 {
                result.push(line);
                in_frontmatter = frontmatter_count == 1;
                continue;
            }
        }
        if in_frontmatter {
            result.push(line);
            continue;
        }

        if let Some(rest) = line.strip_prefix("## ") {
            let section = rest.trim();
            skip_block = section == "Common Pitfalls" || section == "Related Skills";
            if !skip_block {
                result.push(line);
            }
            continue;
        }

        if skip_block {
            continue;
        }

        if line.trim_start().starts_with("```") {
            if code_block_depth == 0 {
                code_block_depth = 1;
                code_block_lines = 0;
            } else {
                if code_block_lines <= 10 {
                    result.push(line);
                }
                code_block_depth = 0;
                code_block_lines = 0;
                continue;
            }
        }
        if code_block_depth > 0 {
            code_block_lines += 1;
            if code_block_lines <= 10 {
                result.push(line);
            }
            continue;
        }

        if line.starts_with("**On failure:**") {
            skip_block = true;
            continue;
        }
        if skip_block
            && (line.starts_with("### ")
                || line.starts_with("**Expected:**")
                || line.starts_with("## "))
        {
            skip_block = false;
        }
        if skip_block {
            continue;
        }

        result.push(line);
    }

    while result.last().is_some_and(|l| l.trim().is_empty()) {
        result.pop();
    }
    Ok(result.join("\n"))
}

fn start_marker(content_type: &str, id: &str) -> String {
    format!("<!-- agent-almanac:start:{content_type}:{id} -->")
}

fn end_marker(content_type: &str, id: &str) -> String {
    format!("<!-- agent-almanac:end:{content_type}:{id} -->")
}

/// Wrap condensed content in start/end marker comments for idempotent splicing.
pub fn wrap_in_markers(content_type: &str, id: &str, content: &str) -> String {
    format!(
        "{}\n{}\n{}",
        start_marker(content_type, id),
        content,
        end_marker(content_type, id)
    )
}

/// Whether `file_content` already contains a marked section for this item.
pub fn has_marked_section(file_content: &str, content_type: &str, id: &str) -> bool {
    file_content.contains(&start_marker(content_type, id))
}

/// Remove a marked section (markers included) from `file_content`. Returns the
/// content unchanged if either marker is absent.
pub fn remove_marked_section(file_content: &str, content_type: &str, id: &str) -> String {
    let start = start_marker(content_type, id);
    let end = end_marker(content_type, id);

    let Some(start_idx) = file_content.find(&start) else {
        return file_content.to_string();
    };
    let Some(end_idx) = file_content.find(&end) else {
        return file_content.to_string();
    };

    let before = file_content[..start_idx].trim_end();
    let after = file_content[end_idx + end.len()..].trim_start();
    if after.is_empty() {
        format!("{before}\n")
    } else {
        format!("{before}\n\n{after}")
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn markers_round_trip() {
        let section = wrap_in_markers("agent", "demo", "body text");
        let doc = format!("# AGENTS\n\n{section}\n");
        assert!(has_marked_section(&doc, "agent", "demo"));
        let stripped = remove_marked_section(&doc, "agent", "demo");
        assert!(!has_marked_section(&stripped, "agent", "demo"));
        assert!(stripped.starts_with("# AGENTS"));
    }

    #[test]
    fn remove_is_a_noop_when_absent() {
        let doc = "# AGENTS\n";
        assert_eq!(remove_marked_section(doc, "agent", "missing"), doc);
    }
}
