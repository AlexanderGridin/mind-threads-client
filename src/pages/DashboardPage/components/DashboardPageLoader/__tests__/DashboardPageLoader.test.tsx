import { describe, it, expect, afterEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithUIProvider } from "@/components/lib";
import { NotificationsTestId } from "@/components/lib/Notifications/Notifications.constants";
import {
  MALFORMED_JSON,
  createDeferred,
  mindThreadFixture,
  mindThreadFixtures,
  resetThreadsServiceOverrides,
  seedThreads,
  threadsServiceOverrides,
} from "@/__test-fixtures__";
import type { MindThread } from "@/types";
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
  DELETE_THREAD_ERROR_MESSAGE,
  SAVE_THREAD_ERROR_MESSAGE,
  THREAD_LIST_MODE_STORAGE_KEY,
} from "../DashboardPageLoader.constants";
import {
  getThreadCreatedMessage,
  getThreadDeletedMessage,
  getThreadUpdatedMessage,
} from "../DashboardPageLoader.utils";

vi.mock("@/services", async (importOriginal) => {
  const { createServicesMock } = await import("@/__test-fixtures__");
  const original = await importOriginal<typeof import("@/services")>();

  return createServicesMock(original);
});

const THREAD_LIST_MODE_TEST_ID = "thread-list-mode";
const THREADS_STATUS_TEST_ID = "threads-status";
const IS_MODAL_OPEN_TEST_ID = "is-modal-open";
const THREAD_TITLE_TEST_ID = "thread-title";
const TOGGLE_BUTTON_TEST_ID = "toggle-button";
const OPEN_MODAL_BUTTON_TEST_ID = "open-modal-button";
const SUBMIT_BUTTON_TEST_ID = "submit-button";
const THREAD_TO_DELETE_TEST_ID = "thread-to-delete";
const IS_DELETING_THREAD_TEST_ID = "is-deleting-thread";
const OPEN_DELETE_BUTTON_TEST_ID_PREFIX = "open-delete-button-";
const CLOSE_DELETE_BUTTON_TEST_ID = "close-delete-button";
const CONFIRM_DELETE_BUTTON_TEST_ID = "confirm-delete-button";
const NO_THREAD_TO_DELETE = "none";
const THREAD_TO_EDIT_TEST_ID = "thread-to-edit";
const IS_SAVING_THREAD_TEST_ID = "is-saving-thread";
const OPEN_EDIT_BUTTON_TEST_ID_PREFIX = "open-edit-button-";
const CLOSE_EDIT_BUTTON_TEST_ID = "close-edit-button";
const SAVE_EDIT_BUTTON_TEST_ID = "save-edit-button";
const NO_THREAD_TO_EDIT = "none";

const NEW_THREAD_TITLE = "New";
const NEW_THREAD = { title: "  New  ", color: "#000" };

const EDITED_THREAD_TITLE = "QA Strategy";
const EDITED_THREAD_COLOR = "#000000";
const EDITED_THREAD_CHANGES = {
  title: `  ${EDITED_THREAD_TITLE}  `,
  color: EDITED_THREAD_COLOR,
};

type ThreadDeleteButtonProps = {
  thread: MindThread;
};

const ThreadDeleteButton = ({ thread }: ThreadDeleteButtonProps) => {
  const { openDeleteThreadModal } = useDashboardPageAction();

  const handleOpenDeleteModal = () => {
    openDeleteThreadModal(thread);
  };

  return (
    <button
      onClick={handleOpenDeleteModal}
      data-testid={`${OPEN_DELETE_BUTTON_TEST_ID_PREFIX}${thread.id}`}
    >
      Delete
    </button>
  );
};

type ThreadEditButtonProps = {
  thread: MindThread;
};

const ThreadEditButton = ({ thread }: ThreadEditButtonProps) => {
  const { openEditThreadModal } = useDashboardPageAction();

  const handleOpenEditModal = () => {
    openEditThreadModal(thread);
  };

  return (
    <button
      onClick={handleOpenEditModal}
      data-testid={`${OPEN_EDIT_BUTTON_TEST_ID_PREFIX}${thread.id}`}
    >
      Edit
    </button>
  );
};

const TestConsumer = () => {
  const {
    threadListMode,
    threads,
    threadsStatus,
    isAddThreadModalOpen,
    threadToDelete,
    isDeletingThread,
    threadToEdit,
    isSavingThread,
  } = useDashboardPageValue();

  const {
    toggleThreadListMode,
    openAddThreadModal,
    submitNewThread,
    closeDeleteThreadModal,
    confirmDeleteThread,
    closeEditThreadModal,
    submitEditedThread,
  } = useDashboardPageAction();

  const handleSubmitNewThread = () => {
    submitNewThread(NEW_THREAD);
  };

  const handleCloseDeleteModal = () => {
    closeDeleteThreadModal();
  };

  const handleConfirmDeleteThread = () => {
    confirmDeleteThread();
  };

  const handleCloseEditModal = () => {
    closeEditThreadModal();
  };

  const handleSaveEditedThread = () => {
    submitEditedThread(EDITED_THREAD_CHANGES);
  };

  return (
    <>
      <div data-testid={THREAD_LIST_MODE_TEST_ID}>{threadListMode}</div>
      <div data-testid={THREADS_STATUS_TEST_ID}>{threadsStatus}</div>
      <div data-testid={IS_MODAL_OPEN_TEST_ID}>
        {String(isAddThreadModalOpen)}
      </div>

      <div data-testid={THREAD_TO_DELETE_TEST_ID}>
        {threadToDelete?.id ?? NO_THREAD_TO_DELETE}
      </div>
      <div data-testid={IS_DELETING_THREAD_TEST_ID}>
        {String(isDeletingThread)}
      </div>

      <div data-testid={THREAD_TO_EDIT_TEST_ID}>
        {threadToEdit?.id ?? NO_THREAD_TO_EDIT}
      </div>
      <div data-testid={IS_SAVING_THREAD_TEST_ID}>{String(isSavingThread)}</div>

      <ul>
        {threads.map((thread) => (
          <li key={thread.id} data-testid={THREAD_TITLE_TEST_ID}>
            {thread.title}
          </li>
        ))}
      </ul>

      <div>
        {threads.map((thread) => (
          <ThreadDeleteButton key={thread.id} thread={thread} />
        ))}
        {threads.map((thread) => (
          <ThreadEditButton key={thread.id} thread={thread} />
        ))}
      </div>

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

      <button
        onClick={handleCloseDeleteModal}
        data-testid={CLOSE_DELETE_BUTTON_TEST_ID}
      >
        Close Delete
      </button>

      <button
        onClick={handleConfirmDeleteThread}
        data-testid={CONFIRM_DELETE_BUTTON_TEST_ID}
      >
        Confirm Delete
      </button>

      <button
        onClick={handleCloseEditModal}
        data-testid={CLOSE_EDIT_BUTTON_TEST_ID}
      >
        Close Edit
      </button>

      <button
        onClick={handleSaveEditedThread}
        data-testid={SAVE_EDIT_BUTTON_TEST_ID}
      >
        Save Edit
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

const readStoredThreads = (): MindThread[] => {
  return JSON.parse(localStorage.getItem(THREADS_STORAGE_KEY) ?? "[]");
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

  const button = screen.getByTestId(OPEN_MODAL_BUTTON_TEST_ID);
  await user.click(button);
};

const submitNewThread = async (user: ReturnType<typeof userEvent.setup>) => {
  const button = screen.getByTestId(SUBMIT_BUTTON_TEST_ID);
  await user.click(button);
};

const openDeleteModalFor = async (
  user: ReturnType<typeof userEvent.setup>,
  thread: MindThread
) => {
  await waitForThreadsLoaded();

  const button = screen.getByTestId(
    `${OPEN_DELETE_BUTTON_TEST_ID_PREFIX}${thread.id}`
  );

  await user.click(button);
};

const confirmDelete = async (user: ReturnType<typeof userEvent.setup>) => {
  const button = screen.getByTestId(CONFIRM_DELETE_BUTTON_TEST_ID);
  await user.click(button);
};

const openEditModalFor = async (
  user: ReturnType<typeof userEvent.setup>,
  thread: MindThread
) => {
  await waitForThreadsLoaded();

  const button = screen.getByTestId(
    `${OPEN_EDIT_BUTTON_TEST_ID_PREFIX}${thread.id}`
  );

  await user.click(button);
};

const closeEditModal = async (user: ReturnType<typeof userEvent.setup>) => {
  const button = screen.getByTestId(CLOSE_EDIT_BUTTON_TEST_ID);
  await user.click(button);
};

const saveEditedThread = async (user: ReturnType<typeof userEvent.setup>) => {
  const button = screen.getByTestId(SAVE_EDIT_BUTTON_TEST_ID);
  await user.click(button);
};

const mockStorageSetItemFailure = () => {
  vi.spyOn(console, "error").mockImplementation(() => {});

  return vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("Storage quota exceeded");
  });
};

describe("DashboardPageLoader", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    resetThreadsServiceOverrides();
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

      const errorMessage = await screen.findByText(SAVE_THREAD_ERROR_MESSAGE);
      expect(errorMessage).toBeInTheDocument();

      const isModalOpenText = screen.getByTestId(
        IS_MODAL_OPEN_TEST_ID
      ).textContent;

      expect(isModalOpenText).toBe("true");

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

  describe("delete thread", () => {
    it("opens the modal for a thread and closes it again", async () => {
      seedThreads(mindThreadFixtures);

      const { user } = setup();

      await openDeleteModalFor(user, mindThreadFixtures[0]);

      let threadToDeleteText = screen.getByTestId(
        THREAD_TO_DELETE_TEST_ID
      ).textContent;

      expect(threadToDeleteText).toBe(mindThreadFixtures[0].id);

      const closeButton = screen.getByTestId(CLOSE_DELETE_BUTTON_TEST_ID);
      await user.click(closeButton);

      threadToDeleteText = screen.getByTestId(
        THREAD_TO_DELETE_TEST_ID
      ).textContent;

      expect(threadToDeleteText).toBe(NO_THREAD_TO_DELETE);
    });

    it("removes the confirmed thread, clears the modal and shows a success notification", async () => {
      seedThreads(mindThreadFixtures);

      const { user } = setup();

      await openDeleteModalFor(user, mindThreadFixtures[0]);
      await confirmDelete(user);

      const notification = await screen.findByText(
        getThreadDeletedMessage(mindThreadFixtures[0].title)
      );

      expect(notification).toBeInTheDocument();

      expect(getThreadTitles()).toStrictEqual([mindThreadFixtures[1].title]);

      const threadToDeleteText = screen.getByTestId(
        THREAD_TO_DELETE_TEST_ID
      ).textContent;

      expect(threadToDeleteText).toBe(NO_THREAD_TO_DELETE);
    });

    it("keeps the other two threads in order and updates storage when the second of three is deleted", async () => {
      seedThreads([
        mindThreadFixtures[0],
        mindThreadFixtures[1],
        mindThreadFixture,
      ]);

      const { user } = setup();

      await openDeleteModalFor(user, mindThreadFixtures[1]);
      await confirmDelete(user);

      const threadDeletedMessage = await screen.findByText(
        getThreadDeletedMessage(mindThreadFixtures[1].title)
      );

      expect(threadDeletedMessage).toBeInTheDocument();

      expect(getThreadTitles()).toStrictEqual([
        mindThreadFixtures[0].title,
        mindThreadFixture.title,
      ]);

      expect(readStoredThreads()).toStrictEqual([
        mindThreadFixtures[0],
        mindThreadFixture,
      ]);
    });

    it("keeps the modal open and the thread listed when the delete fails", async () => {
      seedThreads(mindThreadFixtures);

      const { user } = setup();

      await openDeleteModalFor(user, mindThreadFixtures[0]);

      mockStorageSetItemFailure();

      await confirmDelete(user);

      const errorMessage = await screen.findByText(DELETE_THREAD_ERROR_MESSAGE);
      expect(errorMessage).toBeInTheDocument();

      const threadToDeleteText = screen.getByTestId(
        THREAD_TO_DELETE_TEST_ID
      ).textContent;

      expect(threadToDeleteText).toBe(mindThreadFixtures[0].id);

      const isDeletingText = screen.getByTestId(
        IS_DELETING_THREAD_TEST_ID
      ).textContent;

      expect(isDeletingText).toBe("false");

      expect(getThreadTitles()).toStrictEqual(
        mindThreadFixtures.map((thread) => thread.title)
      );
    });

    it("removes the thread when a retry after a failed delete succeeds", async () => {
      seedThreads(mindThreadFixtures);

      const { user } = setup();

      await openDeleteModalFor(user, mindThreadFixtures[0]);

      const setItemSpy = mockStorageSetItemFailure();

      await confirmDelete(user);

      const deletionError = await screen.findByText(
        DELETE_THREAD_ERROR_MESSAGE
      );

      expect(deletionError).toBeInTheDocument();

      setItemSpy.mockRestore();

      await confirmDelete(user);

      const deletedMessage = await screen.findByText(
        getThreadDeletedMessage(mindThreadFixtures[0].title)
      );

      expect(deletedMessage).toBeInTheDocument();
      expect(getThreadTitles()).toStrictEqual([mindThreadFixtures[1].title]);
    });

    it("reports isDeletingThread while the delete is pending and clears it once it settles", async () => {
      seedThreads(mindThreadFixtures);

      const deferredDelete = createDeferred();
      threadsServiceOverrides.deleteThread = () => deferredDelete.promise;

      const { user } = setup();

      await openDeleteModalFor(user, mindThreadFixtures[0]);
      await confirmDelete(user);

      let isDeletingText = screen.getByTestId(
        IS_DELETING_THREAD_TEST_ID
      ).textContent;

      expect(isDeletingText).toBe("true");

      deferredDelete.resolve();

      const deletedMessage = await screen.findByText(
        getThreadDeletedMessage(mindThreadFixtures[0].title)
      );

      expect(deletedMessage).toBeInTheDocument();

      isDeletingText = screen.getByTestId(
        IS_DELETING_THREAD_TEST_ID
      ).textContent;

      expect(isDeletingText).toBe("false");
    });
  });

  describe("edit thread", () => {
    it("sets threadToEdit when a thread's edit action is chosen and clears it when closed", async () => {
      seedThreads(mindThreadFixtures);

      const { user } = setup();

      await openEditModalFor(user, mindThreadFixtures[0]);

      let threadToEditText = screen.getByTestId(
        THREAD_TO_EDIT_TEST_ID
      ).textContent;

      expect(threadToEditText).toBe(mindThreadFixtures[0].id);

      await closeEditModal(user);

      threadToEditText = screen.getByTestId(THREAD_TO_EDIT_TEST_ID).textContent;

      expect(threadToEditText).toBe(NO_THREAD_TO_EDIT);
    });

    it("updates only the edited thread in place, clears threadToEdit and shows a success notification", async () => {
      seedThreads([
        mindThreadFixtures[0],
        mindThreadFixtures[1],
        mindThreadFixture,
      ]);

      const { user } = setup();

      await openEditModalFor(user, mindThreadFixtures[1]);
      await saveEditedThread(user);

      const updatedMessage = await screen.findByText(
        getThreadUpdatedMessage(EDITED_THREAD_TITLE)
      );

      expect(updatedMessage).toBeInTheDocument();

      expect(getThreadTitles()).toStrictEqual([
        mindThreadFixtures[0].title,
        EDITED_THREAD_TITLE,
        mindThreadFixture.title,
      ]);

      expect(readStoredThreads()[1]).toMatchObject({
        id: mindThreadFixtures[1].id,
        title: EDITED_THREAD_TITLE,
        color: EDITED_THREAD_COLOR,
      });

      const threadToEditText = screen.getByTestId(
        THREAD_TO_EDIT_TEST_ID
      ).textContent;

      expect(threadToEditText).toBe(NO_THREAD_TO_EDIT);
    });

    it("keeps the thread being edited and the list unchanged when saving fails", async () => {
      seedThreads(mindThreadFixtures);

      const { user } = setup();

      await openEditModalFor(user, mindThreadFixtures[0]);

      mockStorageSetItemFailure();

      await saveEditedThread(user);

      const errorMessage = await screen.findByText(SAVE_THREAD_ERROR_MESSAGE);
      expect(errorMessage).toBeInTheDocument();

      const threadToEditText = screen.getByTestId(
        THREAD_TO_EDIT_TEST_ID
      ).textContent;

      expect(threadToEditText).toBe(mindThreadFixtures[0].id);

      expect(getThreadTitles()).toStrictEqual(
        mindThreadFixtures.map((thread) => thread.title)
      );

      const isSavingText = screen.getByTestId(
        IS_SAVING_THREAD_TEST_ID
      ).textContent;

      expect(isSavingText).toBe("false");
    });

    it("saves the edited thread when a retry after a failed save succeeds", async () => {
      seedThreads(mindThreadFixtures);

      const { user } = setup();

      await openEditModalFor(user, mindThreadFixtures[0]);

      const setItemSpy = mockStorageSetItemFailure();

      await saveEditedThread(user);

      const errorMessage = await screen.findByText(SAVE_THREAD_ERROR_MESSAGE);
      expect(errorMessage).toBeInTheDocument();

      setItemSpy.mockRestore();

      await saveEditedThread(user);

      const updatedMessage = await screen.findByText(
        getThreadUpdatedMessage(EDITED_THREAD_TITLE)
      );

      expect(updatedMessage).toBeInTheDocument();

      expect(getThreadTitles()).toStrictEqual([
        EDITED_THREAD_TITLE,
        mindThreadFixtures[1].title,
      ]);
    });

    it("reports isSavingThread while the save is pending and clears it once it settles", async () => {
      seedThreads(mindThreadFixtures);

      const deferredUpdate = createDeferred<MindThread>();
      threadsServiceOverrides.updateThread = () => deferredUpdate.promise;

      const { user } = setup();

      await openEditModalFor(user, mindThreadFixtures[0]);
      await saveEditedThread(user);

      let isSavingText = screen.getByTestId(
        IS_SAVING_THREAD_TEST_ID
      ).textContent;

      expect(isSavingText).toBe("true");

      deferredUpdate.resolve({
        ...mindThreadFixtures[0],
        title: EDITED_THREAD_TITLE,
        color: EDITED_THREAD_COLOR,
      });

      const updatedMessage = await screen.findByText(
        getThreadUpdatedMessage(EDITED_THREAD_TITLE)
      );

      expect(updatedMessage).toBeInTheDocument();

      isSavingText = screen.getByTestId(IS_SAVING_THREAD_TEST_ID).textContent;

      expect(isSavingText).toBe("false");
    });
  });
});
