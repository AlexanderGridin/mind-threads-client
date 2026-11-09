import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent, {
  PointerEventsCheckLevel,
} from "@testing-library/user-event";
import { renderWithUIProvider } from "@/components/lib/__test-fixtures__";
import {
  clickOutside,
  stubLayout,
  waitForDismissListeners,
} from "@/__test-fixtures__";
import { DeleteConfirmationModal } from "../DeleteConfirmationModal";
import { DeleteConfirmationModalActionsTestId } from "../components/DeleteConfirmationModalActions/DeleteConfirmationModalActions.constants";
import type { ComponentProps } from "react";

const TITLE = "Delete section?";
const MESSAGE = '"Research" and all its pages will be permanently deleted.';

const setup = ({
  isDeleting = false,
  onClose = vi.fn(),
  onDelete = vi.fn(),
  pointerEventsCheck = PointerEventsCheckLevel.EachApiCall,
}: Partial<ComponentProps<typeof DeleteConfirmationModal>> & {
  pointerEventsCheck?: PointerEventsCheckLevel;
} = {}) => {
  const user = userEvent.setup({ pointerEventsCheck });

  renderWithUIProvider(
    <DeleteConfirmationModal
      title={TITLE}
      message={MESSAGE}
      isDeleting={isDeleting}
      onClose={onClose}
      onDelete={onDelete}
    />
  );

  return { user, onClose, onDelete };
};

const getCloseButton = () => {
  return screen.getByRole("button", { name: "Close" });
};

const getCancelButton = () => {
  return screen.getByRole("button", { name: "Cancel" });
};

// While deleting, the loading spinner replaces the label, so the button is found by test id.
const getDeleteButton = () => {
  return screen.getByTestId(DeleteConfirmationModalActionsTestId.deleteButton);
};

describe("DeleteConfirmationModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the given title and message", () => {
    setup();

    const title = screen.getByText(TITLE);
    expect(title).toBeInTheDocument();

    const message = screen.getByText(MESSAGE);
    expect(message).toBeInTheDocument();
  });

  it("focuses the Cancel button when the modal opens", async () => {
    stubLayout();
    setup();

    const cancelButton = getCancelButton();

    await waitFor(() => {
      expect(cancelButton).toHaveFocus();
    });
  });

  describe("when not deleting", () => {
    it("calls onClose when Cancel is clicked", async () => {
      const { user, onClose } = setup();

      const cancelButton = getCancelButton();
      await user.click(cancelButton);

      expect(onClose).toHaveBeenCalledOnce();
    });

    it("calls onClose when Escape is pressed", async () => {
      const { user, onClose } = setup();

      await waitForDismissListeners();
      await user.keyboard("{Escape}");

      expect(onClose).toHaveBeenCalledOnce();
    });

    it("calls onClose when the close button is clicked", async () => {
      const { user, onClose } = setup();

      const closeButton = getCloseButton();
      await user.click(closeButton);

      expect(onClose).toHaveBeenCalledOnce();
    });

    it("calls onClose when the user clicks outside the modal", async () => {
      const { user, onClose } = setup({
        pointerEventsCheck: PointerEventsCheckLevel.Never,
      });

      await clickOutside(user);

      await waitFor(() => {
        expect(onClose).toHaveBeenCalledOnce();
      });
    });

    it("calls onDelete when Delete is clicked", async () => {
      const { user, onDelete, onClose } = setup();

      const deleteButton = getDeleteButton();
      await user.click(deleteButton);

      expect(onDelete).toHaveBeenCalledOnce();
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe("when deleting", () => {
    it("disables the close button, Cancel and Delete", () => {
      setup({ isDeleting: true });

      const closeButton = getCloseButton();
      const cancelButton = getCancelButton();
      const deleteButton = getDeleteButton();

      expect(closeButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
      expect(deleteButton).toBeDisabled();
    });

    it("shows the loading indicator on Delete", () => {
      setup({ isDeleting: true });

      const deleteButton = getDeleteButton();

      expect(deleteButton).toHaveAttribute("data-loading");
    });

    it("does not call onClose when Escape is pressed", async () => {
      const { user, onClose } = setup({ isDeleting: true });

      await waitForDismissListeners();
      await user.keyboard("{Escape}");

      expect(onClose).not.toHaveBeenCalled();
    });

    it("does not call onClose when the user clicks outside the modal", async () => {
      const { user, onClose } = setup({
        isDeleting: true,
        pointerEventsCheck: PointerEventsCheckLevel.Never,
      });

      await clickOutside(user);

      expect(onClose).not.toHaveBeenCalled();
    });
  });
});
