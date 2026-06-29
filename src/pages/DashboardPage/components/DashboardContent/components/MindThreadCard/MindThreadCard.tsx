import { Box } from "@/components/lib";
import type { MindThread } from "@/types";
import { ThreadListMode } from "@/pages/DashboardPage/DashboardPage.constants";
import type { ThreadListModeType } from "@/pages/DashboardPage/DashboardPage.types";
import { CardColorIndicator, CardContent } from "./components";
import { MindThreadCardTestId } from "./MindThreadCard.constants";

type MindThreadCardProps = {
  thread: MindThread;
  forMode?: ThreadListModeType;
  onClick: (thread: MindThread) => void;
};

export const MindThreadCard = ({
  thread,
  forMode = ThreadListMode.Grid,
  onClick,
}: MindThreadCardProps) => {
  const forListMode = forMode === ThreadListMode.List;

  const flexDirection = forListMode ? "row" : "column";
  const gap = forListMode ? "3" : "0";

  const handleClick = () => onClick(thread);

  return (
    <Box
      data-testid={MindThreadCardTestId.container}
      display="flex"
      flexDirection={flexDirection}
      borderRadius="md"
      borderWidth="1px"
      borderColor="border"
      overflow="hidden"
      backgroundColor="bg"
      _hover={{
        borderColor: thread.color,
        boxShadow: "0 0 10px rgba(0,0,0,0.3)",
      }}
      transition="border-color 0.4s, box-shadow 0.4s"
      gap={gap}
      width="100%"
      textAlign="left"
      cursor="pointer"
      onClick={handleClick}
    >
      <CardColorIndicator color={thread.color} forMode={forMode} />
      <CardContent thread={thread} forMode={forMode} />
    </Box>
  );
};
