import { initTestIdCreator } from "@/components/lib/utils";

const createTestId = initTestIdCreator("SectionCardActions__");

export const SectionCardActionsTestId = {
  menu: createTestId("menu"),
} as const;

export const DELETE_SECTION_MENU_ITEM = {
  value: "delete",
  label: "Delete",
} as const;
