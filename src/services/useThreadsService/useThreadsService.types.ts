import type { MindThread, MindThreadUpdate, NewMindThread } from "@/types";

export type UseThreadsServiceReturn = {
  getThreads: () => Promise<MindThread[]>;
  createThread: (newThread: NewMindThread) => Promise<MindThread>;
  updateThread: (threadUpdate: MindThreadUpdate) => Promise<MindThread>;
  deleteThread: (threadId: string) => Promise<void>;
};

export type ApplyThreadUpdateParams = {
  thread: MindThread;
  threadUpdate: MindThreadUpdate;
};
