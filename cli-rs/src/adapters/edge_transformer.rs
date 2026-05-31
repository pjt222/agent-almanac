//! Aggressive content distillation for edge LLMs (Google AI Edge Gallery and
//! similar on-device runtimes with 2K–8K token windows).
//!
//! Mirrors `cli/lib/edge-transformer.js`. Each `distill_*` reduces an almanac
//! file to ~20–40 lines of instruction-following text:
//! - **skill** → name + description + procedure step titles + validation list
//! - **agent** → name + description + first Purpose line + skill list
//! - **team** → name + description + member roles
//!
//! `bundle_for_edge` concatenates distilled items into a single system-prompt
//! fragment, approximating a token budget at 4 characters per token.

use std::path::Path;

use crate::error::Result;

/// Distill a SKILL.md into a compact instruction-following block.
pub fn distill_skill(path: &Path) -> Result<String> {
    let raw = std::fs::read_to_string(path)?;
    let mut name = String::new();
    let mut description = String::new();
    let mut steps: Vec<String> = Vec::new();
    let mut validation: Vec<String> = Vec::new();

    let mut in_frontmatter = false;
    let mut frontmatter_count = 0u32;
    let mut in_code_block = false;
    let mut in_validation = false;
    let mut in_description = false;

    for line in raw.lines() {
        if line.trim() == "---" {
            frontmatter_count += 1;
            in_frontmatter = frontmatter_count == 1;
            continue;
        }
        if in_frontmatter {
            if let Some(rest) = line.strip_prefix("name:") {
                name = rest.trim().to_string();
                in_description = false;
            } else if let Some(rest) = line.strip_prefix("description:") {
                let rest = rest.trim_start();
                // Block-scalar markers `>` or `|` start a multiline value.
                let rest = rest.strip_prefix('>').unwrap_or(rest);
                let rest = rest.strip_prefix('|').unwrap_or(rest);
                let rest = rest.trim();
                if rest.is_empty() {
                    in_description = true;
                    description.clear();
                } else {
                    description = rest.to_string();
                    in_description = false;
                }
            } else if in_description && line.starts_with(|c: char| c.is_whitespace()) {
                if !description.is_empty() {
                    description.push(' ');
                }
                description.push_str(line.trim());
            } else if in_description {
                in_description = false;
            }
            continue;
        }

        if line.trim_start().starts_with("```") {
            in_code_block = !in_code_block;
            continue;
        }
        if in_code_block {
            continue;
        }

        if let Some(rest) = line.strip_prefix("## ") {
            in_validation = rest.trim() == "Validation";
            continue;
        }

        if let Some(rest) = line.strip_prefix("### Step ") {
            // Strip "<N>: " prefix to get the step title.
            let after_n = rest.split_once(':').map(|(_, t)| t).unwrap_or(rest);
            steps.push(after_n.trim().to_string());
            continue;
        }

        if in_validation {
            let trimmed = line.trim_start();
            if let Some(rest) = trimmed.strip_prefix("- [") {
                // `- [ ]` or `- [x]` checkbox item.
                if let Some(after) = rest.strip_prefix(' ').or_else(|| rest.strip_prefix('x')) {
                    if let Some(text) = after.strip_prefix("] ").or_else(|| after.strip_prefix("]"))
                    {
                        validation.push(text.trim().to_string());
                    }
                }
            }
        }
    }

    let mut output: Vec<String> = Vec::new();
    output.push(format!("# {name}"));
    if !description.is_empty() {
        output.push(String::new());
        output.push(description);
    }
    if !steps.is_empty() {
        output.push(String::new());
        output.push("## Steps".to_string());
        for (i, step) in steps.iter().enumerate() {
            output.push(format!("{}. {}", i + 1, step));
        }
    }
    if !validation.is_empty() {
        output.push(String::new());
        output.push("## Verify".to_string());
        for v in &validation {
            output.push(format!("- {v}"));
        }
    }
    Ok(output.join("\n"))
}

/// Distill an agent definition into name + description + first Purpose line +
/// skills list.
pub fn distill_agent(path: &Path) -> Result<String> {
    let raw = std::fs::read_to_string(path)?;
    let mut name = String::new();
    let mut description = String::new();
    let mut purpose = String::new();
    let mut skills: Vec<String> = Vec::new();

    let mut in_frontmatter = false;
    let mut frontmatter_count = 0u32;
    let mut current_section = String::new();
    let mut captured_purpose = false;
    let mut in_skills_list = false;

    for line in raw.lines() {
        if line.trim() == "---" {
            frontmatter_count += 1;
            in_frontmatter = frontmatter_count == 1;
            continue;
        }
        if in_frontmatter {
            if let Some(rest) = line.strip_prefix("name:") {
                name = rest.trim().to_string();
            } else if let Some(rest) = line.strip_prefix("description:") {
                let v = rest.trim();
                if !v.is_empty() {
                    description = v.to_string();
                }
            } else if line.starts_with("skills:") {
                in_skills_list = true;
            } else if in_skills_list {
                // Inside the skills list, lines look like `  - skill-id`.
                let trimmed = line.trim_start();
                if let Some(rest) = trimmed.strip_prefix("- ") {
                    skills.push(rest.trim().to_string());
                } else if !line.starts_with(|c: char| c.is_whitespace()) {
                    in_skills_list = false;
                }
            }
            continue;
        }

        if let Some(rest) = line.strip_prefix("## ") {
            current_section = rest.trim().to_string();
            continue;
        }

        if current_section == "Purpose" && !captured_purpose && !line.trim().is_empty() {
            purpose = line.trim().to_string();
            captured_purpose = true;
        }
    }

    let mut output: Vec<String> = vec![format!("# {name}")];
    if !description.is_empty() {
        output.push(String::new());
        output.push(description);
    }
    if !purpose.is_empty() {
        output.push(String::new());
        output.push(purpose);
    }
    if !skills.is_empty() {
        output.push(String::new());
        output.push("## Skills".to_string());
        for s in &skills {
            output.push(format!("- {s}"));
        }
    }
    Ok(output.join("\n"))
}

/// Distill a team into name + description + member roster.
pub fn distill_team(path: &Path) -> Result<String> {
    let raw = std::fs::read_to_string(path)?;
    let mut name = String::new();
    let mut description = String::new();
    let mut members: Vec<(String, String)> = Vec::new();

    let mut in_frontmatter = false;
    let mut frontmatter_count = 0u32;
    let mut in_members = false;
    let mut current: Option<String> = None;

    for line in raw.lines() {
        if line.trim() == "---" {
            frontmatter_count += 1;
            in_frontmatter = frontmatter_count == 1;
            continue;
        }
        if !in_frontmatter {
            continue;
        }
        if let Some(rest) = line.strip_prefix("name:") {
            name = rest.trim().to_string();
        } else if let Some(rest) = line.strip_prefix("description:") {
            let v = rest.trim();
            if !v.is_empty() {
                description = v.to_string();
            }
        } else if line.starts_with("members:") {
            in_members = true;
        } else if in_members {
            if !line.starts_with(|c: char| c.is_whitespace()) {
                in_members = false;
                if let Some(agent) = current.take() {
                    members.push((agent, "member".to_string()));
                }
                continue;
            }
            let trimmed = line.trim_start();
            if let Some(rest) = trimmed.strip_prefix("- agent:") {
                if let Some(agent) = current.take() {
                    members.push((agent, "member".to_string()));
                }
                current = Some(rest.trim().to_string());
            } else if let Some(rest) = trimmed.strip_prefix("role:") {
                if let Some(agent) = current.take() {
                    members.push((agent, rest.trim().to_string()));
                }
            }
        }
    }
    if let Some(agent) = current.take() {
        members.push((agent, "member".to_string()));
    }

    let mut output: Vec<String> = vec![format!("# {name}")];
    if !description.is_empty() {
        output.push(String::new());
        output.push(description);
    }
    if !members.is_empty() {
        output.push(String::new());
        output.push("## Members".to_string());
        for (agent, role) in &members {
            output.push(format!("- **{agent}**: {role}"));
        }
    }
    Ok(output.join("\n"))
}

/// Bundle distilled items into one prompt fragment, stopping when the running
/// token estimate (chars / 4) exceeds `max_tokens`.
pub fn bundle_for_edge(items: &[(String, String, String)], max_tokens: usize) -> String {
    let mut output: Vec<String> = vec!["# Available Procedures".to_string(), String::new()];
    let mut approx_tokens = 10usize;
    let mut loaded = 0usize;
    for (_kind, _id, content) in items {
        let item_tokens = content.len().div_ceil(4);
        if approx_tokens + item_tokens > max_tokens {
            break;
        }
        output.push(content.clone());
        output.push(String::new());
        approx_tokens += item_tokens;
        loaded += 1;
    }
    output.push("---".to_string());
    output.push(format!(
        "{loaded} procedures loaded. Follow steps in order."
    ));
    output.join("\n")
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use std::path::PathBuf;

    fn write_tmp(contents: &str) -> (tempfile::TempDir, PathBuf) {
        let dir = tempfile::tempdir().unwrap();
        let file = dir.path().join("input.md");
        fs::write(&file, contents).unwrap();
        (dir, file)
    }

    #[test]
    fn distill_skill_extracts_name_steps_and_validation() {
        let (_dir, file) = write_tmp(
            "---\nname: demo\ndescription: a demo skill\n---\n\n\
             ## When to Use\n\nDrop this.\n\n\
             ## Procedure\n\n\
             ### Step 1: Pause\n\n**Expected:** ok\n\n\
             ```\ndrop code\n```\n\n\
             ### Step 2: Check\n\n\
             ## Validation\n\n\
             - [ ] thing one\n- [x] thing two\n",
        );
        let out = distill_skill(&file).unwrap();
        assert!(out.starts_with("# demo"));
        assert!(out.contains("a demo skill"));
        assert!(out.contains("## Steps\n1. Pause\n2. Check"));
        assert!(out.contains("## Verify\n- thing one\n- thing two"));
        assert!(!out.contains("Drop this"));
        assert!(!out.contains("drop code"));
    }

    #[test]
    fn distill_skill_collects_multiline_description() {
        let (_dir, file) =
            write_tmp("---\nname: demo\ndescription: >\n  first line\n  second line\n---\n");
        let out = distill_skill(&file).unwrap();
        assert!(out.contains("first line second line"));
    }

    #[test]
    fn distill_agent_extracts_purpose_and_skills() {
        let (_dir, file) = write_tmp(
            "---\nname: demo-agent\ndescription: a demo agent\nskills:\n  - skill-a\n  - skill-b\n---\n\n\
             ## Purpose\n\nA short purpose line.\n\nMore detail (drop).\n\n\
             ## Capabilities\n\nDrop this.\n",
        );
        let out = distill_agent(&file).unwrap();
        assert!(out.starts_with("# demo-agent"));
        assert!(out.contains("a demo agent"));
        assert!(out.contains("A short purpose line."));
        assert!(out.contains("## Skills\n- skill-a\n- skill-b"));
        assert!(!out.contains("More detail"));
        assert!(!out.contains("Capabilities"));
    }

    #[test]
    fn distill_team_extracts_members_with_roles() {
        let (_dir, file) = write_tmp(
            "---\nname: demo-team\ndescription: a demo team\nmembers:\n  - agent: alpha\n    role: lead\n  - agent: beta\n    role: scout\n---\n",
        );
        let out = distill_team(&file).unwrap();
        assert!(out.contains("- **alpha**: lead"));
        assert!(out.contains("- **beta**: scout"));
    }

    #[test]
    fn bundle_for_edge_respects_token_budget() {
        let items = vec![
            ("skill".to_string(), "a".to_string(), "x".repeat(40)),
            ("skill".to_string(), "b".to_string(), "y".repeat(40)),
            ("skill".to_string(), "c".to_string(), "z".repeat(40)),
        ];
        // 40 chars ≈ 10 tokens each. Budget 25 (+10 overhead) fits one item only.
        let out = bundle_for_edge(&items, 25);
        assert!(out.contains(&"x".repeat(40)));
        assert!(!out.contains(&"y".repeat(40)));
        assert!(out.contains("1 procedures loaded"));
    }
}
