import type { GetSectionPagesParams } from "./PagesColumn.types";

export const getSectionPages = ({
  pages,
  sectionId,
}: GetSectionPagesParams) => {
  return pages.filter((page) => {
    return page.sectionId === sectionId;
  });
};
