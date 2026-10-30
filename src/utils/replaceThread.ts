import type { MindThread } from "@/types";

type ReplaceThreadParams = {
  threads: MindThread[];
  updatedThread: MindThread;
};

export const replaceThread = ({
  threads,
  updatedThread,
}: ReplaceThreadParams): MindThread[] => {
  return threads.map((thread) => {
    return thread.id === updatedThread.id ? updatedThread : thread;
  });
};
