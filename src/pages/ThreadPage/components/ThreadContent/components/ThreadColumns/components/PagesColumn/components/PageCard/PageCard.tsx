import { Box, TruncatedText } from "@/components/lib";
import { ContrastColorScope } from "@/components/shared";
import { useScrollIntoView } from "@/hooks";
import { PageTypeIcon } from "@/pages/ThreadPage/components/PageTypeIcon";
import type { SectionPage } from "@/types";
import { PageCardTestId } from "./PageCard.constants";
import { PageCardActions } from "./components";

type PageCardProps = {
  page: SectionPage;
  isLastCreated: boolean;
  isSelected: boolean;
  onSelect: (pageId: string) => void;
  onDelete: (page: SectionPage) => void;
};

export const PageCard = ({
  page,
  isLastCreated,
  isSelected,
  onSelect,
  onDelete,
}: PageCardProps) => {
  const cardRef = useScrollIntoView<HTMLDivElement>(isLastCreated);

  const handleSelect = () => {
    onSelect(page.id);
  };

  return (
    <Box
      ref={cardRef}
      data-testid={PageCardTestId.container}
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
      borderLeftColor={page.color}
      backgroundColor={isSelected ? page.color : "bg"}
    >
      <ContrastColorScope backgroundColor={isSelected ? page.color : undefined}>
        <Box
          data-testid={PageCardTestId.selectButton}
          as="button"
          type="button"
          aria-current={isSelected}
          display="flex"
          alignItems="center"
          gap="2"
          flexGrow={1}
          minWidth="0"
          py="2"
          pl="3"
          textAlign="left"
          cursor="pointer"
          onClick={handleSelect}
        >
          <PageTypeIcon type={page.type} />

          <TruncatedText data-testid={PageCardTestId.name} fontWeight="medium">
            {page.name}
          </TruncatedText>
        </Box>

        <PageCardActions page={page} onDelete={onDelete} />
      </ContrastColorScope>
    </Box>
  );
};
