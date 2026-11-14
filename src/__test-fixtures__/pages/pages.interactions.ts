import { screen } from "@testing-library/react";
import type userEvent from "@testing-library/user-event";
import { ThreadColumnsTestId } from "@/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/ThreadColumns.constants";
import { ADD_PAGE_MODAL_TITLE } from "@/pages/ThreadPage/components/AddPageModalContainer/components/AddPageModal/AddPageModal.constants";

type User = ReturnType<typeof userEvent.setup>;

export const openAddPageModal = async (user: User) => {
  const addPageButton = screen.getByTestId(ThreadColumnsTestId.addPageButton);
  await user.click(addPageButton);

  return screen.findByText(ADD_PAGE_MODAL_TITLE);
};
