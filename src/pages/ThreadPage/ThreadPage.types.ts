import type { MindThread } from "@/types";
import type { ThreadStatus } from "./ThreadPage.constants";

export type ThreadStatusType = (typeof ThreadStatus)[keyof typeof ThreadStatus];

export type GetThreadPageTitleParams = {
  thread: MindThread | null;
  threadStatus: ThreadStatusType;
};
