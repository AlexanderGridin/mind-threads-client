import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { screen, waitForElementToBeRemoved } from "@testing-library/react";
import userEvent, {
  PointerEventsCheckLevel,
} from "@testing-library/user-event";
import { renderWithUIProvider } from "@/components/lib/__test-fixtures__";
import {
  clickOutside,
  confirmSectionDelete,
  createDeferred,
  getRenderedSectionNames,
  mindThreadFixtures,
  openSectionDeleteMenu,
  readStoredSections,
  resetThreadsServiceOverrides,
  seedSections,
  seedThreads,
  threadSectionFixtures,
  threadsServiceOverrides,
  waitForDismissListeners,
} from "@/__test-fixtures__";
import { DeleteConfirmationModalActionsTestId } from "@/components/shared/DeleteConfirmationModal/components/DeleteConfirmationModalActions/DeleteConfirmationModalActions.constants";
import { ThreadPageLoader } from "@/pages/ThreadPage/components/ThreadPageLoader";
import { DELETE_SECTION_ERROR_MESSAGE } from "@/pages/ThreadPage/components/ThreadPageLoader/ThreadPageLoader.constants";
import { getSectionDeletedMessage } from "@/pages/ThreadPage/components/ThreadPageLoader/ThreadPageLoader.utils";
import { SectionsColumn } from "@/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/SectionsColumn/SectionsColumn";
import { getSectionActionsLabel } from "@/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/SectionsColumn/components/SectionCard/components/SectionCardActions/SectionCardActions.utils";
import { DELETE_SECTION_MODAL_TITLE } from "../DeleteSectionModalContainer.constants";
import { getDeleteSectionModalText } from "../DeleteSectionModalContainer.utils";
import { DeleteSectionModalContainer } from "../DeleteSectionModalContainer";

vi.mock("@/services", async (importOriginal) => {
  const { createServicesMock } = await import("@/__test-fixtures__");
  const original = await importOriginal<typeof import("@/services")>();

  return createServicesMock(original);
});

const STORED_THREAD = mindThreadFixtures[0];
const SECTION_NAME = "Research";

const STORED_SECTION_NAMES = threadSectionFixtures
  .filter((section) => {
    return section.threadId === STORED_THREAD.id;
  })
  .map((section) => {
    return section.name;
  });

const setup = ({
  pointerEventsCheck = PointerEventsCheckLevel.EachApiCall,
}: { pointerEventsCheck?: PointerEventsCheckLevel } = {}) => {
  const user = userEvent.setup({ pointerEventsCheck });

  renderWithUIProvider(
    <ThreadPageLoader threadId={STORED_THREAD.id}>
      <SectionsColumn />
      <DeleteSectionModalContainer />
    </ThreadPageLoader>
  );

  return { user };
};

const queryModalTitle = () => {
  return screen.queryByText(DELETE_SECTION_MODAL_TITLE);
};

const getCancelButton = () => {
  return screen.getByRole("button", { name: "Cancel" });
};

const getCloseButton = () => {
  return screen.getByRole("button", { name: "Close" });
};

// While deleting, the loading spinner replaces the label, so the button is found by test id.
const getDeleteButton = () => {
  return screen.getByTestId(DeleteConfirmationModalActionsTestId.deleteButton);
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
  resetThreadsServiceOverrides();
});

describe("DeleteSectionModalContainer", () => {
  it("shows no dialog until Delete is selected in a section's menu", async () => {
    seedThreads(mindThreadFixtures);
    seedSections(threadSectionFixtures);

    const context = setup();

    await screen.findByRole("button", {
      name: getSectionActionsLabel(SECTION_NAME),
    });

    const modalTitle = queryModalTitle();
    expect(modalTitle).not.toBeInTheDocument();

    await openSectionDeleteMenu({
      user: context.user,
      sectionName: SECTION_NAME,
    });

    const openedModalTitle = screen.getByText(DELETE_SECTION_MODAL_TITLE);
    expect(openedModalTitle).toBeInTheDocument();
  });

  it("shows the title and the text with the section's name", async () => {
    seedThreads(mindThreadFixtures);
    seedSections(threadSectionFixtures);

    const context = setup();

    await openSectionDeleteMenu({
      user: context.user,
      sectionName: SECTION_NAME,
    });

    const modalTitle = screen.getByText(DELETE_SECTION_MODAL_TITLE);
    expect(modalTitle).toBeInTheDocument();

    const modalText = screen.getByText(getDeleteSectionModalText(SECTION_NAME));
    expect(modalText).toBeInTheDocument();
  });

  it("closes the dialog and keeps the section listed when Cancel is clicked", async () => {
    seedThreads(mindThreadFixtures);
    seedSections(threadSectionFixtures);

    const context = setup();

    await openSectionDeleteMenu({
      user: context.user,
      sectionName: SECTION_NAME,
    });

    const modalTitle = screen.getByText(DELETE_SECTION_MODAL_TITLE);

    const cancelButton = getCancelButton();
    await context.user.click(cancelButton);

    expect(modalTitle).not.toBeInTheDocument();

    expect(getRenderedSectionNames()).toStrictEqual(STORED_SECTION_NAMES);
    expect(readStoredSections()).toStrictEqual(threadSectionFixtures);
  });

  it("closes the dialog and keeps the section listed when the close button is clicked", async () => {
    seedThreads(mindThreadFixtures);
    seedSections(threadSectionFixtures);

    const context = setup();

    await openSectionDeleteMenu({
      user: context.user,
      sectionName: SECTION_NAME,
    });

    const modalTitle = screen.getByText(DELETE_SECTION_MODAL_TITLE);

    const closeButton = getCloseButton();
    await context.user.click(closeButton);

    expect(modalTitle).not.toBeInTheDocument();

    expect(getRenderedSectionNames()).toStrictEqual(STORED_SECTION_NAMES);
    expect(readStoredSections()).toStrictEqual(threadSectionFixtures);
  });

  it("closes the dialog and keeps the section listed when the user clicks outside", async () => {
    seedThreads(mindThreadFixtures);
    seedSections(threadSectionFixtures);

    const context = setup({
      pointerEventsCheck: PointerEventsCheckLevel.Never,
    });

    await openSectionDeleteMenu({
      user: context.user,
      sectionName: SECTION_NAME,
    });

    const modalTitle = screen.getByText(DELETE_SECTION_MODAL_TITLE);

    await clickOutside(context.user);

    await waitForElementToBeRemoved(modalTitle);

    expect(getRenderedSectionNames()).toStrictEqual(STORED_SECTION_NAMES);
    expect(readStoredSections()).toStrictEqual(threadSectionFixtures);
  });

  it("closes the dialog and keeps the section listed when Escape is pressed", async () => {
    seedThreads(mindThreadFixtures);
    seedSections(threadSectionFixtures);

    const context = setup();

    await openSectionDeleteMenu({
      user: context.user,
      sectionName: SECTION_NAME,
    });

    const modalTitle = screen.getByText(DELETE_SECTION_MODAL_TITLE);

    await waitForDismissListeners();
    await context.user.keyboard("{Escape}");

    expect(modalTitle).not.toBeInTheDocument();

    expect(getRenderedSectionNames()).toStrictEqual(STORED_SECTION_NAMES);
    expect(readStoredSections()).toStrictEqual(threadSectionFixtures);
  });

  it("disables the actions and ignores Escape and outside clicks while the delete is pending", async () => {
    seedThreads(mindThreadFixtures);
    seedSections(threadSectionFixtures);

    const pendingDelete = createDeferred();

    threadsServiceOverrides.removeThreadSection = () => {
      return pendingDelete.promise;
    };

    const context = setup({
      pointerEventsCheck: PointerEventsCheckLevel.Never,
    });

    await openSectionDeleteMenu({
      user: context.user,
      sectionName: SECTION_NAME,
    });
    await confirmSectionDelete(context.user);

    const deleteButton = getDeleteButton();
    const cancelButton = getCancelButton();
    const closeButton = getCloseButton();

    expect(deleteButton).toHaveAttribute("data-loading");
    expect(deleteButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
    expect(closeButton).toBeDisabled();

    await waitForDismissListeners();
    await context.user.keyboard("{Escape}");

    await clickOutside(context.user, { shouldWaitForDismissListeners: false });

    const modalTitle = screen.getByText(DELETE_SECTION_MODAL_TITLE);
    expect(modalTitle).toBeInTheDocument();

    pendingDelete.resolve();

    await waitForElementToBeRemoved(modalTitle);
  });

  it("closes the dialog and shows the success notification after the section is deleted", async () => {
    seedThreads(mindThreadFixtures);
    seedSections(threadSectionFixtures);

    const context = setup();

    await openSectionDeleteMenu({
      user: context.user,
      sectionName: SECTION_NAME,
    });
    await confirmSectionDelete(context.user);

    const successNotification = await screen.findByText(
      getSectionDeletedMessage(SECTION_NAME)
    );

    const closedModalTitle = queryModalTitle();

    expect(successNotification).toBeInTheDocument();
    expect(closedModalTitle).not.toBeInTheDocument();
    expect(getRenderedSectionNames()).toStrictEqual(["Ideas"]);
  });

  it("keeps the dialog open with both buttons enabled and shows the error notification when the delete fails", async () => {
    seedThreads(mindThreadFixtures);
    seedSections(threadSectionFixtures);

    threadsServiceOverrides.removeThreadSection = async () => {
      throw new Error("Remove failed");
    };

    const context = setup();

    await openSectionDeleteMenu({
      user: context.user,
      sectionName: SECTION_NAME,
    });
    await confirmSectionDelete(context.user);

    const errorNotification = await screen.findByText(
      DELETE_SECTION_ERROR_MESSAGE
    );

    expect(errorNotification).toBeInTheDocument();

    const modalTitle = queryModalTitle();
    expect(modalTitle).toBeInTheDocument();

    const cancelButton = getCancelButton();
    const deleteButton = getDeleteButton();

    expect(cancelButton).toBeEnabled();
    expect(deleteButton).toBeEnabled();
  });

  it("keeps the section listed after the dialog is closed following a failed delete", async () => {
    seedThreads(mindThreadFixtures);
    seedSections(threadSectionFixtures);

    threadsServiceOverrides.removeThreadSection = async () => {
      throw new Error("Remove failed");
    };

    const context = setup();

    await openSectionDeleteMenu({
      user: context.user,
      sectionName: SECTION_NAME,
    });

    const modalTitle = screen.getByText(DELETE_SECTION_MODAL_TITLE);
    await confirmSectionDelete(context.user);

    const errorNotification = await screen.findByText(
      DELETE_SECTION_ERROR_MESSAGE
    );

    expect(errorNotification).toBeInTheDocument();

    const cancelButton = getCancelButton();
    await context.user.click(cancelButton);

    expect(modalTitle).not.toBeInTheDocument();

    expect(getRenderedSectionNames()).toStrictEqual(STORED_SECTION_NAMES);
  });
});
