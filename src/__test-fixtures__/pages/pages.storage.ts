import { PAGES_STORAGE_KEY } from "@/services/useSectionPagesService/useSectionPagesService.constants";
import type { SectionPage } from "@/types";

export const seedPages = (pages: SectionPage[]) => {
  localStorage.setItem(PAGES_STORAGE_KEY, JSON.stringify(pages));
};

export const readStoredPages = (): SectionPage[] => {
  return JSON.parse(localStorage.getItem(PAGES_STORAGE_KEY) ?? "[]");
};
