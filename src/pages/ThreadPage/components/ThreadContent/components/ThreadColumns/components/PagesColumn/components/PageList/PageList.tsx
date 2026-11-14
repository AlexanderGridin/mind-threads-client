import { VStack } from "@/components/lib";
import type { SectionPage } from "@/types";
import { PageCard } from "../PageCard";
import { PageListTestId } from "./PageList.constants";

type PageListProps = {
  pages: SectionPage[];
  lastCreatedPageId: string | null;
};

export const PageList = ({ pages, lastCreatedPageId }: PageListProps) => {
  return (
    <VStack data-testid={PageListTestId.container} gap="2" alignItems="stretch">
      {pages.map((page) => {
        return (
          <PageCard
            key={page.id}
            page={page}
            isLastCreated={page.id === lastCreatedPageId}
          />
        );
      })}
    </VStack>
  );
};
