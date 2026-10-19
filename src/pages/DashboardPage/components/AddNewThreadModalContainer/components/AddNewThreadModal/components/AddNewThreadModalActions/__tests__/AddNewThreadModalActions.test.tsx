import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithUIProvider } from "@/components/lib";
import { AddNewThreadModalActions } from "../AddNewThreadModalActions";
import { AddNewThreadModalActionsTestId } from "../AddNewThreadModalActions.constants";
import { vi } from "vitest";

const mockAdd = vi.fn();
const mockCancel = vi.fn();

const setup = () => {
  const user = userEvent.setup();

  renderWithUIProvider(
    <AddNewThreadModalActions
      submitDisabled={false}
      onAdd={mockAdd}
      onCancel={mockCancel}
    />
  );

  return { user };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("AddNewThreadModalActions", () => {
  it("calls onAdd when Add button is clicked", async () => {
    const { user } = setup();

    const addButton = screen.getByTestId(
      AddNewThreadModalActionsTestId.addButton
    );

    expect(addButton.textContent).toBe("Add");

    await user.click(addButton);

    expect(mockAdd).toHaveBeenCalledOnce();
  });

  it("calls onCancel when Cancel button is clicked", async () => {
    const { user } = setup();

    const cancelButton = screen.getByTestId(
      AddNewThreadModalActionsTestId.cancelButton
    );

    expect(cancelButton.textContent).toBe("Cancel");

    await user.click(cancelButton);

    expect(mockCancel).toHaveBeenCalledOnce();
  });
});
