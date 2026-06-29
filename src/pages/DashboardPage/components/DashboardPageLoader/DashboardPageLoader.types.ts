import type { MindThread } from "@/types";
import type { ThreadListModeType } from "../../DashboardPage.types";

export type DashboardPageValue = {
  threadListMode: ThreadListModeType;
  threads: MindThread[];
};

export type DashboardPageAction = {
  toggleThreadListMode: () => void;
};
