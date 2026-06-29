import { forwardRef } from "react";
import { IconButton } from "@/components/lib";
import { LuLayoutGrid, LuLayoutList } from "react-icons/lu";
import { ThreadListMode } from "@/pages/DashboardPage/DashboardPage.constants";
import {
  useDashboardPageValue,
  useDashboardPageAction,
} from "../../../DashboardPageLoader";
import { ThreadListModeButtonTestId } from "./ThreadListModeButton.constants";

export const ThreadListModeButton = forwardRef<HTMLButtonElement, unknown>(
  (_, ref) => {
    const { threadListMode } = useDashboardPageValue();
    const { toggleThreadListMode } = useDashboardPageAction();

    return (
      <IconButton
        data-testid={ThreadListModeButtonTestId.container}
        aria-label="Toggle thread list mode"
        variant="outline"
        borderColor="border"
        color="fg"
        size="sm"
        ref={ref}
        css={{ _icon: { width: "5", height: "5" } }}
        onClick={toggleThreadListMode}
      >
        {threadListMode === ThreadListMode.Grid ? (
          <LuLayoutGrid data-testid={ThreadListModeButtonTestId.gridIcon} />
        ) : (
          <LuLayoutList data-testid={ThreadListModeButtonTestId.listIcon} />
        )}
      </IconButton>
    );
  }
);

ThreadListModeButton.displayName = "ThreadListModeButton";
