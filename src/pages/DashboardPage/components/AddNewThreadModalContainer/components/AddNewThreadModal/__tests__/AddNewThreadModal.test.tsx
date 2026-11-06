import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithUIProvider } from "@/components/lib/__test-fixtures__";
import { NORD_AURORA_SWATCHES } from "@/components/lib/ColorPicker/ColorPicker.constants";
import { AddNewThreadModal } from "../AddNewThreadModal";
import { ThreadFormTestId } from "@/components/shared/ThreadForm/ThreadForm.constants";
import { ThreadFormModalActionsTestId } from "@/components/shared/ThreadFormModalActions/ThreadFormModalActions.constants";
import { vi } from "vitest";
import { ADD_NEW_THREAD_MODAL_TITLE } from "../AddNewThreadModal.constants";

const mockDefaultColor = NORD_AURORA_SWATCHES[3];
const mockSubmit = vi.fn();
const mockClose = vi.fn();

const setup = () => {
  const user = userEvent.setup();

  const renderResult = renderWithUIProvider(
    <AddNewThreadModal onClose={mockClose} onSubmit={mockSubmit} />
  );

  return { user, renderResult };
};

describe("AddNewThreadModal", () => {
  it("renders properly", () => {
    setup();

    expect(screen.getByText(ADD_NEW_THREAD_MODAL_TITLE)).toBeInTheDocument();
    expect(screen.getByTestId(ThreadFormTestId.form)).toBeInTheDocument();
  });

  it("calls onSubmit with form value when typing title and clicking Add", async () => {
    const { user } = setup();

    const titleInput = screen.getByTestId(ThreadFormTestId.titleInput);
    await user.type(titleInput, "My New Thread");

    const addButton = screen.getByTestId(
      ThreadFormModalActionsTestId.submitButton
    );

    await user.click(addButton);

    expect(mockSubmit).toHaveBeenCalledWith({
      title: "My New Thread",
      color: mockDefaultColor,
    });
  });

  it("disables Add when the title contains only spaces", async () => {
    const { user } = setup();

    const titleInput = screen.getByTestId(ThreadFormTestId.titleInput);
    await user.type(titleInput, "   ");

    expect(
      screen.getByTestId(ThreadFormModalActionsTestId.submitButton)
    ).toBeDisabled();
  });

  it("enables Add when the title has text surrounded by spaces", async () => {
    const { user } = setup();

    const titleInput = screen.getByTestId(ThreadFormTestId.titleInput);
    await user.type(titleInput, "  a  ");

    expect(
      screen.getByTestId(ThreadFormModalActionsTestId.submitButton)
    ).toBeEnabled();
  });

  it("calls onClose when Cancel button is clicked", async () => {
    const { user } = setup();

    const cancelButton = screen.getByTestId(
      ThreadFormModalActionsTestId.cancelButton
    );

    await user.click(cancelButton);

    expect(mockClose).toHaveBeenCalledOnce();
  });
});
