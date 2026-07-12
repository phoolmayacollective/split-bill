import {
  fuzzyScore,
  matchesFuzzySearch,
  normalizeSearchQuery,
  sortByFuzzyRelevance,
} from "@/lib/fuzzy-search";
import {
  CATEGORY_LABELS,
  dalbhatMenu,
  DRINK_CATEGORY_LABELS,
  formatExtraName,
  formatMenuItemName,
  type DrinkItem,
  type MenuItem,
  type RecommendationItem,
} from "@/lib/restaurants/dalbhat-menu";

export type MenuFilterId =
  | "all"
  | "kleine_teller_small_plates"
  | "recommendations"
  | "classics"
  | "dalbhat"
  | "momo"
  | "desserts"
  | "extras"
  | "drinks";

export const MENU_FILTER_OPTIONS: Array<{ id: MenuFilterId; label: string }> = [
  { id: "all", label: "All" },
  {
    id: "kleine_teller_small_plates",
    label: "Small Plates",
  },
  { id: "recommendations", label: "Recommendations" },
  { id: "classics", label: "Classics" },
  { id: "dalbhat", label: "Dalbhat" },
  { id: "momo", label: "Momo" },
  { id: "desserts", label: "Desserts" },
  { id: "extras", label: "Extras" },
  { id: "drinks", label: "Drinks" },
];

function matchesQuery(searchText: string, query: string): boolean {
  return matchesFuzzySearch(searchText, query);
}

function scorePrimaryFields(
  primaryTexts: Array<string | undefined>,
  fallbackText: string,
  query: string,
): number {
  const primaryScore = Math.max(
    -1,
    ...primaryTexts
      .filter((text): text is string => Boolean(text))
      .map((text) => fuzzyScore(text, query)),
  );

  if (primaryScore >= 0) {
    return primaryScore + 100;
  }

  return fuzzyScore(fallbackText, query);
}

function getMenuItemRelevance(item: MenuItem, query: string): number {
  return scorePrimaryFields(
    [item.name_en, item.name_de],
    getMenuItemSearchText(item),
    query,
  );
}

function getRecommendationRelevance(
  item: RecommendationItem,
  query: string,
): number {
  return scorePrimaryFields([item.name], getRecommendationSearchText(item), query);
}

function getExtraRelevance(
  item: { name_de: string; name_en: string; note?: string },
  query: string,
): number {
  return scorePrimaryFields(
    [item.name_en, item.name_de],
    getExtraSearchText(item),
    query,
  );
}

function getDrinkRelevance(item: DrinkItem, query: string): number {
  return scorePrimaryFields([item.name], getDrinkSearchText(item), query);
}

function joinSearchParts(parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

function getMenuItemSearchText(item: MenuItem): string {
  return joinSearchParts([
    item.name_de,
    item.name_en,
    item.description_de,
    item.description_en,
    item.options?.map((option) => option.name).join(" "),
    item.allergens?.join(" "),
    item.additives?.join(" "),
  ]);
}

function getRecommendationSearchText(item: RecommendationItem): string {
  return joinSearchParts([
    item.name,
    item.description_de,
    item.description_en,
    item.pricing.map((portion) => portion.portion).join(" "),
    item.allergens?.join(" "),
  ]);
}

function getExtraSearchText(item: {
  name_de: string;
  name_en: string;
  note?: string;
}): string {
  return joinSearchParts([formatExtraName(item), item.note]);
}

function getDrinkSearchText(item: DrinkItem): string {
  return joinSearchParts([
    item.name,
    item.description,
    item.producer,
    item.grape,
    item.size,
    item.sizes?.map((entry) => entry.size).join(" "),
    item.allergens?.join(" "),
  ]);
}

function getMomoSearchText(): string {
  const { momo } = dalbhatMenu.menu;
  return joinSearchParts([
    "momo",
    momo.item_name,
    momo.description,
    momo.fillings.map((filling) => filling.name).join(" "),
    momo.styles_and_pricing
      .flatMap((style) => [
        style.style_de,
        style.style_en,
        style.description_de,
        style.description_en,
      ])
      .join(" "),
  ]);
}

function isCategoryVisible(
  category: MenuFilterId,
  activeFilter: MenuFilterId,
): boolean {
  if (activeFilter === "all") {
    return true;
  }
  if (activeFilter === "drinks") {
    return category === "drinks";
  }
  return category === activeFilter;
}

export type FilteredDalbhatMenu = {
  kleine_teller_small_plates: MenuItem[];
  recommendations: RecommendationItem[];
  classics: MenuItem[];
  dalbhat: MenuItem[];
  showMomo: boolean;
  desserts: MenuItem[];
  extras: Array<(typeof dalbhatMenu.menu.extras)[number]>;
  drinks: Record<string, DrinkItem[]>;
  resultCount: number;
  hasResults: boolean;
};

export function filterDalbhatMenu(
  query: string,
  activeFilter: MenuFilterId,
): FilteredDalbhatMenu {
  const { menu } = dalbhatMenu;
  const hasSearchQuery = normalizeSearchQuery(query).length > 0;

  const kleine_teller_small_plates = isCategoryVisible(
    "kleine_teller_small_plates",
    activeFilter,
  )
    ? sortByFuzzyRelevance(
        menu.kleine_teller_small_plates.filter((item) =>
          matchesQuery(getMenuItemSearchText(item), query),
        ),
        query,
        getMenuItemRelevance,
      )
    : [];

  const recommendations = isCategoryVisible("recommendations", activeFilter)
    ? sortByFuzzyRelevance(
        menu.recommendations.filter((item) =>
          matchesQuery(getRecommendationSearchText(item), query),
        ),
        query,
        getRecommendationRelevance,
      )
    : [];

  const classics = isCategoryVisible("classics", activeFilter)
    ? sortByFuzzyRelevance(
        menu.classics.filter((item) =>
          matchesQuery(getMenuItemSearchText(item), query),
        ),
        query,
        getMenuItemRelevance,
      )
    : [];

  const dalbhat = isCategoryVisible("dalbhat", activeFilter)
    ? sortByFuzzyRelevance(
        menu.dalbhat.filter((item) =>
          matchesQuery(getMenuItemSearchText(item), query),
        ),
        query,
        getMenuItemRelevance,
      )
    : [];

  const showMomo =
    isCategoryVisible("momo", activeFilter) &&
    matchesQuery(getMomoSearchText(), query);

  const desserts = isCategoryVisible("desserts", activeFilter)
    ? sortByFuzzyRelevance(
        menu.desserts.filter((item) =>
          matchesQuery(getMenuItemSearchText(item), query),
        ),
        query,
        getMenuItemRelevance,
      )
    : [];

  const extras = isCategoryVisible("extras", activeFilter)
    ? sortByFuzzyRelevance(
        menu.extras.filter((item) => matchesQuery(getExtraSearchText(item), query)),
        query,
        getExtraRelevance,
      )
    : [];

  let drinks: Record<string, DrinkItem[]> = {};
  if (isCategoryVisible("drinks", activeFilter)) {
    for (const [categoryKey, items] of Object.entries(menu.drinks)) {
      const filteredItems = sortByFuzzyRelevance(
        items.filter((item) => matchesQuery(getDrinkSearchText(item), query)),
        query,
        getDrinkRelevance,
      );
      if (filteredItems.length > 0) {
        drinks[categoryKey] = filteredItems;
      }
    }
  }

  if (hasSearchQuery) {
    drinks = Object.fromEntries(
      Object.entries(drinks).sort(
        ([leftKey, leftItems], [rightKey, rightItems]) => {
          const leftScore = Math.max(
            -1,
            ...leftItems.map((item) => getDrinkRelevance(item, query)),
          );
          const rightScore = Math.max(
            -1,
            ...rightItems.map((item) => getDrinkRelevance(item, query)),
          );
          return rightScore - leftScore || leftKey.localeCompare(rightKey);
        },
      ),
    );
  }

  const drinkCount = Object.values(drinks).reduce(
    (sum, items) => sum + items.length,
    0,
  );

  const resultCount =
    kleine_teller_small_plates.length +
    recommendations.length +
    classics.length +
    dalbhat.length +
    (showMomo ? 1 : 0) +
    desserts.length +
    extras.length +
    drinkCount;

  return {
    kleine_teller_small_plates,
    recommendations,
    classics,
    dalbhat,
    showMomo,
    desserts,
    extras,
    drinks,
    resultCount,
    hasResults: resultCount > 0,
  };
}

export function isMenuFiltered(
  query: string,
  activeFilter: MenuFilterId,
): boolean {
  return normalizeSearchQuery(query).length > 0 || activeFilter !== "all";
}

export function getCategoryLabel(category: MenuFilterId): string {
  if (category === "all") {
    return "All";
  }
  if (category === "momo") {
    return "Momo";
  }
  if (category === "drinks") {
    return "Drinks";
  }
  return CATEGORY_LABELS[category] ?? DRINK_CATEGORY_LABELS[category] ?? category;
}
