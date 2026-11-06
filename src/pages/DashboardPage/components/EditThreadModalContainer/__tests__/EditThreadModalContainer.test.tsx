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
import { ColorPickerTestId } from "@/components/lib/ColorPicker/ColorPicker.constants";
import { ThreadFormTestId } from "@/components/shared/ThreadForm/ThreadForm.constants";
import { ThreadFormModalActionsTestId } from "@/components/shared/ThreadFormModalActions/ThreadFormModalActions.constants";
import {
  clickOutside,
  createDeferred,
  mindThreadFixtures,
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
import { SAVE_THREAD_ERROR_MESSAGE } from "@/pages/DashboardPage/components/DashboardPageLoader/DashboardPageLoader.constants";
import { getThreadUpdatedMessage } from "@/pages/DashboardPage/components/DashboardPageLoader/DashboardPageLoader.utils";
import { EditThreadModalContainer } from "../EditThreadModalContainer";
import { EDIT_THREAD_MODAL_TITLE } from "../components/EditThreadModal/EditThreadModal.constants";

vi.mock("@/services", async (importOriginal) => {
  const { createServicesMock } = await import("@/__test-fixtures__");
  const original = await importOriginal<typeof import("@/services")>();

  return createServicesMock(original);
});

const THREAD_TITLE_TEST_ID = "thread-title";
const THREAD_COLOR_TEST_ID = "thread-color";
const OPEN_EDIT_BUTTON_TEST_ID_PREFIX = "open-edit-button-";
const STORAGE_ERROR_MESSAGE = "Storage quota exceeded";
const EDITED_THREAD_TITLE = "QA Strategy";

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

const ThreadList = () => {
  const { threads } = useDashboardPageValue();

  return (
    <>
      <ul>
        {threads.map((thread) => (
          <li key={thread.id}>
            <span data-testid={THREAD_TITLE_TEST_ID}>{thread.title}</span>
            <span data-testid={THREAD_COLOR_TEST_ID}>{thread.color}</span>
          </li>
        ))}
      </ul>

      <div>
        {threads.map((thread) => (
          <ThreadEditButton key={thread.id} thread={thread} />
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
      <EditThreadModalContainer />
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

const getThreadColors = () => {
  return screen
    .queryAllByTestId(THREAD_COLOR_TEST_ID)
    .map((threadColor) => threadColor.textContent);
};

const readStoredThreads = (): MindThread[] => {
  return JSON.parse(localStorage.getItem(THREADS_STORAGE_KEY) ?? "[]");
};

const queryModalTitle = () => {
  return screen.queryByText(EDIT_THREAD_MODAL_TITLE);
};

const getNameInput = () => {
  return screen.getByTestId(ThreadFormTestId.titleInput);
};

const getColorTrigger = () => {
  return screen.getByTestId(ColorPickerTestId.trigger);
};

const getCancelButton = () => {
  return screen.getByTestId(ThreadFormModalActionsTestId.cancelButton);
};

const getSaveButton = () => {
  return screen.getByTestId(ThreadFormModalActionsTestId.submitButton);
};

const getCloseButton = () => {
  return screen.getByRole("button", { name: "Close" });
};

const openEditModalFor = async ({ user }: SetupResult, thread: MindThread) => {
  await waitForThreadsLoaded();

  await user.click(
    screen.getByTestId(`${OPEN_EDIT_BUTTON_TEST_ID_PREFIX}${thread.id}`)
  );
};

const renameThread = async ({ user }: SetupResult, title: string) => {
  const nameInput = getNameInput();

  await user.clear(nameInput);
  await user.type(nameInput, title);
};

const saveEdit = async ({ user }: SetupResult) => {
  await user.click(getSaveButton());
};

const mockStorageSetItemFailure = () => {
  vi.spyOn(console, "error").mockImplementation(() => {});

  return vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error(STORAGE_ERROR_MESSAGE);
  });
};

describe("EditThreadModalContainer", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    resetThreadsServiceOverrides();
  });

  it("does not render the modal until a thread's edit action is chosen, then shows the thread's values", async () => {
    seedThreads(mindThreadFixtures);

    const context = setup();

    await waitForThreadsLoaded();

    expect(queryModalTitle()).not.toBeInTheDocument();

    await openEditModalFor(context, mindThreadFixtures[0]);

    const modalTitle = screen.getByText(EDIT_THREAD_MODAL_TITLE);
    expect(modalTitle).toBeInTheDocument();

    const nameInput = getNameInput();
    expect(nameInput).toHaveValue(mindThreadFixtures[0].title);

    const colorTrigger = getColorTrigger();
    expect(colorTrigger.firstChild).toHaveAttribute(
      "data-value",
      mindThreadFixtures[0].color.toUpperCase()
    );
  });

  it("closes the modal and leaves the listed thread unchanged when Cancel is clicked", async () => {
    seedThreads(mindThreadFixtures);

    const context = setup();

    await openEditModalFor(context, mindThreadFixtures[0]);

    const modalTitle = screen.getByText(EDIT_THREAD_MODAL_TITLE);
    expect(modalTitle).toBeInTheDocument();

    await renameThread(context, "Changed");
    await context.user.click(getCancelButton());

    expect(modalTitle).not.toBeInTheDocument();

    expect(getThreadTitles()).toStrictEqual(
      mindThreadFixtures.map((thread) => thread.title)
    );
    expect(getThreadColors()).toStrictEqual(
      mindThreadFixtures.map((thread) => thread.color)
    );
  });

  it("closes the modal and leaves the listed thread unchanged when Escape is pressed", async () => {
    seedThreads(mindThreadFixtures);

    const context = setup();

    await openEditModalFor(context, mindThreadFixtures[0]);

    const modalTitle = screen.getByText(EDIT_THREAD_MODAL_TITLE);
    expect(modalTitle).toBeInTheDocument();

    await waitForDismissListeners();
    await context.user.keyboard("{Escape}");

    await waitFor(() => expect(modalTitle).not.toBeInTheDocument());

    expect(getThreadTitles()).toStrictEqual(
      mindThreadFixtures.map((thread) => thread.title)
    );
  });

  it("closes the modal and leaves the listed thread unchanged when the close button is clicked", async () => {
    seedThreads(mindThreadFixtures);

    const context = setup();

    await openEditModalFor(context, mindThreadFixtures[0]);

    const modalTitle = screen.getByText(EDIT_THREAD_MODAL_TITLE);
    expect(modalTitle).toBeInTheDocument();

    await context.user.click(getCloseButton());

    expect(modalTitle).not.toBeInTheDocument();

    expect(getThreadTitles()).toStrictEqual(
      mindThreadFixtures.map((thread) => thread.title)
    );
  });

  it("shows the saved name again when the modal is reopened after closing with unsaved changes", async () => {
    seedThreads(mindThreadFixtures);

    const context = setup();

    await openEditModalFor(context, mindThreadFixtures[0]);
    await renameThread(context, "Changed");
    await context.user.click(getCancelButton());

    await openEditModalFor(context, mindThreadFixtures[0]);

    const nameInput = getNameInput();
    expect(nameInput).toHaveValue(mindThreadFixtures[0].title);
  });

  it("closes the modal, updates the listed thread, stores the trimmed name and shows a success notification on Save", async () => {
    seedThreads(mindThreadFixtures);

    const context = setup();

    await openEditModalFor(context, mindThreadFixtures[0]);

    const modalTitle = screen.getByText(EDIT_THREAD_MODAL_TITLE);
    expect(modalTitle).toBeInTheDocument();

    await renameThread(context, `  ${EDITED_THREAD_TITLE}  `);
    await saveEdit(context);

    const notification = await screen.findByText(
      getThreadUpdatedMessage(EDITED_THREAD_TITLE)
    );

    expect(notification).toBeInTheDocument();
    expect(modalTitle).not.toBeInTheDocument();

    expect(getThreadTitles()[0]).toBe(EDITED_THREAD_TITLE);
    expect(readStoredThreads()[0].title).toBe(EDITED_THREAD_TITLE);
  });

  it("keeps the modal open with the entered name, the thread unchanged and an error notification when the save fails", async () => {
    seedThreads(mindThreadFixtures);

    const context = setup();

    await openEditModalFor(context, mindThreadFixtures[0]);

    mockStorageSetItemFailure();

    await renameThread(context, EDITED_THREAD_TITLE);
    await saveEdit(context);

    const errorMessage = await screen.findByText(SAVE_THREAD_ERROR_MESSAGE);
    expect(errorMessage).toBeInTheDocument();

    expect(queryModalTitle()).toBeInTheDocument();

    const nameInput = getNameInput();
    expect(nameInput).toHaveValue(EDITED_THREAD_TITLE);

    expect(getThreadTitles()).toStrictEqual(
      mindThreadFixtures.map((thread) => thread.title)
    );

    expect(getCancelButton()).toBeEnabled();
    expect(getSaveButton()).toBeEnabled();
    expect(nameInput).toBeEnabled();
    expect(getColorTrigger()).toBeEnabled();
  });

  it("updates the listed thread when Save is retried after a failed save", async () => {
    seedThreads(mindThreadFixtures);

    const context = setup();

    await openEditModalFor(context, mindThreadFixtures[0]);

    const setItemSpy = mockStorageSetItemFailure();

    await renameThread(context, EDITED_THREAD_TITLE);
    await saveEdit(context);

    const errorMessage = await screen.findByText(SAVE_THREAD_ERROR_MESSAGE);
    expect(errorMessage).toBeInTheDocument();

    setItemSpy.mockRestore();

    await saveEdit(context);

    const updatedMessage = await screen.findByText(
      getThreadUpdatedMessage(EDITED_THREAD_TITLE)
    );

    expect(updatedMessage).toBeInTheDocument();
    expect(getThreadTitles()[0]).toBe(EDITED_THREAD_TITLE);
  });

  it("disables the actions and fields, blocks Escape and outside clicks, and closes once the pending save settles", async () => {
    seedThreads(mindThreadFixtures);

    const deferredUpdate = createDeferred<MindThread>();
    threadsServiceOverrides.updateThread = () => deferredUpdate.promise;

    const context = setup({
      pointerEventsCheck: PointerEventsCheckLevel.Never,
    });

    await openEditModalFor(context, mindThreadFixtures[0]);

    const modalTitle = screen.getByText(EDIT_THREAD_MODAL_TITLE);
    expect(modalTitle).toBeInTheDocument();

    await renameThread(context, EDITED_THREAD_TITLE);
    await saveEdit(context);

    expect(getSaveButton()).toHaveAttribute("data-loading");
    expect(getSaveButton()).toBeDisabled();

    expect(getCancelButton()).toBeDisabled();
    expect(getCloseButton()).toBeDisabled();
    expect(getNameInput()).toBeDisabled();
    expect(getColorTrigger()).toBeDisabled();

    await waitForDismissListeners();
    await context.user.keyboard("{Escape}");

    await clickOutside(context.user, { shouldWaitForDismissListeners: false });

    expect(modalTitle).toBeInTheDocument();

    deferredUpdate.resolve({
      ...mindThreadFixtures[0],
      title: EDITED_THREAD_TITLE,
    });

    await waitForElementToBeRemoved(modalTitle);

    await waitFor(() => expect(getThreadTitles()[0]).toBe(EDITED_THREAD_TITLE));
  });
});
