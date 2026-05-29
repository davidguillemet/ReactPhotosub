// Typo-tolerant, accent-insensitive keyword matching for destinations.
//
// Used by Destinations.js -> filterDestinationsByKeyword.
//
// Semantics preserved from the original implementation:
//   - A destination matches only if ALL keywords match (AND across keywords).
// Added on top:
//   - Accent + case insensitivity (norm): "californie" <-> "Californie", "etoile" <-> "étoile".
//   - Typo tolerance: each keyword token may differ from a destination word by a
//     few edits (Levenshtein), so "califronie" still matches "californie".

// How to use in Destinations.js
// const filterDestinationsByKeyword = (destinations) => {
//   if (!keywordFilterSet || keywordFilterSet.size === 0) {
//      return destinations;
//   }
//   return destinations.filter(destination => matchDestination(destination, keywordFilterSet));
// };


const norm = (s) =>
    (s ?? "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

// Levenshtein edit distance: number of insert/delete/substitute ops to turn a into b.
// Rolling two-row implementation (O(n) memory).
function editDistance(a, b) {
    const m = a.length;
    const n = b.length;
    if (m === 0) return n;
    if (n === 0) return m;
    let prev = Array.from({ length: n + 1 }, (_, i) => i);
    let curr = new Array(n + 1);
    for (let i = 1; i <= m; i++) {
        curr[0] = i;
        for (let j = 1; j <= n; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
        }
        [prev, curr] = [curr, prev];
    }
    return prev[n];
}

// Does one already-normalized keyword token match a destination word?
//   - includes(): keeps prefix / substring behaviour so live typing feels instant
//     ("cali" matches "californie") and multi-letter substrings still work.
//   - editDistance(): catches actual typos, but only for tokens long enough that
//     fuzzy matching is meaningful (avoids 1-2 char tokens matching everything).
function tokenMatchesWord(token, word) {
    if (word.includes(token)) return true;
    if (token.length < 3) return false;
    const tolerance = token.length <= 5 ? 1 : 2;
    return editDistance(token, word) <= tolerance;
}

// Build the searchable text for a destination: title, title_en, location_title,
// tags, and every region title / title_en in the region path. (Same fields the
// original filter concatenated.)
function buildDestinationText(destination) {
    const regions = (destination.regionpath ?? [])
        .map((region) => `${region.title ?? ""} ${region.title_en ?? ""}`)
        .join(" ");
    return [
        destination.title ?? "",
        destination.title_en ?? "",
        destination.location_title ?? "",
        (destination.tags ?? []).join(" "),
        regions,
    ].join(" ");
}

// A destination matches when EVERY keyword matches; a keyword matches when each
// of its tokens fuzzily matches at least one word of the destination text.
// (Splitting the keyword on whitespace keeps multi-word keywords like
// "north pacific" working, just as the original substring search did.)
export function matchDestination(destination, keywordFilterSet) {
    const words = norm(buildDestinationText(destination))
        .split(/\s+/)
        .filter(Boolean);
    return Array.from(keywordFilterSet).every((keyword) => {
        const tokens = norm(keyword).split(/\s+/).filter(Boolean);
        return tokens.every((token) =>
            words.some((word) => tokenMatchesWord(token, word))
        );
    });
}
