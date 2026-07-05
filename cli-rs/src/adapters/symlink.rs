//! Shared symlink primitives for the symlink-strategy adapters.
//!
//! `claude_code`, `hermes`, `pi`, `gemini`, `opencode`, and `copilot` all create
//! and remove symlinks the same way; before this module each carried its own
//! copy of these helpers. They are collected here so there is one definition
//! per primitive.
//!
//! **Symlink-target style is *not* uniform across adapters and that is
//! deliberate.** `claude_code`/`gemini`/`opencode`/`copilot` write a *relative*
//! link for project/workspace scope (survives a repo move) and an *absolute*
//! one for global — use [`link_target`]. `hermes` and `pi` write *absolute*
//! links in every scope, matching their Node oracles — they call [`symlink_dir`]
//! / [`symlink_file`] directly with an absolute source and never touch
//! [`link_target`]. Do not "unify" this during cleanup; it is a behaviour
//! contract with each Node adapter.

use std::fs;
use std::io;
use std::path::{Path, PathBuf};

use super::base::Scope;
use crate::error::Result;

/// Create a directory symlink `dst -> src`.
#[cfg(unix)]
pub fn symlink_dir(src: &Path, dst: &Path) -> io::Result<()> {
    std::os::unix::fs::symlink(src, dst)
}
#[cfg(windows)]
pub fn symlink_dir(src: &Path, dst: &Path) -> io::Result<()> {
    std::os::windows::fs::symlink_dir(src, dst)
}

/// Create a file symlink `dst -> src` (per-file links: agent `<id>.md`, etc.).
#[cfg(unix)]
pub fn symlink_file(src: &Path, dst: &Path) -> io::Result<()> {
    std::os::unix::fs::symlink(src, dst)
}
#[cfg(windows)]
pub fn symlink_file(src: &Path, dst: &Path) -> io::Result<()> {
    std::os::windows::fs::symlink_file(src, dst)
}

/// Remove a symlink. On Unix every symlink unlinks as a file; on Windows a
/// directory symlink needs `remove_dir`, so fall back to it.
#[cfg(unix)]
pub fn remove_link(path: &Path) -> io::Result<()> {
    fs::remove_file(path)
}
#[cfg(windows)]
pub fn remove_link(path: &Path) -> io::Result<()> {
    fs::remove_file(path).or_else(|_| fs::remove_dir(path))
}

/// Whether `path` is itself a symlink — true even when the link is broken.
pub fn is_symlink(path: &Path) -> bool {
    fs::symlink_metadata(path)
        .map(|m| m.file_type().is_symlink())
        .unwrap_or(false)
}

/// Whether a directory has no entries.
pub fn dir_is_empty(path: &Path) -> bool {
    fs::read_dir(path)
        .map(|mut d| d.next().is_none())
        .unwrap_or(false)
}

/// Express absolute `target` relative to the absolute directory `base`, so
/// that `base/<result>` resolves back to `target`. Both paths must be
/// canonicalized by the caller.
pub fn relative_to(base: &Path, target: &Path) -> PathBuf {
    let base: Vec<_> = base.components().collect();
    let target: Vec<_> = target.components().collect();
    let shared = base
        .iter()
        .zip(target.iter())
        .take_while(|(a, b)| a == b)
        .count();
    let mut rel = PathBuf::new();
    for _ in shared..base.len() {
        rel.push("..");
    }
    for comp in &target[shared..] {
        rel.push(comp.as_os_str());
    }
    if rel.as_os_str().is_empty() {
        rel.push(".");
    }
    rel
}

/// The symlink target to write for `source` under the given scope: absolute
/// for global installs, relative (from `link_dir`) for project/workspace.
///
/// Used by the relative-link adapters. `hermes` and `pi` deliberately bypass
/// this and always write an absolute link — see the module doc.
pub fn link_target(source: &Path, link_dir: &Path, scope: Scope) -> Result<PathBuf> {
    match scope {
        Scope::Global => Ok(source.to_path_buf()),
        Scope::Project | Scope::Workspace => {
            let canon_dir = link_dir.canonicalize()?;
            let canon_src = source.canonicalize()?;
            Ok(relative_to(&canon_dir, &canon_src))
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn relative_to_climbs_then_descends() {
        let base = Path::new("/tmp/proj/.claude/skills");
        let target = Path::new("/tmp/almanac/skills/demo");
        assert_eq!(
            relative_to(base, target),
            Path::new("../../../almanac/skills/demo")
        );
    }

    #[test]
    fn relative_to_same_dir_is_dot() {
        let p = Path::new("/a/b/c");
        assert_eq!(relative_to(p, p), Path::new("."));
    }
}
