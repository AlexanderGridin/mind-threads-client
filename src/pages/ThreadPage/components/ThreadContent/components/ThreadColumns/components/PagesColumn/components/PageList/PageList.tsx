import { VStack } from "@/components/lib";
import type { SectionPage } from "@/types";
import { PageCard } from "../PageCard";
import { PageListTestId } from "./PageList.constants";

type PageListProps = {
  pages: SectionPage[];
  lastCreatedPageId: string | null;
  selectedPageId: string | null;
  onSelectPage: (pageId: string) => void;
  onDeletePage: (page: SectionPage) => void;
};

export const PageList = ({
  pages,
  lastCreatedPageId,
  selectedPageId,
  onSelectPage,
  onDeletePage,
}: PageListProps) => {
  return (
    <VStack data-testid={PageListTestId.container} gap="2" alignItems="stretch">
      {pages.map((page) => {
        return (
          <PageCard
            key={page.id}
            page={page}
            isLastCreated={page.id === lastCreatedPageId}
            isSelected={page.id === selectedPageId}
            onSelect={onSelectPage}
            onDelete={onDeletePage}
          />
        );
      })}
    </VStack>
  );
};
