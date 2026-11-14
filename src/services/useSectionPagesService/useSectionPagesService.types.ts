import type { NewSectionPage, SectionPage } from "@/types";

export type UseSectionPagesServiceReturn = {
  getThreadPages: (threadId: string) => Promise<SectionPage[]>;
  createSectionPage: (newPage: NewSectionPage) => Promise<SectionPage>;
  deleteSectionPages: (sectionId: string) => Promise<number>;
  deleteThreadPages: (threadId: string) => Promise<void>;
};
