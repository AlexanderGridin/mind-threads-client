import type { ReactNode } from "react";
import {
  ThreadPageActionContext,
  ThreadPageValueContext,
} from "./ThreadPageLoader.context";
import {
  useAddSection,
  useDeleteSection,
  useThreadState,
} from "./ThreadPageLoader.hooks";

type ThreadPageLoaderProps = {
  threadId: string;
  children: ReactNode;
};

export const ThreadPageLoader = ({
  threadId,
  children,
}: ThreadPageLoaderProps) => {
  const { thread, sections, threadStatus, addSection, removeSection } =
    useThreadState(threadId);

  const {
    isAddSectionModalOpen,
    isSavingSection,
    lastCreatedSectionId,
    openAddSectionModal,
    closeAddSectionModal,
    submitNewSection,
  } = useAddSection({ addSection });

  const {
    sectionToDelete,
    isDeletingSection,
    openDeleteSectionModal,
    closeDeleteSectionModal,
    confirmDeleteSection,
  } = useDeleteSection({ removeSection });

  return (
    <ThreadPageActionContext.Provider
      value={{
        openAddSectionModal,
        closeAddSectionModal,
        submitNewSection,
        openDeleteSectionModal,
        closeDeleteSectionModal,
        confirmDeleteSection,
      }}
    >
      <ThreadPageValueContext.Provider
        value={{
          thread,
          sections,
          threadStatus,
          isAddSectionModalOpen,
          isSavingSection,
          lastCreatedSectionId,
          sectionToDelete,
          isDeletingSection,
        }}
      >
        {children}
      </ThreadPageValueContext.Provider>
    </ThreadPageActionContext.Provider>
  );
};
