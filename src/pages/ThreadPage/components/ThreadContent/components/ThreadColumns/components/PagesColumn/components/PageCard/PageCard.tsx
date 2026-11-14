import { Box, TruncatedText } from "@/components/lib";
import { useScrollIntoView } from "@/hooks";
import { PageTypeIcon } from "@/pages/ThreadPage/components/PageTypeIcon";
import type { SectionPage } from "@/types";
import { PageCardTestId } from "./PageCard.constants";

type PageCardProps = {
  page: SectionPage;
  isLastCreated: boolean;
};

export const PageCard = ({ page, isLastCreated }: PageCardProps) => {
  const cardRef = useScrollIntoView<HTMLDivElement>(isLastCreated);

  return (
    <Box
      ref={cardRef}
      data-testid={PageCardTestId.container}
      display="flex"
      alignItems="center"
      gap="2"
      py="2"
      px="3"
      minWidth="0"
      borderRadius="md"
      borderWidth="1px"
      borderColor="border"
      borderLeftWidth="4px"
      borderLeftColor={page.color}
      backgroundColor="bg"
    >
      <PageTypeIcon type={page.type} />

      <TruncatedText data-testid={PageCardTestId.name} fontWeight="medium">
        {page.name}
      </TruncatedText>
    </Box>
  );
};
