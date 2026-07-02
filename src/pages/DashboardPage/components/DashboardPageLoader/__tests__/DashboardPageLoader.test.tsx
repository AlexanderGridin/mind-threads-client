import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithUIProvider } from "@/components/lib";
import { mockThreads } from "@/__mocks__/threads";
import { ThreadListMode } from "@/pages/DashboardPage/DashboardPage.constants";
import { useLocalStorage } from "@/services/local-storage";
import {
  useDashboardPageAction,
  useDashboardPageValue,
} from "../DashboardPageLoader.hooks";
import { DashboardPageLoader } from "../DashboardPageLoader";
import { THREAD_LIST_MODE_STORAGE_KEY } from "../DashboardPageLoader.constants";

const mockReadThreadListMode = vi.fn();
const mockSetThreadListMode = vi.fn();

vi.mock("@/services/local-storage", () => ({
  useLocalStorage: vi.fn().mockImplementation(() => ({
    read: mockReadThreadListMode,
    set: mockSetThreadListMode,
    update: vi.fn(),
  })),
}));

const THREAD_LIST_MODE_TEST_ID = "thread-list-mode";
const THREADS_COUNT_TEST_ID = "threads-count";
const TOGGLE_BUTTON_TEST_ID = "toggle-button";

const TestConsumer = () => {
  const { threadListMode, threads } = useDashboardPageValue();
  const { toggleThreadListMode } = useDashboardPageAction();

  return (
    <>
      <div data-testid={THREAD_LIST_MODE_TEST_ID}>{threadListMode}</div>
      <div data-testid={THREADS_COUNT_TEST_ID}>{threads.length}</div>

      <button
        onClick={toggleThreadListMode}
        data-testid={TOGGLE_BUTTON_TEST_ID}
      >
        Toggle Mode
      </button>
    </>
  );
};

const setup = () => {
  const user = userEvent.setup();

  renderWithUIProvider(
    <DashboardPageLoader>
      <TestConsumer />
    </DashboardPageLoader>
  );

  return { user };
};

beforeEach(() => {
  vi.clearAllMocks();

  mockReadThreadListMode.mockReturnValue(null);
});

describe("DashboardPageLoader", () => {
  describe("rendering", () => {
    it("renders test consumer properly", () => {
      setup();

      expect(screen.getByTestId(THREAD_LIST_MODE_TEST_ID)).toBeInTheDocument();
      expect(screen.getByTestId(THREADS_COUNT_TEST_ID)).toBeInTheDocument();
      expect(screen.getByTestId(TOGGLE_BUTTON_TEST_ID)).toBeInTheDocument();
    });
  });

  describe("context values", () => {
    it("provides correct values", () => {
      setup();

      expect(screen.getByTestId(THREAD_LIST_MODE_TEST_ID).textContent).toBe(
        ThreadListMode.Grid
      );

      expect(screen.getByTestId(THREADS_COUNT_TEST_ID).textContent).toBe(
        `${mockThreads.length}`
      );
    });
  });

  describe("toggleThreadListMode", () => {
    it("toggles threadListMode from 'grid' to 'list'", async () => {
      const { user } = setup();

      expect(screen.getByTestId(THREAD_LIST_MODE_TEST_ID).textContent).toBe(
        ThreadListMode.Grid
      );

      await user.click(screen.getByTestId(TOGGLE_BUTTON_TEST_ID));

      expect(screen.getByTestId(THREAD_LIST_MODE_TEST_ID).textContent).toBe(
        ThreadListMode.List
      );
    });

    it("toggles threadListMode from 'list' back to 'grid'", async () => {
      const { user } = setup();

      await user.click(screen.getByTestId(TOGGLE_BUTTON_TEST_ID));

      expect(screen.getByTestId(THREAD_LIST_MODE_TEST_ID).textContent).toBe(
        ThreadListMode.List
      );

      await user.click(screen.getByTestId(TOGGLE_BUTTON_TEST_ID));

      expect(screen.getByTestId(THREAD_LIST_MODE_TEST_ID).textContent).toBe(
        ThreadListMode.Grid
      );
    });

    it("toggles multiple times correctly", async () => {
      const { user } = setup();

      const toggleButton = screen.getByTestId(TOGGLE_BUTTON_TEST_ID);

      expect(screen.getByTestId(THREAD_LIST_MODE_TEST_ID).textContent).toBe(
        ThreadListMode.Grid
      );

      await user.click(toggleButton);
      expect(screen.getByTestId(THREAD_LIST_MODE_TEST_ID).textContent).toBe(
        ThreadListMode.List
      );

      await user.click(toggleButton);
      expect(screen.getByTestId(THREAD_LIST_MODE_TEST_ID).textContent).toBe(
        ThreadListMode.Grid
      );

      await user.click(toggleButton);
      expect(screen.getByTestId(THREAD_LIST_MODE_TEST_ID).textContent).toBe(
        ThreadListMode.List
      );
    });
  });

  describe("local storage integration", () => {
    it("calls useLocalStorage with the correct storage key", () => {
      setup();

      expect(useLocalStorage).toHaveBeenCalledWith(
        THREAD_LIST_MODE_STORAGE_KEY
      );
    });

    it("reads initial value from storage", () => {
      mockReadThreadListMode.mockReturnValue(ThreadListMode.List);

      setup();

      expect(screen.getByTestId(THREAD_LIST_MODE_TEST_ID).textContent).toBe(
        ThreadListMode.List
      );
    });

    it("persists default value to storage when storage is empty", () => {
      setup();

      expect(mockSetThreadListMode).toHaveBeenCalledWith(ThreadListMode.Grid);
    });

    it("persists new value to storage when toggle is clicked", async () => {
      const { user } = setup();

      await user.click(screen.getByTestId(TOGGLE_BUTTON_TEST_ID));

      expect(mockSetThreadListMode).toHaveBeenLastCalledWith(
        ThreadListMode.List
      );
    });

    it("persists value to storage across multiple toggles", async () => {
      const { user } = setup();

      const toggleButton = screen.getByTestId(TOGGLE_BUTTON_TEST_ID);

      await user.click(toggleButton);

      expect(mockSetThreadListMode).toHaveBeenLastCalledWith(
        ThreadListMode.List
      );

      await user.click(toggleButton);

      expect(mockSetThreadListMode).toHaveBeenLastCalledWith(
        ThreadListMode.Grid
      );
    });
  });
});
