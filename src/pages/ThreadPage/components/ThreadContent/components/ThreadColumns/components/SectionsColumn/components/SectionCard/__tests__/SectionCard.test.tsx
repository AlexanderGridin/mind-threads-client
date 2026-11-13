import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  LOCATION_MARKER_TEST_ID,
  openSectionDeleteMenu,
  renderWithRouter,
  threadSectionFixtures,
} from "@/__test-fixtures__";
import type { ThreadSection } from "@/types";
import {
  stubTextOverflow,
  waitForOpenDelay,
} from "@/components/lib/__test-fixtures__";
import { TruncatedTextTestId } from "@/components/lib/TruncatedText/TruncatedText.constants";
import { SectionCard } from "../SectionCard";
import { SectionCardTestId } from "../SectionCard.constants";
import { getSectionActionsLabel } from "../components/SectionCardActions/SectionCardActions.utils";

const SECTION = threadSectionFixtures[0];
const LIGHT_BACKGROUND_COLOR = "#ebcb8b";
const DARK_BACKGROUND_COLOR = "#2e3440";
const THEME_SCOPE_SELECTOR = ".chakra-theme";

type SetupParams = {
  section?: ThreadSection;
  isLastCreated?: boolean;
  isSelected?: boolean;
  isOverflowing?: boolean;
  onDelete?: () => void;
  onSelect?: (sectionId: string) => void;
};

const setup = ({
  section = SECTION,
  isLastCreated = false,
  isSelected = false,
  isOverflowing = false,
  onDelete = vi.fn(),
  onSelect = vi.fn(),
}: SetupParams = {}) => {
  stubTextOverflow({ isOverflowing });

  const user = userEvent.setup();

  renderWithRouter({
    ui: (
      <SectionCard
        section={section}
        isLastCreated={isLastCreated}
        isSelected={isSelected}
        onSelect={onSelect}
        onDelete={onDelete}
      />
    ),
  });

  return { user, onSelect };
};

const getSelectButton = () => {
  return screen.getByTestId(SectionCardTestId.selectButton);
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

  it("calls onSelect with the section id when the name is clicked", async () => {
    const { user, onSelect } = setup();

    const selectButton = getSelectButton();
    await user.click(selectButton);

    expect(onSelect).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledWith(SECTION.id);
  });

  it("does not call onSelect when the section is deleted from its actions menu", async () => {
    const { user, onSelect } = setup();

    await openSectionDeleteMenu({ user, sectionName: SECTION.name });

    expect(onSelect).not.toHaveBeenCalled();
  });

  it("is not selected, with no section color background and no forced color scope", () => {
    setup({ isSelected: false });

    const selectButton = getSelectButton();
    expect(selectButton).toHaveAttribute("aria-current", "false");

    const card = getCard();
    expect(card).not.toHaveStyle({ backgroundColor: SECTION.color });

    const name = getName();
    const themeScope = name.closest(THEME_SCOPE_SELECTOR);
    expect(themeScope).toBeNull();
  });

  it("is selected, with the section color as its background", () => {
    setup({ isSelected: true });

    const selectButton = getSelectButton();
    expect(selectButton).toHaveAttribute("aria-current", "true");

    const card = getCard();
    expect(card).toHaveStyle({ backgroundColor: SECTION.color });
  });

  it.each([
    ["light", LIGHT_BACKGROUND_COLOR],
    ["dark", DARK_BACKGROUND_COLOR],
  ])(
    "puts the name and actions button in the %s color scope for section color %s",
    (colorMode, sectionColor) => {
      setup({
        isSelected: true,
        section: { ...SECTION, color: sectionColor },
      });

      const name = getName();
      const nameScope = name.closest(THEME_SCOPE_SELECTOR);
      expect(nameScope).toHaveClass("chakra-theme", colorMode);

      const actionsButton = within(getCard()).getByRole("button", {
        name: getSectionActionsLabel(SECTION.name),
      });
      const actionsScope = actionsButton.closest(THEME_SCOPE_SELECTOR);
      expect(actionsScope).toHaveClass("chakra-theme", colorMode);
    }
  );
});
