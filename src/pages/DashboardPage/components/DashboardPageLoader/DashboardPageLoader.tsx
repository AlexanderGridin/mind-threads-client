import type { ReactNode } from "react";
import { useState } from "react";
import { notify } from "@/components/lib";
import { useLocalStorage } from "@/hooks";
import type { NewMindThread } from "@/types";
import { ThreadListMode } from "../../DashboardPage.constants";
import type { ThreadListModeType } from "../../DashboardPage.types";
import {
  DashboardPageValueContext,
  DashboardPageActionContext,
} from "./DashboardPageLoader.context";
import {
  SAVE_THREAD_ERROR_MESSAGE,
  THREAD_LIST_MODE_STORAGE_KEY,
} from "./DashboardPageLoader.constants";
import { getThreadCreatedMessage } from "./DashboardPageLoader.utils";
import { useThreadsState } from "./DashboardPageLoader.hooks";

export const DashboardPageLoader = ({ children }: { children: ReactNode }) => {
  const threadListModeStorage = useLocalStorage<ThreadListModeType>({
    key: THREAD_LIST_MODE_STORAGE_KEY,
  });

  const { threads, threadsStatus, addThread } = useThreadsState();

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

  return (
    <DashboardPageActionContext.Provider
      value={{
        toggleThreadListMode,
        openAddThreadModal,
        closeAddThreadModal,
        submitNewThread,
      }}
    >
      <DashboardPageValueContext.Provider
        value={{ threadListMode, threads, threadsStatus, isAddThreadModalOpen }}
      >
        {children}
      </DashboardPageValueContext.Provider>
    </DashboardPageActionContext.Provider>
  );
};
