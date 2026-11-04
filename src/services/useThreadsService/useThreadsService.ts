import { useLocalStorage } from "@/hooks";
import { replaceThread } from "@/utils";
import type { MindThread, MindThreadUpdate, NewMindThread } from "@/types";
import {
  INVALID_THREADS_DATA_ERROR,
  THREAD_NOT_FOUND_ERROR,
  THREADS_STORAGE_KEY,
} from "./useThreadsService.constants";
import type { UseThreadsServiceReturn } from "./useThreadsService.types";
import {
  applyThreadUpdate,
  buildThread,
  isMindThreadList,
} from "./useThreadsService.utils";

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

  const getThread = async (threadId: string): Promise<MindThread | null> => {
    const storedThreads = await getThreads();

    const storedThread = storedThreads.find((thread) => {
      return thread.id === threadId;
    });

    return storedThread ?? null;
  };

  const createThread = async (
    newThread: NewMindThread
  ): Promise<MindThread> => {
    const createdThread = buildThread(newThread);
    const storedThreads = await getThreads();

    threadsStorage.set([createdThread, ...storedThreads]);

    return createdThread;
  };

  const updateThread = async (
    threadUpdate: MindThreadUpdate
  ): Promise<MindThread> => {
    const storedThreads = await getThreads();

    const storedThread = storedThreads.find(
      (thread) => thread.id === threadUpdate.id
    );

    if (!storedThread) {
      throw new Error(THREAD_NOT_FOUND_ERROR);
    }

    const updatedThread = applyThreadUpdate({
      thread: storedThread,
      threadUpdate,
    });

    threadsStorage.set(
      replaceThread({ threads: storedThreads, updatedThread })
    );

    return updatedThread;
  };

  const deleteThread = async (threadId: string): Promise<void> => {
    const storedThreads = await getThreads();

    threadsStorage.set(
      storedThreads.filter((thread) => thread.id !== threadId)
    );
  };

  return { getThreads, getThread, createThread, updateThread, deleteThread };
};
