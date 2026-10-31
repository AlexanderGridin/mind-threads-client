import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithUIProvider } from "@/components/lib";
import { mindThreadFixture } from "@/__test-fixtures__";
import { ThreadListMode } from "@/pages/DashboardPage/DashboardPage.constants";
import { CardActions } from "../CardActions";

const ACTIONS_LABEL = `Thread actions for ${mindThreadFixture.title}`;
const EDIT_ITEM_LABEL = "Edit";
const DELETE_ITEM_LABEL = "Delete";

const setup = () => {
  const user = userEvent.setup();
  const onParentClick = vi.fn();
  const onEdit = vi.fn();
  const onDelete = vi.fn();

  renderWithUIProvider(
    <div onClick={onParentClick}>
      <CardActions
        thread={mindThreadFixture}
        forMode={ThreadListMode.Grid}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );

  return { user, onParentClick, onEdit, onDelete };
};

const getActionsButton = () => {
  return screen.getByRole("button", { name: ACTIONS_LABEL });
};

const openMenu = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(getActionsButton());
  return screen.findAllByRole("menuitem");
};

describe("CardActions", () => {
  it("labels the actions button with the thread title", () => {
    setup();

    const actionsButton = getActionsButton();
    expect(actionsButton).toBeInTheDocument();
  });

  it("shows exactly the Edit and Delete items, in that order, when the menu is opened", async () => {
    const { user } = setup();

    const menuItems = await openMenu(user);
    const currentItems = menuItems.map((menuItem) => menuItem.textContent);

    expect(currentItems).toStrictEqual([EDIT_ITEM_LABEL, DELETE_ITEM_LABEL]);
  });

  it("does not call the parent's onClick when the actions button or Delete is clicked", async () => {
    const { user, onParentClick } = setup();

    const [, deleteMenuItem] = await openMenu(user);

    expect(onParentClick).not.toHaveBeenCalled();

    await user.click(deleteMenuItem);

    expect(onParentClick).not.toHaveBeenCalled();
  });

  it("calls onDelete with the thread and closes the menu when Delete is clicked", async () => {
    const { user, onDelete } = setup();

    const [, deleteMenuItem] = await openMenu(user);

    await user.click(deleteMenuItem);

    expect(onDelete).toHaveBeenCalledOnce();
    expect(onDelete).toHaveBeenCalledWith(mindThreadFixture);

    await waitFor(() =>
      expect(screen.queryAllByRole("menuitem")).toHaveLength(0)
    );
  });

  it("calls onEdit with the thread, not onDelete or the parent's onClick, and closes the menu when Edit is clicked", async () => {
    const { user, onParentClick, onEdit, onDelete } = setup();

    const [editMenuItem] = await openMenu(user);

    await user.click(editMenuItem);

    expect(onEdit).toHaveBeenCalledOnce();
    expect(onEdit).toHaveBeenCalledWith(mindThreadFixture);
    expect(onDelete).not.toHaveBeenCalled();
    expect(onParentClick).not.toHaveBeenCalled();

    await waitFor(() =>
      expect(screen.queryAllByRole("menuitem")).toHaveLength(0)
    );
  });

  it("moves the highlight between Edit and Delete with the Down and Up arrows after opening with the keyboard", async () => {
    const { user } = setup();

    await user.tab();
    await user.keyboard("{Enter}");

    const [editMenuItem, deleteMenuItem] =
      await screen.findAllByRole("menuitem");
    const menu = screen.getByRole("menu");

    // Zag keeps DOM focus on the menu and marks the highlighted item with aria-activedescendant.
    await waitFor(() =>
      expect(menu).toHaveAttribute("aria-activedescendant", editMenuItem.id)
    );

    await user.keyboard("{ArrowDown}");
    expect(menu).toHaveAttribute("aria-activedescendant", deleteMenuItem.id);

    await user.keyboard("{ArrowUp}");
    expect(menu).toHaveAttribute("aria-activedescendant", editMenuItem.id);
  });
});
