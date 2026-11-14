import type { SectionPage, ThreadSection } from "@/types";
import { ThreadColumnMessage } from "../../../ThreadColumnMessage";
import {
  PAGES_COLUMN_EMPTY_MESSAGE,
  PAGES_COLUMN_MESSAGE,
} from "../../../../ThreadColumns.constants";
import { getSectionPages } from "../../PagesColumn.utils";
import { PageList } from "../PageList";

type PagesColumnContentProps = {
  selectedSection: ThreadSection | null;
  pages: SectionPage[];
  lastCreatedPageId: string | null;
};

export const PagesColumnContent = ({
  selectedSection,
  pages,
  lastCreatedPageId,
}: PagesColumnContentProps) => {
  if (!selectedSection) {
    return <ThreadColumnMessage message={PAGES_COLUMN_MESSAGE} />;
  }

  const sectionPages = getSectionPages({
    pages,
    sectionId: selectedSection.id,
  });

  if (!sectionPages.length) {
    return <ThreadColumnMessage message={PAGES_COLUMN_EMPTY_MESSAGE} />;
  }

  return (
    <PageList pages={sectionPages} lastCreatedPageId={lastCreatedPageId} />
  );
};
