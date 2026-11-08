import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithUIProvider } from "@/components/lib/__test-fixtures__";
import { ThreadFormModalActions } from "../ThreadFormModalActions";
import {
  CANCEL_BUTTON_LABEL,
  ThreadFormModalActionsTestId,
} from "../ThreadFormModalActions.constants";
import { vi } from "vitest";
import type { FormEvent } from "react";

const SUBMIT_LABEL = "Add";
const FORM_ID = "test-form";

const mockOnSubmit = vi.fn();
const mockOnCancel = vi.fn();
const mockOnFormSubmit = vi.fn((event: FormEvent) => {
  event.preventDefault();
});

const setup = ({
  submitDisabled = false,
  isSubmitting = false,
  formId,
}: {
  submitDisabled?: boolean;
  isSubmitting?: boolean;
  formId?: string;
} = {}) => {
  const user = userEvent.setup();

  const actionsProps = {
    submitLabel: SUBMIT_LABEL,
    submitDisabled,
    isSubmitting,
    onCancel: mockOnCancel,
  };

  renderWithUIProvider(
    formId ? (
      <>
        <form id={formId} onSubmit={mockOnFormSubmit} />
        <ThreadFormModalActions {...actionsProps} formId={formId} />
      </>
    ) : (
      <ThreadFormModalActions {...actionsProps} onSubmit={mockOnSubmit} />
    )
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

  it("renders the submit button as type button when no formId is given", () => {
    setup();

    const submitButton = screen.getByTestId(
      ThreadFormModalActionsTestId.submitButton
    );

    expect(submitButton).toHaveAttribute("type", "button");
  });

  describe("with formId", () => {
    it("renders the submit button as type submit attached to the form", () => {
      setup({ formId: FORM_ID });

      const submitButton = screen.getByTestId(
        ThreadFormModalActionsTestId.submitButton
      ) as HTMLButtonElement;

      const form = document.getElementById(FORM_ID);

      expect(submitButton.type).toBe("submit");
      expect(submitButton.form).toBe(form);
    });

    it("submits the form when the submit button is clicked", async () => {
      const { user } = setup({ formId: FORM_ID });

      const submitButton = screen.getByTestId(
        ThreadFormModalActionsTestId.submitButton
      );

      await user.click(submitButton);

      expect(mockOnFormSubmit).toHaveBeenCalledOnce();
    });

    it("does not submit the form when the submit button is disabled", async () => {
      const { user } = setup({ formId: FORM_ID, submitDisabled: true });

      const submitButton = screen.getByTestId(
        ThreadFormModalActionsTestId.submitButton
      );

      expect(submitButton).toBeDisabled();

      await user.click(submitButton);

      expect(mockOnFormSubmit).not.toHaveBeenCalled();
    });

    it("does not submit the form when clicked while submitting", async () => {
      const { user } = setup({ formId: FORM_ID, isSubmitting: true });

      const submitButton = screen.getByTestId(
        ThreadFormModalActionsTestId.submitButton
      );

      expect(submitButton).toBeDisabled();

      await user.click(submitButton);

      expect(mockOnFormSubmit).not.toHaveBeenCalled();
    });
  });
});
