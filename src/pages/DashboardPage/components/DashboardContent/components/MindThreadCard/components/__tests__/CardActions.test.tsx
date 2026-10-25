import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithUIProvider } from "@/components/lib";
import { mindThreadFixture } from "@/__test-fixtures__";
import { ThreadListMode } from "@/pages/DashboardPage/DashboardPage.constants";
import { CardActions } from "../CardActions";

const ACTIONS_LABEL = `Thread actions for ${mindThreadFixture.title}`;
const DELETE_ITEM_LABEL = "Delete";

const setup = () => {
  const user = userEvent.setup();
  const onParentClick = vi.fn();
  const onDelete = vi.fn();

  renderWithUIProvider(
    <div onClick={onParentClick}>
      <CardActions
        thread={mindThreadFixture}
        forMode={ThreadListMode.Grid}
        onDelete={onDelete}
      />
    </div>
  );

  return { user, onParentClick, onDelete };
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

  it("shows exactly one menu item, Delete, when the menu is opened", async () => {
    const { user } = setup();

    const menuItems = await openMenu(user);

    expect(menuItems).toHaveLength(1);
    expect(menuItems[0].textContent).toBe(DELETE_ITEM_LABEL);
  });

  it("does not call the parent's onClick when the actions button or Delete is clicked", async () => {
    const { user, onParentClick } = setup();

    const menuItems = await openMenu(user);

    expect(onParentClick).not.toHaveBeenCalled();

    await user.click(menuItems[0]);

    expect(onParentClick).not.toHaveBeenCalled();
  });

  it("calls onDelete with the thread and closes the menu when Delete is clicked", async () => {
    const { user, onDelete } = setup();

    const menuItems = await openMenu(user);

    await user.click(menuItems[0]);

    expect(onDelete).toHaveBeenCalledOnce();
    expect(onDelete).toHaveBeenCalledWith(mindThreadFixture);

    await waitFor(() =>
      expect(screen.queryAllByRole("menuitem")).toHaveLength(0)
    );
  });
});
