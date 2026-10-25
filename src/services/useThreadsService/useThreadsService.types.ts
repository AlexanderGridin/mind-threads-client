import type { MindThread, NewMindThread } from "@/types";

export type UseThreadsServiceReturn = {
  getThreads: () => Promise<MindThread[]>;
  createThread: (newThread: NewMindThread) => Promise<MindThread>;
};
