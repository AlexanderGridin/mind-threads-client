import { describe, it, expect, vi } from "vitest";
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
import { DeleteThreadModal } from "../DeleteThreadModal";
import { DELETE_THREAD_MODAL_TITLE } from "../DeleteThreadModal.constants";
import { DeleteConfirmationModalActionsTestId } from "@/components/shared/DeleteConfirmationModal/components/DeleteConfirmationModalActions/DeleteConfirmationModalActions.constants";
import { getDeleteThreadModalText } from "../DeleteThreadModal.utils";
import type { DeleteThreadModalProps } from "../DeleteThreadModal.types";

const THREAD_TITLE = "Testing Strategy";

const setup = ({
  threadTitle = THREAD_TITLE,
  isDeleting = false,
  onClose = vi.fn(),
  onDelete = vi.fn(),
  pointerEventsCheck = PointerEventsCheckLevel.EachApiCall,
}: Partial<DeleteThreadModalProps> & {
  pointerEventsCheck?: PointerEventsCheckLevel;
} = {}) => {
  const user = userEvent.setup({ pointerEventsCheck });

  renderWithUIProvider(
    <DeleteThreadModal
      threadTitle={threadTitle}
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

describe("DeleteThreadModal", () => {
  it("shows the title and the confirmation text for the thread", () => {
    setup();

    const title = screen.getByText(DELETE_THREAD_MODAL_TITLE);
    expect(title).toBeInTheDocument();

    const text = screen.getByText(getDeleteThreadModalText(THREAD_TITLE));
    expect(text).toBeInTheDocument();
  });

  it("focuses the Cancel button after open", async () => {
    stubLayout();
    setup();

    const cancelButton = getCancelButton();

    await waitFor(() => expect(cancelButton).toHaveFocus());
  });

  describe("when not deleting", () => {
    it("calls onClose when Cancel is clicked", async () => {
      const { user, onClose } = setup({ isDeleting: false });

      await user.click(getCancelButton());

      expect(onClose).toHaveBeenCalledOnce();
    });

    it("calls onClose when Escape is pressed", async () => {
      const { user, onClose } = setup({ isDeleting: false });

      await waitForDismissListeners();
      await user.keyboard("{Escape}");

      expect(onClose).toHaveBeenCalledOnce();
    });

    it("calls onClose when the close button is clicked", async () => {
      const { user, onClose } = setup({ isDeleting: false });

      const closeButton = getCloseButton();
      await user.click(closeButton);

      expect(onClose).toHaveBeenCalledOnce();
    });

    it("calls onClose when the user clicks outside the modal", async () => {
      const { user, onClose } = setup({
        isDeleting: false,
        pointerEventsCheck: PointerEventsCheckLevel.Never,
      });

      await clickOutside(user);

      await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
    });
  });

  describe("when deleting", () => {
    it("disables Cancel and Delete", () => {
      setup({ isDeleting: true });

      expect(getCancelButton()).toBeDisabled();
      expect(getDeleteButton()).toBeDisabled();
    });

    it("disables the close button", () => {
      setup({ isDeleting: true });

      expect(getCloseButton()).toBeDisabled();
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
