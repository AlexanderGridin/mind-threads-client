import type { ReactNode } from "react";
import {
  DashboardPageValueContext,
  DashboardPageActionContext,
} from "./DashboardPageLoader.context";
import {
  useAddThread,
  useDeleteThread,
  useThreadListMode,
  useThreadsState,
} from "./DashboardPageLoader.hooks";

export const DashboardPageLoader = ({ children }: { children: ReactNode }) => {
  const { threadListMode, toggleThreadListMode } = useThreadListMode();

  const { threads, threadsStatus, addThread, removeThread } = useThreadsState();

  const {
    isAddThreadModalOpen,
    openAddThreadModal,
    closeAddThreadModal,
    submitNewThread,
  } = useAddThread({ addThread });

  const {
    threadToDelete,
    isDeletingThread,
    openDeleteThreadModal,
    closeDeleteThreadModal,
    confirmDeleteThread,
  } = useDeleteThread({ removeThread });

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
