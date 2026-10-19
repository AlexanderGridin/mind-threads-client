import { describe, it, expect, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithUIProvider } from "@/components/lib";
import { ThreadListMode } from "@/pages/DashboardPage/DashboardPage.constants";
import type { ThreadListModeType } from "@/pages/DashboardPage/DashboardPage.types";
import { MindThreadList } from "../MindThreadList";
import { MindThreadListTestId } from "../MindThreadList.constants";
import { MindThreadCardTestId } from "../../MindThreadCard/MindThreadCard.constants";
import {
  mindThreadFixtures,
  mindThreadFixturesWithSameTitle,
} from "@/__test-fixtures__";
import type { MindThread } from "@/types";

let mockThreadListMode: ThreadListModeType = ThreadListMode.Grid;
let mockThreads: MindThread[] = mindThreadFixtures;

vi.mock(
  "@/pages/DashboardPage/components/DashboardPageLoader/DashboardPageLoader.hooks",
  () => ({
    useDashboardPageValue: () => ({
      threads: mockThreads,
      threadListMode: mockThreadListMode,
    }),
    useDashboardPageAction: () => ({
      toggleThreadListMode: vi.fn(),
    }),
  })
);

const setup = () => {
  const user = userEvent.setup();
  renderWithUIProvider(<MindThreadList />);
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

  it("calls console.log with the thread when a card is clicked", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const { user } = setup();

    const cards = screen.getAllByTestId(MindThreadCardTestId.container);
    await user.click(cards[0]);

    expect(consoleSpy).toHaveBeenCalledOnce();
    expect(consoleSpy).toHaveBeenCalledWith(mindThreadFixtures[0]);
  });
});
