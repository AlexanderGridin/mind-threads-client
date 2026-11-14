import { VStack } from "@/components/lib";
import type { ThreadSection } from "@/types";
import { SectionCard } from "../SectionCard";
import { SectionListTestId } from "./SectionList.constants";

type SectionListProps = {
  sections: ThreadSection[];
  lastCreatedSectionId: string | null;
  selectedSectionId: string | null;
  onSelectSection: (sectionId: string) => void;
  onDeleteSection: (section: ThreadSection) => void;
};

export const SectionList = ({
  sections,
  lastCreatedSectionId,
  selectedSectionId,
  onSelectSection,
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
            isSelected={section.id === selectedSectionId}
            onSelect={onSelectSection}
            onDelete={onDeleteSection}
          />
        );
      })}
    </VStack>
  );
};
