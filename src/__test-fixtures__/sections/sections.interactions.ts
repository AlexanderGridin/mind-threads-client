import { screen } from "@testing-library/react";
import type userEvent from "@testing-library/user-event";
import { DeleteConfirmationModalActionsTestId } from "@/components/shared/DeleteConfirmationModal/components/DeleteConfirmationModalActions/DeleteConfirmationModalActions.constants";
import { getSectionActionsLabel } from "@/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/SectionsColumn/components/SectionCard/components/SectionCardActions/SectionCardActions.utils";
import { SECTIONS_STORAGE_KEY } from "@/services/useThreadSectionsService/useThreadSectionsService.constants";
import type { ThreadSection } from "@/types";

type User = ReturnType<typeof userEvent.setup>;

type OpenSectionDeleteMenuParams = {
  user: User;
  sectionName: string;
  index?: number;
};

export const readStoredSections = (): ThreadSection[] => {
  return JSON.parse(localStorage.getItem(SECTIONS_STORAGE_KEY) ?? "[]");
};

export const openSectionDeleteMenu = async ({
  user,
  sectionName,
  index = 0,
}: OpenSectionDeleteMenuParams) => {
  const actionsButtons = await screen.findAllByRole("button", {
    name: getSectionActionsLabel(sectionName),
  });

  await user.click(actionsButtons[index]);

  const [deleteMenuItem] = await screen.findAllByRole("menuitem");
  await user.click(deleteMenuItem);
};

type SelectSectionCardParams = {
  user: User;
  sectionName: string;
};

export const selectSectionCard = async ({
  user,
  sectionName,
}: SelectSectionCardParams) => {
  const selectButton = await screen.findByRole("button", {
    name: sectionName,
  });

  await user.click(selectButton);
};

export const confirmSectionDelete = async (user: User) => {
  const confirmButton = screen.getByTestId(
    DeleteConfirmationModalActionsTestId.deleteButton
  );

  await user.click(confirmButton);
};
