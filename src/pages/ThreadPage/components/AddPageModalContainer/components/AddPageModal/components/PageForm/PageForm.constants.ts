import { initTestIdCreator } from "@/components/lib/utils";

const createTestId = initTestIdCreator("PageForm__");

export const PageFormTestId = {
  form: createTestId("form"),
  nameInput: createTestId("name-input"),
  typeSelect: createTestId("type-select"),
  colorPicker: createTestId("color-picker"),
} as const;

export const PAGE_NAME_LABEL = "Page name";
export const PAGE_NAME_PLACEHOLDER = "Enter page name";
export const PAGE_TYPE_LABEL = "Page type";
export const PAGE_COLOR_LABEL = "Color";
