import { StoreSection } from "@/types/store";

export function slugifyFragment(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function getStoreSectionAnchor(section: StoreSection) {
  return section === "personalized" ? "store-personalized" : "store-designed";
}

export function getCategoryAnchor(section: StoreSection, category: string) {
  return `${getStoreSectionAnchor(section)}-${slugifyFragment(category)}`;
}

export function getStoreSectionLabel(section: StoreSection) {
  return section === "personalized" ? "Personalized Items" : "Designed Items";
}
