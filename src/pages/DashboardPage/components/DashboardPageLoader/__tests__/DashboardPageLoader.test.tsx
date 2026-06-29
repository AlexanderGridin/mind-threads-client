import { describe, it, expect, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithUIProvider } from "@/components/lib";
import { mockThreads } from "@/__mocks__/threads";
import { ThreadListMode } from "@/pages/DashboardPage/DashboardPage.constants";
import {
  DashboardPageLoader,
  useDashboardPageValue,
  useDashboardPageAction,
} from "../index";

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
});
