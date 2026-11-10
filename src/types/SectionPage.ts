export const SECTION_PAGE_TYPES = ["chat"] as const;

export type SectionPageType = (typeof SECTION_PAGE_TYPES)[number];

export type SectionPage = {
  id: string;
  threadId: string;
  sectionId: string;
  name: string;
  type: SectionPageType;
  color: string;
  createdAt: string;
};

export type SectionPageValue = Pick<SectionPage, "name" | "type" | "color">;

export type NewSectionPage = Pick<
  SectionPage,
  "threadId" | "sectionId" | "name" | "type" | "color"
>;
