import { screen } from "@testing-library/react";
import type userEvent from "@testing-library/user-event";
import { getSectionActionsLabel } from "@/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/SectionsColumn/components/SectionCard/components/SectionCardActions/SectionCardActions.utils";
import { SECTIONS_STORAGE_KEY } from "@/services/useThreadSectionsService/useThreadSectionsService.constants";
import type { ThreadSection } from "@/types";
import { openDeleteMenu } from "../deletion";

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
  await openDeleteMenu({
    user,
    actionsLabel: getSectionActionsLabel(sectionName),
    index,
  });
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
