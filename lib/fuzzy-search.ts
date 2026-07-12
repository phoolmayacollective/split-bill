export function normalizeSearchQuery(query: string): string {
  return query.trim().toLowerCase();
}

export type FuzzyMatchResult = {
  match: boolean;
  indices: number[];
};

export function fuzzyMatch(text: string, query: string): FuzzyMatchResult {
  const normalizedQuery = normalizeSearchQuery(query);
  if (!normalizedQuery) {
    return { match: true, indices: [] };
  }

  const normalizedText = text.toLowerCase();
  const indices: number[] = [];
  let queryIndex = 0;

  for (
    let textIndex = 0;
    textIndex < normalizedText.length && queryIndex < normalizedQuery.length;
    textIndex += 1
  ) {
    if (normalizedText[textIndex] === normalizedQuery[queryIndex]) {
      indices.push(textIndex);
      queryIndex += 1;
    }
  }

  const match = queryIndex === normalizedQuery.length;
  return { match, indices: match ? indices : [] };
}

export function matchesFuzzySearch(searchText: string, query: string): boolean {
  return fuzzyMatch(searchText, query).match;
}
