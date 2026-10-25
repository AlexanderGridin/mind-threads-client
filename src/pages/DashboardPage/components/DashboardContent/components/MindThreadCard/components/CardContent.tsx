import { HStack, VStack, Text } from "@/components/lib";
import type { MindThread } from "@/types";
import { ThreadListMode } from "@/pages/DashboardPage/DashboardPage.constants";
import type { ThreadListModeType } from "@/pages/DashboardPage/DashboardPage.types";
import { MindThreadCardTestId } from "../MindThreadCard.constants";
import { formatLastUpdated } from "../utils";

type CardContentProps = {
  thread: MindThread;
  forMode: ThreadListModeType;
};

export const CardContent = ({ thread, forMode }: CardContentProps) => {
  const forListMode = forMode === ThreadListMode.List;

  const contentGap = forListMode ? "1" : "3";
  const lastUpdatedText = formatLastUpdated(thread.lastUpdated);

  return (
    <VStack
      data-testid={MindThreadCardTestId.contentContainer}
      gap={contentGap}
      alignItems="flex-start"
      p="4"
      pr="12"
    >
      <Text
        data-testid={MindThreadCardTestId.title}
        fontWeight="600"
        fontSize="lg"
        as="h3"
      >
        {thread.title}
      </Text>

      <HStack gap="4" fontSize="md" color="fg.muted">
        <Text data-testid={MindThreadCardTestId.sections}>
          {thread.totalSections} sections
        </Text>

        <Text data-testid={MindThreadCardTestId.pages}>
          {thread.totalPages} pages
        </Text>
      </HStack>

      <Text
        data-testid={MindThreadCardTestId.lastUpdated}
        fontSize="md"
        color="fg.muted"
      >
        Updated: {lastUpdatedText || "N/A"}
      </Text>
    </VStack>
  );
};
