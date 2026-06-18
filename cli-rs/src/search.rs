//! Fuzzy filtering over a volume's entries, backed by `nucleo-matcher`.
//!
//! [`FuzzyIndex::filter_indexed`] returns both the matched item indices (ranked
//! by score, best first) and, for each, the matched character positions in the
//! search key — so the index pane can highlight what the query hit.

use nucleo_matcher::pattern::{CaseMatching, Normalization, Pattern};
use nucleo_matcher::{Matcher, Utf32Str};

pub struct FuzzyIndex {
    matcher: Matcher,
}

impl Default for FuzzyIndex {
    fn default() -> Self {
        Self {
            matcher: Matcher::new(nucleo_matcher::Config::DEFAULT.match_paths()),
        }
    }
}

impl FuzzyIndex {
    /// Ranked matches plus, for each, the sorted/deduped matched char offsets
    /// in `key(item)`. An empty query returns every item, in order, with no
    /// match positions.
    pub fn filter_indexed<T, F>(
        &mut self,
        items: &[T],
        query: &str,
        key: F,
    ) -> (Vec<usize>, Vec<Vec<u32>>)
    where
        F: Fn(&T) -> &str,
    {
        if query.is_empty() {
            return ((0..items.len()).collect(), vec![Vec::new(); items.len()]);
        }
        let pattern = Pattern::parse(query, CaseMatching::Smart, Normalization::Smart);
        let mut scored: Vec<(usize, u32, Vec<u32>)> = Vec::new();
        let mut buf = Vec::new();
        let mut indices = Vec::new();
        for (i, item) in items.iter().enumerate() {
            buf.clear();
            let haystack = Utf32Str::new(key(item), &mut buf);
            indices.clear();
            if let Some(score) = pattern.indices(haystack, &mut self.matcher, &mut indices) {
                indices.sort_unstable();
                indices.dedup();
                scored.push((i, score, indices.clone()));
            }
        }
        scored.sort_by_key(|entry| std::cmp::Reverse(entry.1)); // best score first
        let mut out_idx = Vec::with_capacity(scored.len());
        let mut out_pos = Vec::with_capacity(scored.len());
        for (i, _, pos) in scored {
            out_idx.push(i);
            out_pos.push(pos);
        }
        (out_idx, out_pos)
    }

    /// Just the ranked match indices (see [`Self::filter_indexed`]).
    pub fn filter<T, F>(&mut self, items: &[T], query: &str, key: F) -> Vec<usize>
    where
        F: Fn(&T) -> &str,
    {
        self.filter_indexed(items, query, key).0
    }
}
