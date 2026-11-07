import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithUIProvider } from "@/components/lib/__test-fixtures__";
import {
  createServicesMock,
  mindThreadFixtures,
  resetThreadsServiceOverrides,
  seedThreads,
  threadsServiceOverrides,
} from "@/__test-fixtures__";
import { SECTIONS_STORAGE_KEY } from "@/services/useThreadSectionsService/useThreadSectionsService.constants";
import { ThreadColumnsTestId } from "@/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/ThreadColumns.constants";
import { SectionsColumn } from "@/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components";
import {
  SAVE_SECTION_ERROR_MESSAGE,
  ThreadPageLoader,
  getSectionCreatedMessage,
} from "../../ThreadPageLoader";
import { AddSectionModalContainer } from "../AddSectionModalContainer";
import { ADD_SECTION_MODAL_TITLE } from "../components/AddSectionModal/AddSectionModal.constants";
import { SectionFormTestId } from "../components/AddSectionModal/components/SectionForm/SectionForm.constants";
import { ThreadFormModalActionsTestId } from "@/components/shared/ThreadFormModalActions/ThreadFormModalActions.constants";

vi.mock("@/services", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/services")>();

  return createServicesMock(original);
});

const STORED_THREAD = mindThreadFixtures[0];
const SECTION_NAME = "Ideas";
const TYPED_NAME = "Half typed";

const setup = () => {
  const user = userEvent.setup();

  renderWithUIProvider(
    <ThreadPageLoader threadId={STORED_THREAD.id}>
      <SectionsColumn />
      <AddSectionModalContainer />
    </ThreadPageLoader>
  );

  return { user };
};

const getAddSectionButton = () => {
  return screen.getByTestId(ThreadColumnsTestId.addSectionButton);
};

const getModalTitle = () => {
  return screen.queryByText(ADD_SECTION_MODAL_TITLE);
};

const getNameInput = () => {
  return screen.getByTestId(SectionFormTestId.nameInput);
};

const getCancelButton = () => {
  return screen.getByRole("button", { name: "Cancel" });
};

const getAddButton = () => {
  return screen.getByTestId(ThreadFormModalActionsTestId.submitButton);
};

const openModal = async ({ user }: ReturnType<typeof setup>) => {
  const addSectionButton = getAddSectionButton();

  await user.click(addSectionButton);
};

beforeEach(() => {
  seedThreads(mindThreadFixtures);
});

afterEach(() => {
  vi.restoreAllMocks();
  resetThreadsServiceOverrides();
  localStorage.clear();
});

describe("AddSectionModalContainer", () => {
  it("hides the modal at first and opens it from the add section button", async () => {
    const context = setup();

    const modalTitleBeforeOpen = getModalTitle();
    expect(modalTitleBeforeOpen).not.toBeInTheDocument();

    await openModal(context);

    const modalTitleAfterOpen = getModalTitle();
    expect(modalTitleAfterOpen).toBeInTheDocument();
  });

  it("closes on Cancel and stores no section", async () => {
    const context = setup();

    await openModal(context);

    const modalTitle = getModalTitle();
    const cancelButton = getCancelButton();

    await context.user.click(cancelButton);

    await waitFor(() => expect(modalTitle).not.toBeInTheDocument());

    const storedSections = localStorage.getItem(SECTIONS_STORAGE_KEY);
    expect(storedSections).toBeNull();
  });

  it("opens with an empty name after Cancel with a typed name", async () => {
    const context = setup();

    await openModal(context);

    const modalTitle = getModalTitle();
    const nameInput = getNameInput();

    await context.user.type(nameInput, TYPED_NAME);
    const cancelButton = getCancelButton();
    await context.user.click(cancelButton);

    await waitFor(() => expect(modalTitle).not.toBeInTheDocument());

    await openModal(context);

    const reopenedNameInput = getNameInput();
    expect(reopenedNameInput).toHaveValue("");
  });

  it("closes after a successful add and shows the success notification", async () => {
    const context = setup();

    await openModal(context);

    const modalTitle = getModalTitle();
    const nameInput = getNameInput();

    await context.user.type(nameInput, SECTION_NAME);
    const addButton = getAddButton();
    await context.user.click(addButton);

    await waitFor(() => expect(modalTitle).not.toBeInTheDocument());

    const successMessage = getSectionCreatedMessage(SECTION_NAME);
    const notification = await screen.findByText(successMessage);

    expect(notification).toBeInTheDocument();
  });

  it("keeps the modal open and shows the error notification when the add fails", async () => {
    threadsServiceOverrides.addThreadSection = async () => {
      throw new Error("Storage quota exceeded");
    };

    const context = setup();

    await openModal(context);

    const nameInput = getNameInput();

    await context.user.type(nameInput, SECTION_NAME);
    const addButton = getAddButton();
    await context.user.click(addButton);

    const errorNotification = await screen.findByText(
      SAVE_SECTION_ERROR_MESSAGE
    );

    expect(errorNotification).toBeInTheDocument();

    const modalTitle = getModalTitle();
    expect(modalTitle).toBeInTheDocument();
  });
});
