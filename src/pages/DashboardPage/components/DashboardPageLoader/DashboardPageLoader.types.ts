import type { MindThread, MindThreadUpdate, NewMindThread } from "@/types";
import type {
  ThreadListModeType,
  ThreadsStatusType,
} from "../../DashboardPage.types";

export type DashboardPageValue = {
  threadListMode: ThreadListModeType;
  threads: MindThread[];
  threadsStatus: ThreadsStatusType;
  isAddThreadModalOpen: boolean;
  threadToEdit: MindThread | null;
  isSavingThread: boolean;
  threadToDelete: MindThread | null;
  isDeletingThread: boolean;
};

export type DashboardPageAction = {
  toggleThreadListMode: () => void;
  openAddThreadModal: () => void;
  closeAddThreadModal: () => void;
  submitNewThread: (newThread: NewMindThread) => Promise<void>;
  openEditThreadModal: (thread: MindThread) => void;
  closeEditThreadModal: () => void;
  submitEditedThread: (threadChanges: NewMindThread) => Promise<void>;
  openDeleteThreadModal: (thread: MindThread) => void;
  closeDeleteThreadModal: () => void;
  confirmDeleteThread: () => Promise<void>;
};

export type UseDeleteThreadParams = {
  removeThread: (threadId: string) => Promise<void>;
};

export type UseAddThreadParams = {
  addThread: (newThread: NewMindThread) => Promise<MindThread>;
};

export type UseEditThreadParams = {
  editThread: (threadUpdate: MindThreadUpdate) => Promise<MindThread>;
};
