import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithUIProvider } from "@/components/lib";
import { ThreadFormModalActions } from "../ThreadFormModalActions";
import {
  CANCEL_BUTTON_LABEL,
  ThreadFormModalActionsTestId,
} from "../ThreadFormModalActions.constants";
import { vi } from "vitest";

const SUBMIT_LABEL = "Add";

const mockOnSubmit = vi.fn();
const mockOnCancel = vi.fn();

const setup = ({
  submitDisabled = false,
  isSubmitting = false,
}: {
  submitDisabled?: boolean;
  isSubmitting?: boolean;
} = {}) => {
  const user = userEvent.setup();

  renderWithUIProvider(
    <ThreadFormModalActions
      submitLabel={SUBMIT_LABEL}
      submitDisabled={submitDisabled}
      isSubmitting={isSubmitting}
      onSubmit={mockOnSubmit}
      onCancel={mockOnCancel}
    />
  );

  return { user };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ThreadFormModalActions", () => {
  it("shows the Cancel button and the submit label", () => {
    setup();

    const cancelButton = screen.getByTestId(
      ThreadFormModalActionsTestId.cancelButton
    );
    expect(cancelButton.textContent).toBe(CANCEL_BUTTON_LABEL);

    const submitButton = screen.getByTestId(
      ThreadFormModalActionsTestId.submitButton
    );
    expect(submitButton.textContent).toBe(SUBMIT_LABEL);
  });

  it("calls onCancel when Cancel button is clicked", async () => {
    const { user } = setup();

    const cancelButton = screen.getByTestId(
      ThreadFormModalActionsTestId.cancelButton
    );

    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledOnce();
  });

  it("calls onSubmit when submit button is clicked", async () => {
    const { user } = setup();

    const submitButton = screen.getByTestId(
      ThreadFormModalActionsTestId.submitButton
    );

    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledOnce();
  });

  it("disables only the submit button when submitDisabled is true", () => {
    setup({ submitDisabled: true });

    const cancelButton = screen.getByTestId(
      ThreadFormModalActionsTestId.cancelButton
    );
    expect(cancelButton).toBeEnabled();

    const submitButton = screen.getByTestId(
      ThreadFormModalActionsTestId.submitButton
    );
    expect(submitButton).toBeDisabled();
  });

  it("disables both buttons and shows the loading indicator on submit while submitting", () => {
    setup({ isSubmitting: true });

    const cancelButton = screen.getByTestId(
      ThreadFormModalActionsTestId.cancelButton
    );
    expect(cancelButton).toBeDisabled();

    const submitButton = screen.getByTestId(
      ThreadFormModalActionsTestId.submitButton
    );
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveAttribute("data-loading");
  });

  it("does not call the handlers when clicked while submitting", async () => {
    const { user } = setup({ isSubmitting: true });

    const cancelButton = screen.getByTestId(
      ThreadFormModalActionsTestId.cancelButton
    );
    const submitButton = screen.getByTestId(
      ThreadFormModalActionsTestId.submitButton
    );

    await user.click(cancelButton);
    await user.click(submitButton);

    expect(mockOnCancel).not.toHaveBeenCalled();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("enables both buttons and hides the loading indicator when not submitting", () => {
    setup();

    const cancelButton = screen.getByTestId(
      ThreadFormModalActionsTestId.cancelButton
    );
    expect(cancelButton).toBeEnabled();

    const submitButton = screen.getByTestId(
      ThreadFormModalActionsTestId.submitButton
    );
    expect(submitButton).toBeEnabled();
    expect(submitButton).not.toHaveAttribute("data-loading");
  });
});
