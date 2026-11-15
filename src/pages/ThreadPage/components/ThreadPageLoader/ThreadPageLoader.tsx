import type { ReactNode } from "react";
import {
  ThreadPageActionContext,
  ThreadPageValueContext,
} from "./ThreadPageLoader.context";
import {
  useAddPage,
  useAddSection,
  useDeletePage,
  useDeleteSection,
  usePageSelection,
  useSectionSelection,
  useSectionSwitch,
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
    removePage,
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

  const { selectedPage, selectPage, clearSelectedPage } = usePageSelection({
    pages,
  });

  const switchSection = useSectionSwitch({
    selectedSection,
    selectSection,
    clearSelectedPage,
  });

  const {
    isAddPageModalOpen,
    isSavingPage,
    lastCreatedPageId,
    openAddPageModal,
    closeAddPageModal,
    submitNewPage,
  } = useAddPage({ addPage, selectedSection });

  const {
    pageToDelete,
    isDeletingPage,
    openDeletePageModal,
    closeDeletePageModal,
    confirmDeletePage,
  } = useDeletePage({ removePage });

  return (
    <ThreadPageActionContext.Provider
      value={{
        openAddSectionModal,
        closeAddSectionModal,
        submitNewSection,
        openDeleteSectionModal,
        closeDeleteSectionModal,
        confirmDeleteSection,
        selectSection: switchSection,
        selectPage,
        openAddPageModal,
        closeAddPageModal,
        submitNewPage,
        openDeletePageModal,
        closeDeletePageModal,
        confirmDeletePage,
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
          selectedPage,
          isAddPageModalOpen,
          isSavingPage,
          lastCreatedPageId,
          pageToDelete,
          isDeletingPage,
        }}
      >
        {children}
      </ThreadPageValueContext.Provider>
    </ThreadPageActionContext.Provider>
  );
};
