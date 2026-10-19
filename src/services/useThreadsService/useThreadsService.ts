import { useLocalStorage } from "@/hooks";
import type { MindThread, NewMindThread } from "@/types";
import {
  INVALID_THREADS_DATA_ERROR,
  THREADS_STORAGE_KEY,
} from "./useThreadsService.constants";
import type { UseThreadsServiceReturn } from "./useThreadsService.types";
import { buildThread, isMindThreadList } from "./useThreadsService.utils";

export const useThreadsService = (): UseThreadsServiceReturn => {
  const threadsStorage = useLocalStorage<MindThread[]>({
    key: THREADS_STORAGE_KEY,
    throwOnError: true,
  });

  const getThreads = async (): Promise<MindThread[]> => {
    const storedThreads = threadsStorage.read();

    if (storedThreads === null) return [];

    if (!isMindThreadList(storedThreads)) {
      throw new Error(INVALID_THREADS_DATA_ERROR);
    }

    return storedThreads;
  };

  const createThread = async (
    newThread: NewMindThread
  ): Promise<MindThread> => {
    const createdThread = buildThread(newThread);
    const storedThreads = await getThreads();

    threadsStorage.set([createdThread, ...storedThreads]);

    return createdThread;
  };

  return { getThreads, createThread };
};
