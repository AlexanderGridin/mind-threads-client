import type { ThreadListMode } from "./DashboardPage.constants";

export type ThreadListModeType =
  (typeof ThreadListMode)[keyof typeof ThreadListMode];
