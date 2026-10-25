import type { ThreadListMode, ThreadsStatus } from "./DashboardPage.constants";

export type ThreadListModeType =
  (typeof ThreadListMode)[keyof typeof ThreadListMode];

export type ThreadsStatusType =
  (typeof ThreadsStatus)[keyof typeof ThreadsStatus];
