import type { MouseEvent } from "react";
import { LuEllipsisVertical } from "react-icons/lu";
import { Box, Menu, type MenuItem } from "@/components/lib";
import type { MindThread } from "@/types";
import { ThreadListMode } from "@/pages/DashboardPage/DashboardPage.constants";
import type { ThreadListModeType } from "@/pages/DashboardPage/DashboardPage.types";
import {
  DELETE_THREAD_MENU_ITEM,
  MindThreadCardTestId,
} from "../MindThreadCard.constants";
import { getThreadActionsLabel } from "../utils";

type CardActionsProps = {
  thread: MindThread;
  forMode: ThreadListModeType;
  onDelete: (thread: MindThread) => void;
};

export const CardActions = ({
  thread,
  forMode,
  onDelete,
}: CardActionsProps) => {
  const forListMode = forMode === ThreadListMode.List;
  const top = forListMode ? "2" : "4";

  const handleContainerClick = (event: MouseEvent) => {
    event.stopPropagation();
  };

  const handleDelete = () => {
    onDelete(thread);
  };

  const menuItems: MenuItem[] = [
    { ...DELETE_THREAD_MENU_ITEM, color: "red", onSelect: handleDelete },
  ];

  return (
    <Box
      data-testid={MindThreadCardTestId.actions}
      position="absolute"
      top={top}
      right="2"
      onClick={handleContainerClick}
    >
      <Menu
        triggerLabel={getThreadActionsLabel(thread.title)}
        triggerIcon={<LuEllipsisVertical />}
        data-testid={MindThreadCardTestId.actionsMenu}
        items={menuItems}
      />
    </Box>
  );
};
