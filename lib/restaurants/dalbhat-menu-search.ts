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

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

function matchesQuery(searchText: string, query: string): boolean {
  const normalized = normalizeQuery(query);
  if (!normalized) {
    return true;
  }
  return searchText.toLowerCase().includes(normalized);
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

  const kleine_teller_small_plates = isCategoryVisible(
    "kleine_teller_small_plates",
    activeFilter,
  )
    ? menu.kleine_teller_small_plates.filter((item) =>
        matchesQuery(getMenuItemSearchText(item), query),
      )
    : [];

  const recommendations = isCategoryVisible("recommendations", activeFilter)
    ? menu.recommendations.filter((item) =>
        matchesQuery(getRecommendationSearchText(item), query),
      )
    : [];

  const classics = isCategoryVisible("classics", activeFilter)
    ? menu.classics.filter((item) =>
        matchesQuery(getMenuItemSearchText(item), query),
      )
    : [];

  const dalbhat = isCategoryVisible("dalbhat", activeFilter)
    ? menu.dalbhat.filter((item) =>
        matchesQuery(getMenuItemSearchText(item), query),
      )
    : [];

  const showMomo =
    isCategoryVisible("momo", activeFilter) &&
    matchesQuery(getMomoSearchText(), query);

  const desserts = isCategoryVisible("desserts", activeFilter)
    ? menu.desserts.filter((item) =>
        matchesQuery(getMenuItemSearchText(item), query),
      )
    : [];

  const extras = isCategoryVisible("extras", activeFilter)
    ? menu.extras.filter((item) => matchesQuery(getExtraSearchText(item), query))
    : [];

  let drinks: Record<string, DrinkItem[]> = {};
  if (isCategoryVisible("drinks", activeFilter)) {
    for (const [categoryKey, items] of Object.entries(menu.drinks)) {
      const filteredItems = items.filter((item) =>
        matchesQuery(getDrinkSearchText(item), query),
      );
      if (filteredItems.length > 0) {
        drinks[categoryKey] = filteredItems;
      }
    }
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
  return normalizeQuery(query).length > 0 || activeFilter !== "all";
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
