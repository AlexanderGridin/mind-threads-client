import { Box } from "@/components/lib";
import { ThreadListMode } from "@/pages/DashboardPage/DashboardPage.constants";
import {
  useDashboardPageAction,
  useDashboardPageValue,
} from "../../../DashboardPageLoader";
import { MindThreadCard } from "../MindThreadCard";
import { MindThreadListTestId } from "./MindThreadList.constants";

export const MindThreadList = () => {
  const { threads, threadListMode } = useDashboardPageValue();
  const { openEditThreadModal, openDeleteThreadModal } =
    useDashboardPageAction();

  const inListMode = threadListMode === ThreadListMode.List;

  const display = inListMode ? "flex" : "grid";
  const flexDirection = inListMode ? "column" : undefined;

  const gridTemplateColumns = inListMode
    ? undefined
    : "repeat(auto-fill, minmax(320px, 1fr))";

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
            onEdit={openEditThreadModal}
            onDelete={openDeleteThreadModal}
          />
        </Box>
      ))}
    </Box>
  );
};
