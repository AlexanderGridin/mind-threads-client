import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import {
  fireEvent,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { notify } from "@/components/lib";
import {
  MALFORMED_JSON,
  confirmSectionDelete,
  createDeferred,
  dispatchStorageChange,
  getRenderedPageNames,
  getRenderedSectionNames,
  createServicesMock,
  mindThreadFixtures,
  openAddPageModal,
  openSectionDeleteMenu,
  readStoredPages,
  readStoredSections,
  mindThreadFixturesWithSameTitle,
  renderWithRouter,
  resetThreadsServiceOverrides,
  sectionPageFixtures,
  seedPages,
  seedSections,
  seedThreads,
  selectSectionCard,
  threadSectionFixtures,
  threadsServiceOverrides,
  waitForDismissListeners,
} from "@/__test-fixtures__";
import { DEFAULT_SWATCH_COLOR } from "@/components/lib/ColorPicker/ColorPicker.constants";
import { PageFormTestId } from "../components/AddPageModalContainer/components/AddPageModal/components/PageForm/PageForm.constants";
import { PageCardTestId } from "../components/ThreadContent/components/ThreadColumns/components/PagesColumn/components/PageCard/PageCard.constants";
import { PageTypeIconTestId } from "../components/PageTypeIcon/PageTypeIcon.constants";
import { AppPath } from "@/routing/routing.constants";
import { getThreadPath } from "@/routing/routing.utils";
import { THREADS_STORAGE_KEY } from "@/services/useThreadsService/useThreadsService.constants";
import { SECTIONS_STORAGE_KEY } from "@/services/useThreadSectionsService/useThreadSectionsService.constants";
import type { MindThread, ThreadSection } from "@/types";
import { ThreadPage } from "../ThreadPage";
import {
  BACK_TO_DASHBOARD_LABEL,
  LOADING_THREAD_LABEL,
  ThreadPageTestId,
  THREAD_LOAD_ERROR_MESSAGE,
  THREAD_NOT_FOUND_MESSAGE,
} from "../ThreadPage.constants";
import {
  PAGES_COLUMN_MESSAGE,
  SECTIONS_COLUMN_MESSAGE,
  ThreadColumnsTestId,
} from "../components/ThreadContent/components/ThreadColumns/ThreadColumns.constants";
import { ThreadHeaderTestId } from "../components/ThreadHeader/ThreadHeader.constants";
import { SectionCardTestId } from "../components/ThreadContent/components/ThreadColumns/components/SectionsColumn/components/SectionCard/SectionCard.constants";
import { SectionFormTestId } from "../components/AddSectionModalContainer/components/AddSectionModal/components/SectionForm/SectionForm.constants";
import { ADD_SECTION_MODAL_TITLE } from "../components/AddSectionModalContainer/components/AddSectionModal/AddSectionModal.constants";
import {
  SAVE_SECTION_ERROR_MESSAGE,
  getSectionCreatedMessage,
  getSectionDeletedMessage,
} from "../components/ThreadPageLoader";
import { DELETE_SECTION_MODAL_TITLE } from "../components/DeleteSectionModalContainer/DeleteSectionModalContainer.constants";
import { ThreadFormModalActionsTestId } from "@/components/shared/ThreadFormModalActions/ThreadFormModalActions.constants";
import { APP_NAME } from "@/components/shared";

const mockUseColorModeReturn = { toggleColorMode: vi.fn() };

vi.mock("@/components/lib/color-mode/color-mode.hooks", () => ({
  useColorMode: () => mockUseColorModeReturn,
}));

vi.mock("@/services", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/services")>();

  return createServicesMock(original);
});

const DASHBOARD_TITLE = "Dashboard title";
const APP_TITLE = "Mind Threads";
const THREAD_TITLE = "Testing Strategy";
const THREAD_COLOR = "#A8E6CF";
const THREAD_ID = "same-title-1";
const UNKNOWN_THREAD_ID = "unknown-thread-id";
const STORED_THREAD = mindThreadFixturesWithSameTitle[0];
const STORED_BOOKMARK_THREAD = mindThreadFixtures[1];

type SetupParams = {
  threadId: string;
};

const setup = ({ threadId }: SetupParams) => {
  const user = userEvent.setup();

  const renderResult = renderWithRouter({
    ui: <ThreadPage />,
    path: AppPath.Thread,
    initialPath: getThreadPath(threadId),
  });

  return { user, unmount: renderResult.unmount };
};

beforeEach(() => {
  document.title = DASHBOARD_TITLE;
});

afterEach(() => {
  vi.restoreAllMocks();
  resetThreadsServiceOverrides();
});

describe("ThreadPage", () => {
  it("shows the loader, an empty header and the app title while the thread is pending", () => {
    threadsServiceOverrides.getThread = () =>
      createDeferred<MindThread | null>().promise;

    setup({ threadId: THREAD_ID });

    const loader = screen.getByRole("status", { name: LOADING_THREAD_LABEL });
    const headerTitle = screen.queryByTestId(ThreadHeaderTestId.title);

    expect(loader).toBeInTheDocument();
    expect(headerTitle).not.toBeInTheDocument();
    expect(document.title).toBe(APP_TITLE);
  });

  it("removes the loader and shows the thread once the stored thread is loaded", async () => {
    const pendingThread = createDeferred<MindThread | null>();
    threadsServiceOverrides.getThread = () => pendingThread.promise;

    setup({ threadId: THREAD_ID });

    const loader = screen.getByRole("status", { name: LOADING_THREAD_LABEL });
    expect(loader).toBeInTheDocument();

    pendingThread.resolve(STORED_THREAD);

    await waitForElementToBeRemoved(loader);

    const header = screen.getByTestId(ThreadHeaderTestId.container);
    const headerTitle = screen.getByTestId(ThreadHeaderTestId.title);
    const columns = screen.getByTestId(ThreadColumnsTestId.container);

    expect(headerTitle.textContent).toBe(THREAD_TITLE);
    expect(header).toHaveStyle({ backgroundColor: THREAD_COLOR });
    expect(columns).toBeInTheDocument();

    await waitFor(() => {
      expect(document.title).toBe(`${THREAD_TITLE} · ${APP_TITLE}`);
    });
  });

  it("shows the thread opened directly by its address, again after a remount", async () => {
    seedThreads(mindThreadFixtures);

    const { unmount } = setup({ threadId: STORED_BOOKMARK_THREAD.id });

    const firstHeaderTitle = await screen.findByTestId(
      ThreadHeaderTestId.title
    );
    expect(firstHeaderTitle.textContent).toBe(STORED_BOOKMARK_THREAD.title);

    unmount();

    setup({ threadId: STORED_BOOKMARK_THREAD.id });

    const secondHeaderTitle = await screen.findByTestId(
      ThreadHeaderTestId.title
    );

    expect(secondHeaderTitle.textContent).toBe(STORED_BOOKMARK_THREAD.title);
  });

  it("gives the page a minimum width of 768px", () => {
    setup({ threadId: THREAD_ID });

    const page = screen.getByTestId(ThreadPageTestId.container);
    expect(page).toHaveStyle({ minWidth: "768px" });
  });

  it("shows the not-found message and no notification for a thread that does not exist", async () => {
    const errorSpy = vi.spyOn(notify, "error");
    const successSpy = vi.spyOn(notify, "success");

    seedThreads(mindThreadFixtures);

    setup({ threadId: UNKNOWN_THREAD_ID });

    const notFoundMessage = await screen.findByText(THREAD_NOT_FOUND_MESSAGE);
    const main = screen.getByRole("main");
    const backButton = within(main).getByRole("button", {
      name: BACK_TO_DASHBOARD_LABEL,
    });

    const columns = screen.queryByTestId(ThreadColumnsTestId.container);
    const headerTitle = screen.queryByTestId(ThreadHeaderTestId.title);
    const header = screen.getByTestId(ThreadHeaderTestId.container);

    expect(notFoundMessage).toBeInTheDocument();
    expect(backButton).toBeInTheDocument();

    expect(columns).not.toBeInTheDocument();
    expect(headerTitle).not.toBeInTheDocument();

    expect(header.style.backgroundColor).toBe("");
    expect(document.title).toBe(`Thread not found · ${APP_TITLE}`);

    expect(errorSpy).not.toHaveBeenCalled();
    expect(successSpy).not.toHaveBeenCalled();
  });

  it("shows the load error and no notification when the saved data can't be read", async () => {
    const errorSpy = vi.spyOn(notify, "error");
    const successSpy = vi.spyOn(notify, "success");
    vi.spyOn(console, "error").mockImplementation(() => {});

    localStorage.setItem(THREADS_STORAGE_KEY, MALFORMED_JSON);

    setup({ threadId: THREAD_ID });

    const loadErrorMessage = await screen.findByText(THREAD_LOAD_ERROR_MESSAGE);
    const main = screen.getByRole("main");
    const backButton = within(main).getByRole("button", {
      name: BACK_TO_DASHBOARD_LABEL,
    });

    const headerTitle = screen.queryByTestId(ThreadHeaderTestId.title);
    const header = screen.getByTestId(ThreadHeaderTestId.container);

    expect(loadErrorMessage).toBeInTheDocument();
    expect(backButton).toBeInTheDocument();

    expect(headerTitle).not.toBeInTheDocument();
    expect(header.style.backgroundColor).toBe("");

    expect(document.title).toBe(APP_TITLE);

    expect(errorSpy).not.toHaveBeenCalled();
    expect(successSpy).not.toHaveBeenCalled();
  });

  it("restores the dashboard title after the page is unmounted", async () => {
    seedThreads(mindThreadFixtures);

    const { unmount } = setup({ threadId: STORED_BOOKMARK_THREAD.id });

    const header = await screen.findByTestId(ThreadHeaderTestId.title);
    expect(header).toBeInTheDocument();

    expect(document.title).toBe(
      `${STORED_BOOKMARK_THREAD.title} · ${APP_NAME}`
    );

    unmount();

    expect(document.title).toBe(DASHBOARD_TITLE);
  });

  describe("creating a section", () => {
    type User = ReturnType<typeof userEvent.setup>;

    const SECTION_THREAD = mindThreadFixtures[0];
    const OTHER_THREAD = mindThreadFixtures[1];
    const TYPED_SECTION_NAME = "  Ideas  ";
    const SECTION_NAME = "Ideas";
    const SAVE_FAILED_REASON = "Save failed";
    const DELETED_THREAD_ID = SECTION_THREAD.id;

    const STORED_SECTION_NAMES = threadSectionFixtures
      .filter((section) => {
        return section.threadId === SECTION_THREAD.id;
      })
      .map((section) => {
        return section.name;
      });

    const getAddSectionButton = () => {
      return screen.getByTestId(ThreadColumnsTestId.addSectionButton);
    };

    const getSubmitButton = () => {
      return screen.getByTestId(ThreadFormModalActionsTestId.submitButton);
    };

    const waitForLoadedThread = async () => {
      await screen.findByTestId(ThreadHeaderTestId.title);
    };

    const openAddSectionModal = async (user: User) => {
      const addSectionButton = getAddSectionButton();
      await user.click(addSectionButton);

      return screen.findByText(ADD_SECTION_MODAL_TITLE);
    };

    const typeSectionName = async (user: User, name: string) => {
      const nameInput = screen.getByTestId(SectionFormTestId.nameInput);
      await user.type(nameInput, name);
    };

    const waitForModalToClose = async (modalTitle: HTMLElement) => {
      await waitFor(() => {
        expect(modalTitle).not.toBeInTheDocument();
      });
    };

    beforeEach(() => {
      seedThreads(mindThreadFixtures);
    });

    it("shows Add section for a loaded thread without sections", async () => {
      setup({ threadId: SECTION_THREAD.id });

      await waitForLoadedThread();

      const addSectionButton = getAddSectionButton();
      expect(addSectionButton).toBeInTheDocument();
      expect(addSectionButton).toBeEnabled();
    });

    it("shows Add section for a loaded thread with sections", async () => {
      seedSections(threadSectionFixtures);

      setup({ threadId: SECTION_THREAD.id });

      await waitForLoadedThread();

      const addSectionButton = getAddSectionButton();
      expect(addSectionButton).toBeInTheDocument();
      expect(addSectionButton).toBeEnabled();
    });

    it("hides Add section on the not-found page", async () => {
      setup({ threadId: UNKNOWN_THREAD_ID });

      await screen.findByText(THREAD_NOT_FOUND_MESSAGE);

      const addSectionButton = screen.queryByTestId(
        ThreadColumnsTestId.addSectionButton
      );

      expect(addSectionButton).not.toBeInTheDocument();
    });

    it("hides Add section on the load error page", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      localStorage.setItem(THREADS_STORAGE_KEY, MALFORMED_JSON);

      setup({ threadId: SECTION_THREAD.id });

      await screen.findByText(THREAD_LOAD_ERROR_MESSAGE);

      const addSectionButton = screen.queryByTestId(
        ThreadColumnsTestId.addSectionButton
      );

      expect(addSectionButton).not.toBeInTheDocument();
    });

    it("creates a trimmed section that closes the modal, shows the success notification, and is listed last", async () => {
      const { user } = setup({ threadId: SECTION_THREAD.id });

      await waitForLoadedThread();

      const modalTitle = await openAddSectionModal(user);
      await typeSectionName(user, TYPED_SECTION_NAME);
      const submitButton = getSubmitButton();
      await user.click(submitButton);

      await waitForModalToClose(modalTitle);

      const successNotification = await screen.findByText(
        getSectionCreatedMessage(SECTION_NAME)
      );

      expect(successNotification).toBeInTheDocument();
      expect(getRenderedSectionNames()).toStrictEqual([SECTION_NAME]);

      const emptyMessage = screen.queryByText(SECTIONS_COLUMN_MESSAGE);
      expect(emptyMessage).not.toBeInTheDocument();

      const pagesMessage = screen.getByText(PAGES_COLUMN_MESSAGE);
      expect(pagesMessage).toBeInTheDocument();

      const scrollIntoView = vi.mocked(Element.prototype.scrollIntoView);
      const [newCard] = screen.getAllByTestId(SectionCardTestId.container);

      expect(scrollIntoView.mock.contexts).toContain(newCard);
      expect(scrollIntoView).toHaveBeenCalledOnce();
    });

    it("creates a section by submitting the form, after the stored sections", async () => {
      seedSections(threadSectionFixtures);

      const { user } = setup({ threadId: SECTION_THREAD.id });

      await waitForLoadedThread();

      const modalTitle = await openAddSectionModal(user);
      await typeSectionName(user, SECTION_NAME);

      const form = screen.getByTestId(SectionFormTestId.form);
      fireEvent.submit(form);

      await waitForModalToClose(modalTitle);

      expect(getRenderedSectionNames()).toStrictEqual([
        ...STORED_SECTION_NAMES,
        SECTION_NAME,
      ]);
    });

    it("lists two sections when two sections share a name", async () => {
      const { user } = setup({ threadId: SECTION_THREAD.id });

      await waitForLoadedThread();

      const firstModalTitle = await openAddSectionModal(user);
      await typeSectionName(user, SECTION_NAME);
      const firstSubmitButton = getSubmitButton();
      await user.click(firstSubmitButton);
      await waitForModalToClose(firstModalTitle);

      const secondModalTitle = await openAddSectionModal(user);
      await typeSectionName(user, SECTION_NAME);
      const secondSubmitButton = getSubmitButton();
      await user.click(secondSubmitButton);
      await waitForModalToClose(secondModalTitle);

      expect(getRenderedSectionNames()).toStrictEqual([
        SECTION_NAME,
        SECTION_NAME,
      ]);
    });

    it("keeps the created section after a reload, and does not list it for another thread", async () => {
      const { user, unmount } = setup({ threadId: SECTION_THREAD.id });

      await waitForLoadedThread();

      const modalTitle = await openAddSectionModal(user);
      await typeSectionName(user, SECTION_NAME);
      const submitButton = getSubmitButton();
      await user.click(submitButton);
      await waitForModalToClose(modalTitle);

      unmount();

      const reloaded = setup({ threadId: SECTION_THREAD.id });

      await waitForLoadedThread();

      expect(getRenderedSectionNames()).toStrictEqual([SECTION_NAME]);

      reloaded.unmount();

      setup({ threadId: OTHER_THREAD.id });

      await waitForLoadedThread();

      expect(getRenderedSectionNames()).toStrictEqual([]);
    });

    it("keeps the modal open with Add loading while the save is pending, and keeps the typed name after a failed save", async () => {
      const pendingSection = createDeferred<ThreadSection>();

      threadsServiceOverrides.addThreadSection = () => {
        return pendingSection.promise;
      };

      const { user } = setup({ threadId: SECTION_THREAD.id });

      await waitForLoadedThread();

      const modalTitle = await openAddSectionModal(user);
      await typeSectionName(user, SECTION_NAME);
      const submitButton = getSubmitButton();
      await user.click(submitButton);

      const pendingSubmitButton = getSubmitButton();
      expect(pendingSubmitButton).toHaveAttribute("data-loading");
      expect(pendingSubmitButton).toBeDisabled();

      await waitForDismissListeners();
      await user.keyboard("{Escape}");

      expect(modalTitle).toBeInTheDocument();

      pendingSection.reject(new Error(SAVE_FAILED_REASON));

      const errorNotification = await screen.findByText(
        SAVE_SECTION_ERROR_MESSAGE
      );

      expect(errorNotification).toBeInTheDocument();

      const nameInput = screen.getByTestId(SectionFormTestId.nameInput);
      expect(nameInput).toHaveValue(SECTION_NAME);

      const retriedSubmitButton = getSubmitButton();
      expect(retriedSubmitButton).toBeEnabled();
    });

    it("shows the error notification and keeps the modal open when the thread was deleted in another tab", async () => {
      const { user } = setup({ threadId: SECTION_THREAD.id });

      await waitForLoadedThread();

      const modalTitle = await openAddSectionModal(user);
      await typeSectionName(user, SECTION_NAME);

      const remainingThreads = mindThreadFixtures.filter((thread) => {
        return thread.id !== DELETED_THREAD_ID;
      });

      seedThreads(remainingThreads);

      window.dispatchEvent(
        new StorageEvent("storage", { key: THREADS_STORAGE_KEY })
      );

      const submitButton = getSubmitButton();
      await user.click(submitButton);

      const errorNotification = await screen.findByText(
        SAVE_SECTION_ERROR_MESSAGE
      );

      expect(errorNotification).toBeInTheDocument();
      expect(modalTitle).toBeInTheDocument();
    });
  });

  describe("creating a page", () => {
    type User = ReturnType<typeof userEvent.setup>;

    const PAGE_THREAD = mindThreadFixtures[0];
    const OTHER_THREAD = mindThreadFixtures[1];
    const IDEAS_SECTION = threadSectionFixtures[0];
    const RESEARCH_SECTION = threadSectionFixtures[1];
    const DRAFTS_SECTION = threadSectionFixtures[2];
    const PAGE_NAME = "Ideas";
    const SECOND_PAGE_NAME = "Sources";

    const readStoredThreads = (): MindThread[] => {
      return JSON.parse(localStorage.getItem(THREADS_STORAGE_KEY) ?? "[]");
    };

    const findStoredThread = (threadId: string) => {
      return readStoredThreads().find((thread) => {
        return thread.id === threadId;
      });
    };

    const getSubmitButton = () => {
      return screen.getByTestId(ThreadFormModalActionsTestId.submitButton);
    };

    const waitForLoadedThread = async () => {
      await screen.findByTestId(ThreadHeaderTestId.title);
    };

    const createPage = async (user: User, name: string) => {
      const modalTitle = await openAddPageModal(user);

      const nameInput = screen.getByTestId(PageFormTestId.nameInput);
      await user.type(nameInput, name);

      const removal = waitForElementToBeRemoved(modalTitle);
      await user.click(getSubmitButton());
      await removal;
    };

    beforeEach(() => {
      seedThreads(mindThreadFixtures);
      seedSections(threadSectionFixtures);
    });

    it("keeps the created page after a remount, with its name, chat icon, and color, once its section is selected again", async () => {
      const { user, unmount } = setup({ threadId: PAGE_THREAD.id });

      await waitForLoadedThread();
      await selectSectionCard({ user, sectionName: IDEAS_SECTION.name });
      await createPage(user, PAGE_NAME);

      unmount();

      const reloaded = setup({ threadId: PAGE_THREAD.id });

      await waitForLoadedThread();

      const ideasSelectButton = screen.getByRole("button", {
        name: IDEAS_SECTION.name,
      });

      expect(ideasSelectButton).toHaveAttribute("aria-current", "false");
      expect(getRenderedPageNames()).toStrictEqual([]);

      await selectSectionCard({
        user: reloaded.user,
        sectionName: IDEAS_SECTION.name,
      });

      expect(getRenderedPageNames()).toStrictEqual([PAGE_NAME]);

      const [pageCard] = screen.getAllByTestId(PageCardTestId.container);
      const pageIcon = within(pageCard).getByTestId(PageTypeIconTestId.chat);

      expect(pageIcon).toBeInTheDocument();
      expect(pageCard).toHaveStyle({ borderLeftColor: DEFAULT_SWATCH_COLOR });
    });

    it("does not list the page under another section of the thread or in another thread", async () => {
      const { user, unmount } = setup({ threadId: PAGE_THREAD.id });

      await waitForLoadedThread();
      await selectSectionCard({ user, sectionName: IDEAS_SECTION.name });
      await createPage(user, PAGE_NAME);

      await selectSectionCard({ user, sectionName: RESEARCH_SECTION.name });

      expect(getRenderedPageNames()).toStrictEqual([]);

      unmount();

      const other = setup({ threadId: OTHER_THREAD.id });

      await waitForLoadedThread();
      await selectSectionCard({
        user: other.user,
        sectionName: DRAFTS_SECTION.name,
      });

      expect(getRenderedPageNames()).toStrictEqual([]);
    });

    it("sets the thread's totalPages and lastUpdated to the latest page's createdAt, after each page", async () => {
      const emptyThread = { ...PAGE_THREAD, totalPages: 0 };
      seedThreads([emptyThread, OTHER_THREAD]);

      const { user } = setup({ threadId: PAGE_THREAD.id });

      await waitForLoadedThread();
      await selectSectionCard({ user, sectionName: IDEAS_SECTION.name });
      await createPage(user, PAGE_NAME);

      const [firstStoredPage] = readStoredPages();
      const threadAfterFirstPage = findStoredThread(PAGE_THREAD.id);

      expect(threadAfterFirstPage?.totalPages).toBe(1);
      expect(threadAfterFirstPage?.lastUpdated).toBe(firstStoredPage.createdAt);

      await selectSectionCard({ user, sectionName: RESEARCH_SECTION.name });
      await createPage(user, SECOND_PAGE_NAME);

      const storedPages = readStoredPages();
      const secondStoredPage = storedPages[storedPages.length - 1];
      const threadAfterSecondPage = findStoredThread(PAGE_THREAD.id);

      expect(threadAfterSecondPage?.totalPages).toBe(2);
      expect(threadAfterSecondPage?.lastUpdated).toBe(
        secondStoredPage.createdAt
      );
    });

    it("lowers the thread's totalPages by the deleted section's pages and removes those pages from storage", async () => {
      const threadWithPages = { ...PAGE_THREAD, totalPages: 3 };

      seedThreads([threadWithPages, OTHER_THREAD]);
      seedPages(sectionPageFixtures);

      const { user } = setup({ threadId: PAGE_THREAD.id });

      await waitForLoadedThread();
      await openSectionDeleteMenu({ user, sectionName: IDEAS_SECTION.name });
      await confirmSectionDelete(user);

      const deletedMessage = await screen.findByText(
        getSectionDeletedMessage(IDEAS_SECTION.name)
      );

      expect(deletedMessage).toBeInTheDocument();

      const threadAfterDelete = findStoredThread(PAGE_THREAD.id);
      expect(threadAfterDelete?.totalPages).toBe(1);

      expect(readStoredPages()).toStrictEqual([
        sectionPageFixtures[2],
        sectionPageFixtures[3],
      ]);
    });
  });

  describe("deleting a section", () => {
    const SECTION_THREAD = mindThreadFixtures[0];
    const RESEARCH_NAME = "Research";
    const IDEAS_NAME = "Ideas";
    const ARCHIVE_NAME = "Archive";

    const buildSection = (id: string, name: string): ThreadSection => {
      return {
        id,
        threadId: SECTION_THREAD.id,
        name,
        color: "#A3BE8C",
        createdAt: "2026-06-20T12:00:00.000Z",
      };
    };

    const THREE_SECTIONS = [
      buildSection("research-1", RESEARCH_NAME),
      buildSection("ideas-1", IDEAS_NAME),
      buildSection("archive-1", ARCHIVE_NAME),
    ];

    const waitForLoadedThread = async () => {
      await screen.findByTestId(ThreadHeaderTestId.title);
    };

    beforeEach(() => {
      seedThreads(mindThreadFixtures);
    });

    it("leaves the other sections in order when one of three is deleted", async () => {
      seedSections(THREE_SECTIONS);

      const { user } = setup({ threadId: SECTION_THREAD.id });

      await waitForLoadedThread();
      await openSectionDeleteMenu({ user, sectionName: IDEAS_NAME });
      await confirmSectionDelete(user);

      const sectionDeletedMessage = await screen.findByText(
        getSectionDeletedMessage(IDEAS_NAME)
      );
      expect(sectionDeletedMessage).toBeInTheDocument();

      expect(getRenderedSectionNames()).toStrictEqual([
        RESEARCH_NAME,
        ARCHIVE_NAME,
      ]);
    });

    it("keeps the other section when two sections share a name and one is deleted", async () => {
      const firstIdeas = buildSection("ideas-a", IDEAS_NAME);
      const secondIdeas = buildSection("ideas-b", IDEAS_NAME);

      seedSections([firstIdeas, secondIdeas]);

      const { user } = setup({ threadId: SECTION_THREAD.id });

      await waitForLoadedThread();
      await openSectionDeleteMenu({ user, sectionName: IDEAS_NAME, index: 1 });
      await confirmSectionDelete(user);

      const sectionDeletedMessage = await screen.findByText(
        getSectionDeletedMessage(IDEAS_NAME)
      );
      expect(sectionDeletedMessage).toBeInTheDocument();

      expect(getRenderedSectionNames()).toStrictEqual([IDEAS_NAME]);
      expect(readStoredSections()).toStrictEqual([firstIdeas]);
    });

    it("does not list a deleted section after the page is remounted", async () => {
      seedSections(THREE_SECTIONS);

      const { user, unmount } = setup({ threadId: SECTION_THREAD.id });

      await waitForLoadedThread();
      await openSectionDeleteMenu({ user, sectionName: IDEAS_NAME });
      await confirmSectionDelete(user);

      const sectionDeletedMessage = await screen.findByText(
        getSectionDeletedMessage(IDEAS_NAME)
      );
      expect(sectionDeletedMessage).toBeInTheDocument();

      unmount();

      setup({ threadId: SECTION_THREAD.id });

      await waitForLoadedThread();

      expect(getRenderedSectionNames()).toStrictEqual([
        RESEARCH_NAME,
        ARCHIVE_NAME,
      ]);
    });

    it("shows the empty sections message after the only section is deleted", async () => {
      seedSections([buildSection("research-1", RESEARCH_NAME)]);

      const { user } = setup({ threadId: SECTION_THREAD.id });

      await waitForLoadedThread();
      await openSectionDeleteMenu({ user, sectionName: RESEARCH_NAME });
      await confirmSectionDelete(user);

      const emptyMessage = await screen.findByText(SECTIONS_COLUMN_MESSAGE);
      expect(emptyMessage).toBeInTheDocument();
    });

    it("removes the card, closes the dialog and shows the success notification when the section was already deleted in another tab", async () => {
      seedSections(THREE_SECTIONS);

      const { user } = setup({ threadId: SECTION_THREAD.id });

      await waitForLoadedThread();

      const remainingSections = THREE_SECTIONS.filter((section) => {
        return section.name !== RESEARCH_NAME;
      });

      seedSections(remainingSections);
      dispatchStorageChange(SECTIONS_STORAGE_KEY);

      await openSectionDeleteMenu({ user, sectionName: RESEARCH_NAME });

      const modalTitle = screen.getByText(DELETE_SECTION_MODAL_TITLE);
      expect(modalTitle).toBeInTheDocument();

      await confirmSectionDelete(user);

      const successNotification = await screen.findByText(
        getSectionDeletedMessage(RESEARCH_NAME)
      );

      expect(successNotification).toBeInTheDocument();
      expect(modalTitle).not.toBeInTheDocument();
      expect(getRenderedSectionNames()).toStrictEqual([
        IDEAS_NAME,
        ARCHIVE_NAME,
      ]);
    });
  });
});
