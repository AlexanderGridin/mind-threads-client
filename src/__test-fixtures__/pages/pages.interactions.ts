import { screen } from "@testing-library/react";
import type userEvent from "@testing-library/user-event";
import { ThreadColumnsTestId } from "@/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/ThreadColumns.constants";
import { ADD_PAGE_MODAL_TITLE } from "@/pages/ThreadPage/components/AddPageModalContainer/components/AddPageModal/AddPageModal.constants";
import { getPageActionsLabel } from "@/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/PagesColumn/components/PageCard/components/PageCardActions/PageCardActions.utils";
import { openDeleteMenu } from "../deletion";

type User = ReturnType<typeof userEvent.setup>;

type OpenPageDeleteMenuParams = {
  user: User;
  pageName: string;
  index?: number;
};

export const openAddPageModal = async (user: User) => {
  const addPageButton = screen.getByTestId(ThreadColumnsTestId.addPageButton);
  await user.click(addPageButton);

  return screen.findByText(ADD_PAGE_MODAL_TITLE);
};

export const openPageDeleteMenu = async ({
  user,
  pageName,
  index = 0,
}: OpenPageDeleteMenuParams) => {
  await openDeleteMenu({
    user,
    actionsLabel: getPageActionsLabel(pageName),
    index,
  });
};
