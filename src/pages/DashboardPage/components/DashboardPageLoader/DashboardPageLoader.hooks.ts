import { useContext, useEffect, useState } from "react";
import { notify } from "@/components/lib";
import { useLocalStorage } from "@/hooks";
import { checkContext, replaceThread } from "@/utils";
import { useThreadsService } from "@/services";
import type { MindThread, MindThreadUpdate, NewMindThread } from "@/types";
import { ThreadListMode, ThreadsStatus } from "../../DashboardPage.constants";
import type {
  ThreadListModeType,
  ThreadsStatusType,
} from "../../DashboardPage.types";
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
  getThreadUpdatedMessage,
} from "./DashboardPageLoader.utils";
import type {
  UseAddThreadParams,
  UseDeleteThreadParams,
  UseEditThreadParams,
} from "./DashboardPageLoader.types";

export const useDashboardPageValue = () => {
  const context = useContext(DashboardPageValueContext);

  return checkContext(
    context,
    "DashboardPageValueContext",
    "useDashboardPageValue"
  );
};

export const useDashboardPageAction = () => {
  const context = useContext(DashboardPageActionContext);

  return checkContext(
    context,
    "DashboardPageActionContext",
    "useDashboardPageAction"
  );
};

export const useThreadsState = () => {
  const threadsService = useThreadsService();

  const [threads, setThreads] = useState<MindThread[]>([]);
  const [threadsStatus, setThreadsStatus] = useState<ThreadsStatusType>(
    ThreadsStatus.Loading
  );

  useEffect(() => {
    if (threadsStatus !== ThreadsStatus.Loading) return;

    let isActive = true;

    const loadThreads = async () => {
      try {
        const storedThreads = await threadsService.getThreads();

        if (!isActive) return;

        setThreads(storedThreads);
        setThreadsStatus(ThreadsStatus.Loaded);
      } catch {
        if (isActive) setThreadsStatus(ThreadsStatus.Error);
      }
    };

    loadThreads();

    return () => {
      isActive = false;
    };
  }, [threadsStatus, threadsService]);

  const addThread = async (newThread: NewMindThread) => {
    const createdThread = await threadsService.createThread(newThread);

    setThreads((currentThreads) => [createdThread, ...currentThreads]);

    return createdThread;
  };

  const editThread = async (threadUpdate: MindThreadUpdate) => {
    const updatedThread = await threadsService.updateThread(threadUpdate);

    setThreads((currentThreads) => {
      return replaceThread({ threads: currentThreads, updatedThread });
    });

    return updatedThread;
  };

  const removeThread = async (threadId: string) => {
    await threadsService.deleteThread(threadId);

    setThreads((currentThreads) =>
      currentThreads.filter((thread) => thread.id !== threadId)
    );
  };

  return { threads, threadsStatus, addThread, editThread, removeThread };
};

export const useEditThread = ({ editThread }: UseEditThreadParams) => {
  const [threadToEdit, setThreadToEdit] = useState<MindThread | null>(null);
  const [isSavingThread, setIsSavingThread] = useState(false);

  const openEditThreadModal = (thread: MindThread) => {
    setThreadToEdit(thread);
  };

  const closeEditThreadModal = () => {
    setThreadToEdit(null);
  };

  const submitEditedThread = async (threadChanges: NewMindThread) => {
    if (!threadToEdit) {
      return;
    }

    setIsSavingThread(true);

    try {
      const updatedThread = await editThread({
        id: threadToEdit.id,
        ...threadChanges,
      });

      closeEditThreadModal();
      notify.success(getThreadUpdatedMessage(updatedThread.title));
    } catch {
      notify.error(SAVE_THREAD_ERROR_MESSAGE);
    } finally {
      setIsSavingThread(false);
    }
  };

  return {
    threadToEdit,
    isSavingThread,
    openEditThreadModal,
    closeEditThreadModal,
    submitEditedThread,
  };
};

export const useDeleteThread = ({ removeThread }: UseDeleteThreadParams) => {
  const [threadToDelete, setThreadToDelete] = useState<MindThread | null>(null);
  const [isDeletingThread, setIsDeletingThread] = useState(false);

  const openDeleteThreadModal = (thread: MindThread) => {
    setThreadToDelete(thread);
  };

  const closeDeleteThreadModal = () => {
    setThreadToDelete(null);
  };

  const confirmDeleteThread = async () => {
    if (threadToDelete === null) {
      return;
    }

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

  return {
    threadToDelete,
    isDeletingThread,
    openDeleteThreadModal,
    closeDeleteThreadModal,
    confirmDeleteThread,
  };
};

export const useThreadListMode = () => {
  const threadListModeStorage = useLocalStorage<ThreadListModeType>({
    key: THREAD_LIST_MODE_STORAGE_KEY,
  });

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

  return { threadListMode, toggleThreadListMode };
};

export const useAddThread = ({ addThread }: UseAddThreadParams) => {
  const [isAddThreadModalOpen, setIsAddThreadModalOpen] = useState(false);

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

  return {
    isAddThreadModalOpen,
    openAddThreadModal,
    closeAddThreadModal,
    submitNewThread,
  };
};
