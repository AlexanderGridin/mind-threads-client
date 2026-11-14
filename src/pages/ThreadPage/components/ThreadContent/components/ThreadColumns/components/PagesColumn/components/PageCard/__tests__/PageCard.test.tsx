import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { sectionPageFixtures } from "@/__test-fixtures__";
import {
  renderWithUIProvider,
  stubTextOverflow,
  waitForOpenDelay,
} from "@/components/lib/__test-fixtures__";
import { TruncatedTextTestId } from "@/components/lib/TruncatedText/TruncatedText.constants";
import { PageTypeIconTestId } from "@/pages/ThreadPage/components/PageTypeIcon/PageTypeIcon.constants";
import { PageCard } from "../PageCard";
import { PageCardTestId } from "../PageCard.constants";

const PAGE = sectionPageFixtures[0];

type SetupParams = {
  isLastCreated?: boolean;
  isOverflowing?: boolean;
};

const setup = ({
  isLastCreated = false,
  isOverflowing = false,
}: SetupParams = {}) => {
  stubTextOverflow({ isOverflowing });

  const user = userEvent.setup();

  renderWithUIProvider(<PageCard page={PAGE} isLastCreated={isLastCreated} />);

  return { user };
};

const getCard = () => {
  return screen.getByTestId(PageCardTestId.container);
};

const getName = () => {
  return screen.getByTestId(PageCardTestId.name);
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

    expect(name.textContent).toBe(PAGE.name);
    expect(card.firstElementChild).toBe(icon);
    expect(card).toHaveStyle({ borderLeftColor: PAGE.color });
  });

  it("has no button, so there is no actions menu and nothing to click", () => {
    setup();

    const card = getCard();
    const buttons = within(card).queryAllByRole("button");

    expect(buttons).toHaveLength(0);
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
