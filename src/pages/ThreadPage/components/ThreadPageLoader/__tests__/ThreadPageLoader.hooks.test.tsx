import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { act, renderHook, screen, waitFor } from "@testing-library/react";
import { ChakraUIProvider } from "@/components/lib/ChakraUIProvider";
import { NotificationsTestId } from "@/components/lib/Notifications/Notifications.constants";
import {
  MALFORMED_JSON,
  createDeferred,
  createServicesMock,
  mindThreadFixtures,
  resetThreadsServiceOverrides,
  sectionPageFixtures,
  seedPages,
  seedSections,
  seedThreads,
  threadSectionFixtures,
  threadsServiceOverrides,
} from "@/__test-fixtures__";
import type {
  MindThread,
  SectionPage,
  SectionPageValue,
  ThreadSection,
  ThreadSectionValue,
} from "@/types";
import { SECTIONS_STORAGE_KEY } from "@/services/useThreadSectionsService/useThreadSectionsService.constants";
import { ThreadStatus } from "@/pages/ThreadPage/ThreadPage.constants";
import {
  useAddPage,
  useAddSection,
  useDeleteSection,
  useSectionSelection,
  useThreadPageAction,
  useThreadPageValue,
  useThreadState,
} from "../ThreadPageLoader.hooks";
import type { UseAddPageParams } from "../ThreadPageLoader.types";
import {
  DELETE_SECTION_ERROR_MESSAGE,
  SAVE_PAGE_ERROR_MESSAGE,
  SAVE_SECTION_ERROR_MESSAGE,
} from "../ThreadPageLoader.constants";
import {
  getPageCreatedMessage,
  getSectionCreatedMessage,
  getSectionDeletedMessage,
} from "../ThreadPageLoader.utils";

vi.mock("@/services", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/services")>();

  return createServicesMock(original);
});

const STORED_THREAD_ID = mindThreadFixtures[0].id;
const OTHER_THREAD_ID = mindThreadFixtures[1].id;
const UNKNOWN_THREAD_ID = "unknown-thread-id";

const NEW_SECTION_VALUE: ThreadSectionValue = {
  name: "Ideas",
  color: "#5E81AC",
};

const NEW_PAGE_VALUE: SectionPageValue = {
  name: "Ideas",
  type: "chat",
  color: "#5E81AC",
};

const getSectionsOfThread = (threadId: string): ThreadSection[] => {
  return threadSectionFixtures.filter((section) => {
    return section.threadId === threadId;
  });
};

const getPagesOfThread = (threadId: string): SectionPage[] => {
  return sectionPageFixtures.filter((page) => {
    return page.threadId === threadId;
  });
};

const setupSectionSelection = (sections: ThreadSection[]) => {
  return renderHook(
    ({ sections: currentSections }) => {
      return useSectionSelection({ sections: currentSections });
    },
    { initialProps: { sections } }
  );
};

const setupAddPage = (
  addPage: UseAddPageParams["addPage"],
  selectedSection: ThreadSection | null
) => {
  return renderHook(() => useAddPage({ addPage, selectedSection }), {
    wrapper: ChakraUIProvider,
  });
};

const setupThreadState = (threadId: string) => {
  return renderHook(() => useThreadState(threadId), {
    wrapper: ChakraUIProvider,
  });
};

const setupAddSection = (
  addSection: (sectionValue: ThreadSectionValue) => Promise<ThreadSection>
) => {
  return renderHook(() => useAddSection({ addSection }), {
    wrapper: ChakraUIProvider,
  });
};

const setupDeleteSection = (
  removeSection: (sectionId: string) => Promise<void>
) => {
  return renderHook(() => useDeleteSection({ removeSection }), {
    wrapper: ChakraUIProvider,
  });
};

const setupContextHook = <HookResult,>(useContextHook: () => HookResult) => {
  return renderHook(() => useContextHook());
};

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  resetThreadsServiceOverrides();
});

describe("ThreadPageLoader hooks", () => {
  describe("useThreadState", () => {
    it("starts loading with no thread and no sections while the stored thread is pending", () => {
      const pendingThread = createDeferred<MindThread | null>();

      threadsServiceOverrides.getThread = () => {
        return pendingThread.promise;
      };

      const { result } = setupThreadState(STORED_THREAD_ID);

      expect(result.current.thread).toBeNull();
      expect(result.current.sections).toStrictEqual([]);
      expect(result.current.threadStatus).toBe(ThreadStatus.Loading);
    });

    it("loads only the sections of the given thread, in stored order", async () => {
      const expectedThread = mindThreadFixtures[0];
      const expectedSections = getSectionsOfThread(STORED_THREAD_ID);

      seedThreads(mindThreadFixtures);
      seedSections(threadSectionFixtures);

      const { result } = setupThreadState(STORED_THREAD_ID);

      await waitFor(() => {
        expect(result.current.threadStatus).toBe(ThreadStatus.Loaded);
      });

      expect(result.current.thread).toStrictEqual(expectedThread);
      expect(result.current.sections).toStrictEqual(expectedSections);
    });

    it("loads the sections of the other thread separately", async () => {
      const expectedSections = getSectionsOfThread(OTHER_THREAD_ID);

      seedThreads(mindThreadFixtures);
      seedSections(threadSectionFixtures);

      const { result } = setupThreadState(OTHER_THREAD_ID);

      await waitFor(() => {
        expect(result.current.threadStatus).toBe(ThreadStatus.Loaded);
      });

      expect(result.current.sections).toStrictEqual(expectedSections);
    });

    it("resolves to not found with no sections for an unknown id", async () => {
      seedThreads(mindThreadFixtures);
      seedSections(threadSectionFixtures);

      const { result } = setupThreadState(UNKNOWN_THREAD_ID);

      await waitFor(() => {
        expect(result.current.threadStatus).toBe(ThreadStatus.NotFound);
      });

      expect(result.current.thread).toBeNull();
      expect(result.current.sections).toStrictEqual([]);
    });

    it("resolves to error when the stored sections are malformed", async () => {
      seedThreads(mindThreadFixtures);
      localStorage.setItem(SECTIONS_STORAGE_KEY, MALFORMED_JSON);

      const { result } = setupThreadState(STORED_THREAD_ID);

      await waitFor(() => {
        expect(result.current.threadStatus).toBe(ThreadStatus.Error);
      });

      expect(result.current.thread).toBeNull();
      expect(result.current.sections).toStrictEqual([]);

      const notification = screen.queryByTestId(
        NotificationsTestId.notification
      );

      expect(notification).not.toBeInTheDocument();
    });

    it("appends a created section to the sections and returns it", async () => {
      const expectedSections = getSectionsOfThread(STORED_THREAD_ID);

      seedThreads(mindThreadFixtures);
      seedSections(threadSectionFixtures);

      const { result } = setupThreadState(STORED_THREAD_ID);

      await waitFor(() => {
        expect(result.current.threadStatus).toBe(ThreadStatus.Loaded);
      });

      const createdSection = await act(async () => {
        return result.current.addSection(NEW_SECTION_VALUE);
      });

      expect(createdSection.threadId).toBe(STORED_THREAD_ID);
      expect(createdSection.name).toBe(NEW_SECTION_VALUE.name);

      expect(result.current.sections).toStrictEqual([
        ...expectedSections,
        createdSection,
      ]);
    });

    it("removes only the targeted section by id and keeps the order of the rest", async () => {
      const removedSection = threadSectionFixtures[0];
      const expectedSections = [threadSectionFixtures[1]];

      seedThreads(mindThreadFixtures);
      seedSections(threadSectionFixtures);

      const { result } = setupThreadState(STORED_THREAD_ID);

      await waitFor(() => {
        expect(result.current.threadStatus).toBe(ThreadStatus.Loaded);
      });

      await act(async () => {
        await result.current.removeSection(removedSection.id);
      });

      expect(result.current.sections).toStrictEqual(expectedSections);
    });

    it("leaves an empty list when the only section is removed", async () => {
      const onlySection = threadSectionFixtures[2];

      seedThreads(mindThreadFixtures);
      seedSections(threadSectionFixtures);

      const { result } = setupThreadState(OTHER_THREAD_ID);

      await waitFor(() => {
        expect(result.current.threadStatus).toBe(ThreadStatus.Loaded);
      });

      await act(async () => {
        await result.current.removeSection(onlySection.id);
      });

      expect(result.current.sections).toStrictEqual([]);
    });

    it("loads only the pages of the given thread, in stored order", async () => {
      const expectedPages = getPagesOfThread(STORED_THREAD_ID);

      seedThreads(mindThreadFixtures);
      seedSections(threadSectionFixtures);
      seedPages(sectionPageFixtures);

      const { result } = setupThreadState(STORED_THREAD_ID);

      await waitFor(() => {
        expect(result.current.threadStatus).toBe(ThreadStatus.Loaded);
      });

      expect(result.current.pages).toStrictEqual(expectedPages);
    });

    it("appends a created page to the pages and returns it", async () => {
      const expectedPages = getPagesOfThread(STORED_THREAD_ID);

      seedThreads(mindThreadFixtures);
      seedSections(threadSectionFixtures);
      seedPages(sectionPageFixtures);

      const { result } = setupThreadState(STORED_THREAD_ID);

      await waitFor(() => {
        expect(result.current.threadStatus).toBe(ThreadStatus.Loaded);
      });

      const createdPage = await act(async () => {
        return result.current.addPage({
          sectionId: threadSectionFixtures[0].id,
          pageValue: NEW_PAGE_VALUE,
        });
      });

      expect(createdPage.threadId).toBe(STORED_THREAD_ID);
      expect(createdPage.name).toBe(NEW_PAGE_VALUE.name);

      expect(result.current.pages).toStrictEqual([
        ...expectedPages,
        createdPage,
      ]);
    });

    it("removes the pages of the removed section and keeps the others", async () => {
      const expectedPages = [sectionPageFixtures[2]];

      seedThreads(mindThreadFixtures);
      seedSections(threadSectionFixtures);
      seedPages(sectionPageFixtures);

      const { result } = setupThreadState(STORED_THREAD_ID);

      await waitFor(() => {
        expect(result.current.threadStatus).toBe(ThreadStatus.Loaded);
      });

      await act(async () => {
        await result.current.removeSection(threadSectionFixtures[0].id);
      });

      expect(result.current.pages).toStrictEqual(expectedPages);
    });

    it("keeps the sections and rejects when the service fails to remove the section", async () => {
      const expectedSections = getSectionsOfThread(STORED_THREAD_ID);
      const removedSection = expectedSections[0];

      seedThreads(mindThreadFixtures);
      seedSections(threadSectionFixtures);

      threadsServiceOverrides.removeThreadSection = async () => {
        throw new Error("Remove failed");
      };

      const { result } = setupThreadState(STORED_THREAD_ID);

      await waitFor(() => {
        expect(result.current.threadStatus).toBe(ThreadStatus.Loaded);
      });

      await expect(
        result.current.removeSection(removedSection.id)
      ).rejects.toThrow("Remove failed");

      expect(result.current.sections).toStrictEqual(expectedSections);
    });
  });

  describe("useSectionSelection", () => {
    const FIRST_SECTION = threadSectionFixtures[0];
    const SECOND_SECTION = threadSectionFixtures[1];
    const THIRD_SECTION = threadSectionFixtures[2];
    const NEW_SECTION: ThreadSection = {
      ...THIRD_SECTION,
      id: "section-new",
      name: "Sketches",
    };

    it("selects no section at first", () => {
      const { result } = setupSectionSelection(threadSectionFixtures);
      expect(result.current.selectedSection).toBeNull();
    });

    it("selects the section with the given id", () => {
      const { result } = setupSectionSelection(threadSectionFixtures);

      act(() => {
        result.current.selectSection(FIRST_SECTION.id);
      });

      expect(result.current.selectedSection).toStrictEqual(FIRST_SECTION);
    });

    it("moves the selection when another section is selected", () => {
      const { result } = setupSectionSelection(threadSectionFixtures);

      act(() => {
        result.current.selectSection(FIRST_SECTION.id);
      });

      act(() => {
        result.current.selectSection(SECOND_SECTION.id);
      });

      expect(result.current.selectedSection).toStrictEqual(SECOND_SECTION);
    });

    it("keeps the section selected when it is selected again", () => {
      const { result } = setupSectionSelection(threadSectionFixtures);

      act(() => {
        result.current.selectSection(FIRST_SECTION.id);
      });

      act(() => {
        result.current.selectSection(FIRST_SECTION.id);
      });

      expect(result.current.selectedSection).toStrictEqual(FIRST_SECTION);
    });

    it("clears the selection when the selected section leaves the sections", () => {
      const { result, rerender } = setupSectionSelection(threadSectionFixtures);

      act(() => {
        result.current.selectSection(FIRST_SECTION.id);
      });

      rerender({ sections: [SECOND_SECTION, THIRD_SECTION] });

      expect(result.current.selectedSection).toBeNull();
    });

    it("keeps the selection when another section is removed or added", () => {
      const { result, rerender } = setupSectionSelection(threadSectionFixtures);

      act(() => {
        result.current.selectSection(FIRST_SECTION.id);
      });

      rerender({ sections: [FIRST_SECTION, SECOND_SECTION] });

      expect(result.current.selectedSection).toStrictEqual(FIRST_SECTION);

      rerender({
        sections: [FIRST_SECTION, SECOND_SECTION, NEW_SECTION],
      });

      expect(result.current.selectedSection).toStrictEqual(FIRST_SECTION);
    });
  });

  describe("useAddPage", () => {
    const SELECTED_SECTION = threadSectionFixtures[0];
    const CREATED_PAGE = sectionPageFixtures[0];

    it("adds the page to the selected section, closes the modal, and shows the success notification", async () => {
      const addPage = vi.fn(async () => {
        return CREATED_PAGE;
      });

      const { result } = setupAddPage(addPage, SELECTED_SECTION);

      act(() => {
        result.current.openAddPageModal();
      });

      expect(result.current.isAddPageModalOpen).toBe(true);

      await act(async () => {
        await result.current.submitNewPage(NEW_PAGE_VALUE);
      });

      expect(addPage).toHaveBeenCalledWith({
        sectionId: SELECTED_SECTION.id,
        pageValue: NEW_PAGE_VALUE,
      });

      expect(result.current.isAddPageModalOpen).toBe(false);
      expect(result.current.lastCreatedPageId).toBe(CREATED_PAGE.id);

      const successNotification = await screen.findByText(
        getPageCreatedMessage(CREATED_PAGE.name)
      );

      expect(successNotification).toBeInTheDocument();
    });

    it("is saving while the page is being added", async () => {
      const pendingPage = createDeferred<SectionPage>();

      const addPage = vi.fn(() => {
        return pendingPage.promise;
      });

      const { result } = setupAddPage(addPage, SELECTED_SECTION);

      let pendingSubmit!: Promise<void>;

      act(() => {
        pendingSubmit = result.current.submitNewPage(NEW_PAGE_VALUE);
      });

      expect(result.current.isSavingPage).toBe(true);

      await act(async () => {
        pendingPage.resolve(CREATED_PAGE);
        await pendingSubmit;
      });

      expect(result.current.isSavingPage).toBe(false);
    });

    it("keeps the modal open and shows the error notification when the save fails", async () => {
      const addPage = vi.fn(async () => {
        throw new Error("Save failed");
      });

      const { result } = setupAddPage(addPage, SELECTED_SECTION);

      act(() => {
        result.current.openAddPageModal();
      });

      await act(async () => {
        await result.current.submitNewPage(NEW_PAGE_VALUE);
      });

      expect(result.current.isAddPageModalOpen).toBe(true);
      expect(result.current.isSavingPage).toBe(false);
      expect(result.current.lastCreatedPageId).toBeNull();

      const errorNotification = await screen.findByText(
        SAVE_PAGE_ERROR_MESSAGE
      );

      expect(errorNotification).toBeInTheDocument();
    });

    it("shows the error notification and does not call addPage when no section is selected", async () => {
      const addPage = vi.fn(async () => {
        return CREATED_PAGE;
      });

      const { result } = setupAddPage(addPage, null);

      await act(async () => {
        await result.current.submitNewPage(NEW_PAGE_VALUE);
      });

      expect(addPage).not.toHaveBeenCalled();

      const errorNotification = await screen.findByText(
        SAVE_PAGE_ERROR_MESSAGE
      );

      expect(errorNotification).toBeInTheDocument();
    });
  });

  describe("useAddSection", () => {
    it("opens and closes the add section modal", () => {
      const addSection = vi.fn();
      const { result } = setupAddSection(addSection);

      expect(result.current.isAddSectionModalOpen).toBe(false);

      act(() => {
        result.current.openAddSectionModal();
      });

      expect(result.current.isAddSectionModalOpen).toBe(true);

      act(() => {
        result.current.closeAddSectionModal();
      });

      expect(result.current.isAddSectionModalOpen).toBe(false);
    });

    it("is saving while the section is being added", async () => {
      const pendingSection = createDeferred<ThreadSection>();
      const addSection = vi.fn(() => {
        return pendingSection.promise;
      });

      const { result } = setupAddSection(addSection);

      let pendingSubmit!: Promise<void>;

      act(() => {
        pendingSubmit = result.current.submitNewSection(NEW_SECTION_VALUE);
      });

      expect(result.current.isSavingSection).toBe(true);

      await act(async () => {
        pendingSection.resolve(threadSectionFixtures[0]);
        await pendingSubmit;
      });

      expect(result.current.isSavingSection).toBe(false);
    });

    it("closes the modal, stores the created section id and shows the success notification on success", async () => {
      const createdSection = threadSectionFixtures[0];
      const addSection = vi.fn(async () => {
        return createdSection;
      });

      const { result } = setupAddSection(addSection);

      act(() => {
        result.current.openAddSectionModal();
      });

      await act(async () => {
        await result.current.submitNewSection(NEW_SECTION_VALUE);
      });

      expect(result.current.isAddSectionModalOpen).toBe(false);
      expect(result.current.lastCreatedSectionId).toBe(createdSection.id);

      const successNotification = await screen.findByText(
        getSectionCreatedMessage(createdSection.name)
      );

      expect(successNotification).toBeInTheDocument();
    });

    it("keeps the modal open and shows the error notification when the save fails", async () => {
      const addSection = vi.fn(async () => {
        throw new Error("Save failed");
      });

      const { result } = setupAddSection(addSection);

      act(() => {
        result.current.openAddSectionModal();
      });

      await act(async () => {
        await result.current.submitNewSection(NEW_SECTION_VALUE);
      });

      expect(result.current.isAddSectionModalOpen).toBe(true);
      expect(result.current.isSavingSection).toBe(false);
      expect(result.current.lastCreatedSectionId).toBeNull();

      const errorNotification = await screen.findByText(
        SAVE_SECTION_ERROR_MESSAGE
      );

      expect(errorNotification).toBeInTheDocument();
    });
  });

  describe("useDeleteSection", () => {
    const SECTION_TO_DELETE = threadSectionFixtures[1];

    it("sets the section to delete when opened and clears it when closed", () => {
      const removeSection = vi.fn();
      const { result } = setupDeleteSection(removeSection);

      expect(result.current.sectionToDelete).toBeNull();

      act(() => {
        result.current.openDeleteSectionModal(SECTION_TO_DELETE);
      });

      expect(result.current.sectionToDelete).toStrictEqual(SECTION_TO_DELETE);

      act(() => {
        result.current.closeDeleteSectionModal();
      });

      expect(result.current.sectionToDelete).toBeNull();
    });

    it("does nothing when no section is selected", async () => {
      const removeSection = vi.fn();
      const { result } = setupDeleteSection(removeSection);

      await act(async () => {
        await result.current.confirmDeleteSection();
      });

      expect(removeSection).not.toHaveBeenCalled();
      expect(result.current.sectionToDelete).toBeNull();
      expect(result.current.isDeletingSection).toBe(false);
    });

    it("is deleting while the section is being removed", async () => {
      const pendingRemoval = createDeferred<void>();
      const removeSection = vi.fn(() => {
        return pendingRemoval.promise;
      });

      const { result } = setupDeleteSection(removeSection);

      act(() => {
        result.current.openDeleteSectionModal(SECTION_TO_DELETE);
      });

      let pendingConfirm!: Promise<void>;

      act(() => {
        pendingConfirm = result.current.confirmDeleteSection();
      });

      expect(result.current.isDeletingSection).toBe(true);

      await act(async () => {
        pendingRemoval.resolve();
        await pendingConfirm;
      });

      expect(result.current.isDeletingSection).toBe(false);
    });

    it("clears the section to delete, stops deleting and shows the success notification on success", async () => {
      const removeSection = vi.fn(async () => {});
      const { result } = setupDeleteSection(removeSection);

      act(() => {
        result.current.openDeleteSectionModal(SECTION_TO_DELETE);
      });

      await act(async () => {
        await result.current.confirmDeleteSection();
      });

      expect(removeSection).toHaveBeenCalledWith(SECTION_TO_DELETE.id);
      expect(result.current.sectionToDelete).toBeNull();
      expect(result.current.isDeletingSection).toBe(false);

      const successNotification = await screen.findByText(
        getSectionDeletedMessage(SECTION_TO_DELETE.name)
      );

      expect(successNotification).toBeInTheDocument();
    });

    it("keeps the section to delete, stops deleting and shows the error notification on failure", async () => {
      const removeSection = vi.fn(async () => {
        throw new Error("Remove failed");
      });

      const { result } = setupDeleteSection(removeSection);

      act(() => {
        result.current.openDeleteSectionModal(SECTION_TO_DELETE);
      });

      await act(async () => {
        await result.current.confirmDeleteSection();
      });

      expect(result.current.sectionToDelete).toStrictEqual(SECTION_TO_DELETE);
      expect(result.current.isDeletingSection).toBe(false);

      const errorNotification = await screen.findByText(
        DELETE_SECTION_ERROR_MESSAGE
      );

      expect(errorNotification).toBeInTheDocument();
    });
  });

  describe("context hooks", () => {
    it("useThreadPageValue throws outside the ThreadPageLoader", () => {
      const expectedErrorMessage =
        "[ThreadPageValueContext] is not found! useThreadPageValue must be used within a ThreadPageValueContext provider.";

      expect(() => {
        setupContextHook(useThreadPageValue);
      }).toThrow(expectedErrorMessage);
    });

    it("useThreadPageAction throws outside the ThreadPageLoader", () => {
      const expectedErrorMessage =
        "[ThreadPageActionContext] is not found! useThreadPageAction must be used within a ThreadPageActionContext provider.";

      expect(() => {
        setupContextHook(useThreadPageAction);
      }).toThrow(expectedErrorMessage);
    });
  });
});
