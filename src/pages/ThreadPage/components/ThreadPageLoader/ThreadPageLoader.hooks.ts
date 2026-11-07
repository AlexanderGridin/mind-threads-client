import { useContext, useEffect, useState } from "react";
import { notify } from "@/components/lib";
import { useThreadSectionsService, useThreadsService } from "@/services";
import { checkContext } from "@/utils";
import { ThreadStatus } from "@/pages/ThreadPage/ThreadPage.constants";
import type { ThreadStatusType } from "@/pages/ThreadPage/ThreadPage.types";
import type { MindThread, ThreadSection, ThreadSectionValue } from "@/types";
import {
  ThreadPageActionContext,
  ThreadPageValueContext,
} from "./ThreadPageLoader.context";
import { SAVE_SECTION_ERROR_MESSAGE } from "./ThreadPageLoader.constants";
import { getSectionCreatedMessage } from "./ThreadPageLoader.utils";
import type { UseAddSectionParams } from "./ThreadPageLoader.types";

export const useThreadPageValue = () => {
  const context = useContext(ThreadPageValueContext);

  return checkContext(context, "ThreadPageValueContext", "useThreadPageValue");
};

export const useThreadPageAction = () => {
  const context = useContext(ThreadPageActionContext);

  return checkContext(
    context,
    "ThreadPageActionContext",
    "useThreadPageAction"
  );
};

export const useThreadState = (threadId: string) => {
  const threadsService = useThreadsService();
  const threadSectionsService = useThreadSectionsService();

  const [thread, setThread] = useState<MindThread | null>(null);
  const [sections, setSections] = useState<ThreadSection[]>([]);

  const [threadStatus, setThreadStatus] = useState<ThreadStatusType>(
    ThreadStatus.Loading
  );

  useEffect(() => {
    if (threadStatus !== ThreadStatus.Loading) {
      return;
    }

    let isActive = true;

    const loadThread = async () => {
      try {
        const storedThread = await threadsService.getThread(threadId);

        const storedSections = storedThread
          ? await threadSectionsService.getThreadSections(threadId)
          : [];

        if (!isActive) {
          return;
        }

        setThread(storedThread);
        setSections(storedSections);

        setThreadStatus(
          storedThread ? ThreadStatus.Loaded : ThreadStatus.NotFound
        );
      } catch {
        if (isActive) {
          setThreadStatus(ThreadStatus.Error);
        }
      }
    };

    loadThread();

    return () => {
      isActive = false;
    };
  }, [threadId, threadStatus, threadsService, threadSectionsService]);

  const addSection = async (sectionValue: ThreadSectionValue) => {
    const createdSection = await threadsService.addThreadSection({
      threadId,
      ...sectionValue,
    });

    setSections((currentSections) => {
      return [...currentSections, createdSection];
    });

    return createdSection;
  };

  return { thread, sections, threadStatus, addSection };
};

export const useAddSection = ({ addSection }: UseAddSectionParams) => {
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [isSavingSection, setIsSavingSection] = useState(false);

  const [lastCreatedSectionId, setLastCreatedSectionId] = useState<
    string | null
  >(null);

  const openAddSectionModal = () => {
    setIsAddSectionModalOpen(true);
  };

  const closeAddSectionModal = () => {
    setIsAddSectionModalOpen(false);
  };

  const submitNewSection = async (sectionValue: ThreadSectionValue) => {
    setIsSavingSection(true);

    try {
      const createdSection = await addSection(sectionValue);

      setLastCreatedSectionId(createdSection.id);
      closeAddSectionModal();
      notify.success(getSectionCreatedMessage(createdSection.name));
    } catch {
      notify.error(SAVE_SECTION_ERROR_MESSAGE);
    } finally {
      setIsSavingSection(false);
    }
  };

  return {
    isAddSectionModalOpen,
    isSavingSection,
    lastCreatedSectionId,
    openAddSectionModal,
    closeAddSectionModal,
    submitNewSection,
  };
};
