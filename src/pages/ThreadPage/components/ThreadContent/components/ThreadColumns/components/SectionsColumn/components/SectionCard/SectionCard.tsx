import { Box, TruncatedText } from "@/components/lib";
import { ContrastColorScope } from "@/components/shared";
import { useScrollIntoView } from "@/hooks";
import type { ThreadSection } from "@/types";
import { SectionCardTestId } from "./SectionCard.constants";
import { SectionCardActions } from "./components";

type SectionCardProps = {
  section: ThreadSection;
  isLastCreated: boolean;
  isSelected: boolean;
  onSelect: (sectionId: string) => void;
  onDelete: (section: ThreadSection) => void;
};

export const SectionCard = ({
  section,
  isLastCreated,
  isSelected,
  onSelect,
  onDelete,
}: SectionCardProps) => {
  const cardRef = useScrollIntoView<HTMLDivElement>(isLastCreated);

  const handleSelect = () => {
    onSelect(section.id);
  };

  return (
    <Box
      ref={cardRef}
      data-testid={SectionCardTestId.container}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      gap="2"
      pr="1"
      minWidth="0"
      borderRadius="md"
      borderWidth="1px"
      borderColor="border"
      borderLeftWidth="4px"
      borderLeftColor={section.color}
      backgroundColor={isSelected ? section.color : "bg"}
    >
      <ContrastColorScope
        backgroundColor={isSelected ? section.color : undefined}
      >
        <Box
          data-testid={SectionCardTestId.selectButton}
          as="button"
          type="button"
          aria-current={isSelected}
          display="flex"
          flexGrow={1}
          minWidth="0"
          py="2"
          pl="3"
          textAlign="left"
          cursor="pointer"
          onClick={handleSelect}
        >
          <TruncatedText
            data-testid={SectionCardTestId.name}
            fontWeight="medium"
          >
            {section.name}
          </TruncatedText>
        </Box>

        <SectionCardActions section={section} onDelete={onDelete} />
      </ContrastColorScope>
    </Box>
  );
};
