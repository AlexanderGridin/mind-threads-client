import { describe, it, expect } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithUIProvider } from "@/components/lib/__test-fixtures__";
import { DashboardPageLoader } from "@/pages/DashboardPage/components/DashboardPageLoader";
import { AddNewThreadModalContainer } from "@/pages/DashboardPage/components/AddNewThreadModalContainer";
import { ADD_NEW_THREAD_MODAL_TITLE } from "@/pages/DashboardPage/components/AddNewThreadModalContainer/components/AddNewThreadModal/AddNewThreadModal.constants";
import { EmptyThreadList } from "../EmptyThreadList";
import {
  EMPTY_THREAD_LIST_BUTTON_LABEL,
  EMPTY_THREAD_LIST_MESSAGE,
  EmptyThreadListTestId,
} from "../EmptyThreadList.constants";

const setup = () => {
  const user = userEvent.setup();

  renderWithUIProvider(
    <DashboardPageLoader>
      <EmptyThreadList />
      <AddNewThreadModalContainer />
    </DashboardPageLoader>
  );

  return { user };
};

describe("EmptyThreadList", () => {
  it("renders the exact message and the add button", async () => {
    setup();

    const message = await screen.findByTestId(EmptyThreadListTestId.message);

    expect(message).toBeInTheDocument();
    expect(message.textContent).toBe(EMPTY_THREAD_LIST_MESSAGE);

    const addButton = screen.getByTestId(EmptyThreadListTestId.addButton);
    expect(addButton).toBeInTheDocument();
    expect(addButton).toBeEnabled();
    expect(addButton.textContent).toBe(EMPTY_THREAD_LIST_BUTTON_LABEL);
  });

  it("opens the 'Add new thread' modal when the add button is clicked", async () => {
    const { user } = setup();

    const addButton = await screen.findByTestId(
      EmptyThreadListTestId.addButton
    );

    await user.click(addButton);

    const newThreadModal = await screen.findByRole("dialog");
    const modalTitle = within(newThreadModal).getByText(
      ADD_NEW_THREAD_MODAL_TITLE
    );

    expect(modalTitle).toBeInTheDocument();
  });
});
