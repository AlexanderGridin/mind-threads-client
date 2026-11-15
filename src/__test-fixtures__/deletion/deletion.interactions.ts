import { screen } from "@testing-library/react";
import type userEvent from "@testing-library/user-event";
import { DeleteConfirmationModalActionsTestId } from "@/components/shared/DeleteConfirmationModal/components/DeleteConfirmationModalActions/DeleteConfirmationModalActions.constants";

type User = ReturnType<typeof userEvent.setup>;

type OpenDeleteMenuParams = {
  user: User;
  actionsLabel: string;
  index?: number;
};

export const openDeleteMenu = async ({
  user,
  actionsLabel,
  index = 0,
}: OpenDeleteMenuParams) => {
  const actionsButtons = await screen.findAllByRole("button", {
    name: actionsLabel,
  });
  const actionsButton = actionsButtons[index];

  await user.click(actionsButton);

  const [deleteMenuItem] = await screen.findAllByRole("menuitem");
  await user.click(deleteMenuItem);
};

export const confirmDeletion = async (user: User) => {
  const confirmButton = screen.getByTestId(
    DeleteConfirmationModalActionsTestId.deleteButton
  );

  await user.click(confirmButton);
};
