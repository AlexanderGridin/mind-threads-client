import { Box } from "@/components/lib";
import type { MindThread } from "@/types";
import { ThreadListMode } from "@/pages/DashboardPage/DashboardPage.constants";
import { useDashboardPageValue } from "../../../DashboardPageLoader";
import { MindThreadCard } from "../MindThreadCard";
import { MindThreadListTestId } from "./MindThreadList.constants";

export const MindThreadList = () => {
  const { threads, threadListMode } = useDashboardPageValue();

  const inListMode = threadListMode === ThreadListMode.List;

  const display = inListMode ? "flex" : "grid";
  const flexDirection = inListMode ? "column" : undefined;

  const gridTemplateColumns = inListMode
    ? undefined
    : "repeat(auto-fill, minmax(320px, 1fr))";

  const handleThreadClick = (thread: MindThread) => {
    console.log(thread);
  };

  return (
    <Box
      data-testid={MindThreadListTestId.container}
      as="ul"
      display={display}
      gridTemplateColumns={gridTemplateColumns}
      gap="4"
      flexDirection={flexDirection}
    >
      {threads.map((thread) => (
        <Box
          key={thread.id}
          data-testid={MindThreadListTestId.listItem}
          as="li"
        >
          <MindThreadCard
            thread={thread}
            forMode={threadListMode}
            onClick={handleThreadClick}
          />
        </Box>
      ))}
    </Box>
  );
};
