import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { openPageDeleteMenu, sectionPageFixtures } from "@/__test-fixtures__";
import {
  renderWithUIProvider,
  stubTextOverflow,
  waitForOpenDelay,
} from "@/components/lib/__test-fixtures__";
import { TruncatedTextTestId } from "@/components/lib/TruncatedText/TruncatedText.constants";
import { PageTypeIconTestId } from "@/pages/ThreadPage/components/PageTypeIcon/PageTypeIcon.constants";
import { PageCard } from "../PageCard";
import { PageCardTestId } from "../PageCard.constants";
import { getPageActionsLabel } from "../components/PageCardActions/PageCardActions.utils";

const PAGE = sectionPageFixtures[0];

type SetupParams = {
  isLastCreated?: boolean;
  isSelected?: boolean;
  isOverflowing?: boolean;
};

const setup = ({
  isLastCreated = false,
  isSelected = false,
  isOverflowing = false,
}: SetupParams = {}) => {
  stubTextOverflow({ isOverflowing });

  const user = userEvent.setup();
  const onDelete = vi.fn();
  const onSelect = vi.fn();

  renderWithUIProvider(
    <PageCard
      page={PAGE}
      isLastCreated={isLastCreated}
      isSelected={isSelected}
      onSelect={onSelect}
      onDelete={onDelete}
    />
  );

  return { user, onSelect };
};

const getCard = () => {
  return screen.getByTestId(PageCardTestId.container);
};

const getName = () => {
  return screen.getByTestId(PageCardTestId.name);
};

const getSelectButton = () => {
  return screen.getByTestId(PageCardTestId.selectButton);
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("PageCard", () => {
  it("shows the name, with the chat icon before it and the page color as its left border", () => {
    setup();

    const card = getCard();
    const name = getName();
    const icon = screen.getByTestId(PageTypeIconTestId.chat);
    const nameRow = name.parentElement;

    expect(name.textContent).toBe(PAGE.name);
    expect(nameRow?.firstElementChild).toBe(icon);
    expect(card).toHaveStyle({ borderLeftColor: PAGE.color });
  });

  it("shows the select button and the actions button for the page", () => {
    setup();

    const card = getCard();
    const buttons = within(card).getAllByRole("button");
    const selectButton = getSelectButton();
    const actionsButton = within(card).getByRole("button", {
      name: getPageActionsLabel(PAGE.name),
    });

    expect(buttons).toHaveLength(2);
    expect(buttons).toContain(selectButton);
    expect(buttons).toContain(actionsButton);
  });

  it("calls onSelect with the page id when the name is clicked", async () => {
    const { user, onSelect } = setup();

    const selectButton = getSelectButton();
    await user.click(selectButton);

    expect(onSelect).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledWith(PAGE.id);
  });

  it("does not call onSelect when the page is deleted from its actions menu", async () => {
    const { user, onSelect } = setup();

    await openPageDeleteMenu({ user, pageName: PAGE.name });

    expect(onSelect).not.toHaveBeenCalled();
  });

  it("is not selected, with no page color background", () => {
    setup({ isSelected: false });

    const selectButton = getSelectButton();
    expect(selectButton).toHaveAttribute("aria-current", "false");

    const card = getCard();
    expect(card).not.toHaveStyle({ backgroundColor: PAGE.color });
  });

  it("is selected, with the page color as its background", () => {
    setup({ isSelected: true });

    const selectButton = getSelectButton();
    expect(selectButton).toHaveAttribute("aria-current", "true");

    const card = getCard();
    expect(card).toHaveStyle({ backgroundColor: PAGE.color });
  });

  it("lays the card out as a row with the name and the actions button at opposite ends", () => {
    setup();

    const card = getCard();

    expect(card).toHaveStyle({
      display: "flex",
      justifyContent: "space-between",
    });
  });

  it("scrolls itself into view with the nearest block when it is the last created page", () => {
    const scrollIntoView = vi.mocked(Element.prototype.scrollIntoView);

    setup({ isLastCreated: true });

    expect(scrollIntoView).toHaveBeenCalledOnce();

    const [scrollOptions] = scrollIntoView.mock.calls[0];
    expect(scrollOptions).toStrictEqual({ block: "nearest" });
  });

  it("does not scroll itself into view when it is not the last created page", () => {
    const scrollIntoView = vi.mocked(Element.prototype.scrollIntoView);

    setup({ isLastCreated: false });

    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it("truncates the name with an ellipsis on one line", () => {
    setup();

    const name = getName();
    expect(name).toHaveStyle({ textOverflow: "ellipsis" });
  });

  it("shows the full name in a tooltip when the name is cut off", async () => {
    const { user } = setup({ isOverflowing: true });

    const name = getName();
    await user.hover(name);

    const tooltip = await screen.findByTestId(TruncatedTextTestId.tooltip);
    expect(tooltip.textContent).toBe(PAGE.name);
  });

  it("shows no tooltip when the name fits, even after the open delay", async () => {
    const { user } = setup({ isOverflowing: false });

    const name = getName();
    await user.hover(name);

    await waitForOpenDelay();

    const tooltip = screen.queryByTestId(TruncatedTextTestId.tooltip);
    expect(tooltip).not.toBeInTheDocument();
  });
});
