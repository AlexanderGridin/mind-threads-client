import { VStack } from "@/components/lib";
import type { ThreadSection } from "@/types";
import { SectionCard } from "../SectionCard";
import { SectionListTestId } from "./SectionList.constants";

type SectionListProps = {
  sections: ThreadSection[];
  lastCreatedSectionId: string | null;
  onDeleteSection: (section: ThreadSection) => void;
};

export const SectionList = ({
  sections,
  lastCreatedSectionId,
  onDeleteSection,
}: SectionListProps) => {
  return (
    <VStack
      data-testid={SectionListTestId.container}
      gap="2"
      alignItems="stretch"
    >
      {sections.map((section) => {
        return (
          <SectionCard
            key={section.id}
            section={section}
            isLastCreated={section.id === lastCreatedSectionId}
            onDelete={onDeleteSection}
          />
        );
      })}
    </VStack>
  );
};
