import { screen } from "@testing-library/react";
import { DeleteConfirmationModalActionsTestId } from "@/components/shared/DeleteConfirmationModal/components/DeleteConfirmationModalActions/DeleteConfirmationModalActions.constants";

export const getDeletionCancelButton = () => {
  return screen.getByTestId(DeleteConfirmationModalActionsTestId.cancelButton);
};

// While deleting, the loading spinner replaces the label, so the button is found by test id.
export const getDeletionDeleteButton = () => {
  return screen.getByTestId(DeleteConfirmationModalActionsTestId.deleteButton);
};

export const getDeletionCloseButton = () => {
  return screen.getByRole("button", { name: "Close" });
};
