import type { ReactNode } from "react";
import {
  ThreadPageActionContext,
  ThreadPageValueContext,
} from "./ThreadPageLoader.context";
import { useAddSection, useThreadState } from "./ThreadPageLoader.hooks";

type ThreadPageLoaderProps = {
  threadId: string;
  children: ReactNode;
};

export const ThreadPageLoader = ({
  threadId,
  children,
}: ThreadPageLoaderProps) => {
  const { thread, sections, threadStatus, addSection } =
    useThreadState(threadId);

  const {
    isAddSectionModalOpen,
    isSavingSection,
    lastCreatedSectionId,
    openAddSectionModal,
    closeAddSectionModal,
    submitNewSection,
  } = useAddSection({ addSection });

  return (
    <ThreadPageActionContext.Provider
      value={{ openAddSectionModal, closeAddSectionModal, submitNewSection }}
    >
      <ThreadPageValueContext.Provider
        value={{
          thread,
          sections,
          threadStatus,
          isAddSectionModalOpen,
          isSavingSection,
          lastCreatedSectionId,
        }}
      >
        {children}
      </ThreadPageValueContext.Provider>
    </ThreadPageActionContext.Provider>
  );
};
