import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  LOCATION_MARKER_TEST_ID,
  renderWithRouter,
  threadSectionFixtures,
} from "@/__test-fixtures__";
import {
  stubTextOverflow,
  waitForOpenDelay,
} from "@/components/lib/__test-fixtures__";
import { TruncatedTextTestId } from "@/components/lib/TruncatedText/TruncatedText.constants";
import { SectionCard } from "../SectionCard";
import { SectionCardTestId } from "../SectionCard.constants";
import { getSectionActionsLabel } from "../components/SectionCardActions/SectionCardActions.utils";

const SECTION = threadSectionFixtures[0];

type SetupParams = {
  isLastCreated?: boolean;
  isOverflowing?: boolean;
  onDelete?: () => void;
};

const setup = ({
  isLastCreated = false,
  isOverflowing = false,
  onDelete = vi.fn(),
}: SetupParams = {}) => {
  stubTextOverflow({ isOverflowing });

  const user = userEvent.setup();

  renderWithRouter({
    ui: (
      <SectionCard
        section={SECTION}
        isLastCreated={isLastCreated}
        onDelete={onDelete}
      />
    ),
  });

  return { user };
};

const getCard = () => {
  return screen.getByTestId(SectionCardTestId.container);
};

const getName = () => {
  return screen.getByTestId(SectionCardTestId.name);
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("SectionCard", () => {
  it("renders the section name", () => {
    setup();

    const name = getName();
    expect(name.textContent).toBe(SECTION.name);
  });

  it("shows the section color as the left border", () => {
    setup();

    const card = getCard();
    expect(card).toHaveStyle({ borderLeftColor: SECTION.color });
  });

  it("scrolls itself into view with the nearest block when it is the last created section", () => {
    setup({ isLastCreated: true });

    const scrollIntoView = vi.mocked(Element.prototype.scrollIntoView);

    expect(scrollIntoView).toHaveBeenCalledOnce();

    const [scrollOptions] = scrollIntoView.mock.calls[0];
    expect(scrollOptions).toStrictEqual({ block: "nearest" });
  });

  it("does not scroll itself into view when it is not the last created section", () => {
    setup({ isLastCreated: false });

    const scrollIntoView = vi.mocked(Element.prototype.scrollIntoView);
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it("does nothing on click: no navigation and no modal", async () => {
    const { user } = setup();

    const card = getCard();
    await user.click(card);

    const locationMarker = screen.queryByTestId(LOCATION_MARKER_TEST_ID);
    expect(locationMarker).not.toBeInTheDocument();

    const dialog = screen.queryByRole("dialog");
    expect(dialog).not.toBeInTheDocument();
  });

  it("shows the full name in a tooltip when the name is cut off", async () => {
    const { user } = setup({ isOverflowing: true });

    const name = getName();
    await user.hover(name);

    const tooltip = await screen.findByTestId(TruncatedTextTestId.tooltip);
    expect(tooltip.textContent).toBe(SECTION.name);
  });

  it("shows no tooltip when the name fits, even after the open delay", async () => {
    const { user } = setup({ isOverflowing: false });

    const name = getName();
    await user.hover(name);
    await waitForOpenDelay();

    const tooltip = screen.queryByTestId(TruncatedTextTestId.tooltip);
    expect(tooltip).not.toBeInTheDocument();
  });

  it("shows the section actions button inside the card", () => {
    setup();

    const card = getCard();

    const actionsButton = within(card).getByRole("button", {
      name: getSectionActionsLabel(SECTION.name),
    });

    expect(actionsButton).toBeInTheDocument();
    expect(actionsButton).toBeEnabled();
  });

  it("lays the card out as a flex row and truncates the name with an ellipsis", () => {
    setup();

    const card = getCard();
    const name = getName();

    expect(card).toHaveStyle({ display: "flex" });
    expect(name).toHaveStyle({ textOverflow: "ellipsis" });
  });
});
