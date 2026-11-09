import { useLocalStorage } from "@/hooks";
import { replaceThread } from "@/utils";
import type {
  MindThread,
  MindThreadUpdate,
  NewMindThread,
  NewThreadSection,
  ThreadSection,
} from "@/types";
import { useThreadSectionsService } from "../useThreadSectionsService";
import {
  INVALID_THREADS_DATA_ERROR,
  THREAD_NOT_FOUND_ERROR,
  THREADS_STORAGE_KEY,
} from "./useThreadsService.constants";
import type {
  RemoveThreadSectionParams,
  UseThreadsServiceReturn,
} from "./useThreadsService.types";
import {
  applyDeletedSection,
  applyNewSection,
  applyThreadUpdate,
  buildThread,
  findThread,
  isMindThreadList,
} from "./useThreadsService.utils";

export const useThreadsService = (): UseThreadsServiceReturn => {
  const threadsStorage = useLocalStorage<MindThread[]>({
    key: THREADS_STORAGE_KEY,
    throwOnError: true,
  });

  const threadSectionsService = useThreadSectionsService();

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

    const storedThread = findThread({ threads: storedThreads, threadId });

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

    const storedThread = findThread({
      threads: storedThreads,
      threadId: threadUpdate.id,
    });

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

  const addThreadSection = async (
    newSection: NewThreadSection
  ): Promise<ThreadSection> => {
    const storedThreads = await getThreads();

    const storedThread = findThread({
      threads: storedThreads,
      threadId: newSection.threadId,
    });

    if (!storedThread) {
      throw new Error(THREAD_NOT_FOUND_ERROR);
    }

    const createdSection =
      await threadSectionsService.createThreadSection(newSection);

    threadsStorage.set(
      replaceThread({
        threads: storedThreads,
        updatedThread: applyNewSection({
          thread: storedThread,
          createdAt: createdSection.createdAt,
        }),
      })
    );

    return createdSection;
  };

  const removeThreadSection = async ({
    threadId,
    sectionId,
  }: RemoveThreadSectionParams): Promise<void> => {
    const storedThreads = await getThreads();
    const storedThread = findThread({ threads: storedThreads, threadId });

    const isSectionDeleted =
      await threadSectionsService.deleteSection(sectionId);

    if (!isSectionDeleted || !storedThread) {
      return;
    }

    threadsStorage.set(
      replaceThread({
        threads: storedThreads,
        updatedThread: applyDeletedSection({
          thread: storedThread,
          deletedAt: new Date().toISOString(),
        }),
      })
    );
  };

  const deleteThread = async (threadId: string): Promise<void> => {
    const storedThreads = await getThreads();

    await threadSectionsService.deleteThreadSections(threadId);

    const filteredThreads = storedThreads.filter(
      (thread) => thread.id !== threadId
    );

    threadsStorage.set(filteredThreads);
  };

  return {
    getThreads,
    getThread,
    createThread,
    updateThread,
    deleteThread,
    addThreadSection,
    removeThreadSection,
  };
};
