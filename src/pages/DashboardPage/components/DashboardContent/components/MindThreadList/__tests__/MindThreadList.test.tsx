import { describe, it, expect, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThreadListMode } from "@/pages/DashboardPage/DashboardPage.constants";
import type { ThreadListModeType } from "@/pages/DashboardPage/DashboardPage.types";
import { MindThreadList } from "../MindThreadList";
import { MindThreadListTestId } from "../MindThreadList.constants";
import { MindThreadCardTestId } from "../../MindThreadCard/MindThreadCard.constants";
import {
  LOCATION_MARKER_TEST_ID,
  mindThreadFixtures,
  mindThreadFixturesWithSameTitle,
  renderWithRouter,
} from "@/__test-fixtures__";
import type { MindThread } from "@/types";

const FIRST_THREAD_TITLE = "Thread One";
const FIRST_THREAD_PATH = "/threads/thread-1";

let mockThreadListMode: ThreadListModeType = ThreadListMode.Grid;
let mockThreads: MindThread[] = mindThreadFixtures;

const mockOpenEditThreadModal = vi.fn();
const mockOpenDeleteThreadModal = vi.fn();

vi.mock(
  "@/pages/DashboardPage/components/DashboardPageLoader/DashboardPageLoader.hooks",
  () => ({
    useDashboardPageValue: () => ({
      threads: mockThreads,
      threadListMode: mockThreadListMode,
    }),
    useDashboardPageAction: () => ({
      openEditThreadModal: mockOpenEditThreadModal,
      openDeleteThreadModal: mockOpenDeleteThreadModal,
    }),
  })
);

const setup = () => {
  const user = userEvent.setup();
  renderWithRouter({ ui: <MindThreadList /> });
  return { user };
};

const getRenderedSections = () => {
  return screen
    .getAllByTestId(MindThreadCardTestId.sections)
    .map((sections) => sections.textContent);
};

beforeEach(() => {
  vi.clearAllMocks();
  mockThreadListMode = ThreadListMode.Grid;
  mockThreads = mindThreadFixtures;
});

describe("MindThreadList", () => {
  it("renders correct number of cards", () => {
    setup();

    const listItems = screen.getAllByTestId(MindThreadListTestId.listItem);

    expect(listItems.length).toBe(2);
    listItems.forEach((li) => expect(li.tagName).toBe("LI"));

    const cards = screen.getAllByTestId(MindThreadCardTestId.container);
    expect(cards.length).toBe(listItems.length);
  });

  it("renders grid layout container when mode is grid", () => {
    setup();

    const container = screen.getByTestId(MindThreadListTestId.container);

    expect(container).toHaveStyle({ display: "grid" });
    expect(container.tagName).toBe("UL");
  });

  it("renders flex layout container when mode is list", () => {
    mockThreadListMode = ThreadListMode.List;

    setup();

    const container = screen.getByTestId(MindThreadListTestId.container);

    expect(container).toHaveStyle({ display: "flex" });
    expect(container.tagName).toBe("UL");
  });

  it("renders two cards when two threads share the same title", () => {
    mockThreads = mindThreadFixturesWithSameTitle;

    setup();

    const cards = screen.getAllByTestId(MindThreadCardTestId.container);

    expect(cards.length).toBe(2);

    cards.forEach((card) => {
      expect(card).toHaveTextContent("Testing Strategy");
    });
  });

  it("renders the threads with the same title in the given order in grid mode", () => {
    mockThreads = mindThreadFixturesWithSameTitle;

    setup();

    expect(getRenderedSections()).toStrictEqual(["8 sections", "0 sections"]);
  });

  it("renders the threads with the same title in the given order in list mode", () => {
    mockThreads = mindThreadFixturesWithSameTitle;
    mockThreadListMode = ThreadListMode.List;

    setup();

    expect(getRenderedSections()).toStrictEqual(["8 sections", "0 sections"]);
  });

  it("calls openDeleteThreadModal with the thread when Delete is chosen from a card's menu", async () => {
    const { user } = setup();

    const [firstActionsButton] = screen.getAllByRole("button", {
      name: /^Thread actions for/,
    });

    await user.click(firstActionsButton);

    const [, deleteMenuItem] = await screen.findAllByRole("menuitem");
    await user.click(deleteMenuItem);

    expect(mockOpenDeleteThreadModal).toHaveBeenCalledOnce();

    expect(mockOpenDeleteThreadModal).toHaveBeenCalledWith(
      mindThreadFixtures[0]
    );
  });

  it("calls openEditThreadModal with the thread when Edit is chosen from a card's menu", async () => {
    const { user } = setup();

    const [firstActionsButton] = screen.getAllByRole("button", {
      name: /^Thread actions for/,
    });

    await user.click(firstActionsButton);

    const [editMenuItem] = await screen.findAllByRole("menuitem");
    await user.click(editMenuItem);

    expect(mockOpenEditThreadModal).toHaveBeenCalledOnce();
    expect(mockOpenEditThreadModal).toHaveBeenCalledWith(mindThreadFixtures[0]);
    expect(mockOpenDeleteThreadModal).not.toHaveBeenCalled();
  });

  it("opens the clicked thread", async () => {
    const { user } = setup();

    const firstThreadLink = screen.getByRole("link", {
      name: FIRST_THREAD_TITLE,
    });

    await user.click(firstThreadLink);

    const location = screen.getByTestId(LOCATION_MARKER_TEST_ID);
    expect(location.textContent).toBe(FIRST_THREAD_PATH);
  });
});
