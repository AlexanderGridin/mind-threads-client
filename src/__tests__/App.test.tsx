import { describe, it, expect, beforeEach, vi } from "vitest";
import { act, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { renderWithUIProvider } from "@/components/lib/__test-fixtures__";
import { mindThreadFixtures, seedThreads } from "@/__test-fixtures__";
import { App } from "../App";
import { DashboardHeaderTestId } from "@/pages/DashboardPage/components/DashboardHeader/DashboardHeader.constants";
import { ThreadListModeButtonTestId } from "@/pages/DashboardPage/components/DashboardHeader/components/ThreadListModeButton/ThreadListModeButton.constants";
import { MindThreadCardTestId } from "@/pages/DashboardPage/components/DashboardContent/components/MindThreadCard/MindThreadCard.constants";
import { MindThreadListTestId } from "@/pages/DashboardPage/components/DashboardContent/components/MindThreadList/MindThreadList.constants";
import { BACK_TO_DASHBOARD_LABEL } from "@/pages/ThreadPage/ThreadPage.constants";
import { ThreadHeaderTestId } from "@/pages/ThreadPage/components/ThreadHeader/ThreadHeader.constants";
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
});
