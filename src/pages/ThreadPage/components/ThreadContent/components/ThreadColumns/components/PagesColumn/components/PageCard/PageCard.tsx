import { Box, TruncatedText } from "@/components/lib";
import { useScrollIntoView } from "@/hooks";
import { PageTypeIcon } from "@/pages/ThreadPage/components/PageTypeIcon";
import type { SectionPage } from "@/types";
import { PageCardTestId } from "./PageCard.constants";
import { PageCardActions } from "./components";

type PageCardProps = {
  page: SectionPage;
  isLastCreated: boolean;
  onDelete: (page: SectionPage) => void;
};

export const PageCard = ({ page, isLastCreated, onDelete }: PageCardProps) => {
  const cardRef = useScrollIntoView<HTMLDivElement>(isLastCreated);

  return (
    <Box
      ref={cardRef}
      data-testid={PageCardTestId.container}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      gap="2"
      py="1"
      pl="3"
      pr="1"
      minWidth="0"
      borderRadius="md"
      borderWidth="1px"
      borderColor="border"
      borderLeftWidth="4px"
      borderLeftColor={page.color}
      backgroundColor="bg"
    >
      <Box display="flex" alignItems="center" gap="2" minWidth="0">
        <PageTypeIcon type={page.type} />

        <TruncatedText data-testid={PageCardTestId.name} fontWeight="medium">
          {page.name}
        </TruncatedText>
      </Box>

      <PageCardActions page={page} onDelete={onDelete} />
    </Box>
  );
};
