import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithUIProvider } from "@/components/lib";
import { AddNewThread } from "../AddNewThread";
import { AddNewThreadTestId } from "../AddNewThread.constants";
import { vi } from "vitest";
import { AddNewThreadModalActionsTestId } from "../components/AddNewThreadModal/components/AddNewThreadModalActions/AddNewThreadModalActions.constants";
import { ThreadFormTestId } from "../components/AddNewThreadModal/components/ThreadForm/ThreadForm.constants";

const setup = () => {
  const user = userEvent.setup();
  renderWithUIProvider(<AddNewThread />);
  return { user };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("AddNewThread", () => {
  it("renders the + New Thread button", () => {
    setup();

    const button = screen.getByTestId(AddNewThreadTestId.openModalButton);

    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
    expect(button).toHaveAccessibleName("+ New Thread");
    expect(button.textContent).toBe("+ New Thread");
  });

  it("opens the modal when button is clicked", async () => {
    const { user } = setup();

    expect(
      screen.queryByTestId(AddNewThreadModalActionsTestId.container)
    ).not.toBeInTheDocument();

    const button = screen.getByTestId(AddNewThreadTestId.openModalButton);
    await user.click(button);

    expect(
      screen.getByTestId(AddNewThreadModalActionsTestId.container)
    ).toBeInTheDocument();
  });

  it("closes the modal when Cancel is clicked", async () => {
    const { user } = setup();

    const button = screen.getByTestId(AddNewThreadTestId.openModalButton);
    await user.click(button);

    expect(
      screen.getByTestId(AddNewThreadModalActionsTestId.container)
    ).toBeInTheDocument();

    const cancelButton = screen.getByTestId(
      AddNewThreadModalActionsTestId.cancelButton
    );

    await user.click(cancelButton);

    expect(
      screen.queryByTestId(AddNewThreadModalActionsTestId.container)
    ).not.toBeInTheDocument();
  });

  it("logs form value and closes modal when Add is clicked", async () => {
    const { user } = setup();
    const logSpy = vi.spyOn(console, "log");

    const button = screen.getByTestId(AddNewThreadTestId.openModalButton);
    await user.click(button);

    const titleInput = screen.getByTestId(ThreadFormTestId.titleInput);
    await user.type(titleInput, "New Thread");

    const addButton = screen.getByTestId(
      AddNewThreadModalActionsTestId.addButton
    );

    await user.click(addButton);

    expect(logSpy).toHaveBeenCalledWith({
      title: "New Thread",
      color: "#a3be8c",
    });

    expect(
      screen.queryByTestId(AddNewThreadModalActionsTestId.container)
    ).not.toBeInTheDocument();

    logSpy.mockRestore();
  });
});
