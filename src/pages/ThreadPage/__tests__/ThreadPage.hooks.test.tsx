import { describe, it, expect, afterEach, vi } from "vitest";
import type { ReactNode } from "react";
import { act, renderHook, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import { ChakraUIProvider } from "@/components/lib/ChakraUIProvider";
import { NotificationsTestId } from "@/components/lib/Notifications/Notifications.constants";
import {
  MALFORMED_JSON,
  createDeferred,
  createServicesMock,
  mindThreadFixtures,
  resetThreadsServiceOverrides,
  seedThreads,
  threadsServiceOverrides,
} from "@/__test-fixtures__";
import type { MindThread } from "@/types";
import { THREADS_STORAGE_KEY } from "@/services/useThreadsService/useThreadsService.constants";
import { ThreadStatus } from "../ThreadPage.constants";
import { useNavigateToDashboard, useThreadState } from "../ThreadPage.hooks";

vi.mock("@/services", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/services")>();

  return createServicesMock(original);
});

const STORED_THREAD_ID = "thread-2";
const UNKNOWN_THREAD_ID = "unknown-thread-id";
const THREAD_PAGE_PATH = "/threads/test-thread";
const DASHBOARD_PATH = "/";

const setupThreadState = (threadId: string) => {
  return renderHook(() => useThreadState(threadId), {
    wrapper: ChakraUIProvider,
  });
};

const ThreadPageRouterWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <MemoryRouter initialEntries={[THREAD_PAGE_PATH]}>{children}</MemoryRouter>
  );
};

const setupNavigateToDashboard = () => {
  return renderHook(
    () => {
      return {
        navigateToDashboard: useNavigateToDashboard(),
        location: useLocation(),
      };
    },
    { wrapper: ThreadPageRouterWrapper }
  );
};

afterEach(() => {
  vi.restoreAllMocks();
  resetThreadsServiceOverrides();
});

describe("ThreadPage hooks", () => {
  describe("useThreadState", () => {
    it("starts loading with no thread while the stored thread is pending", () => {
      const pendingThread = createDeferred<MindThread | null>();
      threadsServiceOverrides.getThread = () => pendingThread.promise;

      const { result } = setupThreadState(STORED_THREAD_ID);

      expect(result.current.thread).toBeNull();
      expect(result.current.threadStatus).toBe(ThreadStatus.Loading);
    });

    it("loads the stored thread with the given id", async () => {
      const expectedThread = mindThreadFixtures[1];

      seedThreads(mindThreadFixtures);

      const { result } = setupThreadState(STORED_THREAD_ID);

      await waitFor(() => {
        expect(result.current.threadStatus).toBe(ThreadStatus.Loaded);
      });

      expect(result.current.thread).toStrictEqual(expectedThread);
    });

    it("resolves to not found with no thread for an unknown id", async () => {
      seedThreads(mindThreadFixtures);

      const { result } = setupThreadState(UNKNOWN_THREAD_ID);

      await waitFor(() => {
        expect(result.current.threadStatus).toBe(ThreadStatus.NotFound);
      });

      expect(result.current.thread).toBeNull();
    });

    it("resolves to error with no thread when the stored data is malformed, and shows no notification", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});

      localStorage.setItem(THREADS_STORAGE_KEY, MALFORMED_JSON);

      const { result } = setupThreadState(STORED_THREAD_ID);

      await waitFor(() => {
        expect(result.current.threadStatus).toBe(ThreadStatus.Error);
      });

      expect(result.current.thread).toBeNull();

      const notification = screen.queryByTestId(
        NotificationsTestId.notification
      );
      expect(notification).not.toBeInTheDocument();
    });
  });

  describe("useNavigateToDashboard", () => {
    it("navigates from the thread page to the dashboard", () => {
      const { result } = setupNavigateToDashboard();

      expect(result.current.location.pathname).toBe(THREAD_PAGE_PATH);

      act(() => {
        result.current.navigateToDashboard();
      });

      expect(result.current.location.pathname).toBe(DASHBOARD_PATH);
    });
  });
});
