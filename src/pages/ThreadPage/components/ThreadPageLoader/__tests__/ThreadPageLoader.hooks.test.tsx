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
  useThreadPageAction,
  useThreadPageValue,
  useThreadState,
} from "../ThreadPageLoader.hooks";
import { SAVE_SECTION_ERROR_MESSAGE } from "../ThreadPageLoader.constants";
import { getSectionCreatedMessage } from "../ThreadPageLoader.utils";

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
