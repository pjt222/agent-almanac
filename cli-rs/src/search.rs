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
    pub fn filter<T, F>(&mut self, items: &[T], query: &str, key: F) -> Vec<usize>
    where
        F: Fn(&T) -> &str,
    {
        if query.is_empty() {
            return (0..items.len()).collect();
        }
        let pattern = Pattern::parse(query, CaseMatching::Smart, Normalization::Smart);
        let mut scored: Vec<(usize, u32)> = Vec::new();
        let mut buf = Vec::new();
        for (i, item) in items.iter().enumerate() {
            buf.clear();
            let haystack = Utf32Str::new(key(item), &mut buf);
            if let Some(score) = pattern.score(haystack, &mut self.matcher) {
                scored.push((i, score));
            }
        }
        scored.sort_by(|a, b| b.1.cmp(&a.1));
        scored.into_iter().map(|(i, _)| i).collect()
    }
}
