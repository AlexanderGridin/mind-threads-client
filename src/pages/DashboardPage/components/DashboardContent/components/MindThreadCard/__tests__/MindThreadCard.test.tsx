import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { ThreadListMode } from "@/pages/DashboardPage/DashboardPage.constants";
import type { ThreadListModeType } from "@/pages/DashboardPage/DashboardPage.types";
import { MindThreadCard } from "../MindThreadCard";
import { MindThreadCardTestId } from "../MindThreadCard.constants";
import {
  LOCATION_MARKER_TEST_ID,
  mindThreadFixture,
  renderWithRouter,
} from "@/__test-fixtures__";

const CARD_TITLE = "Test Thread";
const THREAD_PATH = "/threads/test-thread";
const OVERLAY_CLASS_NAME = "chakra-linkbox__overlay";

const mockOnEdit = vi.fn();
const mockOnDelete = vi.fn();

const setup = (
  thread = mindThreadFixture,
  forMode: ThreadListModeType = ThreadListMode.Grid
) => {
  const user = userEvent.setup();

  renderWithRouter({
    ui: (
      <MindThreadCard
        thread={thread}
        forMode={forMode}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    ),
  });

  return { user };
};

const getCardLink = () => {
  return screen.getByRole("link", { name: CARD_TITLE });
};

const getLocation = () => {
  return screen.queryByTestId(LOCATION_MARKER_TEST_ID)?.textContent ?? null;
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("MindThreadCard", () => {
  const rendersAllRequiredElements = () => {
    expect(
      screen.getByTestId(MindThreadCardTestId.container)
    ).toBeInTheDocument();

    expect(
      screen.getByTestId(MindThreadCardTestId.contentContainer)
    ).toBeInTheDocument();

    const title = screen.getByTestId(MindThreadCardTestId.title);
    expect(title).toBeInTheDocument();
    expect(title.textContent).toBe(CARD_TITLE);

    const sections = screen.getByTestId(MindThreadCardTestId.sections);
    expect(sections).toBeInTheDocument();
    expect(sections.textContent).toBe("5 sections");

    const pages = screen.getByTestId(MindThreadCardTestId.pages);
    expect(pages).toBeInTheDocument();
    expect(pages.textContent).toBe("15 pages");

    const lastUpdated = screen.getByTestId(MindThreadCardTestId.lastUpdated);
    expect(lastUpdated).toBeInTheDocument();
    expect(lastUpdated.textContent).toContain("Updated: ");
  };

  const rendersNAWhenLastUpdatedTextIsEmpty = () => {
    const lastUpdated = screen.getByTestId(MindThreadCardTestId.lastUpdated);

    expect(lastUpdated).toBeInTheDocument();
    expect(lastUpdated.textContent).toBe("Updated: N/A");
  };

  const rendersThreadLink = () => {
    const threadLink = getCardLink();

    expect(threadLink).toBeInTheDocument();
    expect(threadLink).toHaveAttribute("href", THREAD_PATH);
  };

  const coversWholeCard = () => {
    const container = screen.getByTestId(MindThreadCardTestId.container);
    const threadLink = getCardLink();

    expect(container).toContainElement(threadLink);
    expect(threadLink).toHaveClass(OVERLAY_CLASS_NAME);
  };

  const navigatesOnEnterAfterTab = async (user: UserEvent) => {
    await user.tab();

    const threadLink = getCardLink();
    expect(threadLink).toHaveFocus();

    await user.keyboard("{Enter}");

    expect(getLocation()).toBe(THREAD_PATH);
  };

  const doesNotNavigateOnModifiedClick = async (user: UserEvent) => {
    const threadLink = getCardLink();

    await user.keyboard("{Control>}");
    await user.click(threadLink);
    await user.keyboard("{/Control}");

    expect(getLocation()).toBeNull();

    await user.keyboard("{Meta>}");
    await user.click(threadLink);
    await user.keyboard("{/Meta}");

    expect(getLocation()).toBeNull();
    expect(
      screen.getByTestId(MindThreadCardTestId.container)
    ).toBeInTheDocument();
  };

  const doesNotNavigateOnMiddleClick = async (user: UserEvent) => {
    const threadLink = getCardLink();

    await user.pointer({ keys: "[MouseMiddle]", target: threadLink });

    expect(getLocation()).toBeNull();
    expect(
      screen.getByTestId(MindThreadCardTestId.container)
    ).toBeInTheDocument();
  };

  const getActionsButton = () => {
    return screen.getByRole("button", {
      name: "Thread actions for Test Thread",
    });
  };

  const rendersActionsButton = () => {
    expect(getActionsButton()).toBeInTheDocument();
  };

  const doesNotNavigateOnActions = async (user: UserEvent) => {
    await user.click(getActionsButton());

    expect(getLocation()).toBeNull();
  };

  const handlesEditProperly = async (user: UserEvent) => {
    await user.click(getActionsButton());

    const [editMenuItem] = await screen.findAllByRole("menuitem");
    await user.click(editMenuItem);

    expect(mockOnEdit).toHaveBeenCalledOnce();
    expect(mockOnEdit).toHaveBeenCalledWith(mindThreadFixture);

    expect(getLocation()).toBeNull();
  };

  const handlesDeleteProperly = async (user: UserEvent) => {
    await user.click(getActionsButton());

    const [, deleteMenuItem] = await screen.findAllByRole("menuitem");
    await user.click(deleteMenuItem);

    expect(mockOnDelete).toHaveBeenCalledOnce();
    expect(mockOnDelete).toHaveBeenCalledWith(mindThreadFixture);

    expect(getLocation()).toBeNull();
  };

  describe("grid layout", () => {
    it("renders title, sections, pages, and last updated", () => {
      setup();
      rendersAllRequiredElements();
    });

    it("renders 'Updated: N/A' when lastUpdatedText is empty", () => {
      const futureThread = {
        ...mindThreadFixture,
        lastUpdated: new Date(Date.now() + 1000).toISOString(),
      };

      setup(futureThread);
      rendersNAWhenLastUpdatedTextIsEmpty();
    });

    it("renders zero counts and 'Updated: just now' for a new thread", () => {
      const newThread = {
        ...mindThreadFixture,
        totalSections: 0,
        totalPages: 0,
        lastUpdated: new Date().toISOString(),
      };

      setup(newThread);

      const sections = screen.getByTestId(MindThreadCardTestId.sections);
      expect(sections).toBeInTheDocument();
      expect(sections.textContent).toBe("0 sections");

      const pages = screen.getByTestId(MindThreadCardTestId.pages);
      expect(pages).toBeInTheDocument();
      expect(pages.textContent).toBe("0 pages");

      const lastUpdated = screen.getByTestId(MindThreadCardTestId.lastUpdated);
      expect(lastUpdated).toBeInTheDocument();
      expect(lastUpdated.textContent).toBe("Updated: just now");
    });

    it("renders '1 section' for a thread with one section", () => {
      const oneSectionThread = { ...mindThreadFixture, totalSections: 1 };

      setup(oneSectionThread);

      const sections = screen.getByTestId(MindThreadCardTestId.sections);
      expect(sections.textContent).toBe("1 section");
    });

    it("renders '2 sections' for a thread with two sections", () => {
      const twoSectionsThread = { ...mindThreadFixture, totalSections: 2 };

      setup(twoSectionsThread);

      const sections = screen.getByTestId(MindThreadCardTestId.sections);
      expect(sections.textContent).toBe("2 sections");
    });

    it("renders color border top", () => {
      setup();

      const colorBorderLeft = screen.queryByTestId(
        MindThreadCardTestId.colorBorderLeft
      );

      expect(colorBorderLeft).not.toBeInTheDocument();

      const colorBorderTop = screen.getByTestId(
        MindThreadCardTestId.colorBorderTop
      );

      expect(colorBorderTop).toBeInTheDocument();
      expect(colorBorderTop).toHaveStyle({ backgroundColor: "#FF6B6B" });
    });

    it("renders a link named after the thread title to the thread page", () => {
      setup();
      rendersThreadLink();
    });

    it("covers the whole card with the thread link", () => {
      setup();
      coversWholeCard();
    });

    it("navigates to the thread page when Enter is pressed on the focused card", async () => {
      const { user } = setup();
      await navigatesOnEnterAfterTab(user);
    });

    it("does not navigate in place on Ctrl+click or Cmd+click", async () => {
      const { user } = setup();
      await doesNotNavigateOnModifiedClick(user);
    });

    it("does not navigate in place on middle-click", async () => {
      const { user } = setup();
      await doesNotNavigateOnMiddleClick(user);
    });

    it("renders the thread actions button", () => {
      setup();
      rendersActionsButton();
    });

    it("does not navigate when the actions button is clicked", async () => {
      const { user } = setup();
      await doesNotNavigateOnActions(user);
    });

    it("calls onEdit with the thread and does not navigate when Edit is chosen", async () => {
      const { user } = setup();
      await handlesEditProperly(user);
    });

    it("calls onDelete with the thread and does not navigate when Delete is chosen", async () => {
      const { user } = setup();
      await handlesDeleteProperly(user);
    });
  });

  describe("list layout", () => {
    it("renders title, sections, pages, and last updated", () => {
      setup(mindThreadFixture, ThreadListMode.List);
      rendersAllRequiredElements();
    });

    it("renders 'Updated: N/A' when lastUpdatedText is empty", () => {
      const futureThread = {
        ...mindThreadFixture,
        lastUpdated: new Date(Date.now() + 1000).toISOString(),
      };

      setup(futureThread, ThreadListMode.List);
      rendersNAWhenLastUpdatedTextIsEmpty();
    });

    it("renders color border left", () => {
      setup(mindThreadFixture, ThreadListMode.List);

      const colorBorderTop = screen.queryByTestId(
        MindThreadCardTestId.colorBorderTop
      );

      expect(colorBorderTop).not.toBeInTheDocument();

      const colorBorderLeft = screen.getByTestId(
        MindThreadCardTestId.colorBorderLeft
      );

      expect(colorBorderLeft).toBeInTheDocument();
      expect(colorBorderLeft).toHaveStyle({ backgroundColor: "#FF6B6B" });
    });

    it("renders a link named after the thread title to the thread page", () => {
      setup(mindThreadFixture, ThreadListMode.List);
      rendersThreadLink();
    });

    it("covers the whole card with the thread link", () => {
      setup(mindThreadFixture, ThreadListMode.List);
      coversWholeCard();
    });

    it("navigates to the thread page when Enter is pressed on the focused card", async () => {
      const { user } = setup(mindThreadFixture, ThreadListMode.List);
      await navigatesOnEnterAfterTab(user);
    });

    it("does not navigate in place on Ctrl+click or Cmd+click", async () => {
      const { user } = setup(mindThreadFixture, ThreadListMode.List);
      await doesNotNavigateOnModifiedClick(user);
    });

    it("does not navigate in place on middle-click", async () => {
      const { user } = setup(mindThreadFixture, ThreadListMode.List);
      await doesNotNavigateOnMiddleClick(user);
    });

    it("renders the thread actions button", () => {
      setup(mindThreadFixture, ThreadListMode.List);
      rendersActionsButton();
    });

    it("does not navigate when the actions button is clicked", async () => {
      const { user } = setup(mindThreadFixture, ThreadListMode.List);
      await doesNotNavigateOnActions(user);
    });

    it("calls onEdit with the thread and does not navigate when Edit is chosen", async () => {
      const { user } = setup(mindThreadFixture, ThreadListMode.List);
      await handlesEditProperly(user);
    });

    it("calls onDelete with the thread and does not navigate when Delete is chosen", async () => {
      const { user } = setup(mindThreadFixture, ThreadListMode.List);
      await handlesDeleteProperly(user);
    });
  });
});
