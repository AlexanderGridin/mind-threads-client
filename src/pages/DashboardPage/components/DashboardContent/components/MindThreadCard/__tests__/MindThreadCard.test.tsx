import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { renderWithUIProvider } from "@/components/lib";
import { ThreadListMode } from "@/pages/DashboardPage/DashboardPage.constants";
import type { ThreadListModeType } from "@/pages/DashboardPage/DashboardPage.types";
import { MindThreadCard } from "../MindThreadCard";
import { MindThreadCardTestId } from "../MindThreadCard.constants";
import { mindThreadFixture } from "@/__test-fixtures__";

const mockOnClick = vi.fn();
const mockOnDelete = vi.fn();

const setup = (
  thread = mindThreadFixture,
  forMode: ThreadListModeType = ThreadListMode.Grid
) => {
  const user = userEvent.setup();

  renderWithUIProvider(
    <MindThreadCard
      thread={thread}
      forMode={forMode}
      onClick={mockOnClick}
      onDelete={mockOnDelete}
    />
  );

  return { user };
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
    expect(title.textContent).toBe("Test Thread");

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

  const handlesClickProperly = async (user: UserEvent) => {
    const container = screen.getByTestId(MindThreadCardTestId.container);
    await user.click(container);

    expect(mockOnClick).toHaveBeenCalledOnce();
    expect(mockOnClick).toHaveBeenCalledWith(mindThreadFixture);
  };

  const getActionsButton = () => {
    return screen.getByRole("button", {
      name: "Thread actions for Test Thread",
    });
  };

  const rendersActionsButton = () => {
    expect(getActionsButton()).toBeInTheDocument();
  };

  const doesNotTriggerCardClickOnActions = async (user: UserEvent) => {
    await user.click(getActionsButton());
    expect(mockOnClick).not.toHaveBeenCalled();
  };

  const handlesDeleteProperly = async (user: UserEvent) => {
    await user.click(getActionsButton());

    const menuItems = await screen.findAllByRole("menuitem");
    await user.click(menuItems[0]);

    expect(mockOnDelete).toHaveBeenCalledOnce();
    expect(mockOnDelete).toHaveBeenCalledWith(mindThreadFixture);

    expect(mockOnClick).not.toHaveBeenCalled();
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

    it("calls onClick with thread when clicked", async () => {
      const { user } = setup();
      await handlesClickProperly(user);
    });

    it("renders the thread actions button", () => {
      setup();
      rendersActionsButton();
    });

    it("does not call onClick when the actions button is clicked", async () => {
      const { user } = setup();
      await doesNotTriggerCardClickOnActions(user);
    });

    it("calls onDelete with the thread and not onClick when Delete is chosen", async () => {
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

    it("calls onClick with thread when clicked", async () => {
      const { user } = setup(mindThreadFixture, ThreadListMode.List);
      await handlesClickProperly(user);
    });

    it("renders the thread actions button", () => {
      setup(mindThreadFixture, ThreadListMode.List);
      rendersActionsButton();
    });

    it("does not call onClick when the actions button is clicked", async () => {
      const { user } = setup(mindThreadFixture, ThreadListMode.List);
      await doesNotTriggerCardClickOnActions(user);
    });

    it("calls onDelete with the thread and not onClick when Delete is chosen", async () => {
      const { user } = setup(mindThreadFixture, ThreadListMode.List);
      await handlesDeleteProperly(user);
    });
  });
});
