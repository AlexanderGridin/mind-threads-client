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
  seedSections,
  seedThreads,
  threadSectionFixtures,
  threadsServiceOverrides,
} from "@/__test-fixtures__";
import type { MindThread, ThreadSection, ThreadSectionValue } from "@/types";
import { SECTIONS_STORAGE_KEY } from "@/services/useThreadSectionsService/useThreadSectionsService.constants";
import { ThreadStatus } from "@/pages/ThreadPage/ThreadPage.constants";
import {
  useAddSection,
  useDeleteSection,
  useThreadPageAction,
  useThreadPageValue,
  useThreadState,
} from "../ThreadPageLoader.hooks";
import {
  DELETE_SECTION_ERROR_MESSAGE,
  SAVE_SECTION_ERROR_MESSAGE,
} from "../ThreadPageLoader.constants";
import {
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

const getSectionsOfThread = (threadId: string): ThreadSection[] => {
  return threadSectionFixtures.filter((section) => {
    return section.threadId === threadId;
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
