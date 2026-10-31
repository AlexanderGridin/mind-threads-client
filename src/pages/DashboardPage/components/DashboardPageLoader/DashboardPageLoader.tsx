import type { ReactNode } from "react";
import {
  DashboardPageValueContext,
  DashboardPageActionContext,
} from "./DashboardPageLoader.context";
import {
  useAddThread,
  useDeleteThread,
  useEditThread,
  useThreadListMode,
  useThreadsState,
} from "./DashboardPageLoader.hooks";

export const DashboardPageLoader = ({ children }: { children: ReactNode }) => {
  const { threadListMode, toggleThreadListMode } = useThreadListMode();

  const { threads, threadsStatus, addThread, editThread, removeThread } =
    useThreadsState();

  const {
    isAddThreadModalOpen,
    openAddThreadModal,
    closeAddThreadModal,
    submitNewThread,
  } = useAddThread({ addThread });

  const {
    threadToEdit,
    isSavingThread,
    openEditThreadModal,
    closeEditThreadModal,
    submitEditedThread,
  } = useEditThread({ editThread });

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
        openEditThreadModal,
        closeEditThreadModal,
        submitEditedThread,
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
          threadToEdit,
          isSavingThread,
          threadToDelete,
          isDeletingThread,
        }}
      >
        {children}
      </DashboardPageValueContext.Provider>
    </DashboardPageActionContext.Provider>
  );
};
