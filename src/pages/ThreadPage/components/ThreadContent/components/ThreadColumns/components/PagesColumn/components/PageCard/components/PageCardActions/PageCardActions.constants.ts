import { initTestIdCreator } from "@/components/lib/utils";

const createTestId = initTestIdCreator("PageCardActions__");

export const PageCardActionsTestId = {
  menu: createTestId("menu"),
} as const;

export const DELETE_PAGE_MENU_ITEM = {
  value: "delete",
  label: "Delete",
} as const;
