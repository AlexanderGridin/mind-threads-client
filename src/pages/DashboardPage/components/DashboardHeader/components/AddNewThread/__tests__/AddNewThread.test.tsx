import { afterEach, describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithUIProvider } from "@/components/lib/__test-fixtures__";
import { MALFORMED_JSON } from "@/__test-fixtures__";
import { DashboardPageLoader } from "@/pages/DashboardPage/components/DashboardPageLoader";
import { AddNewThreadModalContainer } from "@/pages/DashboardPage/components/AddNewThreadModalContainer";
import { ADD_NEW_THREAD_MODAL_TITLE } from "@/pages/DashboardPage/components/AddNewThreadModalContainer/components/AddNewThreadModal/AddNewThreadModal.constants";
import { THREADS_STORAGE_KEY } from "@/services/useThreadsService/useThreadsService.constants";
import { AddNewThread } from "../AddNewThread";
import { AddNewThreadTestId } from "../AddNewThread.constants";

const setup = () => {
  const user = userEvent.setup();

  renderWithUIProvider(
    <DashboardPageLoader>
      <AddNewThread />
      <AddNewThreadModalContainer />
    </DashboardPageLoader>
  );

  return { user };
};

const findOpenModalButton = () => {
  return screen.findByTestId(AddNewThreadTestId.openModalButton);
};

describe("AddNewThread", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("enables the button after the threads are loaded", async () => {
    setup();

    const button = await findOpenModalButton();

    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
    expect(button).toHaveAccessibleName("+ New Thread");
    expect(button.textContent).toBe("+ New Thread");
  });

  it("opens the modal when the button is clicked", async () => {
    const { user } = setup();

    const button = await findOpenModalButton();

    let modalTitle = screen.queryByText(ADD_NEW_THREAD_MODAL_TITLE);
    expect(modalTitle).not.toBeInTheDocument();

    await user.click(button);

    modalTitle = await screen.findByText(ADD_NEW_THREAD_MODAL_TITLE);
    expect(modalTitle).toBeInTheDocument();
  });

  it("disables the button when the stored threads are malformed", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    localStorage.setItem(THREADS_STORAGE_KEY, MALFORMED_JSON);

    setup();

    const button = await findOpenModalButton();
    expect(button).toBeDisabled();

    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
