import type { ReactNode } from "react";
import { useState } from "react";
import { notify } from "@/components/lib";
import { useLocalStorage } from "@/hooks";
import type { MindThread, NewMindThread } from "@/types";
import { ThreadListMode } from "../../DashboardPage.constants";
import type { ThreadListModeType } from "../../DashboardPage.types";
import {
  DashboardPageValueContext,
  DashboardPageActionContext,
} from "./DashboardPageLoader.context";
import {
  DELETE_THREAD_ERROR_MESSAGE,
  SAVE_THREAD_ERROR_MESSAGE,
  THREAD_LIST_MODE_STORAGE_KEY,
} from "./DashboardPageLoader.constants";
import {
  getThreadCreatedMessage,
  getThreadDeletedMessage,
} from "./DashboardPageLoader.utils";
import { useThreadsState } from "./DashboardPageLoader.hooks";

export const DashboardPageLoader = ({ children }: { children: ReactNode }) => {
  const threadListModeStorage = useLocalStorage<ThreadListModeType>({
    key: THREAD_LIST_MODE_STORAGE_KEY,
  });

  const { threads, threadsStatus, addThread, removeThread } = useThreadsState();

  const [threadListMode, setThreadListMode] = useState<ThreadListModeType>(
    () => {
      const storedThreadListMode = threadListModeStorage.read();

      if (storedThreadListMode === null) {
        const initialMode = ThreadListMode.Grid;
        threadListModeStorage.set(initialMode);

        return initialMode;
      }

      return storedThreadListMode;
    }
  );

  const [isAddThreadModalOpen, setIsAddThreadModalOpen] = useState(false);

  const [threadToDelete, setThreadToDelete] = useState<MindThread | null>(null);
  const [isDeletingThread, setIsDeletingThread] = useState(false);

  const toggleThreadListMode = () => {
    setThreadListMode((current) => {
      const newThreadListMode =
        current === ThreadListMode.Grid
          ? ThreadListMode.List
          : ThreadListMode.Grid;

      threadListModeStorage.set(newThreadListMode);

      return newThreadListMode;
    });
  };

  const openAddThreadModal = () => setIsAddThreadModalOpen(true);
  const closeAddThreadModal = () => setIsAddThreadModalOpen(false);

  const submitNewThread = async (newThread: NewMindThread) => {
    try {
      const createdThread = await addThread(newThread);

      closeAddThreadModal();
      notify.success(getThreadCreatedMessage(createdThread.title));
    } catch {
      notify.error(SAVE_THREAD_ERROR_MESSAGE);
    }
  };

  const openDeleteThreadModal = (thread: MindThread) =>
    setThreadToDelete(thread);
  const closeDeleteThreadModal = () => setThreadToDelete(null);

  const confirmDeleteThread = async () => {
    if (threadToDelete === null) return;

    setIsDeletingThread(true);

    try {
      await removeThread(threadToDelete.id);

      closeDeleteThreadModal();
      notify.success(getThreadDeletedMessage(threadToDelete.title));
    } catch {
      notify.error(DELETE_THREAD_ERROR_MESSAGE);
    } finally {
      setIsDeletingThread(false);
    }
  };

  return (
    <DashboardPageActionContext.Provider
      value={{
        toggleThreadListMode,
        openAddThreadModal,
        closeAddThreadModal,
        submitNewThread,
        openDeleteThreadModal,
        closeDeleteThreadModal,
        confirmDeleteThread,
      }}
    >
      <DashboardPageValueContext.Provider
        value={{
          threadListMode,
          threads,
          threadsStatus,
          isAddThreadModalOpen,
          threadToDelete,
          isDeletingThread,
        }}
      >
        {children}
      </DashboardPageValueContext.Provider>
    </DashboardPageActionContext.Provider>
  );
};
