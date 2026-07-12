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

export function fuzzyScore(text: string, query: string): number {
  const normalizedQuery = normalizeSearchQuery(query);
  if (!normalizedQuery) {
    return 0;
  }

  const result = fuzzyMatch(text, query);
  if (!result.match) {
    return -1;
  }

  const normalizedText = text.toLowerCase();
  const indices = result.indices;

  const substringIndex = normalizedText.indexOf(normalizedQuery);
  if (substringIndex >= 0) {
    let score = 1000;
    if (substringIndex === 0) {
      score += 200;
    } else {
      score -= substringIndex * 2;
    }
    score -= text.length * 0.1;
    return score;
  }

  let score = 0;
  let consecutiveBonus = 0;

  for (let index = 0; index < indices.length; index += 1) {
    const charIndex = indices[index];
    score += Math.max(0, 50 - charIndex);

    if (index > 0) {
      const gap = charIndex - indices[index - 1] - 1;
      if (gap === 0) {
        consecutiveBonus += 20;
      } else {
        score -= gap * 5;
      }
    }
  }

  score += consecutiveBonus;

  const span = indices[indices.length - 1] - indices[0] + 1;
  score += (normalizedQuery.length / span) * 100;
  score -= text.length * 0.2;

  return score;
}

export function sortByFuzzyRelevance<T>(
  items: readonly T[],
  query: string,
  getScore: (item: T, query: string) => number,
): T[] {
  const normalizedQuery = normalizeSearchQuery(query);
  if (!normalizedQuery) {
    return [...items];
  }

  return items
    .map((item, index) => ({ item, index, score: getScore(item, query) }))
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .map(({ item }) => item);
}
