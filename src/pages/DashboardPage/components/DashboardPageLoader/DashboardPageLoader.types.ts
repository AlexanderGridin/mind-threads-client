import type { MindThread, NewMindThread } from "@/types";
import type {
  ThreadListModeType,
  ThreadsStatusType,
} from "../../DashboardPage.types";

export type DashboardPageValue = {
  threadListMode: ThreadListModeType;
  threads: MindThread[];
  threadsStatus: ThreadsStatusType;
  isAddThreadModalOpen: boolean;
};

export type DashboardPageAction = {
  toggleThreadListMode: () => void;
  openAddThreadModal: () => void;
  closeAddThreadModal: () => void;
  submitNewThread: (newThread: NewMindThread) => Promise<void>;
};
