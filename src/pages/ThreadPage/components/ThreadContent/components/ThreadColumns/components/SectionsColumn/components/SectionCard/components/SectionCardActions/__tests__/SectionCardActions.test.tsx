import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithUIProvider } from "@/components/lib/__test-fixtures__";
import { threadSectionFixtures } from "@/__test-fixtures__";
import type { ThreadSection } from "@/types";
import { SectionCardActions } from "../SectionCardActions";
import { DELETE_SECTION_MENU_ITEM } from "../SectionCardActions.constants";
import { getSectionActionsLabel } from "../SectionCardActions.utils";

const SECTION: ThreadSection = threadSectionFixtures[1];

const setup = () => {
  const user = userEvent.setup();
  const onDelete = vi.fn();

  renderWithUIProvider(
    <SectionCardActions section={SECTION} onDelete={onDelete} />
  );

  return { user, onDelete };
};

const getActionsButton = () => {
  return screen.getByRole("button", {
    name: getSectionActionsLabel(SECTION.name),
  });
};

const openMenu = async (user: ReturnType<typeof userEvent.setup>) => {
  const actionsButton = getActionsButton();
  await user.click(actionsButton);

  return screen.findAllByRole("menuitem");
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("SectionCardActions", () => {
  it("labels the actions button with the section name", () => {
    setup();

    const actionsButton = getActionsButton();
    expect(actionsButton).toBeInTheDocument();
  });

  it("shows exactly one red Delete item when the menu is opened", async () => {
    const { user } = setup();

    const menuItems = await openMenu(user);

    expect(menuItems).toHaveLength(1);

    const [deleteMenuItem] = menuItems;
    expect(deleteMenuItem.textContent).toBe(DELETE_SECTION_MENU_ITEM.label);
    expect(getComputedStyle(deleteMenuItem).color).toMatch(/red/);
  });

  it("calls onDelete with the section when Delete is selected", async () => {
    const { user, onDelete } = setup();

    const [deleteMenuItem] = await openMenu(user);
    await user.click(deleteMenuItem);

    expect(onDelete).toHaveBeenCalledOnce();
    expect(onDelete).toHaveBeenCalledWith(SECTION);
  });
});
