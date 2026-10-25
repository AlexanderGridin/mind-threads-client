import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent, {
  PointerEventsCheckLevel,
} from "@testing-library/user-event";

import { Menu } from "../Menu";
import type { MenuItem, MenuProps } from "../Menu.types";
import { renderWithUIProvider } from "../../utils";

const TRIGGER_LABEL = "Thread actions";
const TRIGGER_ICON = <span>⋮</span>;
const FIRST_ITEM_LABEL = "First item";
const SECOND_ITEM_LABEL = "Second item";
const OUTSIDE_POINTER_POSITION = 10_000;

// Zag attaches its dismiss listeners (Escape and outside interaction) asynchronously,
// after the menu opens. A short tick is not enough in jsdom, so wait longer.
const waitForDismissListeners = async () => {
  const promise = new Promise((resolve) => setTimeout(resolve, 100));
  await promise;
};

const setup = ({
  pointerEventsCheck = PointerEventsCheckLevel.EachApiCall,
}: { pointerEventsCheck?: PointerEventsCheckLevel } = {}) => {
  const user = userEvent.setup({ pointerEventsCheck });
  const onSelectFirst = vi.fn();
  const onSelectSecond = vi.fn();

  const items: MenuItem[] = [
    { value: "first", label: FIRST_ITEM_LABEL, onSelect: onSelectFirst },
    {
      value: "second",
      label: SECOND_ITEM_LABEL,
      color: "red",
      onSelect: onSelectSecond,
    },
  ];

  const menuProps: MenuProps = {
    triggerLabel: TRIGGER_LABEL,
    triggerIcon: TRIGGER_ICON,
    items,
  };

  renderWithUIProvider(<Menu {...menuProps} />);

  return { user, onSelectFirst, onSelectSecond };
};

const getTrigger = () => screen.getByRole("button", { name: TRIGGER_LABEL });

const openMenuWithClick = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(getTrigger());
  return screen.findAllByRole("menuitem");
};

describe("Menu", () => {
  it("renders a trigger button with the given accessible name and hides the items while closed", () => {
    setup();

    const trigger = getTrigger();
    expect(trigger).toBeInTheDocument();
    expect(trigger).toBeEnabled();

    expect(screen.queryAllByRole("menuitem")).toHaveLength(0);
  });

  it("shows the items in order when the trigger is clicked", async () => {
    const { user } = setup();

    const menuItems = await openMenuWithClick(user);
    const currentItems = menuItems.map((menuItem) => menuItem.textContent);

    expect(currentItems).toStrictEqual([FIRST_ITEM_LABEL, SECOND_ITEM_LABEL]);
  });

  it("opens the menu when Enter is pressed on the focused trigger", async () => {
    const { user } = setup();

    await user.tab();

    const trigger = getTrigger();
    expect(trigger).toHaveFocus();

    await user.keyboard("{Enter}");

    const menuItems = await screen.findAllByRole("menuitem");
    expect(menuItems).toHaveLength(2);
  });

  it("opens the menu when Space is pressed on the focused trigger", async () => {
    const { user } = setup();

    await user.tab();

    const trigger = getTrigger();
    expect(trigger).toHaveFocus();

    await user.keyboard(" ");

    const menuItems = await screen.findAllByRole("menuitem");
    expect(menuItems).toHaveLength(2);
  });

  it("moves the highlight between items with the Down and Up arrows after opening with the keyboard", async () => {
    const { user } = setup();

    await user.tab();
    await user.keyboard("{Enter}");

    const [firstItem, secondItem] = await screen.findAllByRole("menuitem");
    const menu = screen.getByRole("menu");

    // Zag keeps DOM focus on the menu and marks the highlighted item with aria-activedescendant.
    await waitFor(() =>
      expect(menu).toHaveAttribute("aria-activedescendant", firstItem.id)
    );

    await user.keyboard("{ArrowDown}");
    expect(menu).toHaveAttribute("aria-activedescendant", secondItem.id);

    await user.keyboard("{ArrowUp}");
    expect(menu).toHaveAttribute("aria-activedescendant", firstItem.id);
  });

  it("calls only the selected item's onSelect and closes the menu", async () => {
    const { user, onSelectFirst, onSelectSecond } = setup();

    const menuItems = await openMenuWithClick(user);

    await user.click(menuItems[1]);

    expect(onSelectSecond).toHaveBeenCalledOnce();
    expect(onSelectFirst).not.toHaveBeenCalled();

    await waitFor(() =>
      expect(screen.queryAllByRole("menuitem")).toHaveLength(0)
    );
  });

  it("closes the menu when Escape is pressed", async () => {
    const { user } = setup();

    await openMenuWithClick(user);

    await waitForDismissListeners();
    await user.keyboard("{Escape}");

    await waitFor(() =>
      expect(screen.queryAllByRole("menuitem")).toHaveLength(0)
    );
  });

  it("closes the menu when the user clicks outside", async () => {
    const { user } = setup({
      pointerEventsCheck: PointerEventsCheckLevel.Never,
    });

    await openMenuWithClick(user);

    await waitForDismissListeners();

    await user.pointer({
      keys: "[MouseLeft]",
      target: document.body,
      coords: {
        clientX: OUTSIDE_POINTER_POSITION,
        clientY: OUTSIDE_POINTER_POSITION,
      },
    });

    await waitFor(() =>
      expect(screen.queryAllByRole("menuitem")).toHaveLength(0)
    );
  });
});
