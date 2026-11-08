import type {
  MindThread,
  MindThreadUpdate,
  NewMindThread,
  NewThreadSection,
  ThreadSection,
} from "@/types";

export type UseThreadsServiceReturn = {
  getThreads: () => Promise<MindThread[]>;
  getThread: (threadId: string) => Promise<MindThread | null>;
  createThread: (newThread: NewMindThread) => Promise<MindThread>;
  updateThread: (threadUpdate: MindThreadUpdate) => Promise<MindThread>;
  deleteThread: (threadId: string) => Promise<void>;
  addThreadSection: (newSection: NewThreadSection) => Promise<ThreadSection>;
};

export type ApplyThreadUpdateParams = {
  thread: MindThread;
  threadUpdate: MindThreadUpdate;
};

export type ApplyNewSectionParams = {
  thread: MindThread;
  createdAt: string;
};

export type FindThreadParams = {
  threads: MindThread[];
  threadId: string;
};
