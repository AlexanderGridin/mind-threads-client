import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
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
  clickOutside,
  confirmDeletion,
  createDeferred,
  getRenderedPageNames,
  mindThreadFixtures,
  openPageDeleteMenu,
  readStoredPages,
  resetThreadsServiceOverrides,
  seedPages,
  stubLayout,
  seedSections,
  seedThreads,
  selectSectionCard,
  sectionPageFixtures,
  threadSectionFixtures,
  threadsServiceOverrides,
  waitForDismissListeners,
  getDeletionCancelButton,
  getDeletionCloseButton,
  getDeletionDeleteButton,
} from "@/__test-fixtures__";
import { ThreadPageLoader } from "@/pages/ThreadPage/components/ThreadPageLoader";
import { DELETE_PAGE_ERROR_MESSAGE } from "@/pages/ThreadPage/components/ThreadPageLoader/ThreadPageLoader.constants";
import { getPageDeletedMessage } from "@/pages/ThreadPage/components/ThreadPageLoader/ThreadPageLoader.utils";
import { SectionsColumn } from "@/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/SectionsColumn/SectionsColumn";
import { PagesColumn } from "@/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PagesColumn/PagesColumn";
import { DELETE_PAGE_MODAL_TITLE } from "../DeletePageModalContainer.constants";
import { getDeletePageModalText } from "../DeletePageModalContainer.utils";
import { DeletePageModalContainer } from "../DeletePageModalContainer";

vi.mock("@/services", async (importOriginal) => {
  const { createServicesMock } = await import("@/__test-fixtures__");
  const original = await importOriginal<typeof import("@/services")>();

  return createServicesMock(original);
});

const STORED_THREAD = mindThreadFixtures[0];
const SECTION_NAME = threadSectionFixtures[0].name;
const PAGE_NAME = sectionPageFixtures[0].name;

const STORED_PAGE_NAMES = sectionPageFixtures
  .filter((page) => {
    return page.sectionId === threadSectionFixtures[0].id;
  })
  .map((page) => {
    return page.name;
  });

const setup = ({
  pointerEventsCheck = PointerEventsCheckLevel.EachApiCall,
}: { pointerEventsCheck?: PointerEventsCheckLevel } = {}) => {
  const user = userEvent.setup({ pointerEventsCheck });

  renderWithUIProvider(
    <ThreadPageLoader threadId={STORED_THREAD.id}>
      <SectionsColumn />
      <PagesColumn />
      <DeletePageModalContainer />
    </ThreadPageLoader>
  );

  return { user };
};

const setupWithSelectedSection = async ({
  pointerEventsCheck,
}: { pointerEventsCheck?: PointerEventsCheckLevel } = {}) => {
  seedThreads(mindThreadFixtures);
  seedSections(threadSectionFixtures);
  seedPages(sectionPageFixtures);

  const context = setup({ pointerEventsCheck });

  await selectSectionCard({ user: context.user, sectionName: SECTION_NAME });

  return context;
};

const queryModalTitle = () => {
  return screen.queryByText(DELETE_PAGE_MODAL_TITLE);
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
  resetThreadsServiceOverrides();
});

describe("DeletePageModalContainer", () => {
  it("shows no dialog until Delete is selected in a page's menu", async () => {
    const context = await setupWithSelectedSection();

    const modalTitle = queryModalTitle();
    expect(modalTitle).not.toBeInTheDocument();

    await openPageDeleteMenu({ user: context.user, pageName: PAGE_NAME });

    const openedModalTitle = screen.getByText(DELETE_PAGE_MODAL_TITLE);
    expect(openedModalTitle).toBeInTheDocument();
  });

  it("shows the title and the text with the page's name", async () => {
    const context = await setupWithSelectedSection();

    await openPageDeleteMenu({ user: context.user, pageName: PAGE_NAME });

    const modalTitle = screen.getByText(DELETE_PAGE_MODAL_TITLE);
    expect(modalTitle).toBeInTheDocument();

    const modalText = screen.getByText(getDeletePageModalText(PAGE_NAME));
    expect(modalText).toBeInTheDocument();
  });

  it("focuses the Cancel button when the dialog opens", async () => {
    stubLayout();

    const context = await setupWithSelectedSection();

    await openPageDeleteMenu({ user: context.user, pageName: PAGE_NAME });

    const cancelButton = getDeletionCancelButton();

    await waitFor(() => {
      expect(cancelButton).toHaveFocus();
    });
  });

  it("closes the dialog and keeps the page listed when Cancel is clicked", async () => {
    const context = await setupWithSelectedSection();

    await openPageDeleteMenu({ user: context.user, pageName: PAGE_NAME });

    const modalTitle = screen.getByText(DELETE_PAGE_MODAL_TITLE);

    const cancelButton = getDeletionCancelButton();
    await context.user.click(cancelButton);

    expect(modalTitle).not.toBeInTheDocument();

    expect(getRenderedPageNames()).toStrictEqual(STORED_PAGE_NAMES);
    expect(readStoredPages()).toStrictEqual(sectionPageFixtures);
  });

  it("closes the dialog and keeps the page listed when the close button is clicked", async () => {
    const context = await setupWithSelectedSection();

    await openPageDeleteMenu({ user: context.user, pageName: PAGE_NAME });

    const modalTitle = screen.getByText(DELETE_PAGE_MODAL_TITLE);

    const closeButton = getDeletionCloseButton();
    await context.user.click(closeButton);

    expect(modalTitle).not.toBeInTheDocument();

    expect(getRenderedPageNames()).toStrictEqual(STORED_PAGE_NAMES);
    expect(readStoredPages()).toStrictEqual(sectionPageFixtures);
  });

  it("closes the dialog and keeps the page listed when the user clicks outside", async () => {
    const context = await setupWithSelectedSection({
      pointerEventsCheck: PointerEventsCheckLevel.Never,
    });

    await openPageDeleteMenu({ user: context.user, pageName: PAGE_NAME });

    const modalTitle = screen.getByText(DELETE_PAGE_MODAL_TITLE);

    await clickOutside(context.user);

    await waitForElementToBeRemoved(modalTitle);

    expect(getRenderedPageNames()).toStrictEqual(STORED_PAGE_NAMES);
    expect(readStoredPages()).toStrictEqual(sectionPageFixtures);
  });

  it("closes the dialog and keeps the page listed when Escape is pressed", async () => {
    const context = await setupWithSelectedSection();

    await openPageDeleteMenu({ user: context.user, pageName: PAGE_NAME });

    const modalTitle = screen.getByText(DELETE_PAGE_MODAL_TITLE);

    await waitForDismissListeners();
    await context.user.keyboard("{Escape}");

    expect(modalTitle).not.toBeInTheDocument();

    expect(getRenderedPageNames()).toStrictEqual(STORED_PAGE_NAMES);
    expect(readStoredPages()).toStrictEqual(sectionPageFixtures);
  });

  it("disables the actions and ignores Escape and outside clicks while the delete is pending", async () => {
    const pendingDelete = createDeferred();

    threadsServiceOverrides.removeSectionPage = () => {
      return pendingDelete.promise;
    };

    const context = await setupWithSelectedSection({
      pointerEventsCheck: PointerEventsCheckLevel.Never,
    });

    await openPageDeleteMenu({ user: context.user, pageName: PAGE_NAME });
    await confirmDeletion(context.user);

    const deleteButton = getDeletionDeleteButton();
    const cancelButton = getDeletionCancelButton();
    const closeButton = getDeletionCloseButton();

    expect(deleteButton).toHaveAttribute("data-loading");
    expect(deleteButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
    expect(closeButton).toBeDisabled();

    await waitForDismissListeners();
    await context.user.keyboard("{Escape}");

    await clickOutside(context.user, { shouldWaitForDismissListeners: false });

    const modalTitle = screen.getByText(DELETE_PAGE_MODAL_TITLE);
    expect(modalTitle).toBeInTheDocument();

    pendingDelete.resolve();

    await waitForElementToBeRemoved(modalTitle);
  });

  it("closes the dialog, removes the page and shows the success notification after the page is deleted", async () => {
    const context = await setupWithSelectedSection();

    await openPageDeleteMenu({ user: context.user, pageName: PAGE_NAME });
    await confirmDeletion(context.user);

    const successNotification = await screen.findByText(
      getPageDeletedMessage(PAGE_NAME)
    );

    const closedModalTitle = queryModalTitle();

    expect(successNotification).toBeInTheDocument();
    expect(closedModalTitle).not.toBeInTheDocument();
    expect(getRenderedPageNames()).toStrictEqual(STORED_PAGE_NAMES.slice(1));
  });

  it("keeps the dialog open with both buttons enabled and shows the error notification when the delete fails", async () => {
    threadsServiceOverrides.removeSectionPage = async () => {
      throw new Error("Remove failed");
    };

    const context = await setupWithSelectedSection();

    await openPageDeleteMenu({ user: context.user, pageName: PAGE_NAME });
    await confirmDeletion(context.user);

    const errorNotification = await screen.findByText(
      DELETE_PAGE_ERROR_MESSAGE
    );

    expect(errorNotification).toBeInTheDocument();

    const modalTitle = queryModalTitle();
    expect(modalTitle).toBeInTheDocument();

    const cancelButton = getDeletionCancelButton();
    const deleteButton = getDeletionDeleteButton();

    expect(cancelButton).toBeEnabled();
    expect(deleteButton).toBeEnabled();
  });

  it("keeps the page listed after the dialog is closed following a failed delete", async () => {
    threadsServiceOverrides.removeSectionPage = async () => {
      throw new Error("Remove failed");
    };

    const context = await setupWithSelectedSection();

    await openPageDeleteMenu({ user: context.user, pageName: PAGE_NAME });

    const modalTitle = screen.getByText(DELETE_PAGE_MODAL_TITLE);
    await confirmDeletion(context.user);

    const errorNotification = await screen.findByText(
      DELETE_PAGE_ERROR_MESSAGE
    );

    expect(errorNotification).toBeInTheDocument();

    const cancelButton = getDeletionCancelButton();
    await context.user.click(cancelButton);

    expect(modalTitle).not.toBeInTheDocument();

    expect(getRenderedPageNames()).toStrictEqual(STORED_PAGE_NAMES);
  });
});
