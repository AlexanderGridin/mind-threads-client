import { describe, it, expect, vi } from "vitest";
import { createRef, type ComponentProps } from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithUIProvider } from "@/components/lib/__test-fixtures__";
import { DeleteConfirmationModalActions } from "../DeleteConfirmationModalActions";
import { DeleteConfirmationModalActionsTestId } from "../DeleteConfirmationModalActions.constants";

const setup = ({
  isDeleting = false,
  cancelButtonRef = createRef<HTMLButtonElement>(),
  onDelete = vi.fn(),
  onCancel = vi.fn(),
}: Partial<ComponentProps<typeof DeleteConfirmationModalActions>> = {}) => {
  const user = userEvent.setup();

  renderWithUIProvider(
    <DeleteConfirmationModalActions
      isDeleting={isDeleting}
      cancelButtonRef={cancelButtonRef}
      onDelete={onDelete}
      onCancel={onCancel}
    />
  );

  return { user, cancelButtonRef, onDelete, onCancel };
};

const getCancelButton = () => {
  return screen.getByTestId(DeleteConfirmationModalActionsTestId.cancelButton);
};

const getDeleteButton = () => {
  return screen.getByTestId(DeleteConfirmationModalActionsTestId.deleteButton);
};

describe("DeleteConfirmationModalActions", () => {
  it("renders the Cancel and Delete buttons", () => {
    setup();

    const cancelButton = getCancelButton();
    const deleteButton = getDeleteButton();

    expect(cancelButton.textContent).toBe("Cancel");
    expect(deleteButton.textContent).toBe("Delete");
  });

  it("calls onDelete when the Delete button is clicked", async () => {
    const { user, onDelete, onCancel } = setup();

    const deleteButton = getDeleteButton();
    await user.click(deleteButton);

    expect(onDelete).toHaveBeenCalledOnce();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it("calls onCancel when the Cancel button is clicked", async () => {
    const { user, onDelete, onCancel } = setup();

    const cancelButton = getCancelButton();
    await user.click(cancelButton);

    expect(onCancel).toHaveBeenCalledOnce();
    expect(onDelete).not.toHaveBeenCalled();
  });

  it("disables both buttons and shows the loading indicator on Delete while deleting", () => {
    setup({ isDeleting: true });

    const cancelButton = getCancelButton();
    const deleteButton = getDeleteButton();

    expect(cancelButton).toBeDisabled();
    expect(deleteButton).toBeDisabled();

    expect(deleteButton).toHaveAttribute("data-loading");
  });

  it("does not call the handlers when clicked while deleting", async () => {
    const { user, onDelete, onCancel } = setup({ isDeleting: true });

    const cancelButton = getCancelButton();
    const deleteButton = getDeleteButton();

    await user.click(cancelButton);
    await user.click(deleteButton);

    expect(onCancel).not.toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();
  });

  it("enables both buttons and hides the loading indicator when not deleting", () => {
    setup({ isDeleting: false });

    const cancelButton = getCancelButton();
    const deleteButton = getDeleteButton();

    expect(cancelButton).toBeEnabled();
    expect(deleteButton).toBeEnabled();

    expect(deleteButton).not.toHaveAttribute("data-loading");
  });

  it("points cancelButtonRef at the Cancel button", () => {
    const { cancelButtonRef } = setup();

    const cancelButton = getCancelButton();
    expect(cancelButtonRef.current).toBe(cancelButton);
  });
});
