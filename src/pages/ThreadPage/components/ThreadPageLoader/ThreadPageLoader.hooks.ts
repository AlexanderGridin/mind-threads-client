import { useContext, useEffect, useState } from "react";
import { notify } from "@/components/lib";
import {
  useSectionPagesService,
  useThreadSectionsService,
  useThreadsService,
} from "@/services";
import { checkContext } from "@/utils";
import { ThreadStatus } from "@/pages/ThreadPage/ThreadPage.constants";
import type { ThreadStatusType } from "@/pages/ThreadPage/ThreadPage.types";
import type {
  MindThread,
  SectionPage,
  SectionPageValue,
  ThreadSection,
  ThreadSectionValue,
} from "@/types";
import {
  ThreadPageActionContext,
  ThreadPageValueContext,
} from "./ThreadPageLoader.context";
import {
  DELETE_SECTION_ERROR_MESSAGE,
  NO_SELECTED_SECTION_ERROR,
  SAVE_PAGE_ERROR_MESSAGE,
  SAVE_SECTION_ERROR_MESSAGE,
} from "./ThreadPageLoader.constants";
import {
  getPageCreatedMessage,
  getSectionCreatedMessage,
  getSectionDeletedMessage,
} from "./ThreadPageLoader.utils";
import type {
  AddPageParams,
  UseAddPageParams,
  UseAddSectionParams,
  UseCreateModalParams,
  UseDeleteSectionParams,
  UseSectionSelectionParams,
} from "./ThreadPageLoader.types";

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
  const sectionPagesService = useSectionPagesService();

  const [thread, setThread] = useState<MindThread | null>(null);
  const [sections, setSections] = useState<ThreadSection[]>([]);
  const [pages, setPages] = useState<SectionPage[]>([]);

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

        const storedPages = storedThread
          ? await sectionPagesService.getThreadPages(threadId)
          : [];

        if (!isActive) {
          return;
        }

        setThread(storedThread);
        setSections(storedSections);
        setPages(storedPages);

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
  }, [
    threadId,
    threadStatus,
    threadsService,
    threadSectionsService,
    sectionPagesService,
  ]);

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

  const removeSection = async (sectionId: string) => {
    await threadsService.removeThreadSection({ threadId, sectionId });

    setSections((currentSections) => {
      return currentSections.filter((section) => {
        return section.id !== sectionId;
      });
    });

    setPages((currentPages) => {
      return currentPages.filter((page) => {
        return page.sectionId !== sectionId;
      });
    });
  };

  const addPage = async ({ sectionId, pageValue }: AddPageParams) => {
    const createdPage = await threadsService.addSectionPage({
      threadId,
      sectionId,
      ...pageValue,
    });

    setPages((currentPages) => {
      return [...currentPages, createdPage];
    });

    return createdPage;
  };

  return {
    thread,
    sections,
    pages,
    threadStatus,
    addSection,
    removeSection,
    addPage,
  };
};

export const useCreateModal = <Value>({
  create,
  getCreatedMessage,
  errorMessage,
}: UseCreateModalParams<Value>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastCreatedId, setLastCreatedId] = useState<string | null>(null);

  const open = () => {
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
  };

  const submit = async (value: Value) => {
    setIsSaving(true);

    try {
      const createdItem = await create(value);

      setLastCreatedId(createdItem.id);
      close();
      notify.success(getCreatedMessage(createdItem.name));
    } catch {
      notify.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return { isOpen, isSaving, lastCreatedId, open, close, submit };
};

export const useSectionSelection = ({
  sections,
}: UseSectionSelectionParams) => {
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null
  );

  const selectedSection =
    sections.find((section) => {
      return section.id === selectedSectionId;
    }) ?? null;

  const selectSection = (sectionId: string) => {
    setSelectedSectionId(sectionId);
  };

  return { selectedSection, selectSection };
};

export const useAddPage = ({ addPage, selectedSection }: UseAddPageParams) => {
  const addPageToSelectedSection = async (pageValue: SectionPageValue) => {
    if (!selectedSection) {
      throw new Error(NO_SELECTED_SECTION_ERROR);
    }

    return addPage({ sectionId: selectedSection.id, pageValue });
  };

  const pageModal = useCreateModal({
    create: addPageToSelectedSection,
    getCreatedMessage: getPageCreatedMessage,
    errorMessage: SAVE_PAGE_ERROR_MESSAGE,
  });

  return {
    isAddPageModalOpen: pageModal.isOpen,
    isSavingPage: pageModal.isSaving,
    lastCreatedPageId: pageModal.lastCreatedId,
    openAddPageModal: pageModal.open,
    closeAddPageModal: pageModal.close,
    submitNewPage: pageModal.submit,
  };
};

export const useAddSection = ({ addSection }: UseAddSectionParams) => {
  const sectionModal = useCreateModal({
    create: addSection,
    getCreatedMessage: getSectionCreatedMessage,
    errorMessage: SAVE_SECTION_ERROR_MESSAGE,
  });

  return {
    isAddSectionModalOpen: sectionModal.isOpen,
    isSavingSection: sectionModal.isSaving,
    lastCreatedSectionId: sectionModal.lastCreatedId,
    openAddSectionModal: sectionModal.open,
    closeAddSectionModal: sectionModal.close,
    submitNewSection: sectionModal.submit,
  };
};

export const useDeleteSection = ({ removeSection }: UseDeleteSectionParams) => {
  const [sectionToDelete, setSectionToDelete] = useState<ThreadSection | null>(
    null
  );

  const [isDeletingSection, setIsDeletingSection] = useState(false);

  const openDeleteSectionModal = (section: ThreadSection) => {
    setSectionToDelete(section);
  };

  const closeDeleteSectionModal = () => {
    setSectionToDelete(null);
  };

  const confirmDeleteSection = async () => {
    if (!sectionToDelete) {
      return;
    }

    setIsDeletingSection(true);

    try {
      await removeSection(sectionToDelete.id);

      closeDeleteSectionModal();
      notify.success(getSectionDeletedMessage(sectionToDelete.name));
    } catch {
      notify.error(DELETE_SECTION_ERROR_MESSAGE);
    } finally {
      setIsDeletingSection(false);
    }
  };

  return {
    sectionToDelete,
    isDeletingSection,
    openDeleteSectionModal,
    closeDeleteSectionModal,
    confirmDeleteSection,
  };
};
