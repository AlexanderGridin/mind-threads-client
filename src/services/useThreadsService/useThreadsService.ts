import { useLocalStorage } from "@/hooks";
import { replaceThread } from "@/utils";
import type {
  ChatMessage,
  MindThread,
  MindThreadUpdate,
  NewChatMessage,
  NewMindThread,
  NewSectionPage,
  NewThreadSection,
  SectionPage,
  ThreadSection,
} from "@/types";
import { usePageMessagesService } from "../usePageMessagesService";
import { useSectionPagesService } from "../useSectionPagesService";
import { useThreadSectionsService } from "../useThreadSectionsService";
import {
  INVALID_THREADS_DATA_ERROR,
  PAGE_NOT_FOUND_ERROR,
  SECTION_NOT_FOUND_ERROR,
  THREAD_NOT_FOUND_ERROR,
  THREADS_STORAGE_KEY,
} from "./useThreadsService.constants";
import type {
  RemoveSectionPageParams,
  RemoveThreadSectionParams,
  UseThreadsServiceReturn,
} from "./useThreadsService.types";
import {
  applyDeletedPage,
  applyDeletedSection,
  applyNewPage,
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
  const sectionPagesService = useSectionPagesService();
  const pageMessagesService = usePageMessagesService();

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

  const addSectionPage = async (
    newPage: NewSectionPage
  ): Promise<SectionPage> => {
    const storedThreads = await getThreads();

    const storedThread = findThread({
      threads: storedThreads,
      threadId: newPage.threadId,
    });

    if (!storedThread) {
      throw new Error(THREAD_NOT_FOUND_ERROR);
    }

    const threadSections = await threadSectionsService.getThreadSections(
      newPage.threadId
    );

    const sectionExists = threadSections.some((section) => {
      return section.id === newPage.sectionId;
    });

    if (!sectionExists) {
      throw new Error(SECTION_NOT_FOUND_ERROR);
    }

    const createdPage = await sectionPagesService.createSectionPage(newPage);

    threadsStorage.set(
      replaceThread({
        threads: storedThreads,
        updatedThread: applyNewPage({
          thread: storedThread,
          createdAt: createdPage.createdAt,
        }),
      })
    );

    return createdPage;
  };

  const removeThreadSection = async ({
    threadId,
    sectionId,
  }: RemoveThreadSectionParams): Promise<void> => {
    const storedThreads = await getThreads();
    const storedThread = findThread({ threads: storedThreads, threadId });

    const isSectionDeleted =
      await threadSectionsService.deleteSection(sectionId);

    const deletedPageCount =
      await sectionPagesService.deleteSectionPages(sectionId);

    if (isSectionDeleted && storedThread) {
      threadsStorage.set(
        replaceThread({
          threads: storedThreads,
          updatedThread: applyDeletedSection({
            thread: storedThread,
            deletedPageCount,
            deletedAt: new Date().toISOString(),
          }),
        })
      );
    }

    await pageMessagesService.deleteSectionMessages(sectionId);
  };

  const removeSectionPage = async ({
    threadId,
    pageId,
  }: RemoveSectionPageParams): Promise<void> => {
    const storedThreads = await getThreads();
    const storedThread = findThread({ threads: storedThreads, threadId });

    const isPageDeleted = await sectionPagesService.deletePage(pageId);

    if (isPageDeleted && storedThread) {
      threadsStorage.set(
        replaceThread({
          threads: storedThreads,
          updatedThread: applyDeletedPage({
            thread: storedThread,
            deletedAt: new Date().toISOString(),
          }),
        })
      );
    }

    await pageMessagesService.deletePageMessages(pageId);
  };

  const getPageMessages = async (pageId: string): Promise<ChatMessage[]> => {
    return pageMessagesService.getPageMessages(pageId);
  };

  const addPageMessage = async (
    newMessage: NewChatMessage
  ): Promise<ChatMessage> => {
    const threadPages = await sectionPagesService.getThreadPages(
      newMessage.threadId
    );

    const pageExists = threadPages.some((page) => {
      return page.id === newMessage.pageId;
    });

    if (!pageExists) {
      throw new Error(PAGE_NOT_FOUND_ERROR);
    }

    return pageMessagesService.createMessage(newMessage);
  };

  const deleteThread = async (threadId: string): Promise<void> => {
    const storedThreads = await getThreads();

    await threadSectionsService.deleteThreadSections(threadId);
    await sectionPagesService.deleteThreadPages(threadId);

    const filteredThreads = storedThreads.filter(
      (thread) => thread.id !== threadId
    );

    threadsStorage.set(filteredThreads);

    await pageMessagesService.deleteThreadMessages(threadId);
  };

  return {
    getThreads,
    getThread,
    createThread,
    updateThread,
    deleteThread,
    addThreadSection,
    removeThreadSection,
    addSectionPage,
    removeSectionPage,
    getPageMessages,
    addPageMessage,
  };
};
