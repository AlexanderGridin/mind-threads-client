import { SECTION_PAGE_TYPES } from "@/types";
import type { NewSectionPage, SectionPage } from "@/types";

export const buildPage = ({
  threadId,
  sectionId,
  name,
  type,
  color,
}: NewSectionPage): SectionPage => {
  return {
    id: crypto.randomUUID(),
    threadId,
    sectionId,
    name: name.trim(),
    type,
    color,
    createdAt: new Date().toISOString(),
  };
};

const isSectionPage = (value: unknown): value is SectionPage => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const page = value as Partial<Record<keyof SectionPage, unknown>>;

  return (
    typeof page.id === "string" &&
    typeof page.threadId === "string" &&
    typeof page.sectionId === "string" &&
    typeof page.name === "string" &&
    SECTION_PAGE_TYPES.some((pageType) => {
      return pageType === page.type;
    }) &&
    typeof page.color === "string" &&
    typeof page.createdAt === "string"
  );
};

export const isSectionPageList = (value: unknown): value is SectionPage[] => {
  return Array.isArray(value) && value.every(isSectionPage);
};
