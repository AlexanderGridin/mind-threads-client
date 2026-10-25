import { afterEach, describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithUIProvider } from "@/components/lib";
import { ColorPickerTestId } from "@/components/lib/ColorPicker/ColorPicker.constants";
import {
  DashboardPageLoader,
  useDashboardPageAction,
} from "@/pages/DashboardPage/components/DashboardPageLoader";
import { SAVE_THREAD_ERROR_MESSAGE } from "@/pages/DashboardPage/components/DashboardPageLoader/DashboardPageLoader.constants";
import { getThreadCreatedMessage } from "@/pages/DashboardPage/components/DashboardPageLoader/DashboardPageLoader.utils";
import { AddNewThreadModalContainer } from "../AddNewThreadModalContainer";
import { ADD_NEW_THREAD_MODAL_TITLE } from "../components/AddNewThreadModal/AddNewThreadModal.constants";
import { ThreadFormTestId } from "../components/AddNewThreadModal/components/ThreadForm/ThreadForm.constants";
import { AddNewThreadModalActionsTestId } from "../components/AddNewThreadModal/components/AddNewThreadModalActions/AddNewThreadModalActions.constants";

const OPEN_MODAL_BUTTON_TEST_ID = "open-modal-button";
const THREAD_TITLE = "Kept name";
const FIRST_SWATCH_INDEX = 0;
const STORAGE_ERROR_MESSAGE = "Storage quota exceeded";

const OpenModalTrigger = () => {
  const { openAddThreadModal } = useDashboardPageAction();

  return (
    <button
      onClick={openAddThreadModal}
      data-testid={OPEN_MODAL_BUTTON_TEST_ID}
    >
      Open
    </button>
  );
};

const setup = () => {
  const user = userEvent.setup();

  renderWithUIProvider(
    <DashboardPageLoader>
      <OpenModalTrigger />
      <AddNewThreadModalContainer />
    </DashboardPageLoader>
  );

  return { user };
};

type SetupResult = ReturnType<typeof setup>;

const getTitleInput = () => {
  return screen.getByTestId(ThreadFormTestId.titleInput) as HTMLInputElement;
};

const getSelectedColor = () => {
  const colorPicker = screen.getByTestId(ThreadFormTestId.colorPicker);
  return (colorPicker.querySelector("input") as HTMLInputElement).value;
};

const openModal = async ({ user }: SetupResult) => {
  await user.click(screen.getByTestId(OPEN_MODAL_BUTTON_TEST_ID));
};

const fillTitle = async ({ user }: SetupResult, title: string) => {
  await user.type(getTitleInput(), title);
};

const selectSwatch = async ({ user }: SetupResult, swatchIndex: number) => {
  await user.click(screen.getByTestId(ColorPickerTestId.trigger));

  await user.click(
    screen.getAllByTestId(ColorPickerTestId.swatchTrigger)[swatchIndex]
  );
};

const clickAdd = async ({ user }: SetupResult) => {
  await user.click(
    screen.getByTestId(AddNewThreadModalActionsTestId.addButton)
  );
};

const fillAndSubmit = async (context: SetupResult, title: string) => {
  await fillTitle(context, title);
  await clickAdd(context);
};

describe("AddNewThreadModalContainer", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not render the modal until it is opened", async () => {
    const context = setup();

    let modalTitle = screen.queryByText(ADD_NEW_THREAD_MODAL_TITLE);
    expect(modalTitle).not.toBeInTheDocument();

    await openModal(context);

    modalTitle = screen.getByText(ADD_NEW_THREAD_MODAL_TITLE);
    expect(modalTitle).toBeInTheDocument();
  });

  it("closes the modal when Cancel is clicked", async () => {
    const context = setup();

    await openModal(context);

    const modalTitle = screen.getByText(ADD_NEW_THREAD_MODAL_TITLE);
    expect(modalTitle).toBeInTheDocument();

    const cancelButton = screen.getByTestId(
      AddNewThreadModalActionsTestId.cancelButton
    );

    await context.user.click(cancelButton);

    expect(modalTitle).not.toBeInTheDocument();
  });

  it("closes the modal and shows a success notification after a successful Add", async () => {
    const context = setup();

    await openModal(context);

    const modalTitle = screen.getByText(ADD_NEW_THREAD_MODAL_TITLE);
    expect(modalTitle).toBeInTheDocument();

    await fillAndSubmit(context, THREAD_TITLE);

    const threadCreatedMessage = await screen.findByText(
      getThreadCreatedMessage(THREAD_TITLE)
    );

    expect(threadCreatedMessage).toBeInTheDocument();
    expect(modalTitle).not.toBeInTheDocument();
  });

  it("keeps the modal open with the name and color when saving fails, and shows an error notification", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    const context = setup();

    await openModal(context);
    await fillTitle(context, THREAD_TITLE);
    await selectSwatch(context, FIRST_SWATCH_INDEX);

    const selectedColor = getSelectedColor();

    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error(STORAGE_ERROR_MESSAGE);
    });

    await clickAdd(context);

    const errorMessage = await screen.findByText(SAVE_THREAD_ERROR_MESSAGE);
    expect(errorMessage).toBeInTheDocument();

    const modalTitle = screen.getByText(ADD_NEW_THREAD_MODAL_TITLE);
    expect(modalTitle).toBeInTheDocument();

    expect(getTitleInput().value).toBe(THREAD_TITLE);
    expect(getSelectedColor()).toBe(selectedColor);
  });

  it("closes the modal and shows a success notification when a retry succeeds after storage is restored", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    const context = setup();

    await openModal(context);
    await fillTitle(context, THREAD_TITLE);

    const setItemSpy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error(STORAGE_ERROR_MESSAGE);
      });

    await clickAdd(context);

    const errorMessage = await screen.findByText(SAVE_THREAD_ERROR_MESSAGE);
    expect(errorMessage).toBeInTheDocument();

    setItemSpy.mockRestore();

    const modalTitle = screen.getByText(ADD_NEW_THREAD_MODAL_TITLE);
    expect(modalTitle).toBeInTheDocument();

    await clickAdd(context);

    const threadCreatedMessage = await screen.findByText(
      getThreadCreatedMessage(THREAD_TITLE)
    );

    expect(threadCreatedMessage).toBeInTheDocument();

    expect(modalTitle).not.toBeInTheDocument();
  });

  it("shows an empty form with the default color when the modal is reopened", async () => {
    const context = setup();

    await openModal(context);

    const defaultColor = getSelectedColor();

    await fillAndSubmit(context, THREAD_TITLE);

    await screen.findByText(getThreadCreatedMessage(THREAD_TITLE));

    await openModal(context);

    expect(getTitleInput().value).toBe("");
    expect(getSelectedColor()).toBe(defaultColor);
  });
});
