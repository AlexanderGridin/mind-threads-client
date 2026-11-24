import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { act, renderHook, screen, waitFor } from "@testing-library/react";
import { ChakraUIProvider } from "@/components/lib/ChakraUIProvider";
import { NotificationsTestId } from "@/components/lib/Notifications/Notifications.constants";
import {
  firstPageMessageFixtures,
  MALFORMED_JSON,
  buildNewMessage,
  chatMessageFixtures,
  createDeferred,
  createServicesMock,
  mindThreadFixtures,
  readStoredMessages,
  resetThreadsServiceOverrides,
  sectionPageFixtures,
  seedMessages,
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
  useDeletePage,
  useDeleteSection,
  usePageSelection,
  useSectionSelection,
  useSectionSwitch,
  useThreadPageAction,
  useThreadPageValue,
  useThreadState,
} from "../ThreadPageLoader.hooks";
import type {
  UseAddPageParams,
  UseDeletePageParams,
} from "../ThreadPageLoader.types";
import {
  DELETE_PAGE_ERROR_MESSAGE,
  DELETE_SECTION_ERROR_MESSAGE,
  SAVE_PAGE_ERROR_MESSAGE,
  SAVE_SECTION_ERROR_MESSAGE,
} from "../ThreadPageLoader.constants";
import {
  getPageCreatedMessage,
  getPageDeletedMessage,
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

const setupPageSelection = (pages: SectionPage[]) => {
  return renderHook(
    ({ pages: currentPages }) => {
      return usePageSelection({ pages: currentPages });
    },
    { initialProps: { pages } }
  );
};

const setupSectionSwitch = (selectedSection: ThreadSection | null) => {
  const selectSection = vi.fn();
  const clearSelectedPage = vi.fn();

  const hook = renderHook(
    ({ selectedSection: currentSelectedSection }) => {
      return useSectionSwitch({
        selectedSection: currentSelectedSection,
        selectSection,
        clearSelectedPage,
      });
    },
    { initialProps: { selectedSection } }
  );

  return { ...hook, selectSection, clearSelectedPage };
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

const setupDeletePage = (removePage: UseDeletePageParams["removePage"]) => {
  return renderHook(() => useDeletePage({ removePage }), {
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

    it("removes only the targeted page by id and keeps the order of the rest and the pages of other sections", async () => {
      const removedPage = sectionPageFixtures[0];
      const expectedPages = [sectionPageFixtures[1], sectionPageFixtures[2]];

      seedThreads(mindThreadFixtures);
      seedSections(threadSectionFixtures);
      seedPages(sectionPageFixtures);

      const { result } = setupThreadState(STORED_THREAD_ID);

      await waitFor(() => {
        expect(result.current.threadStatus).toBe(ThreadStatus.Loaded);
      });

      await act(async () => {
        await result.current.removePage(removedPage.id);
      });

      expect(result.current.pages).toStrictEqual(expectedPages);
    });

    it("leaves the sections unchanged when a page is removed", async () => {
      const expectedSections = getSectionsOfThread(STORED_THREAD_ID);

      seedThreads(mindThreadFixtures);
      seedSections(threadSectionFixtures);
      seedPages(sectionPageFixtures);

      const { result } = setupThreadState(STORED_THREAD_ID);

      await waitFor(() => {
        expect(result.current.threadStatus).toBe(ThreadStatus.Loaded);
      });

      await act(async () => {
        await result.current.removePage(sectionPageFixtures[0].id);
      });

      expect(result.current.sections).toStrictEqual(expectedSections);
    });

    it("keeps the pages and rejects when the service fails to remove the page", async () => {
      const expectedPages = getPagesOfThread(STORED_THREAD_ID);

      seedThreads(mindThreadFixtures);
      seedSections(threadSectionFixtures);
      seedPages(sectionPageFixtures);

      threadsServiceOverrides.removeSectionPage = async () => {
        throw new Error("Remove failed");
      };

      const { result } = setupThreadState(STORED_THREAD_ID);

      await waitFor(() => {
        expect(result.current.threadStatus).toBe(ThreadStatus.Loaded);
      });

      await expect(
        result.current.removePage(expectedPages[0].id)
      ).rejects.toThrow("Remove failed");

      expect(result.current.pages).toStrictEqual(expectedPages);
    });

    it("getPageMessages resolves the seeded page's messages", async () => {
      seedThreads(mindThreadFixtures);
      seedSections(threadSectionFixtures);
      seedPages(sectionPageFixtures);
      seedMessages(chatMessageFixtures);

      const { result } = setupThreadState(STORED_THREAD_ID);

      await waitFor(() => {
        expect(result.current.threadStatus).toBe(ThreadStatus.Loaded);
      });

      const pageMessages = await result.current.getPageMessages(
        sectionPageFixtures[0].id
      );

      expect(pageMessages).toStrictEqual(firstPageMessageFixtures);
    });

    it("addPageMessage resolves the created message and stores it first", async () => {
      seedThreads(mindThreadFixtures);
      seedSections(threadSectionFixtures);
      seedPages(sectionPageFixtures);
      seedMessages(chatMessageFixtures);

      const { result } = setupThreadState(STORED_THREAD_ID);

      await waitFor(() => {
        expect(result.current.threadStatus).toBe(ThreadStatus.Loaded);
      });

      const createdMessage = await result.current.addPageMessage(
        buildNewMessage({ content: "<p>Loader message</p>" })
      );

      expect(readStoredMessages()).toStrictEqual([
        createdMessage,
        ...chatMessageFixtures,
      ]);
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

  describe("usePageSelection", () => {
    const FIRST_PAGE = sectionPageFixtures[0];
    const SECOND_PAGE = sectionPageFixtures[1];
    const THIRD_PAGE = sectionPageFixtures[2];
    const NEW_PAGE: SectionPage = {
      ...THIRD_PAGE,
      id: "page-new",
      name: "Sketches",
    };

    it("selects no page at first", () => {
      const { result } = setupPageSelection(sectionPageFixtures);
      expect(result.current.selectedPage).toBeNull();
    });

    it("selects the page with the given id", () => {
      const { result } = setupPageSelection(sectionPageFixtures);

      act(() => {
        result.current.selectPage(FIRST_PAGE.id);
      });

      expect(result.current.selectedPage).toStrictEqual(FIRST_PAGE);
    });

    it("moves the selection when another page is selected", () => {
      const { result } = setupPageSelection(sectionPageFixtures);

      act(() => {
        result.current.selectPage(FIRST_PAGE.id);
      });

      act(() => {
        result.current.selectPage(SECOND_PAGE.id);
      });

      expect(result.current.selectedPage).toStrictEqual(SECOND_PAGE);
    });

    it("clears the selection when the selected page leaves the pages", () => {
      const { result, rerender } = setupPageSelection(sectionPageFixtures);

      act(() => {
        result.current.selectPage(FIRST_PAGE.id);
      });

      rerender({ pages: [SECOND_PAGE, THIRD_PAGE] });
      expect(result.current.selectedPage).toBeNull();
    });

    it("keeps the selection when another page is removed or added", () => {
      const { result, rerender } = setupPageSelection(sectionPageFixtures);

      act(() => {
        result.current.selectPage(FIRST_PAGE.id);
      });

      rerender({ pages: [FIRST_PAGE, SECOND_PAGE] });
      expect(result.current.selectedPage).toStrictEqual(FIRST_PAGE);

      rerender({ pages: [FIRST_PAGE, SECOND_PAGE, NEW_PAGE] });
      expect(result.current.selectedPage).toStrictEqual(FIRST_PAGE);
    });

    it("clears the selection with clearSelectedPage", () => {
      const { result } = setupPageSelection(sectionPageFixtures);

      act(() => {
        result.current.selectPage(FIRST_PAGE.id);
      });

      act(() => {
        result.current.clearSelectedPage();
      });

      expect(result.current.selectedPage).toBeNull();
    });
  });

  describe("useSectionSwitch", () => {
    const FIRST_SECTION = threadSectionFixtures[0];
    const SECOND_SECTION = threadSectionFixtures[1];

    it("selects the other section and clears the selected page", () => {
      const { result, selectSection, clearSelectedPage } =
        setupSectionSwitch(FIRST_SECTION);

      act(() => {
        result.current(SECOND_SECTION.id);
      });

      expect(selectSection).toHaveBeenCalledExactlyOnceWith(SECOND_SECTION.id);
      expect(clearSelectedPage).toHaveBeenCalledOnce();
    });

    it("selects the section and clears the selected page when no section is selected", () => {
      const { result, selectSection, clearSelectedPage } =
        setupSectionSwitch(null);

      act(() => {
        result.current(FIRST_SECTION.id);
      });

      expect(selectSection).toHaveBeenCalledExactlyOnceWith(FIRST_SECTION.id);
      expect(clearSelectedPage).toHaveBeenCalledOnce();
    });

    it("does nothing when the selected section is chosen again", () => {
      const { result, selectSection, clearSelectedPage } =
        setupSectionSwitch(FIRST_SECTION);

      act(() => {
        result.current(FIRST_SECTION.id);
      });

      expect(selectSection).not.toHaveBeenCalled();
      expect(clearSelectedPage).not.toHaveBeenCalled();
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

  describe("useDeletePage", () => {
    const PAGE_TO_DELETE = sectionPageFixtures[1];

    it("sets the page to delete when opened and clears it when closed", () => {
      const removePage = vi.fn();
      const { result } = setupDeletePage(removePage);

      expect(result.current.pageToDelete).toBeNull();

      act(() => {
        result.current.openDeletePageModal(PAGE_TO_DELETE);
      });

      expect(result.current.pageToDelete).toStrictEqual(PAGE_TO_DELETE);

      act(() => {
        result.current.closeDeletePageModal();
      });

      expect(result.current.pageToDelete).toBeNull();
    });

    it("does nothing when no page is selected", async () => {
      const removePage = vi.fn();
      const { result } = setupDeletePage(removePage);

      await act(async () => {
        await result.current.confirmDeletePage();
      });

      expect(removePage).not.toHaveBeenCalled();
      expect(result.current.pageToDelete).toBeNull();
      expect(result.current.isDeletingPage).toBe(false);
    });

    it("is deleting while the page is being removed", async () => {
      const pendingRemoval = createDeferred<void>();
      const removePage = vi.fn(() => {
        return pendingRemoval.promise;
      });

      const { result } = setupDeletePage(removePage);

      act(() => {
        result.current.openDeletePageModal(PAGE_TO_DELETE);
      });

      let pendingConfirm!: Promise<void>;

      act(() => {
        pendingConfirm = result.current.confirmDeletePage();
      });

      expect(result.current.isDeletingPage).toBe(true);

      await act(async () => {
        pendingRemoval.resolve();
        await pendingConfirm;
      });

      expect(result.current.isDeletingPage).toBe(false);
    });

    it("clears the page to delete, stops deleting and shows the success notification on success", async () => {
      const removePage = vi.fn(async () => {});
      const { result } = setupDeletePage(removePage);

      act(() => {
        result.current.openDeletePageModal(PAGE_TO_DELETE);
      });

      await act(async () => {
        await result.current.confirmDeletePage();
      });

      expect(removePage).toHaveBeenCalledWith(PAGE_TO_DELETE.id);
      expect(result.current.pageToDelete).toBeNull();
      expect(result.current.isDeletingPage).toBe(false);

      const successNotification = await screen.findByText(
        getPageDeletedMessage(PAGE_TO_DELETE.name)
      );

      expect(successNotification).toBeInTheDocument();
    });

    it("keeps the page to delete, stops deleting and shows the error notification on failure", async () => {
      const removePage = vi.fn(async () => {
        throw new Error("Remove failed");
      });

      const { result } = setupDeletePage(removePage);

      act(() => {
        result.current.openDeletePageModal(PAGE_TO_DELETE);
      });

      await act(async () => {
        await result.current.confirmDeletePage();
      });

      expect(result.current.pageToDelete).toStrictEqual(PAGE_TO_DELETE);
      expect(result.current.isDeletingPage).toBe(false);

      const errorNotification = await screen.findByText(
        DELETE_PAGE_ERROR_MESSAGE
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
