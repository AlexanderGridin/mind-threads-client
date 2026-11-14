import type { ReactNode } from "react";
import {
  ThreadPageActionContext,
  ThreadPageValueContext,
} from "./ThreadPageLoader.context";
import {
  useAddPage,
  useAddSection,
  useDeleteSection,
  useSectionSelection,
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
  const {
    thread,
    sections,
    pages,
    threadStatus,
    addSection,
    removeSection,
    addPage,
  } = useThreadState(threadId);

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

  const { selectedSection, selectSection } = useSectionSelection({ sections });

  const {
    isAddPageModalOpen,
    isSavingPage,
    lastCreatedPageId,
    openAddPageModal,
    closeAddPageModal,
    submitNewPage,
  } = useAddPage({ addPage, selectedSection });

  return (
    <ThreadPageActionContext.Provider
      value={{
        openAddSectionModal,
        closeAddSectionModal,
        submitNewSection,
        openDeleteSectionModal,
        closeDeleteSectionModal,
        confirmDeleteSection,
        selectSection,
        openAddPageModal,
        closeAddPageModal,
        submitNewPage,
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
          pages,
          selectedSection,
          isAddPageModalOpen,
          isSavingPage,
          lastCreatedPageId,
        }}
      >
        {children}
      </ThreadPageValueContext.Provider>
    </ThreadPageActionContext.Provider>
  );
};
