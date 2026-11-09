import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { act, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { renderWithUIProvider } from "@/components/lib/__test-fixtures__";
import {
  confirmSectionDelete,
  dispatchStorageChange,
  mindThreadFixtures,
  openSectionDeleteMenu,
  seedSections,
  seedThreads,
  threadSectionFixtures,
} from "@/__test-fixtures__";
import type { MindThread, ThreadSection } from "@/types";
import { SECTIONS_STORAGE_KEY } from "@/services/useThreadSectionsService/useThreadSectionsService.constants";
import { THREADS_STORAGE_KEY } from "@/services/useThreadsService/useThreadsService.constants";
import { ThreadColumnsTestId } from "@/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/ThreadColumns.constants";
import { SectionFormTestId } from "@/pages/ThreadPage/components/AddSectionModalContainer/components/AddSectionModal/components/SectionForm/SectionForm.constants";
import { ADD_SECTION_MODAL_TITLE } from "@/pages/ThreadPage/components/AddSectionModalContainer/components/AddSectionModal/AddSectionModal.constants";
import { ThreadFormModalActionsTestId } from "@/components/shared/ThreadFormModalActions/ThreadFormModalActions.constants";
import { DeleteConfirmationModalActionsTestId } from "@/components/shared/DeleteConfirmationModal/components/DeleteConfirmationModalActions/DeleteConfirmationModalActions.constants";
import { App } from "../App";
import { DashboardHeaderTestId } from "@/pages/DashboardPage/components/DashboardHeader/DashboardHeader.constants";
import { ThreadListModeButtonTestId } from "@/pages/DashboardPage/components/DashboardHeader/components/ThreadListModeButton/ThreadListModeButton.constants";
import { MindThreadCardTestId } from "@/pages/DashboardPage/components/DashboardContent/components/MindThreadCard/MindThreadCard.constants";
import { MindThreadListTestId } from "@/pages/DashboardPage/components/DashboardContent/components/MindThreadList/MindThreadList.constants";
import { BACK_TO_DASHBOARD_LABEL } from "@/pages/ThreadPage/ThreadPage.constants";
import { ThreadHeaderTestId } from "@/pages/ThreadPage/components/ThreadHeader/ThreadHeader.constants";
import { DELETE_SECTION_ERROR_MESSAGE } from "@/pages/ThreadPage/components/ThreadPageLoader/ThreadPageLoader.constants";
import { getSectionDeletedMessage } from "@/pages/ThreadPage/components/ThreadPageLoader/ThreadPageLoader.utils";
import { APP_NAME } from "@/components/shared";

const mockUseColorModeReturn = { toggleColorMode: vi.fn() };

vi.mock("@/components/lib/color-mode/color-mode.hooks", () => ({
  useColorMode: () => mockUseColorModeReturn,
}));

const STORED_THREAD = mindThreadFixtures[1];
const THREAD_PATH = `/threads/${STORED_THREAD.id}`;
const MAX_TAB_PRESSES = 20;

const setup = (initialPath: string = "/") => {
  const user = userEvent.setup();

  const router = createMemoryRouter([{ path: "*", element: <App /> }], {
    initialEntries: [initialPath],
  });

  renderWithUIProvider(<RouterProvider router={router} />);

  return { user, router };
};

const findThreadTitles = async () => {
  const titleElements = await screen.findAllByTestId(
    MindThreadCardTestId.title
  );

  return titleElements.map((titleElement) => {
    return titleElement.textContent ?? "";
  });
};

const getThreadLinks = () => {
  const titleElements = screen.getAllByTestId(MindThreadCardTestId.title);

  return titleElements.map((titleElement) => {
    return within(titleElement).getByRole("link");
  });
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("App", () => {
  it("renders DashboardPage at the root path", () => {
    setup("/");

    const container = screen.getByTestId(DashboardHeaderTestId.container);
    expect(container).toBeInTheDocument();
  });

  it("shows the thread title in the header of a seeded thread at its address", async () => {
    seedThreads(mindThreadFixtures);

    setup(THREAD_PATH);

    const headerTitle = await screen.findByTestId(ThreadHeaderTestId.title);
    expect(headerTitle.textContent).toBe(STORED_THREAD.title);
  });

  describe("opening and returning to the dashboard", () => {
    it("opens a thread from the grid view and returns to the same threads in the same order", async () => {
      seedThreads(mindThreadFixtures);

      const { user } = setup("/");

      const dashboardTitles = await findThreadTitles();
      const threadLinks = getThreadLinks();

      const secondThreadLink = threadLinks[1];
      const secondThreadTitle = dashboardTitles[1];

      await user.click(secondThreadLink);

      const headerTitle = await screen.findByTestId(ThreadHeaderTestId.title);
      expect(headerTitle.textContent).toBe(secondThreadTitle);

      const backButton = screen.getByRole("button", {
        name: BACK_TO_DASHBOARD_LABEL,
      });

      await user.click(backButton);

      const returnedTitles = await findThreadTitles();
      const gridContainer = screen.getByTestId(MindThreadListTestId.container);

      expect(returnedTitles).toStrictEqual(dashboardTitles);
      expect(gridContainer).toHaveStyle({ display: "grid" });
    });

    it("keeps the list view when the browser Back button returns from a thread", async () => {
      seedThreads(mindThreadFixtures);

      const { user, router } = setup("/");

      const dashboardTitles = await findThreadTitles();

      const listModeButton = screen.getByTestId(
        ThreadListModeButtonTestId.container
      );

      await user.click(listModeButton);

      const threadLinks = getThreadLinks();

      const secondThreadLink = threadLinks[1];
      const secondThreadTitle = dashboardTitles[1];

      await user.click(secondThreadLink);

      const headerTitle = await screen.findByTestId(ThreadHeaderTestId.title);
      expect(headerTitle.textContent).toBe(secondThreadTitle);

      await act(async () => {
        await router.navigate(-1);
      });

      const returnedTitles = await findThreadTitles();
      const listContainer = screen.getByTestId(MindThreadListTestId.container);

      expect(returnedTitles).toStrictEqual(dashboardTitles);
      expect(listContainer).toHaveStyle({ display: "flex" });
    });

    it("keeps the browser tab title the same after returning to the dashboard", async () => {
      seedThreads(mindThreadFixtures);

      const { user } = setup("/");

      const dashboardTitles = await findThreadTitles();

      const dashboardTabTitle = document.title;

      const secondThreadLink = getThreadLinks()[1];
      const secondThreadTitle = dashboardTitles[1];

      await user.click(secondThreadLink);

      const headerTitle = await screen.findByTestId(ThreadHeaderTestId.title);
      expect(headerTitle.textContent).toBe(secondThreadTitle);

      expect(document.title).toBe(`${secondThreadTitle} · ${APP_NAME}`);

      const backButton = screen.getByRole("button", {
        name: BACK_TO_DASHBOARD_LABEL,
      });

      await user.click(backButton);

      await findThreadTitles();

      expect(document.title).toBe(dashboardTabTitle);
    });
  });

  it("moves keyboard focus through every thread card link with Tab", async () => {
    seedThreads(mindThreadFixtures);

    const { user } = setup("/");

    const dashboardTitles = await findThreadTitles();
    const focusedTitles: string[] = [];
    let pressCount = 0;

    while (
      focusedTitles.length < dashboardTitles.length &&
      pressCount < MAX_TAB_PRESSES
    ) {
      await user.tab();

      pressCount += 1;

      const focusedElement = document.activeElement;

      if (focusedElement instanceof HTMLAnchorElement) {
        focusedTitles.push(focusedElement.textContent ?? "");
      }
    }

    expect(focusedTitles).toStrictEqual(dashboardTitles);
  });

  describe("creating and deleting sections", () => {
    type User = ReturnType<typeof userEvent.setup>;

    const SECTION_THREAD = { ...mindThreadFixtures[0], totalSections: 0 };
    const OTHER_THREAD = mindThreadFixtures[1];
    const OTHER_THREAD_SECTION = threadSectionFixtures[2];
    const FIRST_SECTION_NAME = "Ideas";
    const SECOND_SECTION_NAME = "Research";
    const FIRST_SECTION_TIME = "2026-11-08T10:00:00.000Z";
    const SECOND_SECTION_TIME = "2026-11-08T11:30:00.000Z";
    const JUST_NOW_TEXT = "Updated: just now";

    const getThreadLink = (threadTitle: string) => {
      return screen.getByRole("link", { name: threadTitle });
    };

    const openThreadFromDashboard = async (user: User, threadTitle: string) => {
      const threadLink = getThreadLink(threadTitle);
      await user.click(threadLink);

      await screen.findByTestId(ThreadHeaderTestId.title);
    };

    const addSection = async (user: User, sectionName: string) => {
      const addSectionButton = screen.getByTestId(
        ThreadColumnsTestId.addSectionButton
      );

      await user.click(addSectionButton);

      const modalTitle = await screen.findByText(ADD_SECTION_MODAL_TITLE);
      const nameInput = screen.getByTestId(SectionFormTestId.nameInput);

      await user.type(nameInput, sectionName);

      const submitButton = screen.getByTestId(
        ThreadFormModalActionsTestId.submitButton
      );

      await user.click(submitButton);

      await waitFor(() => {
        expect(modalTitle).not.toBeInTheDocument();
      });
    };

    const returnToDashboard = async (user: User) => {
      const backButton = screen.getByRole("button", {
        name: BACK_TO_DASHBOARD_LABEL,
      });

      await user.click(backButton);
      await findThreadTitles();
    };

    const deleteSection = async (user: User, sectionName: string) => {
      await openSectionDeleteMenu({ user, sectionName });
      await confirmSectionDelete(user);
    };

    const getStoredSections = (): ThreadSection[] => {
      const storedSections = localStorage.getItem(SECTIONS_STORAGE_KEY);
      return storedSections ? JSON.parse(storedSections) : [];
    };

    const getStoredThread = (threadId: string): MindThread | undefined => {
      const storedThreads: MindThread[] = JSON.parse(
        localStorage.getItem(THREADS_STORAGE_KEY) ?? "[]"
      );

      return storedThreads.find((thread) => {
        return thread.id === threadId;
      });
    };

    beforeEach(() => {
      vi.useFakeTimers({ toFake: ["Date"] });
      vi.setSystemTime(new Date(FIRST_SECTION_TIME));
    });

    afterEach(() => {
      vi.useRealTimers();
      vi.restoreAllMocks();
    });

    it("counts the sections on the card as they are created, and shows the creation time", async () => {
      seedThreads([SECTION_THREAD]);

      const { user } = setup("/");

      await findThreadTitles();
      await openThreadFromDashboard(user, SECTION_THREAD.title);
      await addSection(user, FIRST_SECTION_NAME);
      await returnToDashboard(user);

      const [firstSectionsText] = screen.getAllByTestId(
        MindThreadCardTestId.sections
      );

      const [firstLastUpdated] = screen.getAllByTestId(
        MindThreadCardTestId.lastUpdated
      );

      expect(firstSectionsText.textContent).toBe("1 section");
      expect(firstLastUpdated.textContent).toBe(JUST_NOW_TEXT);

      expect(getStoredThread(SECTION_THREAD.id)?.lastUpdated).toBe(
        FIRST_SECTION_TIME
      );

      vi.setSystemTime(new Date(SECOND_SECTION_TIME));

      await openThreadFromDashboard(user, SECTION_THREAD.title);
      await addSection(user, SECOND_SECTION_NAME);
      await returnToDashboard(user);

      const [secondSectionsText] = screen.getAllByTestId(
        MindThreadCardTestId.sections
      );

      expect(secondSectionsText.textContent).toBe("2 sections");

      expect(getStoredThread(SECTION_THREAD.id)?.lastUpdated).toBe(
        SECOND_SECTION_TIME
      );
    });

    it("removes the deleted thread's sections and keeps the other thread's sections", async () => {
      seedThreads([SECTION_THREAD, OTHER_THREAD]);
      seedSections([OTHER_THREAD_SECTION]);

      const { user } = setup("/");

      await findThreadTitles();
      await openThreadFromDashboard(user, SECTION_THREAD.title);
      await addSection(user, FIRST_SECTION_NAME);
      await returnToDashboard(user);

      const deletedThreadLink = getThreadLink(SECTION_THREAD.title);

      const menuButton = screen.getByRole("button", {
        name: `Thread actions for ${SECTION_THREAD.title}`,
      });

      await user.click(menuButton);

      const [, deleteMenuItem] = await screen.findAllByRole("menuitem");
      await user.click(deleteMenuItem);

      const confirmButton = screen.getByTestId(
        DeleteConfirmationModalActionsTestId.deleteButton
      );

      await user.click(confirmButton);

      await waitFor(() => {
        expect(deletedThreadLink).not.toBeInTheDocument();
      });

      const remainingSections = getStoredSections();
      expect(remainingSections).toStrictEqual([OTHER_THREAD_SECTION]);
    });

    describe("deleting a section", () => {
      const THIRD_SECTION_TIME = "2026-11-08T12:00:00.000Z";
      const ARCHIVE_NAME = "Archive";

      const ARCHIVE_SECTION: ThreadSection = {
        ...threadSectionFixtures[0],
        id: "archive-1",
        name: ARCHIVE_NAME,
      };

      const THREE_SECTIONS = [
        threadSectionFixtures[0],
        threadSectionFixtures[1],
        ARCHIVE_SECTION,
      ];

      const THREE_SECTION_THREAD = {
        ...SECTION_THREAD,
        totalSections: 3,
        lastUpdated: FIRST_SECTION_TIME,
      };

      const DELETED_SECTION_NAME = SECOND_SECTION_NAME;

      it("shows two sections and the just-now update time on the card after one of three sections is deleted", async () => {
        seedThreads([THREE_SECTION_THREAD]);
        seedSections(THREE_SECTIONS);

        const { user } = setup("/");

        await findThreadTitles();
        await openThreadFromDashboard(user, SECTION_THREAD.title);

        vi.setSystemTime(new Date(SECOND_SECTION_TIME));

        await deleteSection(user, DELETED_SECTION_NAME);

        const successNotification = await screen.findByText(
          getSectionDeletedMessage(DELETED_SECTION_NAME)
        );

        expect(successNotification).toBeInTheDocument();

        await returnToDashboard(user);

        const [sectionsText] = screen.getAllByTestId(
          MindThreadCardTestId.sections
        );

        const [lastUpdated] = screen.getAllByTestId(
          MindThreadCardTestId.lastUpdated
        );

        expect(sectionsText.textContent).toBe("2 sections");
        expect(lastUpdated.textContent).toBe(JUST_NOW_TEXT);

        expect(getStoredThread(SECTION_THREAD.id)?.lastUpdated).toBe(
          SECOND_SECTION_TIME
        );
      });

      it("keeps the card's count and update time when the delete fails", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {});

        seedThreads([THREE_SECTION_THREAD]);
        seedSections(THREE_SECTIONS);

        const { user } = setup("/");

        await findThreadTitles();
        await openThreadFromDashboard(user, SECTION_THREAD.title);

        const setItemSpy = vi
          .spyOn(Storage.prototype, "setItem")
          .mockImplementation(() => {
            throw new Error("Storage quota exceeded");
          });

        await deleteSection(user, DELETED_SECTION_NAME);

        const errorNotification = await screen.findByText(
          DELETE_SECTION_ERROR_MESSAGE
        );

        expect(errorNotification).toBeInTheDocument();

        const cancelButton = screen.getByRole("button", { name: "Cancel" });
        await user.click(cancelButton);

        setItemSpy.mockRestore();

        await returnToDashboard(user);

        const [sectionsText] = screen.getAllByTestId(
          MindThreadCardTestId.sections
        );

        expect(sectionsText.textContent).toBe("3 sections");

        expect(getStoredThread(SECTION_THREAD.id)?.lastUpdated).toBe(
          FIRST_SECTION_TIME
        );
      });

      it("drops the count only once when the section was already deleted in another tab", async () => {
        seedThreads([THREE_SECTION_THREAD]);
        seedSections(THREE_SECTIONS);

        const { user } = setup("/");

        await findThreadTitles();
        await openThreadFromDashboard(user, SECTION_THREAD.title);

        const otherTabThread = {
          ...THREE_SECTION_THREAD,
          totalSections: 2,
          lastUpdated: SECOND_SECTION_TIME,
        };

        seedThreads([otherTabThread]);
        seedSections(
          THREE_SECTIONS.filter((section) => {
            return section.name !== DELETED_SECTION_NAME;
          })
        );

        dispatchStorageChange(THREADS_STORAGE_KEY);
        dispatchStorageChange(SECTIONS_STORAGE_KEY);

        vi.setSystemTime(new Date(THIRD_SECTION_TIME));

        await deleteSection(user, DELETED_SECTION_NAME);

        const successNotification = await screen.findByText(
          getSectionDeletedMessage(DELETED_SECTION_NAME)
        );

        expect(successNotification).toBeInTheDocument();

        await returnToDashboard(user);

        const [sectionsText] = screen.getAllByTestId(
          MindThreadCardTestId.sections
        );

        expect(sectionsText.textContent).toBe("2 sections");

        expect(getStoredThread(SECTION_THREAD.id)?.lastUpdated).toBe(
          SECOND_SECTION_TIME
        );
      });
    });
  });
});
