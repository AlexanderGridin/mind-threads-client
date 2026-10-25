import { describe, it, expect, afterEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithUIProvider } from "@/components/lib";
import { NotificationsTestId } from "@/components/lib/Notifications/Notifications.constants";
import {
  MALFORMED_JSON,
  mindThreadFixtures,
  seedThreads,
} from "@/__test-fixtures__";
import {
  ThreadListMode,
  ThreadsStatus,
} from "@/pages/DashboardPage/DashboardPage.constants";
import { THREADS_STORAGE_KEY } from "@/services/useThreadsService/useThreadsService.constants";
import {
  useDashboardPageAction,
  useDashboardPageValue,
} from "../DashboardPageLoader.hooks";
import { DashboardPageLoader } from "../DashboardPageLoader";
import {
  SAVE_THREAD_ERROR_MESSAGE,
  THREAD_LIST_MODE_STORAGE_KEY,
} from "../DashboardPageLoader.constants";
import { getThreadCreatedMessage } from "../DashboardPageLoader.utils";

const THREAD_LIST_MODE_TEST_ID = "thread-list-mode";
const THREADS_STATUS_TEST_ID = "threads-status";
const IS_MODAL_OPEN_TEST_ID = "is-modal-open";
const THREAD_TITLE_TEST_ID = "thread-title";
const TOGGLE_BUTTON_TEST_ID = "toggle-button";
const OPEN_MODAL_BUTTON_TEST_ID = "open-modal-button";
const SUBMIT_BUTTON_TEST_ID = "submit-button";

const NEW_THREAD_TITLE = "New";
const NEW_THREAD = { title: "  New  ", color: "#000" };

const TestConsumer = () => {
  const { threadListMode, threads, threadsStatus, isAddThreadModalOpen } =
    useDashboardPageValue();

  const { toggleThreadListMode, openAddThreadModal, submitNewThread } =
    useDashboardPageAction();

  const handleSubmitNewThread = () => {
    submitNewThread(NEW_THREAD);
  };

  return (
    <>
      <div data-testid={THREAD_LIST_MODE_TEST_ID}>{threadListMode}</div>
      <div data-testid={THREADS_STATUS_TEST_ID}>{threadsStatus}</div>
      <div data-testid={IS_MODAL_OPEN_TEST_ID}>
        {String(isAddThreadModalOpen)}
      </div>

      <ul>
        {threads.map((thread) => (
          <li key={thread.id} data-testid={THREAD_TITLE_TEST_ID}>
            {thread.title}
          </li>
        ))}
      </ul>

      <button
        onClick={toggleThreadListMode}
        data-testid={TOGGLE_BUTTON_TEST_ID}
      >
        Toggle Mode
      </button>

      <button
        onClick={openAddThreadModal}
        data-testid={OPEN_MODAL_BUTTON_TEST_ID}
      >
        Open Modal
      </button>

      <button
        onClick={handleSubmitNewThread}
        data-testid={SUBMIT_BUTTON_TEST_ID}
      >
        Submit
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

const seedThreadListMode = (mode: string) => {
  localStorage.setItem(THREAD_LIST_MODE_STORAGE_KEY, JSON.stringify(mode));
};

const readStoredThreadListMode = () => {
  return localStorage.getItem(THREAD_LIST_MODE_STORAGE_KEY);
};

const getThreadTitles = () => {
  return screen
    .queryAllByTestId(THREAD_TITLE_TEST_ID)
    .map((threadTitle) => threadTitle.textContent);
};

const waitForThreadsLoaded = () => {
  return screen.findByText(ThreadsStatus.Loaded);
};

const openAddThreadModal = async (user: ReturnType<typeof userEvent.setup>) => {
  await waitForThreadsLoaded();
  await user.click(screen.getByTestId(OPEN_MODAL_BUTTON_TEST_ID));
};

const submitNewThread = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByTestId(SUBMIT_BUTTON_TEST_ID));
};

describe("DashboardPageLoader", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("context values", () => {
    it("provides the default values when nothing is stored", async () => {
      setup();

      await waitForThreadsLoaded();

      const listMode = screen.getByTestId(THREAD_LIST_MODE_TEST_ID).textContent;
      expect(listMode).toBe(ThreadListMode.Grid);

      const isModalOpen = screen.getByTestId(IS_MODAL_OPEN_TEST_ID).textContent;
      expect(isModalOpen).toBe("false");

      expect(getThreadTitles()).toStrictEqual([]);
    });
  });

  describe("threads", () => {
    it("starts in the loading status and loads the stored threads", async () => {
      seedThreads(mindThreadFixtures);

      setup();

      let threadStatus = screen.getByTestId(THREADS_STATUS_TEST_ID).textContent;
      expect(threadStatus).toBe(ThreadsStatus.Loading);

      await waitForThreadsLoaded();

      threadStatus = screen.getByTestId(THREADS_STATUS_TEST_ID).textContent;
      expect(threadStatus).toBe(ThreadsStatus.Loaded);

      expect(getThreadTitles()).toStrictEqual(
        mindThreadFixtures.map((thread) => thread.title)
      );
    });

    it("shows the error status when the stored threads are malformed, without a notification", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});

      localStorage.setItem(THREADS_STORAGE_KEY, MALFORMED_JSON);

      setup();

      const errorStatus = await screen.findByText(ThreadsStatus.Error);
      expect(errorStatus).toBeInTheDocument();

      const notification = screen.queryByTestId(
        NotificationsTestId.notification
      );

      expect(notification).not.toBeInTheDocument();
    });

    it("prepends the new thread, closes the modal, and shows a success notification", async () => {
      seedThreads(mindThreadFixtures);

      const { user } = setup();

      let isModalOpen = (await screen.findByTestId(IS_MODAL_OPEN_TEST_ID))
        .textContent;

      expect(isModalOpen).toBe("false");

      await openAddThreadModal(user);

      isModalOpen = screen.getByTestId(IS_MODAL_OPEN_TEST_ID).textContent;
      expect(isModalOpen).toBe("true");

      await submitNewThread(user);

      const newThreadTitle = await screen.findByText(
        getThreadCreatedMessage(NEW_THREAD_TITLE)
      );

      expect(newThreadTitle).toBeInTheDocument();

      isModalOpen = screen.getByTestId(IS_MODAL_OPEN_TEST_ID).textContent;
      expect(isModalOpen).toBe("false");

      expect(getThreadTitles()).toStrictEqual([
        NEW_THREAD_TITLE,
        ...mindThreadFixtures.map((thread) => thread.title),
      ]);
    });

    it("keeps the modal open and the threads unchanged when saving fails", async () => {
      seedThreads(mindThreadFixtures);

      const { user } = setup();

      await openAddThreadModal(user);

      vi.spyOn(console, "error").mockImplementation(() => {});
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("Storage quota exceeded");
      });

      await submitNewThread(user);

      expect(
        await screen.findByText(SAVE_THREAD_ERROR_MESSAGE)
      ).toBeInTheDocument();

      expect(screen.getByTestId(IS_MODAL_OPEN_TEST_ID).textContent).toBe(
        "true"
      );

      expect(getThreadTitles()).toStrictEqual(
        mindThreadFixtures.map((thread) => thread.title)
      );
    });

    it("puts the thread first when a retry after a failed save succeeds", async () => {
      seedThreads(mindThreadFixtures);

      const { user } = setup();

      await openAddThreadModal(user);

      vi.spyOn(console, "error").mockImplementation(() => {});
      vi.spyOn(Storage.prototype, "setItem").mockImplementationOnce(() => {
        throw new Error("Storage quota exceeded");
      });

      await submitNewThread(user);

      const errorMessage = await screen.findByText(SAVE_THREAD_ERROR_MESSAGE);
      expect(errorMessage).toBeInTheDocument();

      await submitNewThread(user);

      const newThreadTitle = await screen.findByText(
        getThreadCreatedMessage(NEW_THREAD_TITLE)
      );

      expect(newThreadTitle).toBeInTheDocument();

      expect(getThreadTitles()[0]).toBe(NEW_THREAD_TITLE);
    });
  });

  describe("toggleThreadListMode", () => {
    it("toggles threadListMode from 'grid' to 'list'", async () => {
      const { user } = setup();

      let listMode = screen.getByTestId(THREAD_LIST_MODE_TEST_ID).textContent;
      expect(listMode).toBe(ThreadListMode.Grid);

      await user.click(screen.getByTestId(TOGGLE_BUTTON_TEST_ID));

      listMode = screen.getByTestId(THREAD_LIST_MODE_TEST_ID).textContent;
      expect(listMode).toBe(ThreadListMode.List);
    });

    it("toggles threadListMode from 'list' back to 'grid'", async () => {
      const { user } = setup();

      let listMode = (await screen.findByTestId(THREAD_LIST_MODE_TEST_ID))
        .textContent;

      expect(listMode).toBe(ThreadListMode.Grid);

      await user.click(screen.getByTestId(TOGGLE_BUTTON_TEST_ID));

      listMode = screen.getByTestId(THREAD_LIST_MODE_TEST_ID).textContent;
      expect(listMode).toBe(ThreadListMode.List);

      await user.click(screen.getByTestId(TOGGLE_BUTTON_TEST_ID));

      listMode = screen.getByTestId(THREAD_LIST_MODE_TEST_ID).textContent;
      expect(listMode).toBe(ThreadListMode.Grid);
    });

    it("toggles multiple times correctly", async () => {
      const { user } = setup();

      const toggleButton = await screen.findByTestId(TOGGLE_BUTTON_TEST_ID);

      let listMode = screen.getByTestId(THREAD_LIST_MODE_TEST_ID).textContent;
      expect(listMode).toBe(ThreadListMode.Grid);

      await user.click(toggleButton);

      listMode = screen.getByTestId(THREAD_LIST_MODE_TEST_ID).textContent;
      expect(listMode).toBe(ThreadListMode.List);

      await user.click(toggleButton);

      listMode = screen.getByTestId(THREAD_LIST_MODE_TEST_ID).textContent;
      expect(listMode).toBe(ThreadListMode.Grid);

      await user.click(toggleButton);

      listMode = screen.getByTestId(THREAD_LIST_MODE_TEST_ID).textContent;
      expect(listMode).toBe(ThreadListMode.List);
    });
  });

  describe("local storage integration", () => {
    it("reads the initial value from storage", () => {
      seedThreadListMode(ThreadListMode.List);

      setup();

      const listMode = screen.getByTestId(THREAD_LIST_MODE_TEST_ID).textContent;
      expect(listMode).toBe(ThreadListMode.List);
    });

    it("persists the default value to storage when storage is empty", () => {
      setup();

      expect(readStoredThreadListMode()).toBe(
        JSON.stringify(ThreadListMode.Grid)
      );
    });

    it("persists the new value to storage when toggle is clicked", async () => {
      const { user } = setup();

      const toggleButton = screen.getByTestId(TOGGLE_BUTTON_TEST_ID);
      await user.click(toggleButton);

      expect(readStoredThreadListMode()).toBe(
        JSON.stringify(ThreadListMode.List)
      );
    });

    it("persists the value to storage across multiple toggles", async () => {
      const { user } = setup();

      const toggleButton = screen.getByTestId(TOGGLE_BUTTON_TEST_ID);

      await user.click(toggleButton);

      expect(readStoredThreadListMode()).toBe(
        JSON.stringify(ThreadListMode.List)
      );

      await user.click(toggleButton);

      expect(readStoredThreadListMode()).toBe(
        JSON.stringify(ThreadListMode.Grid)
      );
    });
  });
});
