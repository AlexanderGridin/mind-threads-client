import { afterEach, describe, it, expect, vi } from "vitest";
import {
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent, {
  PointerEventsCheckLevel,
} from "@testing-library/user-event";
import { renderWithUIProvider } from "@/components/lib/__test-fixtures__";
import {
  createDeferred,
  mindThreadFixture,
  mindThreadFixtures,
  clickOutside,
  resetThreadsServiceOverrides,
  seedThreads,
  threadsServiceOverrides,
  waitForDismissListeners,
} from "@/__test-fixtures__";
import type { MindThread } from "@/types";
import { THREADS_STORAGE_KEY } from "@/services/useThreadsService/useThreadsService.constants";
import {
  DashboardPageLoader,
  useDashboardPageAction,
  useDashboardPageValue,
} from "@/pages/DashboardPage/components/DashboardPageLoader";
import { DELETE_THREAD_ERROR_MESSAGE } from "@/pages/DashboardPage/components/DashboardPageLoader/DashboardPageLoader.constants";
import { getThreadDeletedMessage } from "@/pages/DashboardPage/components/DashboardPageLoader/DashboardPageLoader.utils";
import { DeleteThreadModalContainer } from "../DeleteThreadModalContainer";
import { DELETE_THREAD_MODAL_TITLE } from "../components/DeleteThreadModal/DeleteThreadModal.constants";
import { getDeleteThreadModalText } from "../components/DeleteThreadModal/DeleteThreadModal.utils";
import { DeleteConfirmationModalActionsTestId } from "@/components/shared/DeleteConfirmationModal/components/DeleteConfirmationModalActions/DeleteConfirmationModalActions.constants";

vi.mock("@/services", async (importOriginal) => {
  const { createServicesMock } = await import("@/__test-fixtures__");
  const original = await importOriginal<typeof import("@/services")>();

  return createServicesMock(original);
});

const THREAD_TITLE_TEST_ID = "thread-title";
const OPEN_DELETE_BUTTON_TEST_ID_PREFIX = "open-delete-button-";
const STORAGE_ERROR_MESSAGE = "Storage quota exceeded";

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

const ThreadList = () => {
  const { threads } = useDashboardPageValue();

  return (
    <>
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
      </div>
    </>
  );
};

const setup = ({
  pointerEventsCheck = PointerEventsCheckLevel.EachApiCall,
}: { pointerEventsCheck?: PointerEventsCheckLevel } = {}) => {
  const user = userEvent.setup({ pointerEventsCheck });

  renderWithUIProvider(
    <DashboardPageLoader>
      <ThreadList />
      <DeleteThreadModalContainer />
    </DashboardPageLoader>
  );

  return { user };
};

type SetupResult = ReturnType<typeof setup>;

const waitForThreadsLoaded = () => {
  return screen.findAllByTestId(THREAD_TITLE_TEST_ID);
};

const getThreadTitles = () => {
  return screen
    .queryAllByTestId(THREAD_TITLE_TEST_ID)
    .map((threadTitle) => threadTitle.textContent);
};

const readStoredThreads = (): MindThread[] => {
  return JSON.parse(localStorage.getItem(THREADS_STORAGE_KEY) ?? "[]");
};

const queryModalTitle = () => {
  return screen.queryByText(DELETE_THREAD_MODAL_TITLE);
};

const getCancelButton = () => {
  return screen.getByTestId(DeleteConfirmationModalActionsTestId.cancelButton);
};

// While deleting, the loading spinner replaces the label, so the button is found by test id.
const getDeleteButton = () => {
  return screen.getByTestId(DeleteConfirmationModalActionsTestId.deleteButton);
};

const getCloseButton = () => {
  return screen.getByRole("button", { name: "Close" });
};

const openDeleteModalFor = async (
  { user }: SetupResult,
  thread: MindThread
) => {
  await waitForThreadsLoaded();

  await user.click(
    screen.getByTestId(`${OPEN_DELETE_BUTTON_TEST_ID_PREFIX}${thread.id}`)
  );
};

const confirmDelete = async ({ user }: SetupResult) => {
  await user.click(getDeleteButton());
};

const mockStorageSetItemFailure = () => {
  vi.spyOn(console, "error").mockImplementation(() => {});

  return vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error(STORAGE_ERROR_MESSAGE);
  });
};

describe("DeleteThreadModalContainer", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    resetThreadsServiceOverrides();
  });

  it("does not render the modal until a thread's delete action is chosen, then shows the thread-specific text", async () => {
    seedThreads(mindThreadFixtures);

    const context = setup();

    await waitForThreadsLoaded();

    expect(queryModalTitle()).not.toBeInTheDocument();

    await openDeleteModalFor(context, mindThreadFixtures[0]);

    const modalTitle = screen.getByText(DELETE_THREAD_MODAL_TITLE);
    expect(modalTitle).toBeInTheDocument();

    const modalText = screen.getByText(
      getDeleteThreadModalText(mindThreadFixtures[0].title)
    );

    expect(modalText).toBeInTheDocument();
  });

  it("closes the modal and keeps the thread listed when Cancel is clicked", async () => {
    seedThreads(mindThreadFixtures);

    const context = setup();

    await openDeleteModalFor(context, mindThreadFixtures[0]);

    const modalTitle = screen.getByText(DELETE_THREAD_MODAL_TITLE);
    expect(modalTitle).toBeInTheDocument();

    await context.user.click(getCancelButton());

    expect(modalTitle).not.toBeInTheDocument();

    expect(getThreadTitles()).toStrictEqual(
      mindThreadFixtures.map((thread) => thread.title)
    );
  });

  it("closes the modal and keeps the thread listed when Escape is pressed", async () => {
    seedThreads(mindThreadFixtures);

    const context = setup();

    await openDeleteModalFor(context, mindThreadFixtures[0]);

    const modalTitle = screen.getByText(DELETE_THREAD_MODAL_TITLE);
    expect(modalTitle).toBeInTheDocument();

    await waitForDismissListeners();
    await context.user.keyboard("{Escape}");

    await waitFor(() => expect(modalTitle).not.toBeInTheDocument());

    expect(getThreadTitles()).toStrictEqual(
      mindThreadFixtures.map((thread) => thread.title)
    );
  });

  it("closes the modal and keeps the thread listed when the close button is clicked", async () => {
    seedThreads(mindThreadFixtures);

    const context = setup();

    await openDeleteModalFor(context, mindThreadFixtures[0]);

    const modalTitle = screen.getByText(DELETE_THREAD_MODAL_TITLE);
    expect(modalTitle).toBeInTheDocument();

    await context.user.click(getCloseButton());

    expect(modalTitle).not.toBeInTheDocument();

    expect(getThreadTitles()).toStrictEqual(
      mindThreadFixtures.map((thread) => thread.title)
    );
  });

  it("removes the thread, closes the modal, shows a success notification and updates storage on Delete", async () => {
    seedThreads(mindThreadFixtures);

    const context = setup();

    await openDeleteModalFor(context, mindThreadFixtures[0]);

    const modalTitle = screen.getByText(DELETE_THREAD_MODAL_TITLE);
    expect(modalTitle).toBeInTheDocument();

    await confirmDelete(context);

    const notification = await screen.findByText(
      getThreadDeletedMessage(mindThreadFixtures[0].title)
    );

    expect(notification).toBeInTheDocument();
    expect(modalTitle).not.toBeInTheDocument();
    expect(getThreadTitles()).toStrictEqual([mindThreadFixtures[1].title]);
    expect(readStoredThreads()).toStrictEqual([mindThreadFixtures[1]]);
  });

  it("leaves an empty list when the only thread is deleted", async () => {
    seedThreads([mindThreadFixture]);

    const context = setup();

    await openDeleteModalFor(context, mindThreadFixture);

    await confirmDelete(context);

    const notification = await screen.findByText(
      getThreadDeletedMessage(mindThreadFixture.title)
    );

    expect(notification).toBeInTheDocument();
    expect(getThreadTitles()).toStrictEqual([]);
    expect(readStoredThreads()).toStrictEqual([]);
  });

  it("keeps the modal open, the thread listed and shows an error notification when the delete fails", async () => {
    seedThreads(mindThreadFixtures);

    const context = setup();

    await openDeleteModalFor(context, mindThreadFixtures[0]);

    mockStorageSetItemFailure();

    await confirmDelete(context);

    const errorMessage = await screen.findByText(DELETE_THREAD_ERROR_MESSAGE);
    expect(errorMessage).toBeInTheDocument();

    expect(queryModalTitle()).toBeInTheDocument();

    expect(getThreadTitles()).toStrictEqual(
      mindThreadFixtures.map((thread) => thread.title)
    );

    expect(getCancelButton()).toBeEnabled();
    expect(getDeleteButton()).toBeEnabled();
  });

  it("removes the thread when a retry after a failed delete succeeds", async () => {
    seedThreads(mindThreadFixtures);

    const context = setup();

    await openDeleteModalFor(context, mindThreadFixtures[0]);

    const setItemSpy = mockStorageSetItemFailure();

    await confirmDelete(context);

    const deleteErrorMessage = await screen.findByText(
      DELETE_THREAD_ERROR_MESSAGE
    );

    expect(deleteErrorMessage).toBeInTheDocument();

    setItemSpy.mockRestore();

    await confirmDelete(context);

    const deletedMessage = await screen.findByText(
      getThreadDeletedMessage(mindThreadFixtures[0].title)
    );

    expect(deletedMessage).toBeInTheDocument();

    expect(getThreadTitles()).toStrictEqual([mindThreadFixtures[1].title]);
  });

  it("disables the actions, blocks Escape and outside clicks, and closes once the pending delete settles", async () => {
    seedThreads(mindThreadFixtures);

    const deferredDelete = createDeferred();
    threadsServiceOverrides.deleteThread = () => deferredDelete.promise;

    const context = setup({
      pointerEventsCheck: PointerEventsCheckLevel.Never,
    });

    await openDeleteModalFor(context, mindThreadFixtures[0]);

    const modalTitle = screen.getByText(DELETE_THREAD_MODAL_TITLE);
    expect(modalTitle).toBeInTheDocument();

    await confirmDelete(context);

    expect(getDeleteButton()).toHaveAttribute("data-loading");
    expect(getDeleteButton()).toBeDisabled();

    expect(getCancelButton()).toBeDisabled();
    expect(getCloseButton()).toBeDisabled();

    await waitForDismissListeners();
    await context.user.keyboard("{Escape}");

    await clickOutside(context.user, { shouldWaitForDismissListeners: false });

    expect(modalTitle).toBeInTheDocument();

    deferredDelete.resolve();

    await waitForElementToBeRemoved(modalTitle);

    await waitFor(() =>
      expect(getThreadTitles()).toStrictEqual([mindThreadFixtures[1].title])
    );
  });
});
