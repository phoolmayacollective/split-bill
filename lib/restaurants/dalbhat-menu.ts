import menuData from "@/data/restaurants/dalbhat-menu.json";

export type MenuOption = {
  id: string;
  name: string;
  extra_charge: number;
};

export type MenuItem = {
  id: string;
  name_de: string;
  name_en: string;
  description_de?: string;
  description_en?: string;
  allergens?: string[];
  additives?: string[];
  price: number;
  options?: MenuOption[];
  note?: string;
};

export type RecommendationItem = {
  id: string;
  name: string;
  description_de: string;
  description_en: string;
  allergens?: string[];
  pricing: Array<{
    id: string;
    portion: string;
    price: number;
  }>;
};

export type MomoStyle = {
  id: string;
  style_de: string;
  style_en: string;
  description_de?: string;
  description_en?: string;
  allergens?: string[];
  prices: Array<{ quantity: number; price: number }>;
};

export type DrinkSize = {
  size: string;
  price: number;
};

export type DrinkItem = {
  id: string;
  name: string;
  price?: number;
  size?: string;
  sizes?: DrinkSize[];
  description?: string;
  producer?: string;
  grape?: string;
  allergens?: string[];
  additives?: string[];
};

export type DalbhatMenu = typeof menuData;

export const dalbhatMenu = menuData as DalbhatMenu;

export const CATEGORY_LABELS: Record<string, string> = {
  kleine_teller_small_plates: "Kleine Teller / Small Plates",
  recommendations: "Recommendations",
  classics: "Classics",
  dalbhat: "Dalbhat",
  desserts: "Desserts",
  extras: "Extras",
};

export const DRINK_CATEGORY_LABELS: Record<string, string> = {
  tea: "Tea",
  soft_drinks: "Soft Drinks",
  craft_beer: "Craft Beer",
  long_drinks: "Long Drinks",
  special_drinks_non_alcoholic: "Special Drinks (Non-alcoholic)",
  special_drinks_alcoholic: "Special Drinks (Alcoholic)",
  wine: "Wine",
};

export function formatMenuItemName(item: {
  name_de: string;
  name_en: string;
}): string {
  return `${item.name_de} / ${item.name_en}`;
}

export function formatExtraName(item: {
  name_de: string;
  name_en: string;
}): string {
  return `${item.name_de} / ${item.name_en}`;
}

export function buildBillItemId(
  category: string,
  itemId: string,
  variant?: string,
): string {
  return variant
    ? `${category}/${itemId}/${variant}`
    : `${category}/${itemId}`;
}
